import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderDashboard.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import { apiFetch } from '../utils/apiFetch';
import { reverseGeocode } from '../utils/hereApi';
import BocaueHeatmap from '../Components/Heatmap';

const ResponderDashboard = () => {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [locationName, setLocationName] = useState('Loading...');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsObj = await apiFetch(`${process.env.REACT_APP_URL}/api/responder/reports`);
        //console.log("Reports: ", reportsObj)

        const reports = Array.isArray(reportsObj) ? reportsObj : Object.values(reportsObj);

        if (reports && reports.length > 0) {
          const item = reports[0];
          setLatestReport(item);
          //console.log("Latest Report: ", item)

          if (item.landmark) {
            setLocationName(item.landmark);
          } else if (item.latitude && item.longitude) {
            const address = await reverseGeocode(Number(item.latitude), Number(item.longitude));
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
          <div className="responder-map-container">
            <div className="responder-map-placeholder">
              <div className="heatmap-legend">
                  <span className="legend-label">Least</span>
                  <div className="legend-bar"></div>
                  <span className="legend-label">Most</span>
              </div>
              <div className="responder-map-content">
                <BocaueHeatmap
                  apiKey={process.env.REACT_APP_HERE_API_KEY}
                  incidents={incidents}
                  mapOptions={{ center: { lat: 14.7968, lng: 121.0410 }, zoom: 12 }}
                />
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
