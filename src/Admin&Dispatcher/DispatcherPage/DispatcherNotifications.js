import React, { useEffect, useState, useRef } from "react";
import AdminReportPageView from "../AdminPage/AdminReportsPageView";
import "./DispatcherNotifications.css";
import { apiFetch } from "../../utils/apiFetch";
import AgoraRTC from "agora-rtc-sdk-ng";
import CallPopup from "../AdminPage/Functionalities/CallPopup";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const DispatcherNotifications = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [duplicateReports, setDuplicateReports] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);

  const echoChannelRef = useRef(null);
  const activeCallRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleIncomingCall = (e) => {
      const report = e.detail;
      console.log("Incoming call (in-app popup):", report);
      setIncomingCalls((prev) => [...prev, report]);
    };

    const handleCallEnded = async (event) => {
      const incidentId = String(event.incidentId);
      const currentIncidentId = String(activeCallRef.current?.id ?? "");

      if (!currentIncidentId || incidentId !== currentIncidentId) {
        console.log("CallEnded not for dispatcher -> ignoring", event);
        return;
      }

      console.log(`Dispatcher's call ended by ${event.endedByRole} (user ${event.endedById})`);
      await cleanupCall();
    };

    const handleDuplicate = (e) => {
      const dup = e.detail;
      console.log("Duplicate report detected:", dup);

      setDuplicateReports((prev) => [...prev, dup]);

      setTimeout(() => {
        setDuplicateReports((prev) =>
          prev.filter((d) => d.incident_id !== dup.incident_id)
        );
      }, 5000);
    };

    window.addEventListener("incidentCallCreated", handleIncomingCall);
    window.addEventListener("callEnded", handleCallEnded);
    window.addEventListener("duplicateReportCreated", handleDuplicate);

    const handleUserPublished = async (user, mediaType) => {
      if (mediaType === "audio") {
        try {
          await client.subscribe(user, mediaType);

          if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            await audioCtxRef.current.resume();
          }
          
          user.audioTrack.play();
          console.log("Playing remote audio from:", user.uid);
        } catch (err) {
          console.warn("Failed to subscribe/play remote audio:", err);
        }
      }
    };

    const handleUserUnpublished = (user) => {
      console.log("Remote user left:", user.uid);
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    if (window.Echo && !echoChannelRef.current) {
      try {
        const chName = "dispatcher";
        const channelObj = window.Echo.channel(chName);
        echoChannelRef.current = { name: chName, channel: channelObj };

        channelObj.listen(".CallEnded", async (event) => {
          console.log("Dispatcher received .CallEnded event:", event);

          if (!activeCallRef.current) {
            console.log("Dispatcher: no active call currently — ignoring CallEnded event.");
            return;
          }

          console.log(
            `Dispatcher activeCall.id = ${activeCallRef.current.id}, event.incidentId = ${event.incidentId}`
          );

          if (String(event.incidentId) === String(activeCallRef.current.id)) {
            console.log("Dispatcher: CallEnded matches active call, cleaning up popup...");
            await cleanupCall();
          } else {
            console.log("Dispatcher: CallEnded does not match active call — ignoring.");
          }
        });

      } catch (err) {
        console.warn("Failed to join Echo channel (dispatcher):", err);
      }
    }

    return () => {
      window.removeEventListener("incidentCallCreated", handleIncomingCall);
      window.removeEventListener("callEnded", handleCallEnded);
      window.removeEventListener("duplicateReportCreated", handleDuplicate); 

      client.removeAllListeners("user-published");
      client.removeAllListeners("user-unpublished");

      leaveEchoChannel();
    };
  }, []);

  const acceptCall = async (call) => {
    if (activeCallRef.current && activeCallRef.current.id === call.id) return;

    try {
      const data = await apiFetch(
        `${process.env.REACT_APP_URL}/api/incidents/calls/accept/${call.id}`,
        {
          method: "POST",
          body: JSON.stringify({ incident_id: call.id }),
        }
      );

      setActiveCall(data.incident);
      setIncomingCalls((prev) => prev.filter((c) => c.id !== call.id));

      const { appID, token, channelName, uid } = data.agora;

      console.log("Dispatcher Agora UID from backend:", uid);

      await client.join(appID, channelName, token, uid);

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([micTrack]);
      setLocalAudioTrack(micTrack);

      console.log("Dispatcher: published local audio");
      
      if (!timerRef.current) {
        setCallDuration(0);
        startTimer();
        setActiveCall(prev => ({ ...prev, callStatus: "connected" }));
      }
    } catch (error) {
      console.error("Failed to accept call: ", error);
      clearTimer();
    }
  };

  const rejectCall = (call) => {
    setIncomingCalls((prev) => prev.filter((c) => c.id !== call.id));
  };

  const endCall = async () => {
    if (!activeCallRef.current) return;

    try {
      await apiFetch(
        `${process.env.REACT_APP_URL}/api/incidents/calls/${activeCallRef.current.id}/end`,
        { method: "POST" }
      );
    } catch (err) {
      console.error("Failed to notify backend about call end:", err);
      await cleanupCall();
    }
    clearTimer();
    setCallDuration(0);
  };

  const cleanupCall = async () => {
    if (localAudioTrack) {
      try {
        localAudioTrack.stop();
        localAudioTrack.close();
      } catch (err) {
        console.warn("Error stopping/closing localAudioTrack:", err);
      }
      setLocalAudioTrack(null);
    }
    clearTimer();
    setCallDuration(0);

    try {
      await client.leave();
    } catch (err) {
      console.warn("Already left Agora or leave error:", err);
    }

    leaveEchoChannel();

    setActiveCall(null);
    console.log("Dispatcher cleaned up call");
  };

  const leaveEchoChannel = () => {
    const ref = echoChannelRef.current;
    if (!ref || !ref.channel) return;

    try {
      if (typeof ref.channel.stopListening === "function") {
        ref.channel.stopListening(".CallEnded");
      }
      if (typeof ref.channel.unsubscribe === "function") ref.channel.unsubscribe();
    } catch (err) {
      console.warn("Error leaving Echo channel:", err);
    } finally {
      echoChannelRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 4: return "#ac3737ff";
      case 3: return "#c94c4c";
      case 2: return "#dc6b6bff";
      case 1: return "#fca8a9ff";
      default: return "#ffffff";
    }
  };

  return (
    <>
      {incomingCalls.map((call) => {
        const borderColor = getPriorityColor(call.incident_type?.priority?.priority_level);

        return (
          <div key={call.id} className="incoming-call-popup" style={{ borderColor: borderColor }}>
            <h4>Incoming Call</h4>
            <p>Incident Type: {call.incident_type?.name || "Unknown"}</p>
            <p>
              Reported By:{" "}
              {call.user
                ? `${call.user.first_name} ${call.user.last_name}`
                : "Unknown Caller"}{" "}
              {call.reporter_type && (
                <span className="reporter-type">({call.reporter_type})</span>
              )}
            </p>
            <button type="button" onClick={() => acceptCall(call)}>
              Accept
            </button>
            <button type="button" onClick={() => rejectCall(call)}>
              Reject
            </button>
          </div>
        );
      })}

      {duplicateReports.map((dup) => {
        const borderColor = getPriorityColor(dup.incident_type?.priority?.priority_level);

        return (
          <div key={`dup-${dup.incident_id}`} className="duplicate-popup" style={{ borderColor }}>
            <h5>Duplicate Report</h5>
            <p>Incident #{dup.incident_id}</p>
            <p>{dup.incident_type?.name || "Unknown Type"}</p>
            <p>Total reports: {dup.duplicate_count}</p>
          </div>
        );
      })}

      <CallPopup
        show={!!activeCall}
        caller={activeCall?.user}
        incident={activeCall}
        callDuration={callDuration}
        onEnd={endCall}
      />

      {activeCall && 
        <AdminReportPageView 
          reportFromCall={activeCall}
          editable={!!activeCall} 
        />
      }
    </>
  );
};

export default DispatcherNotifications;
