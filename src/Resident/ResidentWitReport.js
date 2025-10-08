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

  const [coordinates, setCoordinates] = useState({ lat: 14.7995, lng: 120.9267 }); 
  const [incidentType] = useState(location.state?.incidentType || "");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation failed, using default coordinates.", err);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    let map, marker;
    const onDragStart = (ev) => {
      if (ev.target instanceof window.H.map.Marker) {
        map.getViewPort().capture(false);
        ev.currentTarget.getEngine().disableEventHandling();
      }
    };
    const onDrag = (ev) => {
      if (ev.target instanceof window.H.map.Marker) {
        const pos = map.screenToGeo(
          ev.currentPointer.viewportX,
          ev.currentPointer.viewportY
        );
        ev.target.setGeometry(pos);
      }
    };
    const onDragEnd = (ev) => {
      if (ev.target instanceof window.H.map.Marker) {
        ev.currentTarget.getEngine().enableEventHandling();
        const pos = map.screenToGeo(
          ev.currentPointer.viewportX,
          ev.currentPointer.viewportY
        );
        setCoordinates({ lat: pos.lat, lng: pos.lng });
      }
    };
    const onResize = () => map.getViewPort().resize();

    const loadHereMaps = async () => {
      if (!window.H && !hereMapsLoaded) {
        const scripts = [
          "https://js.api.here.com/v3/3.1/mapsjs-core.js",
          "https://js.api.here.com/v3/3.1/mapsjs-service.js",
          "https://js.api.here.com/v3/3.1/mapsjs-ui.js",
          "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js",
        ];
        hereMapsLoaded = true;
        await Promise.all(
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
      }

      const platform = new window.H.service.Platform({
        apikey: process.env.REACT_APP_HERE_API_KEY,
      });
      const defaultLayers = platform.createDefaultLayers();

      map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
        center: coordinates,
        zoom: 15,
      });

      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);

      marker = new window.H.map.Marker(coordinates, { volatility: true });
      marker.draggable = true;
      map.addObject(marker);

      map.addEventListener("dragstart", onDragStart);
      map.addEventListener("drag", onDrag);
      map.addEventListener("dragend", onDragEnd);
      window.addEventListener("resize", onResize);
    };

    loadHereMaps();

    return () => {
      if (map) {
        map.removeEventListener("dragstart", onDragStart);
        map.removeEventListener("drag", onDrag);
        map.removeEventListener("dragend", onDragEnd);
        window.removeEventListener("resize", onResize);
        map.dispose();
      }
    };
  }, []);

  const handleSubmitReport = async () => {
    try {
      const payload = {
        incident_type_id: null,
        reporter_type: "witness",
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        landmark: null,
        description: null,
      };

      const data = await apiFetch(`${process.env.REACT_APP_URL}/api/incidents/from-resident`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      navigate("/resident/call", {
        state: {
          incidentType,
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
        <label className="label">Pin Your Location:</label>
        <p className="instruction-text">
          Drag the marker to the exact location you witnessed the incident.
        </p>
        <div className="map-box">
          <div
            ref={mapRef}
            style={{ width: "100%", height: "300px", borderRadius: "8px" }}
          />
        </div>
      </div>

      <button className="submit-button" onClick={handleSubmitReport}>
        <span className="submit-button-text">Report</span>
      </button>

      <BottomNav />
    </div>
  );
};

export default ResidentWitReport;
