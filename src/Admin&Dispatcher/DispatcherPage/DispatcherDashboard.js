import React from 'react';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import NavBar from '../../Components/ComponentsNavBar/NavBar';
import './DispatcherDashboard.css'; // Create this CSS file for custom styles

const DispatcherDashboard = () => {
  return (
    <div className="dispatcher-dashboard-container">
      <TopBar />
      <div className="dispatcher-main-content">
        <NavBar />
        <main className="dispatcher-content-area">
          <section className="dispatcher-header">
            <h2 className="dispatcher-title">Dispatch Control</h2>
            <span className="dispatcher-welcome">Welcome Back!</span>
          </section>
          <div className="dispatcher-grid">
            <div className="dispatcher-column">
              <div className="dispatcher-card incoming-reports">
                <h3>Incoming Reports</h3>
                {/* Example incoming reports */}
                <div className="report-item new">
                  <div>
                    <span className="report-badge new">New</span>
                    <span className="report-title">Medical Assistance</span>
                    <span className="report-time">3 mins ago</span>
                  </div>
                  <div className="report-desc">123 Bocaue st - Difficulty Breathing</div>
                  <button className="assign-btn">Assign</button>
                </div>
                <div className="report-item new">
                  <div>
                    <span className="report-badge new">New</span>
                    <span className="report-title">Fire Alarm</span>
                    <span className="report-time">8 mins ago</span>
                  </div>
                  <div className="report-desc">456 Bocaue, Turo - KFC Alarm</div>
                  <button className="assign-btn">Assign</button>
                </div>
              </div>
              <div className="dispatcher-card active-reports">
                <h3>Active Reports Monitor</h3>
                {/* Example active reports */}
                <div className="report-item assigned">
                  <span className="report-badge assigned">Assigned</span>
                  <span className="report-title">Car Accident</span>
                  <span className="report-time">Assigned 5 mins ago</span>
                  <div className="report-desc">
                    789 Duhat, Bocaue - Road Rage | McArthur Highway<br />
                    Responder: <span className="responder-name">Lei Anysson Marquez</span>
                  </div>
                </div>
                <div className="report-item enroute">
                  <span className="report-badge enroute">On Route</span>
                  <span className="report-title">Medical Assistance</span>
                  <span className="report-time">On Route 2 mins ago</span>
                  <div className="report-desc">
                    10 Duhat, Bocaue - Heart Attack | Phase 3, Blk 21 Lot 24<br />
                    Responder: <span className="responder-name">Grace Bayonito</span>
                  </div>
                </div>
                <div className="report-item onsite">
                  <span className="report-badge onsite">On Scene</span>
                  <span className="report-title">Fire Alarm</span>
                  <span className="report-time">On Scene 15 mins ago</span>
                  <div className="report-desc">
                    Industrial Park Rd - Warehouse Fire | Phase 4L, Blk 12 Lot 92<br />
                    Responder: <span className="responder-name">Grace Bayonito</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dispatcher-column">
              <div className="dispatcher-card incident-heatmap">
                <h3>Incident Heatmap</h3>
                <div className="heatmap-placeholder">[Map Placeholder]</div>
              </div>
              <div className="dispatcher-card available-responders">
                <h3>Available Responders</h3>
                <div className="responder-item">
                  <span className="responder-name">M201 - EMT Anysson</span>
                  <span className="responder-details">
                    Type: Medical | Location: Duhat, Bocaue | Status: <span className="status onroute">On Route</span>
                  </span>
                  <button className="assign-btn">Assign</button>
                </div>
                <div className="responder-item">
                  <span className="responder-name">E3 - Fire Truck 3 Crew</span>
                  <span className="responder-details">
                    Type: Fire | Location: Brgy. Turo, Bocaue
                  </span>
                  <button className="assign-btn">Assign</button>
                </div>
                <div className="responder-item">
                  <span className="responder-name">M201 - EMT Bayonito</span>
                  <span className="responder-details">
                    Type: Medical | Location: Duhat, Bocaue
                  </span>
                  <button className="assign-btn">Assign</button>
                </div>
                <div className="responder-item">
                  <span className="responder-name">M201 - EMT Anysson</span>
                  <span className="responder-details">
                    Type: Medical | Location: Duhat, Bocaue | Status: End of Shift
                  </span>
                  <button className="assign-btn">Assign</button>
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
