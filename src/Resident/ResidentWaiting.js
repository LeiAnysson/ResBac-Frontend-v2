import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Ably from "ably";
import Header from "../Components/ComponentsHeaderWebApp/header.jsx";
import BottomNav from "../Components/ComponentsBottomNavWebApp/BottomNav.jsx";
import "./ResidentWaiting.css";
import { FaCar, FaCheckCircle, FaMapPin } from "react-icons/fa";
import { apiFetch } from "../utils/apiFetch";

let hereMapsLoaded = false;
const MUNICIPAL = { lat: 14.79407719563481, lng: 120.94294770863102 };

const ResidentWaiting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);
  const lastRouteRef = useRef(0);

  const callData = location.state || {};
  const report = callData.emergencyReport || null;
  const assignedTeam = report?.assignedTeam || null;

  const [incidentStatus, setIncidentStatus] = useState(report?.status || "Pending");
  const [incident, setIncident] = useState(null);
  const [responderTeam, setResponderTeam] = useState(null);
  const [responderLocation, setResponderLocation] = useState(MUNICIPAL);
  const [eta, setEta] = useState(null);

  const mapInstanceRef = useRef(null);
  const responderMarkerRef = useRef(null);
  const incidentMarkerRef = useRef(null);
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
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
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
      if (incident.id === report.id) {
        setIncidentStatus(incident.status);
      }
    };

    channel.listen(".IncidentStatusUpdated", listener);

    return () => {
      try {
        window.Echo.channel("resident").stopListening(".IncidentStatusUpdated");
      } catch (err) {
        console.warn("Error stopping Echo listener:", err);
      }
    };
  }, [report?.id]);

  useEffect(() => {
    const fetchWithTeam = async () => {
      try {
        const res = await apiFetch(`${process.env.REACT_APP_URL}/api/resident/reports/with-team`);
        if (Array.isArray(res) && res.length > 0) {
          const latestReport = res[0];
          setIncident(latestReport);
          setResponderTeam(latestReport.responder_team || null);
        }
      } catch (err) {
        console.error("Failed to fetch incident with team:", err);
      }
    };
    fetchWithTeam();
  }, []);


  const updateRoute = async (origin, destReport) => {
    if (!destReport || !mapInstanceRef.current || !window.H) {
      return;
    }

    const now = Date.now();
    if (now - lastRouteRef.current < 2500) return;
    lastRouteRef.current = now;

    if (!process.env.REACT_APP_HERE_API_KEY) {
      console.error("Missing REACT_APP_HERE_API_KEY");
      return;
    }

    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${parseFloat(destReport.latitude)},${parseFloat(destReport.longitude)}`;

    const url =
      `https://router.hereapi.com/v8/routes?apikey=${process.env.REACT_APP_HERE_API_KEY}` +
      `&transportMode=car&routingMode=short&origin=${originStr}&destination=${destStr}&return=polyline,summary`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const t = await res.text();
        console.error("Route API error", res.status, t.slice ? t.slice(0, 500) : t);
        return;
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const t = await res.text();
        console.error("Route API returned non-json:", t.slice ? t.slice(0, 500) : t);
        return;
      }

      const data = await res.json();
      if (!data.routes || data.routes.length === 0) {
        console.warn("No routes returned from HERE", data);
        return;
      }

      const section = data.routes[0].sections[0];

      const travelTimeSeconds = section.summary?.travelTime;

      if (travelTimeSeconds == null) {
        console.warn("No travel time from API");
        return;
      }

      const etaMinutes = Math.max(0, Math.round(travelTimeSeconds / 60));

      if (etaMinutes <= 1) {
        setEta("Arriving now");
      } else {
        setEta(etaMinutes); 
      }

      const encoded = data.routes[0].sections[0].polyline;
      const lineString = window.H.geo.LineString.fromFlexiblePolyline(encoded);

      if (routeLineRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeObject(routeLineRef.current);
        } catch (e) {}
        routeLineRef.current = null;
      }

      routeLineRef.current = new window.H.map.Polyline(lineString, { style: { strokeColor: "blue", lineWidth: 4 } });
      mapInstanceRef.current.addObject(routeLineRef.current);

    try {
      const bbox = routeLineRef.current && routeLineRef.current.getBoundingBox && routeLineRef.current.getBoundingBox();
      const map = mapInstanceRef.current;

      if (bbox && map && map.getViewModel && typeof map.getViewModel === 'function') {
        const viewModel = map.getViewModel();
        if (viewModel && typeof viewModel.setLookAtData === 'function') {
          viewModel.setLookAtData({ bounds: bbox });
        } else {
          console.warn('[ROUTE] viewModel.setLookAtData not available (map not ready)');
        }
      } else {
      }
    } catch (e) {
      console.warn('[ROUTE] fit-to-bounds failed (ignored):', e);
    }

    } catch (err) {
      console.error("Routing fetch error:", err);
    }
  };

  useEffect(() => {
    if (!incident?.latitude || !incident?.longitude) return;

    let map;
    let handleResize;

    loadHereMaps()
      .then(() => {
        if (!mapRef.current) return;

        const platform = new window.H.service.Platform({ apikey: process.env.REACT_APP_HERE_API_KEY });
        const defaultLayers = platform.createDefaultLayers();

        map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
          center: { lat: parseFloat(incident.latitude), lng: parseFloat(incident.longitude) },
          zoom: 15,
          pixelRatio: window.devicePixelRatio || 1,
        });

        handleResize = () => map.getViewPort().resize();
        window.addEventListener("resize", handleResize);

        new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
        window.H.ui.UI.createDefault(map, defaultLayers);

        incidentMarkerRef.current = new window.H.map.Marker({
          lat: parseFloat(incident.latitude),
          lng: parseFloat(incident.longitude),
        });
        map.addObject(incidentMarkerRef.current);

        const carIcon = new window.H.map.Icon("https://cdn-icons-png.flaticon.com/512/8023/8023798.png", {
          size: { w: 32, h: 32 },
        });
        responderMarkerRef.current = new window.H.map.Marker(MUNICIPAL, { icon: carIcon, zIndex: 999 });
        map.addObject(responderMarkerRef.current);

        mapInstanceRef.current = map;

        setTimeout(() => {
          updateRoute(MUNICIPAL, incident);
        }, 700);
      })
      .catch((err) => {
        console.error("HERE Maps failed to load:", err);
      });

    return () => {
      try {
        if (mapInstanceRef.current && mapInstanceRef.current.getViewPort) {
          const vp = mapInstanceRef.current.getViewPort();
          if (vp && typeof vp.removeEventListener === "function") {
            vp.removeEventListener("resize", handleResize);
          }
        }

        if (handleResize) window.removeEventListener("resize", handleResize);

        if (routeLineRef.current && mapInstanceRef.current) {
          try {
            mapInstanceRef.current.removeObject(routeLineRef.current);
          } catch {}
        }

        if (map && typeof map.dispose === "function") {
          map.dispose();
        }
      } catch (err) {
        console.warn("[Cleanup] Map dispose error:", err);
      }

      mapInstanceRef.current = null;
      responderMarkerRef.current = null;
      incidentMarkerRef.current = null;
      routeLineRef.current = null;
    };

  }, [incident]);

  useEffect(() => {
    if (!incident) return; 

    if (!ablyRef.current) {
      ablyRef.current = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });
    }

    const channel = ablyRef.current.channels.get("responder-location");

    const handleLocationUpdate = (msg) => {
      const { lat, lng } = msg.data || {};
      if (lat == null || lng == null) return;

      const newLoc = { lat, lng };
      setResponderLocation(newLoc);

      if (responderMarkerRef.current && mapInstanceRef.current) {
        responderMarkerRef.current.setGeometry(newLoc);
      }

      updateRoute(newLoc, incident);
    };

    channel.subscribe("update", handleLocationUpdate);
    channel.subscribe("locationupdated", handleLocationUpdate);

    console.debug("[resident] Subscribed to responder-location");

    return () => {
      channel.unsubscribe("update", handleLocationUpdate);
      channel.unsubscribe("locationupdated", handleLocationUpdate);
    };
  }, [incident]);

  return (
    <div className="waiting-container">
      <Header />
      <div className="map-background">
        <div ref={mapRef} style={{ width: "100%", height: "100vh", borderRadius: "8px" }} />
      </div>

      <div className="status-card" style={{ width: "95%", borderRadius: "50px" }}>
        {(incidentStatus === "Pending" || incidentStatus === "Accepted") && (
          <>
            <div className="status-icon">
              <div className="processing-spinner">
                <div className="spinner-circle"></div>
              </div>
            </div>
            <div className="status-content">
              <h2 className="status-title">Your report has been submitted</h2>
              <p className="status-subtitle">
                Please wait for the response team to come to you. <br />
                {responderTeam && <span className="team-info"> Assigned to Team <b>{responderTeam}</b>.</span>}
              </p>
              <p style={{ color: "gray", padding: "5px", fontSize: "10px"}}>
                Responder Location: {responderLocation.lat}, {responderLocation.lng}
              </p>
            </div>
          </>
        )}

        {incidentStatus === "En Route" && (
          <>
            <div className="status-icon">
              <FaCar width={75} fontSize="50px" />
            </div>
            <div className="status-content">
              <h2 className="status-title">Responders are on their way!</h2>
              <p className="status-subtitle">
                Please stay where you are — help is coming soon. <br />
                {responderTeam && <span className="team-info"> Team <b>{responderTeam}</b> is on the way!</span>}
              </p>
              <p style={{ color: "gray", padding: "5px", fontSize: "10px"}}>
                Responder Location: {responderLocation.lat}, {responderLocation.lng}
              </p>
              {typeof eta === "number" ? (
                <p style={{ color: "gray", padding: "5px", fontSize: "10px"}}>
                  Estimated arrival: ~{Math.max(0, eta - 1)}–{eta + 1} minutes
                </p>
              ) : eta ? (
                <p style={{ color: "gray", padding: "5px", fontSize: "10px"}}>
                  {eta}
                </p>
              ) : (
                <p style={{ color: "gray", padding: "5px", fontSize: "10px"}}>
                  Calculating arrival time...
                </p>
              )}
            </div>
          </>
        )}

        {incidentStatus === "On Scene" && (
          <>
            <div className="status-icon">
              <FaMapPin width={75} fontSize="50px" />
            </div>
            <div className="status-content">
              <h2 className="status-title">Responders are now on the scene</h2>
              <p className="status-subtitle">
                They’re assessing and handling the situation. <br />
                {responderTeam && <span className="team-info"> Handled by team <b>{responderTeam}</b>.</span>}
              </p>
              <p style={{ color: "gray", padding: "5px", fontSize: "10px"}}>
                Responder Location: {responderLocation.lat}, {responderLocation.lng}
              </p>
            </div>
          </>
        )}

        {incidentStatus === "Resolved" && (
          <>
            <div className="status-icon">
              <FaCheckCircle width={50} fontSize="50px"/>
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
