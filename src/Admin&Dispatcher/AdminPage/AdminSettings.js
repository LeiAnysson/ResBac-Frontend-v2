import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminSettings.css";
import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from '../../utils/apiFetch';
import { printTable } from "../../utils/printTable";

console.log(printTable);

const AdminSettings = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const fileInputRef = useRef(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false); //NOT FUNCTIONAL YET!!!
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const fetchActivityLogs = async (page = 1, filters = {}) => {
      try {
        const data = await apiFetch(`http://127.0.0.1:8000/api/admin/activity-logs?page=${page}`);

        setActivityLogs(data.data);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
        });
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);
      }
  };

  useEffect(() => {
      fetchActivityLogs();
  }, []);

  const handlePrintAll = async () => {
    const data = await apiFetch("http://127.0.0.1:8000/api/admin/activity-logs/all");

    printTable(data, [
      { header: "User ID", key: "user_id" },
      { header: "Action", key: "action" },
      { header: "Entity", key: "entity" },
      { header: "Timestamp", key: "created_at" },
    ], "Activity Logs");
  };

  const handleImportClick = () => {
    if (!isMaintenanceMode) return;

    const confirmRestore = window.confirm(
      "Restoring will overwrite current system data. Do you want to continue?"
    );

    if (confirmRestore) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`Selected file: ${file.name}`);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setMessage("No file selected for restore.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("backupFile", selectedFile);

      const response = await fetch("/api/restore", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Restore completed successfully!");
      } else {
        setMessage("Restore failed. Please try again.");
      }
    } catch (error) {
      console.error("Restore error:", error);
      setMessage("An error occurred during restore.");
    }
  };


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

              <table id="activity-log-table" className="activity-logs">
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

              <div className="table-footer">
                <button className="export-btn" onClick={handlePrintAll}>Export Log</button>

                <div className="pagination">
                  <button
                    disabled={pagination.current_page === 1}
                    onClick={() => fetchActivityLogs(pagination.current_page - 1)}
                  >
                    Prev
                  </button>
                  <span>
                    {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() => fetchActivityLogs(pagination.current_page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
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
              <button
                onClick={() => window.open('http://127.0.0.1:8000/backup-database', '_blank')}
                className="export-btn"
              >
                Export
              </button>
            </div>

            <div className="settings-card import-data">
              <h4>Import Data</h4>
              <div className="settings-description">
                Insert a copy of your system data.
              </div>

              <button
                className="import-btn"
                onClick={handleImportClick}
                disabled={!isMaintenanceMode}
                title={
                  !isMaintenanceMode
                    ? "Enable Maintenance Mode to restore data."
                    : "Import backup file"
                }
              >
                Import
              </button>

              {selectedFile && (
                <button className="restore-btn" onClick={handleRestore}>
                  Confirm Restore
                </button>
              )}

              {message && <div className="restore-message">{message}</div>}

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".sql,.json,.zip"
                onChange={handleFileChange}
              />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
export default AdminSettings;
