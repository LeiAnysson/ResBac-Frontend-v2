import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResidentWitReport.css";
import "../Components/Shared/SharedComponents.css";
import BackButton from "../assets/backbutton.png";
import Header from "../Components/ComponentsHeaderWebApp/header.jsx";
import BottomNav from "../Components/ComponentsBottomNavWebApp/BottomNav.jsx";
import { apiFetch } from "../utils/apiFetch";
import Spinner from '../utils/Spinner';

let hereScriptsLoaded = false;

const ResidentWitReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [incidentType] = useState(location.state?.incidentType || "");
  const [incidentTypeId] = useState(location.state?.incidentTypeId || null);

  const initialCoords = location.state?.latitude && location.state?.longitude
    ? { lat: location.state.latitude, lng: location.state.longitude }
    : { lat: 14.7995, lng: 120.9267 };
  const [selectedCoords, setSelectedCoords] = useState(initialCoords);
  const [mapReady, setMapReady] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const waitForMapContainer = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (mapRef.current && mapRef.current.offsetWidth > 0 && mapRef.current.offsetHeight > 0) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  };

  const loadHereScripts = () => {
    if (window.H) return Promise.resolve();
    if (hereScriptsLoaded) {
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (window.H) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(check);
          reject(new Error("HERE scripts load timeout"));
        }, 10000);
      });
    }

    hereScriptsLoaded = true; 

    const scripts = [
      "https://js.api.here.com/v3/3.1/mapsjs-core.js",
      "https://js.api.here.com/v3/3.1/mapsjs-service.js",
      "https://js.api.here.com/v3/3.1/mapsjs-ui.js",
      "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js",
    ];

    return Promise.all(
      scripts.map((src) =>
        new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) return resolve();

          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = () => resolve();
          s.onerror = (e) => reject(new Error(`Failed to load ${src}`));
          document.body.appendChild(s);
        })
      )
    );
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setSelectedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let disposed = false;
    let resizeTimeout = null;
    let waitForViewInterval = null;
    let fallbackTimeout = null;

    const initMap = async () => {
      setInitializing(true);

      try {
        await loadHereScripts();

        let retries = 0;
        while (
          (!mapRef.current || mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) &&
          retries < 20
        ) {
          await new Promise((r) => setTimeout(r, 150));
          retries++;
        }
        if (!mapRef.current) {
          console.warn("Map container never became ready — aborting init.");
          return;
        }

        const platform = new window.H.service.Platform({
          apikey: process.env.REACT_APP_HERE_API_KEY,
        });

        const configureMap = (map, defaultLayers) => {
          new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
          window.H.ui.UI.createDefault(map, defaultLayers);

          const residentMarker = new window.H.map.Marker(selectedCoords, { volatility: true });

          const label = new window.H.map.DomIcon(`
            <div style="
              background: rgba(25, 118, 210, 0.95);
              color: white;
              font-size: 12px;
              font-weight: 500;
              padding: 2px 8px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              transform: translate(-50%, 8px);
            ">
              You are here
            </div>
          `);

          const labelMarker = new window.H.map.DomMarker(
            { lat: selectedCoords.lat - 0.00004, lng: selectedCoords.lng },
            { icon: label }
          );

          const residentGroup = new window.H.map.Group();
          residentGroup.addObjects([residentMarker, labelMarker]);
          map.addObject(residentGroup);

          map.addEventListener("tap", (evt) => {
            const coords = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);

            if (markerRef.current) {
              try { map.removeObject(markerRef.current); } catch {}
            }

            const marker = new window.H.map.Marker({ lat: coords.lat, lng: coords.lng });
            map.addObject(marker);
            markerRef.current = marker;

            setSelectedCoords({ lat: coords.lat, lng: coords.lng });
          });
        };

        let map;
        const defaultLayers = platform.createDefaultLayers();
        try {
          map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
            center: { lat: selectedCoords?.lat ?? 14.7995, lng: selectedCoords?.lng ?? 120.9267 },
            zoom: 17,
            pixelRatio: window.devicePixelRatio || 1,
          });
          configureMap(map, defaultLayers);
        } catch (vecErr) {
          console.warn("Vector init failed, falling back to raster:", vecErr);
          try {
            map = new window.H.Map(mapRef.current, defaultLayers.raster.normal.map, {
              center: { lat: selectedCoords?.lat ?? 14.7995, lng: selectedCoords?.lng ?? 120.9267 },
              zoom: 17,
              pixelRatio: window.devicePixelRatio || 1,
            });
            configureMap(map, defaultLayers);
          } catch (rasterErr) {
            console.error("Raster fallback also failed:", rasterErr);
            return;
          }
        }

        waitForViewInterval = setInterval(() => {
          try {
            if (map && typeof map.getViewModel === "function" && map.getViewModel()) {
              clearInterval(waitForViewInterval);
              waitForViewInterval = null;
              if (!disposed) setMapReady(true);
              if (!disposed) setInitializing(false);
            }
          } catch (e) {
          }
        }, 250);

        fallbackTimeout = setTimeout(() => {
          if (!disposed && !mapReady) {
            setMapReady(true);
            setInitializing(false);
            if (waitForViewInterval) {
              clearInterval(waitForViewInterval);
              waitForViewInterval = null;
            }
          }
        }, 6000);

        const resizeListener = () => {
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            try { map.getViewPort().resize(); } catch {}
          }, 150);
        };
        window.addEventListener("resize", resizeListener);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error("Map init error:", err);
        if (!disposed) {
          setMapReady(true);
          setInitializing(false);
        }
      }
    };

    initMap();

    return () => {
      disposed = true;
      if (waitForViewInterval) clearInterval(waitForViewInterval);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener("resize", () => {});
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.dispose(); } catch {}
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  const handleSubmitReport = async () => {
    if (!mapReady) return alert("Map not ready.");
    try {
      const payload = {
        incident_type_id: incidentTypeId,
        reporter_type: "witness",
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        landmark: null,
        description: null,
      };

      const data = await apiFetch(`${process.env.REACT_APP_URL}/api/incidents/from-resident`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Witness report response:", data);

      if (data.duplicate_of) {
        alert("This incident was already reported. We've added you as a duplicate reporter.");
        navigate("/resident/waiting", {
          state: { 
            duplicateOf: data.duplicate_of,
            duplicates: data.duplicates
          }
        });
        return;
      }

      navigate("/resident/call", {
        state: { 
          incidentType, 
          fromWitnessReport: true, 
          incident: data.incident 
        },
      });

    } catch (err) {
      console.error(err);
      alert("Submit failed — try again.");
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
        <label className="label">Pin the Location of the Incident:</label>
        <p className="instruction-text">Tap on the map to drop a pin where the incident happened.</p>

        <div className="map-box" style={{ position: "relative" }}>
          {initializing && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.6)",
              zIndex: 1000
            }}>
              <Spinner message="Loading map..." />
            </div>
          )}

          <div
            ref={mapRef}
            style={{
              width: "100%",
              height: "500px",
              borderRadius: "8px",
              visibility: mapReady ? "visible" : "hidden"
            }}
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
