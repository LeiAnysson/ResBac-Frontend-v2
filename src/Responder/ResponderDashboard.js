import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderDashboard.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import RespondeerBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';

const ResponderDashboard = () => {
  const navigate = useNavigate();
  
  const [assignedReports] = useState([]);

  const handleViewReport = (reportId) => {
    // Navigate to report details page
    navigate(`/responder/report/${reportId}`);
  };

  return (
    <div className="responder-dashboard">
      {/* Header */}
      <ResponderHeader />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2 className="welcome-text">Welcome back!</h2>
        </div>

        {/* Assigned Reports Section */}
        <div className="assigned-reports-section">
          <h3 className="section-title">Assigned Reports</h3>
          <div className="reports-container">
            {assignedReports.length > 0 ? (
              <div className="reports-list">
                {assignedReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-info">
                      <p className="report-date">{report.date}</p>
                      <p className="report-type">
                        Incident Type : <strong>{report.incidentType}</strong>
                      </p>
                      <p className="report-location">{report.location}</p>
                    </div>
                    <button 
                      className="view-button"
                      onClick={() => handleViewReport(report.id)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-inner">
                <p className="empty-text">No assigned reports available</p>
              </div>
            )}
          </div>
        </div>

        {/* Incident Heatmap Section */}
        <div className="heatmap-section">
          <h3 className="section-title">Incident Heatmap</h3>
          <div className="map-container">
            <div className="map-placeholder">
              {/* This would be replaced with actual Google Maps integration */}
              <div className="map-content">
                <div className="map-overlay">
                  <div className="map-pins">
                    {/* Map pins will be dynamically added here */}
                  </div>
                  <div className="map-roads">
                    {/* Road lines will be dynamically added here */}
                  </div>
                  <div className="map-labels">
                    {/* Map labels will be dynamically added here */}
                  </div>
                </div>
                <div className="map-footer">
                  <span className="google-text"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <RespondeerBottomNav />
    </div>
  );
};

export default ResponderDashboard;
