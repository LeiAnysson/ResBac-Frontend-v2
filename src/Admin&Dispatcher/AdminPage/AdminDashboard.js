import NavBar from '../../Components/ComponentsNavBar/NavBar';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import './AdminDashboard.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BocaueHeatmap from '../../Components/Heatmap';
import { MdPending, MdPeople, MdAssignment, MdCheckCircle, MdPrint } from 'react-icons/md';
import { printTable } from '../../utils/printTable';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0); 
  const [reportsThisWeek, setReportsThisWeek] = useState(0);
  const [pendingResidents, setPendingResidents] = useState(0);
  const [ongoingReports, setOngoingReports] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [monthlyIncidentReports, setMonthlyIncidentReports] = useState([]);

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

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/incidents/monthly-counts`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setMonthlyIncidentReports(data))
      .catch(error => console.error("Error fetching monthly incident reports:", error));
  }, []);

  const handlePrintDetailedReports = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/admin/reports/all`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      const data = await response.json();

      const formattedData = data.map(report => {
        const statusHistory = (report.status_logs || [])
        .map(s => `${s.status} (${new Date(s.created_at).toLocaleString()})`)
        .join("\n↓\n");

        return {
          ...report,
          status_history: statusHistory || report.status_history, 
          team_name: report.team_name,
        };
      });

      const columns = [
        { header: "Incident Type", key: "incident_type" },
        { header: "Resident", key: "resident_name" },
        { header: "Landmark", key: "landmark" },
        { header: "Latitude", key: "latitude" },
        { header: "Longitude", key: "longitude" },
        { header: "Status History", key: "status_history" }, 
        { header: "Team Assigned", key: "team_name" },
        { header: "Reporter Type", key: "reporter_type" },
        { header: "Date Reported", key: "created_at" },
      ];

      printTable(formattedData, columns, "Detailed Emergency Incident Reports");

    } catch (error) {
      console.error("Error generating detailed report:", error);
    }
  };

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
                <span className="stat-label"><MdPeople className="stat-icon"/> Total Registered Users</span>
                <span className="stat-value">{userCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label"><MdAssignment className="stat-icon"/> Ongoing Emergency Reports</span>
                <span className="stat-value stat-danger">{ongoingReports}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label"><MdPending className="stat-icon"/> Residents Awaiting Approval</span>
                <span className="stat-value stat-warning">{pendingResidents}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label"><MdCheckCircle className="stat-icon"/> Reports Resolved this Week</span>
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

            <div className="incident-report-monthly">
              <div className="incident-header">
                <h3>Number of Reports per Incident Type (This Month)</h3>
                <button
                  className="print-btn"
                  onClick={() =>
                    printTable(
                      monthlyIncidentReports,
                      [
                        { header: "Incident Type", key: "type" },
                        { header: "Number of Reports", key: "count" },
                      ],
                      "Monthly Incident Report Summary"
                    )
                  }
                >
                  <MdPrint className="print-icon"/> Print Report
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Incident Type</th>
                    <th>Number of Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyIncidentReports.length === 0 ? (
                    <tr>
                      <td colSpan="2">No data available</td>
                    </tr>
                  ) : (
                    monthlyIncidentReports.map((incident, idx) => (
                      <tr key={idx}>
                        <td>{incident.type}</td>
                        <td>{incident.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
                <div className="incident-detailed-section">
                  <button
                    className="print-btn"
                    onClick={() => handlePrintDetailedReports()}
                  >
                    <MdPrint className="print-icon"/> Print Detailed Reports
                  </button>
                </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
