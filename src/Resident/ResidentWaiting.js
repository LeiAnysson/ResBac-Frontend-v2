import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Ably from "ably";
import Header from "../Components/ComponentsHeaderWebApp/header.jsx";
import BottomNav from "../Components/ComponentsBottomNavWebApp/BottomNav.jsx";
import "./ResidentWaiting.css";
import { FaCar, FaCheckCircle, FaMapPin } from 'react-icons/fa';

let hereMapsLoaded = false;

const ResidentWaiting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);
  const lastRouteRef = useRef(0);

  const callData = location.state || {};
  const report = callData.emergencyReport || null;
  const assignedTeam = report?.assignedTeam || null;

  const [responderLocation, setResponderLocation] = useState(null);
  const [incidentStatus, setIncidentStatus] = useState(report?.status || "Pending");
  const mapInstanceRef = useRef(null);
  const responderMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const ablyRef = useRef(null);

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

  useEffect(() => {
    if (!report?.id) return;

    if (!window.Echo) {
      console.warn("Echo not initialized yet.");
      return;
    }

    const channel = window.Echo.channel("resident");

    const listener = (event) => {
      const { incident } = event;
      console.log("[resident] IncidentStatusUpdated received:", incident.status);

      if (incident.id === report.id) {
        setIncidentStatus(incident.status);
      }
    };

    channel.listen(".IncidentStatusUpdated", listener);

    return () => {
      try {
        if (window.Echo) {
          window.Echo.channel("resident").stopListening(".IncidentStatusUpdated");
        }
      } catch (err) {
        console.warn("Error stopping Echo listener:", err);
      }
    };
  }, [report?.id]);

  useEffect(() => {
    if (!report?.latitude || !report?.longitude) return;

    let map, incidentMarker, handleResize;

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
          center: { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) },
          zoom: 15,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      handleResize = () => map.getViewPort().resize();
      window.addEventListener("resize", handleResize);

      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);

      incidentMarker = new window.H.map.Marker({
        lat: parseFloat(report.latitude),
        lng: parseFloat(report.longitude),
      });
      map.addObject(incidentMarker);

      mapInstanceRef.current = map;
    }).catch(err => console.error("HERE Maps failed to load:", err));

    return () => {
      if (map) map.dispose();
      if (handleResize) window.removeEventListener("resize", handleResize);
    };
  }, [report]);

  useEffect(() => {
    if (!assignedTeam || !mapInstanceRef.current) return;

    if (!ablyRef.current)
      ablyRef.current = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });

    const channelName = 'responder-location';
    const channel = ablyRef.current.channels.get(channelName);

    const updateRoute = async (start) => {
      const now = Date.now();
      if (now - lastRouteRef.current < 3000) return;
      lastRouteRef.current = now;

      try {
        const url = `https://router.hereapi.com/v8/routes?apikey=${
          process.env.REACT_APP_HERE_API_KEY
        }&transportMode=car&origin=${start.lat},${start.lng}&destination=${
          report.latitude
        },${report.longitude}&return=polyline`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.length) {
          const encoded = data.routes[0].sections[0].polyline;
          const lineString = window.H.geo.LineString.fromFlexiblePolyline(encoded);

          if (routeLineRef.current) mapInstanceRef.current.removeObject(routeLineRef.current);

          routeLineRef.current = new window.H.map.Polyline(lineString, {
            style: { strokeColor: "blue", lineWidth: 4 },
          });
          mapInstanceRef.current.addObject(routeLineRef.current);
        }
      } catch (err) {
        console.error("Routing error:", err);
      }
    };

    const subscriber = (msg) => {
      const data = msg.data;
      if (!data || data.team_id !== assignedTeam) return;

      const newLocation = { lat: data.latitude, lng: data.longitude };
      setResponderLocation(newLocation);

      const map = mapInstanceRef.current;
      if (!map) return;

      const carIcon = new window.H.map.Icon("https://cdn-icons-png.flaticon.com/512/8023/8023798.png", {
        size: { w: 32, h: 32 },
      });

      if (!responderMarkerRef.current) {
        responderMarkerRef.current = new window.H.map.Marker(newLocation, { icon: carIcon });
        map.addObject(responderMarkerRef.current);
      } else {
        responderMarkerRef.current.setGeometry(newLocation);
      }

      updateRoute(newLocation);
    };

    channel.subscribe(subscriber);

    return () => {
      channel.unsubscribe(subscriber);
      channel.detach();
    };
  }, [assignedTeam, report]);

  return (
    <div className="waiting-container">
      <Header />
      <div className="map-background">
        <div ref={mapRef} style={{ width: "100%", height: "100vh", borderRadius: "8px" }} />
      </div>

      <div className="status-card" style={{ width: "95%", borderRadius: "50px" }}>
        {incidentStatus === "Pending" && (
          <>
            <div className="status-icon">
              <div className="processing-spinner"><div className="spinner-circle"></div></div>
            </div>
            <div className="status-content">
              <h2 className="status-title">Your report has been submitted</h2>
              <p className="status-subtitle">Please wait for the response team to come to you.</p>
            </div>
          </>
        )}

        {incidentStatus === "En Route" && (
          <>
            <div className="status-icon">
              <FaCar alt="on the way" width={50} />
            </div>
            <div className="status-content">
              <h2 className="status-title">Responders are on their way!</h2>
              <p className="status-subtitle">Please stay where you are — help is coming soon.</p>
            </div>
          </>
        )}

        {incidentStatus === "On Scene" && (
          <>
            <div className="status-icon">
              <FaMapPin alt="on the way" width={50} />
            </div>
            <div className="status-content">
              <h2 className="status-title">Responders are now on the scene</h2>
              <p className="status-subtitle">They’re assessing and handling the situation.</p>
            </div>
          </>
        )}

        {incidentStatus === "Resolved" && (
          <>
            <div className="status-icon">
              <FaCheckCircle alt="on the way" width={50} />
            </div>
            <div className="status-content">
              <h2 className="status-title">Incident resolved</h2>
              <p className="status-subtitle">Thank you for reporting. Stay safe!</p>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ResidentWaiting;
