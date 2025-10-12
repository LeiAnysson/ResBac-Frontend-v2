import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentDashboard.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import { apiFetch } from '../utils/apiFetch';
import { reverseGeocode } from '../utils/hereApi';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    user: { name: '', address: '', avatar: null },
    emergencyTips: 'Show',
    publicAnnouncements: [],
    recentReports: [],
  });
  const [locationName, setLocationName] = useState('Loading...');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reports = await apiFetch(`${process.env.REACT_APP_URL}/api/resident/reports`);
        setData(prev => ({ ...prev, recentReports: reports }));

        if (reports.length > 0) {
          const item = reports[0];
          if (item.latitude && item.longitude) {
            const address = await reverseGeocode(item.latitude, item.longitude);
            setLocationName(address || 'Unknown location');
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

  const handleSOSClick = () => {
    navigate('/resident/call', {
      state: { incidentType: 'Emergency', fromSOS: true },
    });
  };

  const getStatusClass = (status = '') =>
    `report-status ${status.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="dashboard-container">
      <Header />

      <div className="scroll-view">
        {/* User Info Section */}
        <div className="user-info-section">
          <div className='left-side'>
            <p className="welcome">Welcome back!</p>
            <p className="name">{data.user.name || ''}</p>
            <p className="address">{data.user.address || ''}</p>
          </div>
          <div className='right-side'>
            <button className="tips-button">
              <span className="tips-button-text">Emergency Tips</span>
              <div className="tips-show-button">
                <span className="tips-show-button-text">{data.emergencyTips}</span>
              </div>
            </button>
          </div>
        </div>

        {/* SOS Section */}
        <div className="sos-section">
          <p className="sos-title">Are you in an Emergency?</p>
          <p className="sos-subtitle">Press the button to report an emergency.</p>
          <button className="sos-button" onClick={() => navigate("/resident/report")}>
            <div className="sos-outer-circle">
              <div className="sos-inner-circle">
                <span className="sos-text">SOS</span>
              </div>
            </div>
          </button>
        </div>

        {/* Public Announcements */}
        <p className="resident-section-title">Public Announcement</p>
        {data.publicAnnouncements.length > 0 ? (
          <div className="announcements-list">
            {data.publicAnnouncements.map((item) => (
              <div className="announcement-card" key={item.id}>
                <p className="announcement-text">{item.message}</p>
                <button className="announcement-button">
                  <span className="announcement-button-text">{item.button}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-card">
            <p className="empty-text">No announcements available</p>
          </div>
        )}

        {/* Recent Reports */}
        <p className="resident-section-title">My Recent Report</p>
        {data.recentReports.length > 0 ? (
          (() => {
            const item = data.recentReports[0];
            return (
              <div
                className="resident-report-card"
                key={item.id}
                style={{ cursor: 'pointer', display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onClick={() => navigate("/resident/waiting", { state: { emergencyReport: item } })}
              >
                <div className="report-info">
                  <p className="report-date">{item.date}</p>
                  <p className="report-type">
                    Incident Type: <strong>{item.type}</strong>
                  </p>
                  <p className="report-location">{locationName}</p>
                </div>
                <div className="report-status-container">
                  <span className={`resident-status-badge status-${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="empty-card">
            <p className="empty-text">No recent reports</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ResidentDashboard;
