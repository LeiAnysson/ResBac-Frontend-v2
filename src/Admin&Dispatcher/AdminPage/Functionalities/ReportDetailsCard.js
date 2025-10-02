import React, { useEffect, useRef, useState } from "react";

let hereMapsLoaded = false;

const ReportDetailsCard = ({ report, editable, setReport }) => {
  const mapRef = useRef(null);
  const [updateMessage, setUpdateMessage] = useState(report.description ?? "");
  const [landmark, setLandmark] = useState(report.landmark ?? "");

  useEffect(() => {
    setUpdateMessage(report.description ?? "");
    setLandmark(report.landmark ?? "");
  }, [report]);

  useEffect(() => {
    if (!report?.latitude || !report?.longitude) return;

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
        scripts.map(src => new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        }))
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
            lat: parseFloat(report.latitude),
            lng: parseFloat(report.longitude),
          },
          zoom: 15,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      window.addEventListener("resize", () => map.getViewPort().resize());
      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);

      const marker = new window.H.map.Marker({
        lat: parseFloat(report.latitude),
        lng: parseFloat(report.longitude),
      });
      map.addObject(marker);

      return () => map.dispose();
    });
  }, [report]);

  const sendUpdate = async () => {
    if (!updateMessage.trim() && (!editable || !landmark?.trim())) return;

    try {
      const body = { update_message: updateMessage };
      if (editable && landmark?.trim()) body.landmark = landmark;

      const data = await apiFetch(
        `${process.env.REACT_APP_URL}/api/incidents/${report.id}/updates`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      setReport(prev => ({
        ...prev,
        description: updateMessage,
        landmark: landmark,
      }));

      console.log("Update sent:", data);
      alert("Update sent to responder!");
    } catch (error) {
      console.error(error);
      alert("Failed to send update. Try again.");
    }
  };

  const markInvalid = async () => {
    if (!window.confirm("Are you sure you want to mark this report as invalid?")) return;

    try {
      const data = await apiFetch(
        `${process.env.REACT_APP_URL}/api/incidents/${report.id}/mark-invalid`,
        { method: "POST" }
      );

      setReport(prev => ({
        ...prev,
        status: 'invalid'
      }));

      alert("Report marked as invalid!");
    } catch (err) {
      console.error(err);
      alert("Failed to mark report as invalid. Try again.");
    }
  };



  if (!report) return null;

  return (
    <div className="emergency-report-card">
      <div className="emergency-report-header">
        <div className="incident-details">
          <div>
            <span className="incident-type-label">Incident Type:</span>
            <span className={`type-badge incident-type-${report.incident_type.name.toLowerCase().replace(/\s+/g, '-')}`}>
              {report.incident_type?.name  || 'Unknown'}
            </span>
            {report.duplicates && (
              <span className="duplicate-badge">
                {JSON.parse(report.duplicates).length} duplicates
              </span>
            )}
          </div>
          <div className="incident-meta">
            {report?.reported_at && (
              <span>
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                }).format(new Date(report.reported_at))}
              </span>
            )}
          </div>
          
          <div className="incident-reporter">
            <span className="reporter-label"><b>Reported By: </b></span>
            <span className="reporter-name">
              {report.user ? `${report.user.first_name} ${report.user.last_name}` : 'N/A'}
            </span>
          </div>
          <div className="incident-location-detail">
            {editable ? (
              <input
                className="landmark-input"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Enter landmark"
                readOnly={report.status === 'invalid'}
              />
            ) : (
              report.status === 'invalid' ? (
                <span className="invalid-text">Invalid</span>
              ) : (
                report.landmark || "Unknown location"
              )
            )}
          </div>
        </div>
        <div className="incident-actions-header">
          <button className="invalid-btn" onClick={markInvalid}>Mark as Invalid</button>
        </div>
      </div>

      <div className="incident-location">
        <h4>Location</h4>
        <div
          ref={mapRef}
          style={{ width: "100%", height: "250px", borderRadius: "8px" }}
        />
      </div>

      <div className="incident-description">
        <h4>Description</h4>
        <input
          className="description-input"
          value={updateMessage}
          readOnly={!editable || report.status === 'invalid'}
          onChange={(e) => setUpdateMessage(e.target.value)}
        />
      </div>
      <div className="incident-actions">
        <button className="send-btn" onClick={sendUpdate}>
          Send To Responder
        </button>
      </div>
    </div>
  );
};

export default ReportDetailsCard;
