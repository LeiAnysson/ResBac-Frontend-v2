import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderDashboard.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import { apiFetch } from '../utils/apiFetch';
import { reverseGeocode } from '../utils/hereApi';

const ResponderDashboard = () => {
  const navigate = useNavigate();
  
  const [latestReport, setLatestReport] = useState(null);
  const [locationName, setLocationName] = useState('Loading...');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsObj = await apiFetch(`${process.env.REACT_APP_URL}/api/responder/reports`);
        console.log("Reports: ", reportsObj)

        const reports = Array.isArray(reportsObj) ? reportsObj : Object.values(reportsObj);

        if (reports && reports.length > 0) {
          const item = reports[0];
          setLatestReport(item);
          console.log("Latest Report: ", item)

          if (item.latitude && item.longitude) {
            const address = await reverseGeocode(item.latitude, item.longitude);
            setLocationName(address || 'Unknown Location');
          } else {
            setLocationName('—');
          }
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
    };

    fetchReports();
  }, []);

  const handleViewReport = (report) => {
    navigate(`/responder/reports/view-report/${report.id}`, { state: { report } });
  };

  return (
    <div className="responder-dashboard">
      <ResponderHeader />

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2 className="welcome-text">Welcome back!</h2>
        </div>

        <div className="assigned-reports-section">
          <h3 className="section-title">Assigned Reports</h3>
          <div className="reports-container">
            {latestReport ? (
              <div
                className="report-card"
                style={{ cursor: 'pointer', display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onClick={() => handleViewReport(latestReport)}
              >
                <div className="report-info">
                  <p className="report-date">{latestReport.date}</p>
                  <p className="report-type">
                    Incident Type: <strong>{latestReport.type}</strong>
                  </p>
                  <p className="report-location">{locationName}</p>
                </div>
                <div className="report-status-container">
                  <span className={`resident-status-badge status-${latestReport.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {latestReport.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-card">
                <p className="empty-text">No assigned reports available</p>
              </div>
            )}
          </div>
        </div>

        <div className="heatmap-section">
          <h3 className="section-title">Incident Heatmap</h3>
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-content">
                <div className="map-overlay">
                  <div className="map-pins">
                  </div>
                  <div className="map-roads">
                  </div>
                  <div className="map-labels">
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

      <ResponderBottomNav />
    </div>
  );
};

export default ResponderDashboard;
