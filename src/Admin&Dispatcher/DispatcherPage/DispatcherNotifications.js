import React, { useEffect, useState } from "react";
import AdminReportPageView from "../AdminPage/AdminReportsPageView";
import './DispatcherNotifications.css';

const DispatcherNotifications = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    window.Echo.channel("dispatcher-channel")
      .listen(".IncidentCallCreated", (e) => {
        console.log("Incoming call event:", e);
        setIncomingCalls(prev => [...prev, e.report]);
        showBrowserNotification(e.report);
      });
  }, []);

  const showBrowserNotification = (report) => {
    if (Notification.permission !== "granted") Notification.requestPermission();

    if (Notification.permission === "granted") {
      new Notification("Incoming Emergency Call!", {
        body: `Incident Type: ${report.incident_type?.name || "Unknown"}`,
        icon: "/logo192.png",
      });
    }
  };

  const acceptCall = async (call) => {
    try {
      await fetch('/api/incidents/calls/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: call.id })
      });

      setActiveCall(call);
      setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
    } catch (error) {
      console.error(error);
    }
  };

  const rejectCall = (call) => {
    setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
  };

  const endCall = () => setActiveCall(null);

  return (
    <>
      {incomingCalls.map((call) => (
        <div key={call.id} className="incoming-call-popup">
          <h4>Incoming Call</h4>
          <p>Incident Type: {call.incident_type?.name || 'Unknown'}</p>
          <button onClick={() => acceptCall(call)}>Accept</button>
          <button onClick={() => rejectCall(call)}>Reject</button>
        </div>
      ))}

      {activeCall && ( 
        <div className="floating-active-call"> 
          <p>On Call: {activeCall.user?.first_name} {activeCall.user?.last_name}</p> 
          <button onClick={endCall}>End Call</button> 
        </div> )}

      {activeCall && <AdminReportPageView reportFromCall={activeCall} />}
    </>
  );
};

export default DispatcherNotifications;

{/* <CallPopup
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
      /> */}