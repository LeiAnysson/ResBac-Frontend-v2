import { useParams } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminReportsPage.css"; 
import React, { useState, useEffect } from 'react';

const AdminReportPageView = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/admin/incidents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching report:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h2>Loading report...</h2>
          </main>
        </div>
      </div>
    );
  }

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
  };

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h1 className="report-title">Report</h1>
          <div className="emergency-report-wrapper">
            <span className="emergency-report-badge">
              <span role="img" aria-label="alert">🚨</span> Emergency Incident and Disaster Reports
            </span>

            <div className="emergency-report-card">
              <div className="emergency-report-header">
                <div className="incident-details">
                  <div>
                    <span className="incident-type-label">Incident Type:</span>
                    <span className={`type-badge incident-type-${report.incident_type.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {report.incident_type.name}
                    </span>
                  </div>
                  <div className="incident-meta">
                    {report && report.reported_at && (
                      <span>
                        {new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        }).format(new Date(report.reported_at))}
                      </span>
                    )}
                  </div>
                  <div className="incident-location-detail">
                    {report.landmark ?? 'Unknown location'}
                  </div>
                  <div className="incident-reporter">
                    <span className="reporter-label"><b>Reported By: </b></span>
                    <span className="reporter-name">{report.user ? `${report.user.first_name} ${report.user.last_name}` : 'N/A'}</span>
                  </div>
                </div>
                
                <div className="incident-actions-header">
                  <button className="backup-btn">Backup</button>
                  <button className="invalid-btn">Mark as Invalid</button>
                </div>
              </div>
              
              <div className="incident-location">
                <h4>Location</h4>
                <img
                  src={report.map_url ?? '/default-map.png'}
                  alt="Map"
                  className="incident-map"
                />
              </div>

              <div className="incident-description">
                <h4>Description</h4>
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
          </div>
        </main>
      </div>
    </div>
  );
};
export default AdminReportPageView;
