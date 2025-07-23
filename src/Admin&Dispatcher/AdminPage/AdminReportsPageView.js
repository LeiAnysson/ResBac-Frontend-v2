
import React from "react";
import { useParams } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminReportsPage.css"; // reuse your CSS

// Example static data (replace with real data/fetch if needed)
const reports = [
  {
    id: "RPT001",
    type: "Fire",
    location: "Duhat, Bocaue",
    timestamp: "02-31-2025 3:00PM",
    status: "Requesting for backup",
    description: "Fire reported in a residential neighborhood. Thick black smoke observed rising.",
    reporter: "Lei Anysson Marquez",
    mapUrl: "https://i.ibb.co/6bQ7Q2d/map-placeholder.png"
  },
  {
    id: "RPT002",
    type: "Medical",
    location: "Balagtas, Bulacan",
    timestamp: "02-31-2025 3:00PM",
    status: "Resolved",
    description: "Medical emergency at Balagtas.",
    reporter: "Grace Bayonito",
    mapUrl: "https://i.ibb.co/6bQ7Q2d/map-placeholder.png"
  },
  // ... more reports
];

export default function AdminReportPageView() {
  const { id } = useParams();
  const report = reports.find(r => r.id === id);

  if (!report) {
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h2>Report Not Found</h2>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h1 className="report-title">Report</h1>
          <div className="emergency-report-card">
            <div className="emergency-report-header">
              <span className="emergency-report-badge">
                <span role="img" aria-label="alert">🚨</span> Emergency Incident and Disaster Reports
              </span>
              <div>
                <button className="backup-btn">Backup</button>
                <button className="invalid-btn">Mark as Invalid</button>
              </div>
            </div>
            <div className="incident-details">
              <div>
                <span className="incident-type-label">Incident Type:</span>
                <span className={`incident-type-${report.type.toLowerCase()}`}>{report.type}</span>
              </div>
              <div className="incident-meta">
                <span>{report.timestamp}</span>
                <span>{report.location}</span>
              </div>
              <div className="incident-reporter">
                <span>Reported By: <b>{report.reporter}</b></span>
              </div>
            </div>
            <div className="incident-location">
              <h3>Location</h3>
              <img
                src={report.mapUrl}
                alt="Map"
                className="incident-map"
              />
            </div>
            <div className="incident-description">
              <h3>Description</h3>
              <input
                className="description-input"
                value={report.description}
                readOnly
              />
            </div>
            <div className="incident-actions">
              <button className="send-btn">Send To Responder</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
