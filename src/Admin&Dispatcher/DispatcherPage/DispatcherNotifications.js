import React, { useEffect, useState } from "react";
import AdminReportPageView from "../AdminPage/AdminReportsPageView";
import * as Ably from "ably";
import './DispatcherNotifications.css';
import { apiFetch } from '../../utils/apiFetch';

const ably = new Ably.Realtime(process.env.REACT_APP_ABLY_KEY);
ably.connection.on('connected', () => console.log('Ably connected!'));
ably.connection.on('failed', (err) => console.error('Ably connection failed', err));

const DispatcherNotifications = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const channel = ably.channels.get("dispatcher-channel");

    const handleIncomingCall = (msg) => {
      const report = msg.data;
      console.log("Incoming call event:", report);
      setIncomingCalls(prev => [...prev, report]);
      if (Notification.permission === "granted") {
        new Notification("Incoming Emergency Call!", {
          body: `Incident Type: ${report.incident_type?.name || "Unknown"}`,
          icon: "/logo192.png",
        });
      }
    };

    const handleCallAccepted = (msg) => {
      const acceptedReport = msg.data;
      console.log("Call accepted event:", acceptedReport);
      setIncomingCalls(prev => prev.filter(c => c.id !== acceptedReport.id));
      setActiveCall(acceptedReport);
    };

    channel.subscribe("IncidentCallCreated", handleIncomingCall);
    channel.subscribe("CallAccepted", handleCallAccepted);

    return () => {
      channel.unsubscribe("IncidentCallCreated", handleIncomingCall);
      channel.unsubscribe("CallAccepted", handleCallAccepted);
    };
  }, []);

  const acceptCall = async (call) => {
    try {
      const data = await apiFetch(`http://127.0.0.1:8000/api/incidents/calls/accept/${call.id}`, {
        method: 'POST',
        body: JSON.stringify({ incident_id: call.id }),
      });

      setActiveCall(data.incident);
      setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
    } catch (error) {
      console.error("Failed to accept call: ", error);
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
        </div>
      )}

      {activeCall && <AdminReportPageView reportFromCall={activeCall} />}
    </>
  );
};

export default DispatcherNotifications;
