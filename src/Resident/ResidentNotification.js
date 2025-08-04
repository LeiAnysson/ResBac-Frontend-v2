import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentNotification.css';
import homeIcon from '../assets/home.png';
import historyIcon from '../assets/history.png';
import announcementIcon from '../assets/announcement.png';
import reportIcon from '../assets/report.png';
import notificationIcon from '../assets/notification.png';

const ResidentNotification = () => {
  const navigate = useNavigate();
  const notifications = []; // Placeholder for notifications data

  return (
    <div className="notification-container">
      {/* Header */}
      <div className="header">
        <div className="header-left"></div>
        <button className="account-button" onClick={() => navigate('/resident/profile')}>
          <div className="avatar">
            <span>👤</span>
          </div>
        </button>
      </div>
      
      {/* Title row with back button and Notification text */}
      <div className="title-row">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-button-icon">←</span>
        </button>
        <h1 className="title">Notification</h1>
      </div>
      
      {/* Notification container */}
      <div className="container">
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((item) => (
              <div className="notification-item" key={item.id}>
                <p className="notification-text">{item.message}</p>
                <p className="notification-time">{item.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">No notifications available</p>
        )}
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

export default ResidentNotification; 