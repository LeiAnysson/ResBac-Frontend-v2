import React, { useEffect, useState } from "react";
import AdminReportPageView from "../AdminPage/AdminReportsPageView";
import "./DispatcherNotifications.css";
import { apiFetch } from "../../utils/apiFetch";

const DispatcherNotifications = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Handle incoming call
    const handleIncomingCall = (e) => {
      const report = e.detail;
      console.log("Incoming call (in-app popup):", report);
      setIncomingCalls((prev) => [...prev, report]);
    };

    // Handle resident ending call
    const handleCallEnded = (e) => {
      const event = e.detail;
      console.log("Resident ended the call:", event);

      if (activeCall && event.id === activeCall.id) {
        setActiveCall(null);
      }
    };

    window.addEventListener("incidentCallCreated", handleIncomingCall);
    window.addEventListener("callEnded", handleCallEnded);

    return () => {
      window.removeEventListener("incidentCallCreated", handleIncomingCall);
      window.removeEventListener("callEnded", handleCallEnded);
    };
  }, [activeCall]);

  const acceptCall = async (call) => {
    try {
      const data = await apiFetch(
        `http://127.0.0.1:8000/api/incidents/calls/accept/${call.id}`,
        {
          method: "POST",
          body: JSON.stringify({ incident_id: call.id }),
        }
      );

      setActiveCall(data.incident);
      setIncomingCalls((prev) => prev.filter((c) => c.id !== call.id));
    } catch (error) {
      console.error("Failed to accept call: ", error);
    }
  };

  const rejectCall = (call) => {
    setIncomingCalls((prev) => prev.filter((c) => c.id !== call.id));
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      await apiFetch(`http://127.0.0.1:8000/api/incidents/calls/${activeCall.id}`, {
        method: "POST",
      });

      setActiveCall(null);
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  };

  return (
    <>
      {incomingCalls.map((call) => (
        <div key={call.id} className="incoming-call-popup">
          <h4>Incoming Call</h4>
          <p>Incident Type: {call.incident_type?.name || "Unknown"}</p>
          <button onClick={() => acceptCall(call)}>Accept</button>
          <button onClick={() => rejectCall(call)}>Reject</button>
        </div>
      ))}

      {activeCall && (
        <div className="floating-active-call">
          <p>
            On Call: {activeCall.user?.first_name} {activeCall.user?.last_name}
          </p>
          <button onClick={endCall}>End Call</button>
        </div>
      )}

      {activeCall && <AdminReportPageView reportFromCall={activeCall} />}
    </>
  );
};

export default DispatcherNotifications;
