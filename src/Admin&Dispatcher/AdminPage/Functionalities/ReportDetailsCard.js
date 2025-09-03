import React, { useEffect, useRef } from "react";

let hereMapsLoaded = false;

const ReportDetailsCard = ({ report }) => {
  const mapRef = useRef(null);

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
            {report.landmark || 'Unknown location'}
          </div>
        </div>
        <div className="incident-actions-header">
          <button className="backup-btn">Backup</button>
          <button className="invalid-btn">Mark as Invalid</button>
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
          value={report.description ?? ""}
          readOnly
        />
      </div>
      <div className="incident-actions">
        <button className="send-btn">Send To Responder</button>
      </div>
    </div>
  );
};

export default ReportDetailsCard;
