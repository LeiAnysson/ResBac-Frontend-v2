import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminSettings.css";
import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { printTable } from "../../utils/printTable";
import IncidentTypeEditor from "./Functionalities/IncidentTypeEditor";
import {
  MdHistory, MdUploadFile, MdDownload, MdEvent, MdTableChart
} from 'react-icons/md';

const AdminSettings = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [incidentPagination, setIncidentPagination] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [isIncidentEditorOpen, setIsIncidentEditorOpen] = useState(false);
  const [frequency, setFrequency] = useState(localStorage.getItem("backupFrequency") || "Daily");
  const [time, setTime] = useState(localStorage.getItem("backupTime") || "00:00");

  const fetchActivityLogs = async (page = 1, filters = {}) => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/activity-logs?page=${page}`);

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
    const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/activity-logs/all`);

    printTable(data, [
      { header: "User ID", key: "user_id" },
      { header: "Action", key: "action" },
      { header: "Entity", key: "entity" },
      { header: "Timestamp", key: "created_at" },
    ], "Activity Logs");
  };

  const handleImportClick = () => {
    const confirmRestore = window.confirm(
      "Restoring will overwrite current system data. Do you want to continue?"
    );

    if (confirmRestore) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('backupFile', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Unexpected response from server.");
      }

      if (!response.ok) {
        if (data.code === "TABLE_EXISTS") {
          alert("Restore failed: Tables already exist. Please drop existing tables before restoring.");
        } else {
          alert(`Restore failed: ${data.message}`);
        }
        console.error('Restore failed:', data);
        return;
      }

      alert("Database restored successfully!");
      console.log('Restore success:', data);
    } catch (err) {
      console.error('Error during restore:', err);
      alert(`Error during restore: ${err.message}`);
    }
  };

  const handleScheduledBackup = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/backup/scheduled`);
      const data = await response.json();

      if (response.ok) {
        alert(`Scheduled backup saved: ${data.file}`);
      } else {
        alert(`Backup failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Scheduled backup error:", error);
      alert("Error while creating scheduled backup.");
    }
  };

  const handleSaveSchedule = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/backup/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frequency: frequency.toLowerCase(),
          time,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("backupFrequency", frequency);
        localStorage.setItem("backupTime", time);
        alert(`Backup schedule saved!\n${frequency} at ${time}`);
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to connect to the server.");
    }
  };

  
  const fetchIncidentTypes = async (page = 1) => {
    try {
      const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types?page=${page}`);
      setIncidentTypes(data.data);
      setIncidentPagination({
        current_page: data.current_page,
        last_page: data.last_page,
      });
    } catch (err) {
      console.error("Failed to fetch incident types: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentTypes();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h2 className="settings-title">Settings</h2>
          <div className="settings-grid">

            <div className="settings-card activity-log full-width">
              <div className="card-header activity-log-header">
                <div className="title-wrapper">
                  <MdHistory className="card-icon" />
                  <h4>Activity Log</h4>
                </div>
                <button className="btn btn-primary export-log-btn" onClick={handlePrintAll}>
                  Export Log
                </button>
              </div>

              <div className="settings-description">View Recent system activities and user actions.</div>
              <div className="activity-log-table-wrapper">
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
              </div>
              
              <div className="table-footer">
                <div className="emergency-reports-pagination">
                  <button className="pagination-btn" 
                    disabled={pagination.current_page === 1}
                    onClick={() => fetchActivityLogs(pagination.current_page - 1)}
                  >
                    Prev
                  </button>
                  <span>
                    {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button className="pagination-btn" 
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() => fetchActivityLogs(pagination.current_page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            
            {/* Lookup Tables - Left side of middle row */}
            <div className="settings-card lookup-tables">
              <div className="card-header activity-log-header">
                <div className="title-wrapper">
                  <MdTableChart className="card-icon" />
                  <h4>Lookup Tables</h4>
                </div>
                <button className="btn btn-primary export-log-btn" onClick={() => setIsIncidentEditorOpen(true)}>
                  Edit
                </button>
              </div>
              <div className="settings-description">View reference table.</div>
              <table className="lookup-table">
                <thead>
                  <tr>
                    <th>Incident Type</th>
                    <th>Default Priority Level</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentTypes.map((incident) => (
                    <tr key={incident.id}>
                      <td>{incident.name}</td>
                      <td>{incident.priority?.priority_name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="table-footer">
                <div className="emergency-reports-pagination">
                  <button className="pagination-btn"
                    disabled={incidentPagination.current_page === 1}
                    onClick={() => fetchIncidentTypes(incidentPagination.current_page - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    {incidentPagination.current_page} / {incidentPagination.last_page}
                  </span>

                  <button className="pagination-btn"
                    disabled={incidentPagination.current_page === incidentPagination.last_page}
                    onClick={() => fetchIncidentTypes(incidentPagination.current_page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            
            {/* Schedule Backup - Right side of middle row */}
            <div className="settings-card schedule-backup">
              <div className="card-header">
                <MdEvent className="card-icon" />
                <h4>Schedule Backup</h4>
              </div>
              <div className="settings-description">Configure automatic data backups.</div>
              <div className="form-group">
                <label>Frequency:</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time:</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="button-group">
                <button className="btn btn-primary" onClick={handleSaveSchedule}>
                  Save Schedule
                </button>
                <button className="btn btn-secondary" onClick={handleScheduledBackup}>
                  Run Scheduled Backup Now
                </button>
              </div>
            </div>
            
            {/* Export Data - Left side of bottom row */}
            <div className="settings-card export-data">
              <div className="card-header">
                <MdDownload className="card-icon" />
                <h4>Export Data</h4>
              </div>
              <div className="settings-description">Download a copy of your system data.</div>
              <button
                onClick={() => window.open(`${process.env.REACT_APP_URL}/api/backup/download`, '_blank')}
                className="btn btn-primary"
              >
                Export
              </button>
            </div>
            
            {/* Import Data - Right side of bottom row */}
            <div className="settings-card import-data">
              <div className="card-header">
                <MdUploadFile className="card-icon" />
                <h4>Import Data</h4>
              </div>
              <div className="settings-description">Insert a copy of your system data.</div>
              <button
                className="btn btn-primary"
                onClick={handleImportClick}
              >
                Import
              </button>

              <input
                type="file"
                accept=".sql,.txt"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <IncidentTypeEditor
              isOpen={isIncidentEditorOpen}
              onClose={() => setIsIncidentEditorOpen(false)}
              refreshList={() => fetchIncidentTypes(incidentPagination.current_page)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
