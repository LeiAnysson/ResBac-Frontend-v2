// capstone/src/Admin&Dispatcher/AdminPage/AdminReportsPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminReportsPage.css";

const reports = [
  {
    id: "RPT001",
    type: "Fire",
    location: "Duhat, Bocaue",
    timestamp: "02-31-2025 3:00PM",
    status: "Requesting for backup",
  },
  {
    id: "RPT002",
    type: "Medical",
    location: "Balagtas, Bulacan",
    timestamp: "02-31-2025 3:00PM",
    status: "Resolved",
  },
  {
    id: "RPT003",
    type: "Medical",
    location: "Valenzuela City",
    timestamp: "02-31-2025 3:00PM",
    status: "Resolved",
  },
];

export default function AdminReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h1 className="emergency-reports-title">Emergency Reports Overview</h1>
          <div className="emergency-reports-card">
            <div className="emergency-reports-controls">
              <input className="emergency-reports-search" placeholder="Search..." />
              <button className="emergency-reports-search-btn">
                <span role="img" aria-label="search">🔍</span> Search
              </button>
            </div>
            <table className="emergency-reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>
                      <span className={`type-badge type-${report.type.toLowerCase()}`}>
                        {report.type}
                      </span>
                    </td>
                    <td>{report.location}</td>
                    <td>{report.timestamp}</td>
                    <td>
                      <span className={`status-badge status-${report.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/admin/emergency-reports/${report.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="emergency-reports-pagination">
              <span>1 of 1 items</span>
              <span>
                &lt; <b>Page 1</b> of 1 &gt;
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
