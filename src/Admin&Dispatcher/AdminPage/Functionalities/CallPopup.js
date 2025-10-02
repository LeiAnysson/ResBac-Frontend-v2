import React, { useEffect, useState } from "react";
import "./CallPopup.css";
import endCallIcon from "../assets/endcall.png";
import { reverseGeocode } from '../../utils/hereApi';

const CallPopup = ({ show, caller, incident, onEnd }) => {
  const [location, setLocation] = useState("Fetching location...");
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (show && incident?.callStatus === "connected") {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [show, incident]);

  useEffect(() => {
    if (incident?.latitude && incident?.longitude) {
      reverseGeocode(incident.latitude, incident.longitude).then(addr => setLocation(addr));
    }
  }, [incident]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (!show) return null;

  return (
    <div className="floating-call-popup">
      <div className="call-info-mini">
        <h4 className="caller-name">
          {caller?.first_name} {caller?.last_name || "Resident"}
        </h4>
        {incident?.callStatus === "calling" && <p className="call-status">Calling...</p>}
        {incident?.callStatus === "connected" && (
          <p className="call-duration">{formatTime(callDuration)}</p>
        )}
        <p className="incident-location">{location}</p>
      </div>

      {incident?.callStatus !== "ended" && (
        <button className="end-call-btn" onClick={onEnd}>
          <img src={endCallIcon} alt="End Call" />
        </button>
      )}
    </div>
  );
};

export default CallPopup;
