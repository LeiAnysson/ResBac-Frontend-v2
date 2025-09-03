import React, { useEffect, useState } from "react";
import ReportDetailsCard from "./ReportDetailsCard";
import CallPopup from "./CallPopup";
import './CallPopup.css';

const DispatcherNotifications = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null); 

  useEffect(() => {
    window.Echo.channel("dispatcher-channel")
      .listen("IncidentCallCreated", (e) => {
        console.log("Incoming call event:", e);
        setIncomingCall(e.report); 
        showBrowserNotification(e.report);
      });
  }, []);

  const showBrowserNotification = (report) => {
    if (Notification.permission !== "granted") Notification.requestPermission();

    if (Notification.permission === "granted") {
      const notification = new Notification("Incoming Emergency Call!", {
        body: `Incident Type: ${report.incident_type.name}`,
        icon: "/logo192.png",
      });

      notification.onclick = () => {
        window.focus();
        setIncomingCall(report);
      };
    }
  };

  const acceptCall = () => {
    console.log("Call accepted for report:", incomingCall.id);
    setActiveCall(incomingCall);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    console.log("Call rejected for report:", incomingCall.id);
    setIncomingCall(null);
  };

  const endCall = () => {
    console.log("Call ended for report:", activeCall.id);
    setActiveCall(null);
  };

  return (
    <>
      <CallPopup
        show={!!incomingCall}
        caller={incomingCall?.user}
        callStatus="incoming"
        onAnswer={acceptCall}
        onDecline={rejectCall}
      />

      <CallPopup
        show={!!activeCall}
        caller={activeCall?.user}
        callStatus="active"
        onEnd={endCall}
      />

      {activeCall && <ReportDetailsCard report={activeCall} />}
    </>
  );
};

export default DispatcherNotifications;
