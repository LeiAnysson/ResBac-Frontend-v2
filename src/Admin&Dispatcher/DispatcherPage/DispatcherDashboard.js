import React, { useState, useEffect } from 'react';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import NavBar from '../../Components/ComponentsNavBar/NavBar';
import './DispatcherDashboard.css'; 
import BocaueHeatmap from '../../Components/Heatmap';
import { useNavigate } from 'react-router-dom';

const DispatcherDashboard = () => {
  const [incidents, setIncidents] = useState([]);

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
    <div className="dispatcher-dashboard-container">
      <TopBar />
      <div className="dispatcher-main-content">
        <NavBar />
        <main className="dispatcher-content-area">
          <section className="dispatcher-header">
            <h2 className="dispatcher-title">Dispatch Control</h2>
            <span className="dispatcher-welcome">Welcome Back, Dispatcher!</span>
          </section>
          <div className="dispatcher-grid">
            <div className="dispatcher-column">
              <div className="dispatcher-card incoming-reports">
                <div className="dispatcher-card-header">Incoming Reports</div>

                <div className="report-item new">
                  <div>
                    <span className="report-badge new">New</span>
                    <span className="report-title">Medical Assistance</span>
                    <span className="report-time">3 mins ago</span>
                  </div>
                  <div className="report-desc">123 Bocaue st - Difficulty Breathing</div>
                </div>
                <div className="report-item new">
                  <div>
                    <span className="report-badge new">New</span>
                    <span className="report-title">Fire Alarm</span>
                    <span className="report-time">8 mins ago</span>
                  </div>
                  <div className="report-desc">456 Bocaue, Turo - KFC Alarm</div>
                </div>
              </div>
              <div className="dispatcher-card active-reports">
                <div className="dispatcher-card-header">Active Reports Monitor</div>
                <div className="report-item assigned">
                  <span className="report-badge assigned">Assigned</span>
                  <span className="report-title">Car Accident</span>
                  <div className="report-desc">
                    789 Duhat, Bocaue - Road Rage | McArthur Highway<br />
                    Responder: <span className="responder-name">Lei Anysson Marquez</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dispatcher-column">
              <div className="dispatcher-card dispatcher-incident-heatmap">
                <div className="dispatcher-card-header">Incident Heatmap</div>
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
              <div className="dispatcher-card available-responders">
                <div className="dispatcher-card-header">Available Response Team</div>
                <div className="responder-item">
                  <span className="responder-name">M201 - EMT Anysson</span>
                  <span className="responder-details">
                    Type: Medical | Location: Duhat, Bocaue | Status: <span className="status onroute">On Route</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
