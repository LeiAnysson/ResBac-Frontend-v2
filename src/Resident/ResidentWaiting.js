import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Ably from "ably";
import Header from "../Components/ComponentsHeaderWebApp/header.jsx";
import BottomNav from "../Components/ComponentsBottomNavWebApp/BottomNav.jsx";
import "./ResidentWaiting.css";

let hereMapsLoaded = false;

const ResidentWaiting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);

  const callData = location.state || {};
  const report = callData.emergencyReport || null;
  const assignedTeam = report?.assignedTeam || null;

  const [responderLocation, setResponderLocation] = useState(null);
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

    if (!ablyRef.current) ablyRef.current = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });
    const channel = ablyRef.current.channels.get("responder-location");

    const updateRoute = async (start) => {
      if (!start || !report?.latitude || !report?.longitude) return;

      try {
        const url = `https://router.hereapi.com/v8/routes?apikey=${process.env.REACT_APP_HERE_API_KEY}&transportMode=car&origin=${start.lat},${start.lng}&destination=${report.latitude},${report.longitude}&return=polyline`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.length) {
          const encodedPolyline = data.routes[0].sections[0].polyline;
          const lineString = window.H.geo.LineString.fromFlexiblePolyline(encodedPolyline);

          if (routeLineRef.current) mapInstanceRef.current.removeObject(routeLineRef.current);

          routeLineRef.current = new window.H.map.Polyline(lineString, {
            style: { strokeColor: "blue", lineWidth: 4 },
          });
          mapInstanceRef.current.addObject(routeLineRef.current);

          mapInstanceRef.current.getViewModel().setLookAtData({ bounds: routeLineRef.current.getBoundingBox() });
        }
      } catch (err) {
        console.error("Routing error:", err);
      }
    };

    const subscriber = (msg) => {
      const data = msg.data;
      if (data.team_id !== assignedTeam) return;

      const newLocation = { lat: data.latitude, lng: data.longitude };
      setResponderLocation(newLocation);

      const map = mapInstanceRef.current;
      if (!map) return;

      if (!responderMarkerRef.current) {
        const carIcon = new window.H.map.Icon("https://cdn-icons-png.flaticon.com/512/8023/8023798.png", { size: { w: 32, h: 32 } });
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
      ablyRef.current.close();
    };
  }, [assignedTeam, report]);

  return (
    <div className="waiting-container">
      <Header />
      <div className="map-background">
        <div ref={mapRef} style={{ width: "100%", height: "100vh", borderRadius: "8px" }} />
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
