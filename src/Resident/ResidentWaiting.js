import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Ably from "ably";
import "./ResidentWaiting.css";
import Header from "../Components/ComponentsHeaderWebApp/header.jsx";
import BottomNav from "../Components/ComponentsBottomNavWebApp/BottomNav.jsx";

let hereMapsLoaded = false;

const ResidentWaiting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);

  const callData = location.state || {};
  const report = callData.emergencyReport || null;
  const assignedTeam = report?.assignedTeam || null;

  const [responderLocation, setResponderLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const ablyRef = useRef(null);
  const responderMarkerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!report?.coordinates) return;

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

    let map;
    loadHereMaps().then(() => {
      if (!mapRef.current || mapRef.current.hasChildNodes()) return;

      const platform = new window.H.service.Platform({
        apikey: process.env.REACT_APP_HERE_API_KEY,
      });
      const defaultLayers = platform.createDefaultLayers();

      map = new window.H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          center: {
            lat: parseFloat(report.coordinates.latitude),
            lng: parseFloat(report.coordinates.longitude),
          },
          zoom: 15,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      window.addEventListener("resize", () => map.getViewPort().resize());
      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);

      const incidentMarker = new window.H.map.Marker({
        lat: parseFloat(report.coordinates.latitude),
        lng: parseFloat(report.coordinates.longitude),
      });
      map.addObject(incidentMarker);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (map) map.dispose();
    };
  }, [report]);

  useEffect(() => {
    if (!mapLoaded || !assignedTeam) return;

    const ably = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });
    ablyRef.current = ably;

    const channel = ably.channels.get("responder-location");

    channel.subscribe((msg) => {
      const data = msg.data;
      if (data.teamId !== assignedTeam) return;

      const newLocation = { lat: data.lat, lng: data.lng };
      setResponderLocation(newLocation);

      const map = mapInstanceRef.current;
      if (!map) return;

      if (!responderMarkerRef.current) {
        responderMarkerRef.current = new window.H.map.Marker(newLocation);
        map.addObject(responderMarkerRef.current);
      } else {
        responderMarkerRef.current.setGeometry(newLocation);
      }

      map.setCenter(newLocation);
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [mapLoaded, assignedTeam]);

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
            {report?.fromSOS
              ? "Your SOS emergency call has been successfully submitted"
              : report?.fromWitnessReport
              ? "Your witness report has been successfully submitted"
              : "Your report has been successfully submitted"}
          </h2>
          <p className="status-subtitle">
            {report?.fromSOS
              ? "and is now being dispatched with high priority."
              : report?.fromWitnessReport
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
