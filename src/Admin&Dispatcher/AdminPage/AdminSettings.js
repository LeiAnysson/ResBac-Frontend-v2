import React from "react";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminSettings.css";

export default function AdminSettings() {
  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h2 className="settings-title">Settings</h2>
          <div className="settings-grid">
            <div className="settings-card activity-log">
              <h3>Activity Log</h3>
              <div className="settings-description">View Recent system activities and user actions.</div>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Admin</td>
                    <td>deleted</td>
                    <td>account</td>
                    <td>2025-05-01 | 19:30:00 PM</td>
                  </tr>
                  <tr>
                    <td>Admin</td>
                    <td>approved</td>
                    <td>registration</td>
                    <td>2025-05-01 | 19:30:00 PM</td>
                  </tr>
                  <tr>
                    <td>Dispatcher</td>
                    <td>assigned</td>
                    <td>responder</td>
                    <td>2025-05-01 | 19:30:00 PM</td>
                  </tr>
                </tbody>
              </table>
              <button className="export-btn">Export Log</button>
            </div>
            <div className="settings-card lookup-tables">
              <h3>Lookup Tables</h3>
              <div className="settings-description">View reference table.</div>
              <table>
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
              <h3>Schedule Backup</h3>
              <div className="settings-description">Configure automatic data backups.</div>
              <div>
                <label>Frequency:</label>
                <select>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label>Time:</label>
                <input type="time" />
              </div>
              <button className="save-btn">Save Schedule</button>
            </div>
            <div className="settings-card export-data">
              <h3>Export Data</h3>
              <div className="settings-description">Download a copy of your system data.</div>
              <button className="export-btn">Export</button>
            </div>
            <div className="settings-card import-data">
              <h3>Import Data</h3>
              <div className="settings-description">Insert a copy of your system data.</div>
              <button className="import-btn">Import</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
