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
            <div className="settings-card activity-log">
              <h4>Activity Log</h4>
              <div className="settings-description">View Recent system activities and user actions.</div>
              <table className="activity-logs">
                <thead>
                  <tr>
                    <th>User ID</th>
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
              <button className="export-btn">Export Log</button>
            </div>
            <div className="settings-card lookup-tables">
              <h4>Lookup Tables</h4>
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
              <button className="edit-btn">Edit</button>
            </div>
            <div className="settings-card schedule-backup">
              <h4>Schedule Backup</h4>
              <div className="settings-description">Configure automatic data backups.</div>
              <div>
                <label>Frequency: </label>
                <select>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label>Time: </label>
                <input type="time" />
              </div>
              <button className="save-btn">Save Schedule</button>
            </div>
            <div className="settings-card export-data">
              <h4>Export Data</h4>
              <div className="settings-description">Download a copy of your system data.</div>
              <button className="export-btn">Export</button>
            </div>
            <div className="settings-card import-data">
              <h4>Import Data</h4>
              <div className="settings-description">Insert a copy of your system data.</div>
              <button className="import-btn">Import</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default AdminSettings;
