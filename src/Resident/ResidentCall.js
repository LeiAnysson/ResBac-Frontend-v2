import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResidentCall.css";
import endCallIcon from "../assets/endcall.png";
import AgoraRTC from "agora-rtc-sdk-ng";
import { apiFetch } from "../utils/apiFetch";

const ResidentCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidentType] = useState(location.state?.incidentType || "");
  const [callStatus, setCallStatus] = useState("calling");
  const [callDuration, setCallDuration] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const residentId = currentUser?.id;

  const [activeCall, setActiveCall] = useState(null);
  const activeCallRef = useRef(null);

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const timerRef = useRef(null);
  const echoChannelRef = useRef(null);
  const incidentIdRef = useRef(location.state?.incidentId || location.state?.incident?.id || null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!incidentType) navigate("/resident/report");
  }, [incidentType, navigate]);

  const handleCallAccepted = async (event) => {
    console.log("handleCallAccepted fired with event:", event);

    if (!event) {
      console.warn("CallAccepted event empty — ignoring.");
      return;
    }

    // make ID comparison robust (string/number)
    if (String(event.reporter_id) !== String(residentId)) {
      console.log("CallAccepted event not for this resident:", event.reporter_id, "!= ", residentId);
      return;
    }

    console.log("Call accepted by dispatcher (for me):", event);

    if (event.incident) {
      setActiveCall(event.incident);
      activeCallRef.current = event.incident;
      incidentIdRef.current = event.incident.id;
    }

    try {
      const { appID, token, channelName, uid } = event.agora || {};
      console.log("agora payload:", { appID, tokenPresent: !!token, channelName, uid });

      if (!appID || !channelName || uid == null) {
        console.error("Missing Agora payload — cannot join", event.agora);
        return;
      }

      if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        console.log("Created new Agora client");
      }

      // remove previous listeners to avoid duplicates
      clientRef.current.removeAllListeners();

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log("Created audio context");
      }
      if (audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
          console.log("audio context resumed");
        } catch (err) {
          console.warn("audio context resume failed:", err);
        }
      }

      clientRef.current.on("user-published", async (user, mediaType) => {
        console.log("user-published event:", user.uid, mediaType);
        try {
          if (mediaType === "audio") {
            await clientRef.current.subscribe(user, mediaType);
            if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
              await audioCtxRef.current.resume();
              console.log("audio context resumed inside user-published");
            }
            user.audioTrack.play();
            console.log("Resident: playing remote audio from", user.uid);
          }
        } catch (e) {
          console.error("Error in user-published handling:", e);
        }
      });

      clientRef.current.on("user-unpublished", (user) => {
        console.log("Dispatcher left/unpublished:", user.uid);
      });

      console.log("Joining Agora channel:", channelName, "uid:", uid);
      const assignedUid = await clientRef.current.join(appID, channelName, token || null, uid);
      console.log("Joined Agora with uid:", assignedUid);

      console.log("Creating microphone audio track...");
      localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      console.log("Microphone track created:", localAudioTrackRef.current?.getTrackId?.());

      console.log("Publishing local audio...");
      await clientRef.current.publish([localAudioTrackRef.current]);
      console.log("Resident: published local audio successfully");

      setCallStatus("connected");
    } catch (err) {
      console.error("Agora join/publish error in handleCallAccepted:", err);
    }
  };

  const handleCallEnded = async (event) => {
    const incidentId = String(event.incidentId);
    const reporterId = String(event.reporterId);
    const currentIncidentId = String(incidentIdRef.current ?? location.state?.incident?.id);
    const currentResidentId = String(currentUser.id);

    if (incidentId !== currentIncidentId || reporterId !== currentResidentId) {
      console.log("CallEnded not for this resident -> ignoring", event);
      return;
    }

    console.log(`Resident call ended by ${event.endedByRole} (user ${event.endedById})`);
    await endCallCleanup();
  };

  useEffect(() => {
    const setupEcho = async () => {
      let waited = 0;
      while (!window.Echo && waited < 5000) {
        await new Promise(r => setTimeout(r, 100));
        waited += 100;
      }
      if (!window.Echo) {
        console.error("Echo not available after wait — cannot subscribe to resident channel");
        return;
      }

      console.log("Subscribing to resident channel once Echo is ready");
      const channel = window.Echo.channel("resident");
      echoChannelRef.current = channel;

      channel.listen(".CallAccepted", (ev) => {
        console.log("raw .CallAccepted received on channel:", ev);
        handleCallAccepted(ev);
      });

      channel.listen(".CallEnded", (ev) => {
        console.log("raw .CallEnded received on channel:", ev);
        handleCallEnded(ev);
      });
    };

    setupEcho();

    return () => {
      console.log("Unmounting ResidentCall — cleaning up Echo and Agora");
      cleanupAgora();
      clearTimer();

      if (echoChannelRef.current) {
        try {
          echoChannelRef.current.stopListening(".CallAccepted");
          echoChannelRef.current.stopListening(".CallEnded");
        } catch (err) {
          console.warn("Error while stopping Echo listeners:", err);
        }
        echoChannelRef.current = null;
      }
    };
  }, [residentId]);

  useEffect(() => {
    if (callStatus === "connected") startTimer();
    else clearTimer();
  }, [callStatus]);

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanupAgora = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
    } catch (err) {
      console.error("Error cleaning up Agora:", err);
    }
  };

  const endCallCleanup = async () => {
    clearTimer();
    await cleanupAgora();
    setCallStatus("ended");

    const incidentObj = activeCallRef.current || location.state?.incident || null;

    navigate("/resident/waiting", {
      state: {
        incidentType,
        callDuration,
        timestamp: new Date().toISOString(),
        fromSOS: location.state?.fromSOS || false,
        emergencyReport: incidentObj,
      },
    });
  };

  const handleEndCall = async () => {
    if (callStatus === "ended") return;

    const idToEnd =
      incidentIdRef.current ||
      activeCallRef.current?.id ||
      location.state?.incident?.id ||
      null;

    if (!idToEnd) {
      console.error("Cannot end call: missing incidentId (no idToEnd). Performing local cleanup.");
      await endCallCleanup();
      return;
    }

    console.log("Ending call; incidentId:", idToEnd);

    try {
      await apiFetch(
        `${process.env.REACT_APP_URL}/api/incidents/calls/${idToEnd}/end`,
        {
          method: "POST",
          body: JSON.stringify({ endedBy: residentId }),
        }
      );
    } catch (err) {
      console.error("Failed to notify backend about call end:", err);
    }

    await endCallCleanup();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="call-container">
      <div className="content-scroll">
        <div className="call-interface">
          <div className="call-info">
            <h1 className="caller-name">MDRRMO</h1>
            {callStatus === "calling" && <p className="call-status-text">Calling...</p>}
            {callStatus === "connected" && <p className="call-duration">{formatTime(callDuration)}</p>}
            {callStatus === "ended" && <p className="call-status-text">Call Ended</p>}
          </div>

          {callStatus !== "ended" && (
            <div className="call-controls">
              <button className="control-button end-call" onClick={handleEndCall}>
                <div className="control-icon">
                  <img src={endCallIcon} alt="End Call" className="control-img" />
                </div>
                <span className="control-label">End Call</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentCall;