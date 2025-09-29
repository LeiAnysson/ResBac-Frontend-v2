import React, { useEffect, useState, useRef } from "react";
import AdminReportPageView from "../AdminPage/AdminReportsPageView";
import "./DispatcherNotifications.css";
import { apiFetch } from "../../utils/apiFetch";
import AgoraRTC from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const DispatcherNotifications = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);

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

    const handleCallEnded = (e) => {
      const event = e.detail;
      console.log("Resident ended the call:", event);

      if (activeCallRef.current && event.id === activeCallRef.current.id) {
        cleanupCall();
      }
    };

    window.addEventListener("incidentCallCreated", handleIncomingCall);
    window.addEventListener("callEnded", handleCallEnded);

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
          if (!activeCallRef.current) return; 
          if (event.incidentId !== activeCallRef.current?.id) return;
          console.log(`Call ended by ${event.endedBy}`);
          await cleanupCall();
        });
      } catch (err) {
        console.warn("Failed to join Echo channel (dispatcher):", err);
      }
    }

    return () => {
      window.removeEventListener("incidentCallCreated", handleIncomingCall);
      window.removeEventListener("callEnded", handleCallEnded);

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
    } catch (error) {
      console.error("Failed to accept call: ", error);
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
    }

    await cleanupCall();
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

  return (
    <>
      {incomingCalls.map((call) => (
        <div key={call.id} className="incoming-call-popup">
          <h4>Incoming Call</h4>
          <p>Incident Type: {call.incident_type?.name || "Unknown"}</p>
          <button type="button" onClick={() => acceptCall(call)}>
            Accept
          </button>
          <button type="button" onClick={() => rejectCall(call)}>
            Reject
          </button>
        </div>
      ))}

      {activeCall && (
        <div className="floating-active-call">
          <p>
            On Call: {activeCall.user?.first_name} {activeCall.user?.last_name}
          </p>
          <button type="button" onClick={endCall}>
            End Call
          </button>
        </div>
      )}

      {activeCall && <AdminReportPageView reportFromCall={activeCall} />}
    </>
  );
};

export default DispatcherNotifications;
