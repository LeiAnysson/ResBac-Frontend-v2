import React from 'react';
import NavBar from '../../Components/ComponentsNavBar/NavBar';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import './AdminDashboard.css';

const AdminDashboard = () => {
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
                <span className="stat-label">Total Users</span>
                <span className="stat-value">829</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Reports</span>
                <span className="stat-value stat-danger">21</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pending Approvals</span>
                <span className="stat-value stat-warning">12</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Reports Resolved (24h)</span>
                <span className="stat-value stat-success">829</span>
              </div>
            </div>
          </section>

          <section className="dashboard-overview-section">
            <div className="reports-overview">
              <div className="reports-summary">
                <div>
                  <span className="summary-value">35</span>
                  <span className="summary-label">Reports Today</span>
                </div>
                <div>
                  <span className="summary-value">15m 30s</span>
                  <span className="summary-label">Avg. Resolution time</span>
                </div>
                <div>
                  <span className="summary-value">92%</span>
                  <span className="summary-label">Resolution Rate (7d)</span>
                </div>
              </div>
              <div className="reports-chart-placeholder">
                {/* Placeholder for bar chart */}
                <div className="chart-bar" />
              </div>
            </div>
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <ul className="activity-list">
                <li>ADM001 deleted an account <span className="activity-time">3 mins ago</span></li>
                <li>ADM001 created an account <span className="activity-time">3 mins ago</span></li>
                <li>New Report #102 <span className="activity-time">3 mins ago</span></li>
                <li>New Report #102 <span className="activity-time">3 mins ago</span></li>
                <li>New Report #102 <span className="activity-time">3 mins ago</span></li>
                <li>New Report #102 <span className="activity-time">3 mins ago</span></li>
              </ul>
            </div>
          </section>
          <section className="dashboard-lower-section">
            <div className="incident-heatmap">
              <h3>Incident Heat Map</h3>
              <div className="heatmap-placeholder">Map Placeholder</div>
            </div>
            <div className="latest-emergency-report">
              <h3>Latest Emergency Report</h3>
              <ul className="emergency-report-list">
                <li>
                  <span className="report-status assigned">Assigned</span>
                  <span className="report-title">Car Accident</span>
                  <span className="report-time">5 mins ago</span>
                  <div className="report-details">
                    789 Duhat, Bocaue - Road Rage | McArthur Highway<br />
                    Responder: <span className="responder-name">Lei Anysson Marquez</span>
                  </div>
                </li>
                <li>
                  <span className="report-status enroute">En Route</span>
                  <span className="report-title">Medical Assistance</span>
                  <span className="report-time">2 mins ago</span>
                  <div className="report-details">
                    10 Duhat, Bocaue - Heart Attack | Phase 3, Blk 21 Lot 24<br />
                    Responder: <span className="responder-name">Grace Bayonito</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
