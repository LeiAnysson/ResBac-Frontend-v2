import React, { useEffect, useState, useRef } from "react";
import "./CallPopup.css";
import endCallIcon from "../../../assets/endcall.png";
import { reverseGeocode } from '../../../utils/hereApi';

const CallPopup = ({ show, caller, incident, callDuration, onEnd }) => {
  const [location, setLocation] = useState("Fetching location...");

  useEffect(() => {
    const fetchLocation = async () => {
      if (incident?.latitude != null && incident?.longitude != null) {
        try {
          const addr = await reverseGeocode(incident.latitude, incident.longitude);
          setLocation(addr);
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          setLocation(`${incident.latitude}, ${incident.longitude}`);
        }
      }
    };

    fetchLocation();
  }, [incident?.latitude, incident?.longitude]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (!show || incident?.callStatus === "ended") return null;

  return (
    <div className="floating-call-popup">
      <div className="call-info-mini">
        <label className="d-caller-label">Resident</label>
        <h4 className="d-caller-name">
          {caller?.first_name} {caller?.last_name || "Resident"}
        </h4>
        {incident?.callStatus === "calling" && <p className="call-status">Calling...</p>}
        {incident?.callStatus === "connected" && (
          <p className="call-duration">{formatTime(callDuration)}</p>
        )}
        <p className="call-popup-location">{location}</p>
      </div>

      {incident?.callStatus !== "ended" && (
        <div className="call-popup-actions">
          <button className="end-call-btn" onClick={onEnd}>
            <img src={endCallIcon} alt="End Call" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallPopup;
