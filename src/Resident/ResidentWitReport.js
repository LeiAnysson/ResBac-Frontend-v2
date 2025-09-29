import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResidentWitReport.css";
import "../Components/Shared/SharedComponents.css";
import BackButton from "../assets/backbutton.png";
import Header from "../Components/ComponentsHeaderWebApp/header.jsx";
import BottomNav from "../Components/ComponentsBottomNavWebApp/BottomNav.jsx";
import { apiFetch } from "../utils/apiFetch";

let hereMapsLoaded = false;

const ResidentWitReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);

  const [incidentType] = useState(location.state?.incidentType || "");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 14.7995, lng: 120.9267 }); 
  const [incidentTypes, setIncidentTypes] = useState([]);

  useEffect(() => {
    const loadHereMaps = () => {
      if (window.H) return Promise.resolve();
      if (hereMapsLoaded) return Promise.resolve();

      const scripts = [
        "https://js.api.here.com/v3/3.1/mapsjs-core.js",
        "https://js.api.here.com/v3/3.1/mapsjs-service.js",
        "https://js.api.here.com/v3/3.1/mapsjs-ui.js",
        "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js",
      ];

      hereMapsLoaded = true;

      return Promise.all(
        scripts.map(
          (src) =>
            new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = src;
              script.onload = resolve;
              script.onerror = reject;
              document.body.appendChild(script);
            })
        )
      );
    };

    loadHereMaps().then(() => {
      if (!mapRef.current) return;

      const platform = new window.H.service.Platform({
        apikey: process.env.REACT_APP_HERE_API_KEY,
      });
      const defaultLayers = platform.createDefaultLayers();

      const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
        center: coordinates,
        zoom: 15,
      });

      window.addEventListener("resize", () => map.getViewPort().resize());
      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);

      let marker = new window.H.map.Marker(coordinates, { volatility: true });
      marker.draggable = true;
      map.addObject(marker);

      map.addEventListener("dragstart", function (ev) {
        let target = ev.target;
        if (target instanceof window.H.map.Marker) {
          map.getViewPort().capture(false);
          ev.currentTarget.getEngine().disableEventHandling();
        }
      });

      map.addEventListener("dragend", function (ev) {
        let target = ev.target;
        if (target instanceof window.H.map.Marker) {
          ev.currentTarget.getEngine().enableEventHandling();
          let pos = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
          setCoordinates({ lat: pos.lat, lng: pos.lng });
        }
      });

      map.addEventListener("drag", function (ev) {
        let target = ev.target;
        if (target instanceof window.H.map.Marker) {
          let pos = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
          target.setGeometry(pos);
        }
      });
    });
  }, []);

  const mapIncidentLabelToId = (label) => {
    const found = incidentTypes.find((type) => type.name === label);
    return found ? found.id : null;
  };

  const handleSubmitReport = async () => {
    try {
      const incidentTypeId = mapIncidentLabelToId(incidentType); 

      const payload = {
        incident_type_id: incidentTypeId,
        reporter_type: "witness",
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        landmark: locationText,
        description: description || null,
      };

      const data = await apiFetch(`${process.env.REACT_APP_URL}/api/incidents/from-resident`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Witness incident created:", data);

      navigate("/resident/call", {
        state: {
          incidentType,
          incidentTypeId,
          fromWitnessReport: true,
          incident: data.incident,
        },
      });
    } catch (err) {
      console.error("Failed to submit witness report:", err);
      alert("Failed to submit witness report. Please try again.");
    }
  };
  return (
    <div className="witness-report-container">
      <Header />
      <div className="title-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img className="back-button-icon" src={BackButton} />
        </button>
        <h1>Witness Report</h1>
      </div>

      <div className="form-section">
        <label className="label">Incident Type:</label>
        <div className="input-box">
          <span className="input-text">{incidentType}</span>
        </div>
      </div>

      <div className="form-section">
        <label className="label">Description (optional):</label>
        <textarea
          className="input-field"
          placeholder="Describe what you witnessed"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label className="label">Landmark / Address:</label>
        <input
          type="text"
          className="input-field"
          placeholder="Enter location details"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label className="label">Pin Location:</label>
        <div className="map-box">
          <div ref={mapRef} style={{ width: "100%", height: "300px", borderRadius: "8px" }} />
        </div>
      </div>

      <button className="submit-button" onClick={handleSubmitReport}>
        <span className="submit-button-text">Submit Report</span>
      </button>

      <BottomNav />
    </div>
  );
};

export default ResidentWitReport;
