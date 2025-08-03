import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentAnnouncement.css';
import homeIcon from '../assets/home.png';
import historyIcon from '../assets/history.png';
import announcementIcon from '../assets/announcement.png';
import reportIcon from '../assets/report.png';
import notificationIcon from '../assets/notification.png';

const ResidentAnnouncement = () => {
  const navigate = useNavigate();

  // Backend-ready: announcements should be fetched from backend or passed as props
  const announcements = [];

  return (
    <div className="announcement-container">
      <div className="header">
        <div className="header-left"></div>
        <button className="account-button" onClick={() => navigate('/resident/profile')}>
          <div className="avatar">
            <span>👤</span>
          </div>
        </button>
      </div>
      
      <div className="title-row">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="back-button-icon">←</span>
        </button>
        <h1 className="title">Announcement</h1>
      </div>

      {/* Announcements Container */}
      <div className="scroll-view">
        {announcements.length === 0 ? (
          <>
            <div className="announcement-card">
              <p className="empty-text">No announcements available.</p>
            </div>
            <div className="announcement-card">
              <p className="empty-text">No announcements available.</p>
            </div>
            <div className="announcement-card">
              <p className="empty-text">No announcements available.</p>
            </div>
          </>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="announcement-card">
              <h2 className="announcement-title">{item.title}</h2>
              <div className="announcement-img-box">
                <img src={item.image} alt={item.title} className="announcement-img" />
              </div>
              <p className="announcement-date">{item.date}</p>
            </div>
          ))
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
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

export default ResidentAnnouncement;
