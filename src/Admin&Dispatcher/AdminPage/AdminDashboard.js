import NavBar from '../../Components/ComponentsNavBar/NavBar';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import './AdminDashboard.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BocaueHeatmap from '../../Components/Heatmap';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0); 
  const [reportsThisWeek, setReportsThisWeek] = useState(0);
  const [pendingResidents, setPendingResidents] = useState(0);
  const [ongoingReports, setOngoingReports] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/admin/users/total-users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setUserCount(data.total_users))
      .catch(error => console.error("Error fetching user count:", error));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/incidents/ongoing-reports`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setOngoingReports(data.ongoing_reports))
      .catch(error => console.error("Error fetching ongoing reports:", error));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/admin/residents/pending-residents`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setPendingResidents(data.pending_residents))
      .catch(error => console.error("Error fetching pending residents:", error));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/incidents/weekly-reports`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setReportsThisWeek(data.weekly_reports))
      .catch(error => console.error("Error fetching weekly resolved reports:", error));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/admin/activity-logs?per_page=5`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => {
        setActivityLogs(data.data || []);
      })
      .catch(error => console.error("Error fetching activity logs:", error));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/incidents/latest-report`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setLatestReport(data))
      .catch(error => console.error("Error fetching latest report:", error));
  }, []);

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

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="dashboard-greeting">
              <h2 className="dashboard-title">Dashboard Overview</h2>
              <span className="dashboard-welcome">Welcome Back, Admin!</span>
          </div>
          <section className="dashboard-header">
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-label">Total Registered Users</span>
                <span className="stat-value">{userCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Ongoing Emergency Reports</span>
                <span className="stat-value stat-danger">{ongoingReports}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Residents Awaiting Approval</span>
                <span className="stat-value stat-warning">{pendingResidents}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Reports Resolved this Week</span>
                <span className="stat-value stat-success">{reportsThisWeek}</span>
              </div>
            </div>
          </section>

          <section className="dashboard-lower-section">
            <div className="lower-grid">
              <div className="incident-heatmap">
                <h3>Incident Heat Map</h3>
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
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <ul className="activity-list">
                  {activityLogs.length === 0 && <li>No recent activity</li>}
                    {activityLogs.map(log => (
                      <li className="list" key={log.id}>
                        User {log.user_id} {log.action} <span className="activity-time">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="latest-emergency-report">
                <h3>Latest Emergency Report</h3>
                {latestReport ? (
                  <div>
                    <div className="dashboard-report-info">
                      <p className="dashboard-report-date">{latestReport.date}</p>
                      <div className="dashboard-same-line">
                        <span className={`a-status-badge a-status-${latestReport.status.replace(/\s+/g, '-').toLowerCase()}`}>
                          {latestReport.status}
                        </span>
                        <p className="dashboard-report-type">Incident Type: <strong>{latestReport.type}</strong></p>
                      </div>
                      <p className="dashboard-report-location">{latestReport.location || latestReport.landmark || "No location provided"}</p>
                      <p className="dashboard-report-team">
                        Response Team: <strong>Team {latestReport.response_team || "Unassigned"}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="empty-card">
                    <p className="empty-text">No recent reports</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
