import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResidentWaiting.css";
import Header from "../Components/ComponentsHeaderWebApp/header.jsx";
import BottomNav from "../Components/ComponentsBottomNavWebApp/BottomNav.jsx";

let hereMapsLoaded = false;

const ResidentWaiting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);

  const callData = location.state || {};
  const initialReport = callData.emergencyReport || null;

  const [emergencyReport, setEmergencyReport] = useState(
    initialReport || {
      id: "",
      type: callData.incidentType || "",
      description: "",
      location: "",
      coordinates: {
        latitude: 14.7995,
        longitude: 120.9267,
      },
      status: "pending",
      submittedAt: callData.timestamp || new Date().toISOString(),
      estimatedResponseTime: "5-10 minutes",
      assignedDispatcher: null,
      priority: "medium",
      callDuration: callData.callDuration || 0,
      fromWitnessReport: callData.fromWitnessReport || false,
      fromSOS: callData.fromSOS || false,
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!emergencyReport.coordinates) return;

    console.log("Resident got incident:", emergencyReport);

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
      if (!mapRef.current || mapRef.current.hasChildNodes()) return;

      const platform = new window.H.service.Platform({
        apikey: process.env.REACT_APP_HERE_API_KEY,
      });

      const defaultLayers = platform.createDefaultLayers();

      const map = new window.H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          center: {
            lat: parseFloat(emergencyReport.coordinates.latitude),
            lng: parseFloat(emergencyReport.coordinates.longitude),
          },
          zoom: 15,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      window.addEventListener("resize", () => map.getViewPort().resize());
      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);

      const marker = new window.H.map.Marker({
        lat: parseFloat(emergencyReport.coordinates.latitude),
        lng: parseFloat(emergencyReport.coordinates.longitude),
      });
      map.addObject(marker);

      return () => map.dispose();
    });
  }, [emergencyReport.coordinates]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (emergencyReport.status === "pending") {
        console.log("Checking for status updates...");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [emergencyReport.status]);

  if (loading) {
    return (
      <div className="waiting-container">
        <Header />
        <div className="loading-overlay">
          <p>Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="waiting-container">
        <Header />
        <div className="error-overlay">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="waiting-container">
      <Header />

      <div className="map-background">
        <div
          ref={mapRef}
          style={{ width: "100%", height: "100vh", borderRadius: "8px" }}
        />
      </div>

      <div className="status-card" style={{ width: "95%", borderRadius: "50px" }}>
        <div className="status-icon">
          <div className="processing-spinner">
            <div className="spinner-circle"></div>
          </div>
        </div>
        <div className="status-content">
          <h2 className="status-title">
            {emergencyReport.fromSOS
              ? "Your SOS emergency call has been successfully submitted"
              : emergencyReport.fromWitnessReport
              ? "Your witness report has been successfully submitted"
              : "Your emergency report has been successfully submitted"}
          </h2>
          <p className="status-subtitle">
            {emergencyReport.fromSOS
              ? "and is now being dispatched with high priority."
              : emergencyReport.fromWitnessReport
              ? "and is now being reviewed by our response team."
              : "and is now awaiting assignment by a dispatcher."}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ResidentWaiting;
