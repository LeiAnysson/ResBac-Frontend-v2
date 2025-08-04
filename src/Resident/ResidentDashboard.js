// src/components/Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentDashboard.css';
import homeIcon from '../assets/home.png';
import historyIcon from '../assets/history.png';
import announcementIcon from '../assets/announcement.png';
import reportIcon from '../assets/report.png';
import notificationIcon from '../assets/notification.png';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [data] = useState({
    user: {
      name: '',
      address: '',
      avatar: null,
    },
    emergencyTips: 'Show',
    publicAnnouncements: [],
    recentReports: [],
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <Header />
      
      <div className="scroll-view">
        {/* User Info Section */}
        <div className="user-info-section">
        <div className='left-side'>
          <p className="welcome">Welcome back!</p>
          <p className="name">{data.user.name || 'User Name'}</p>
          <p className="address">{data.user.address || 'User Address'}</p>
        </div>
        <div className='right-side'>
          <button className="tips-button">
            <span className="tips-button-text">Emergency Tips</span>
            <div className="tips-show-button">
              <span className="tips-show-button-text">Show</span>
            </div>
          </button>
        </div>
          
        </div>

        {/* SOS Section */}
        <div className="sos-section">
          <p className="sos-title">Are you in an Emergency?</p>
          <p className="sos-subtitle">Press the button to report an emergency.</p>
          <button className="sos-button">
            <div className="sos-outer-circle">
              <div className="sos-inner-circle">
                <span className="sos-text">SOS</span>
              </div>
            </div>
          </button>
        </div>
        
        {/* Public Announcements */}
        <p className="section-title">Public Announcement</p>
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
        <p className="section-title">My Recent Report</p>
        {data.recentReports.length > 0 ? (
          <div className="reports-list">
            {data.recentReports.map((item) => (
              <div className="report-card" key={item.id}>
                <div className="report-info">
                  <p className="report-date">{item.date}</p>
                  <p className="report-type">
                    Incident Type : <strong>{item.type}</strong>
                  </p>
                  <p className="report-location">{item.location}</p>
                </div>
                <div className="report-status-container">
                  <span className="report-status">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-card">
            <p className="empty-text">No recent reports</p>
          </div>
        )}
      </div>
      
      {/* BOTTOM NAVIGATION WITH ASSETS ICONS */}
      <BottomNav/>
    </div>
  );
};

export default ResidentDashboard;
