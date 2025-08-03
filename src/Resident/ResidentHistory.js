import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentHistory.css';
import homeIcon from '../assets/home.png';
import historyIcon from '../assets/history.png';
import announcementIcon from '../assets/announcement.png';
import reportIcon from '../assets/report.png';
import notificationIcon from '../assets/notification.png';

const ResidentHistory = () => {
  const navigate = useNavigate();
  const reports = []; // Placeholder for reports data

  const statusColor = (status) => {
    switch (status) {
      case 'En Route': return { color: '#1041BC' };
      case 'Resolved': return { color: '#2ecc40' };
      case 'Cancelled': return { color: '#e53935' };
      case 'Pending': return { color: '#f7b84b' };
      default: return { color: '#888' };
    }
  };

  return (
    <div className="history-container">
      {/* Header */}
      <div className="header">
        <div className="header-left"></div>
        <button className="account-button" onClick={() => navigate('/resident/profile')}>
          <div className="avatar">
            <span>👤</span>
          </div>
        </button>
      </div>
      
      {/* Title row with back button and Recent Reports text */}
      <div className="title-row">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-button-icon">←</span>
        </button>
        <h1 className="title">Recent Reports</h1>
        <button className="report-button" onClick={() => navigate('/resident/report')}>
          <span className="report-button-text">Report</span>
          <img src={reportIcon} alt="Report" className="report-button-icon" />
        </button>
      </div>
      
      {/* Reports Container */}
      <div className="scroll-container">
        <div className="container">
          {reports.length === 0 ? (
            <p className="empty-text">No reports available.</p>
          ) : (
            <div className="reports-list">
              {reports.map((item, idx) => (
                <div key={item.id} className={`report-card ${idx !== reports.length - 1 ? 'report-card-border' : ''}`}>
                  <div className="report-header">
                    <p className="report-date">{item.date}</p>
                    <p className="status" style={statusColor(item.status)}>{item.status}</p>
                  </div>
                  <p className="incident-type">
                    Incident Type: <strong style={{color: '#e53935'}}>{item.type}</strong>
                  </p>
                  <p className="location">{item.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-icon" onClick={() => navigate('/resident/history')}>
          <img src={historyIcon} alt="History" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident/announcement')}>
          <img src={announcementIcon} alt="Announcement" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident')}>
          <img src={homeIcon} alt="Home" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident/report')}>
          <img src={reportIcon} alt="Report" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident/notification')}>
          <img src={notificationIcon} alt="Notification" className="nav-img" />
        </button>
      </div>
    </div>
  );
};

export default ResidentHistory; 