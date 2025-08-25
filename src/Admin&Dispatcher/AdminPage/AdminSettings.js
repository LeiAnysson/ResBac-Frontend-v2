import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminSettings.css";
import React, { useEffect, useState } from "react";

const AdminSettings = () => {
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/admin/activity-logs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setActivityLogs(data);
      })
      .catch((error) => {
        console.error("Error fetching activity logs:", error);
      });
  }, []);

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h2 className="settings-title">Settings</h2>
          <div className="settings-grid">
            {/* Activity Log - Full width top row */}
            <div className="settings-card activity-log full-width">
              <div className="card-header">
                <span className="card-icon">🔄</span>
                <h4>Activity Log</h4>
              </div>
              <div className="settings-description">View Recent system activities and user actions.</div>
              <table className="activity-logs">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4">No activity logs available.</td>
                    </tr>
                  ) : (
                    activityLogs.map((log, index) => (
                      <tr key={index}>
                        <td>{log.user_id}</td>
                        <td>{log.action}</td>
                        <td>{log.entity}</td>
                        <td>{new Date(log.created_at).toLocaleString('en-PH', { hour12: true })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <button className="btn btn-primary">Export Log</button>
            </div>
            
            {/* Lookup Tables - Left side of middle row */}
            <div className="settings-card lookup-tables">
              <div className="card-header">
                <span className="card-icon">🔍</span>
                <h4>Lookup Tables</h4>
                <button className="btn btn-primary edit-btn">Edit</button>
              </div>
              <div className="settings-description">View reference table.</div>
              <table className="lookup-table">
                <thead>
                  <tr>
                    <th>Incident Type</th>
                    <th>Priority Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fire</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td>Medical Emergency</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td>Flood</td>
                    <td>Medium</td>
                  </tr>
                  <tr>
                    <td>Road Accident</td>
                    <td>Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Schedule Backup - Right side of middle row */}
            <div className="settings-card schedule-backup">
              <div className="card-header">
                <span className="card-icon">⏰</span>
                <h4>Schedule Backup</h4>
              </div>
              <div className="settings-description">Configure automatic data backups.</div>
              <div className="form-group">
                <label>Frequency:</label>
                <select>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time:</label>
                <input type="time" />
              </div>
              <button className="btn btn-primary">Save Schedule</button>
            </div>
            
            {/* Export Data - Left side of bottom row */}
            <div className="settings-card export-data">
              <div className="card-header">
                <span className="card-icon">⬇️</span>
                <h4>Export Data</h4>
              </div>
              <div className="settings-description">Download a copy of your system data.</div>
              <button className="btn btn-primary">Export</button>
            </div>
            
            {/* Import Data - Right side of bottom row */}
            <div className="settings-card import-data">
              <div className="card-header">
                <span className="card-icon">⬆️</span>
                <h4>Import Data</h4>
              </div>
              <div className="settings-description">Insert a copy of your system data.</div>
              <button className="btn btn-primary">Import</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
