import React, { useState, useEffect } from 'react';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import NavBar from '../../Components/ComponentsNavBar/NavBar';
import './DispatcherDashboard.css'; 
import BocaueHeatmap from '../../Components/Heatmap';
import { useNavigate } from 'react-router-dom';
import { reverseGeocode } from "../../utils/hereApi";

const DispatcherDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [activeReportGeocode, setActiveReportGeocode] = useState(null);
  const [latestReports, setLatestReports] = useState([]);
  const [latestReportsGeocode, setLatestReportsGeocode] = useState({});
  const [availableResponders, setAvailableResponders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => { 
    fetch(`${process.env.REACT_APP_URL}/api/incidents/latest-report`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(res => res.json())
      .then(async (data) => {
        const inactiveStatuses = ["Resolved", "Invalid", "Unanswered"];
        if (!inactiveStatuses.includes(data.status)) {
          setActiveReport(data);

          if (data.latitude && data.longitude) {
            const address = await reverseGeocode(data.latitude, data.longitude);
            setActiveReportGeocode(address);
          }
        }
      })
      .catch(error => console.error("Error fetching active report:", error));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/incidents/latest-reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(res => res.json())
      .then(async (data) => {
        const reportsArray = Array.isArray(data) ? data : [data];
        setLatestReports(reportsArray);

        const geocodeResults = {};
        for (const report of reportsArray) {
          if (!report.location && !report.landmark && !report.description && report.latitude && report.longitude) {
            const address = await reverseGeocode(report.latitude, report.longitude);
            geocodeResults[report.id] = address;
          }
        }
        setLatestReportsGeocode(geocodeResults);
      })
      .catch(error => console.error("Error fetching latest reports:", error));
  }, [token]);

  useEffect(() => {
      fetch(`${process.env.REACT_APP_URL}/api/heatmap/incidents`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      })
        .then(res => res.json())
        .then(data => {
          setIncidents(data);
        })
        .catch(error => console.error("Error fetching heatmap incidents:", error));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/teams/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setAvailableResponders(data))
      .catch(err => console.error("Error fetching available teams:", err));
  }, [token]);

  return (
    <div className="dispatcher-dashboard-container">
      <TopBar />
      <div className="dispatcher-main-content">
        <NavBar />
        <main className="dispatcher-content-area">
          <section className="dispatcher-header">
            <h2 className="dispatcher-title">Dispatch Control</h2>
            <span className="dispatcher-welcome">Welcome Back, Dispatcher!</span>
          </section>
          <div className="dispatcher-grid">
            <div className="dispatcher-column">
              <div className="dispatcher-card incoming-reports">
                <div className="dispatcher-card-header">Latest Reports</div>
                  {latestReports.length ? latestReports.map(report => (
                    <div key={report.id} className="report-item new">
                      <div>
                        <span className={`a-status-badge a-status-${report.status ? report.status.replace(/\s+/g, '-').toLowerCase() : 'unknown'}`}>
                          {report.status || 'Unknown'}
                        </span>
                        <span className="dispatcher-report-title">{report.type}</span>
                        <span className="dispatcher-report-time">{report.date}</span>
                      </div>
                      <div className="dispatcher-report-desc">
                        {latestReportsGeocode[report.id] && <div>{latestReportsGeocode[report.id]}</div>}
                        {(report.landmark || report.description) && (
                          <div>
                            {report.landmark || ""}{report.landmark && report.description ? " - " : ""}{report.description || ""}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="report-item">No reports</div>
                  )}
              </div>

              <div className="dispatcher-card active-reports">
                <div className="dispatcher-card-header">Active Report Monitor</div>
                {activeReport ? (
                  <div className="report-item assigned">
                    <span className={`report-badge ${activeReport.status ? activeReport.status.replace(/\s+/g, '-').toLowerCase() : 'unknown'}`}>
                      {activeReport.status}
                    </span>
                    <span className="dispatcher-report-title">{activeReport.type}</span>
                    <div className="dispatcher-report-desc">
                      {activeReportGeocode && <div>{activeReportGeocode}</div>}
                      {(activeReport.landmark || activeReport.description) && (
                        <div>
                          {activeReport.landmark || ""}{activeReport.landmark && activeReport.description ? " - " : ""}{activeReport.description || ""}
                        </div>
                      )}
                      Response Team: <span className="responder-name">Team {activeReport.response_team || "Unassigned"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="report-item">No active reports</div>
                )}
              </div>
            </div>
            <div className="dispatcher-column">
              <div className="dispatcher-card dispatcher-incident-heatmap">
                <div className="dispatcher-card-header">Incident Heatmap</div>
                  <div className="heatmap-legend">
                    <span className="legend-label">Least</span>
                    <div className="legend-bar"></div>
                    <span className="legend-label">Most</span>
                  </div>
                  <BocaueHeatmap
                    apiKey={process.env.REACT_APP_HERE_API_KEY}
                    incidents={incidents}
                    mapOptions={{ center: { lat: 14.7968, lng: 121.0410 }, zoom: 12 }}
                  />
              </div>
             <div className="dispatcher-card available-responders">
                <div className="dispatcher-card-header">Available Response Teams</div>
                {availableResponders && availableResponders.length > 0 ? (
                  availableResponders.map((responder) => (
                    <div className="responder-item" key={responder.id}>
                      <span className="responder-name">Team {responder.team_name}</span>
                      <span className="responder-details">
                        <span className={`status ${responder.status ? responder.status.replace(/\s+/g, '-').toLowerCase() : 'unknown'}`}>
                          {responder.status || 'Unknown'}
                        </span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="responder-item">No responders available</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
