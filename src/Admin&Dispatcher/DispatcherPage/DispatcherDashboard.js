import React from 'react';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import NavBar from '../../Components/ComponentsNavBar/NavBar';
import './DispatcherDashboard.css'; 

const DispatcherDashboard = () => {
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
                <div className="dispatcher-heatmap-placeholder">[Map Placeholder]</div>
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
