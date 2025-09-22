import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResidentCall.css";
import endCallIcon from "../assets/endcall.png";
import AgoraRTC from "agora-rtc-sdk-ng";
import { apiFetch } from "../utils/apiFetch";

const ResidentCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidentType, setIncidentType] = useState(location.state?.incidentType || "");
  const [callStatus, setCallStatus] = useState("calling");
  const [callDuration, setCallDuration] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const residentId = currentUser?.id;

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const timerRef = useRef(null);
  const echoChannelRef = useRef(null);

  useEffect(() => {
    if (!incidentType) navigate("/resident/report");
  }, [incidentType, navigate]);

  useEffect(() => {
    if (!residentId || !window.Echo) return;

    console.log("Subscribing to resident channel");
    const channelName = "resident";
    const channel = window.Echo.channel(channelName);
    echoChannelRef.current = channel;

    channel.listen(".CallAccepted", async (event) => {
      if (event.reporter_id !== residentId) return;

      console.log("Call accepted by dispatcher:", event);

      try {
        const data = await apiFetch(
          `http://127.0.0.1:8000/api/agora/token?channel=incident_${event.id}&uid=${residentId}`
        );

        const { appID, token, channelName, uid } = data;

        clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await clientRef.current.join(appID, channelName, token, uid);

        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await clientRef.current.publish([localAudioTrackRef.current]);

        setCallStatus("connected");
      } catch (err) {
        console.error("Agora join error:", err);
      }
    });

    channel.listen(".CallEnded", async (event) => {
      if (event.reporter_id !== residentId) return;

      console.log("Dispatcher ended the call:", event);
      await endCallCleanup();
    });

    return () => {
      leaveEchoChannel();
      cleanupAgora();
      clearTimer();
    };
  }, [residentId]);

  useEffect(() => {
    if (callStatus === "connected") {
      startTimer();
    } else {
      clearTimer();
    }
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
        clientRef.current = null;
      }
    } catch (err) {
      console.error("Error cleaning up Agora:", err);
    }
  };

  const leaveEchoChannel = () => {
    if (echoChannelRef.current && window.Echo) {
      window.Echo.leave("resident");
      echoChannelRef.current = null;
    }
  };

  const endCallCleanup = async () => {
    clearTimer();
    await cleanupAgora();
    setCallStatus("ended");

    navigate("/resident/waiting", {
      state: {
        incidentType,
        callDuration,
        timestamp: new Date().toISOString(),
        fromSOS: location.state?.fromSOS || false,
      },
    });
  };

  const handleEndCall = async () => {
    try {
      await apiFetch(`http://127.0.0.1:8000/api/incidents/calls/end/${location.state?.incidentId}`, {
        method: "POST",
      });
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
