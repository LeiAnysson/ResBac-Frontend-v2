import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentNotification.css';
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png'
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const ResidentNotification = () => {
  const navigate = useNavigate();
  const notifications = []; // Placeholder for notifications data

  return (
    <div className="notification-container">
      {/* Header */}
      <Header />
      <div className='title-container'>
            <button className="back-button" onClick={() => navigate(-1)}>
            <img className='back-button-icon' src={BackButton}/>
          </button>
          <h1>Notification</h1>
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
      <BottomNav/>
    </div>
  );
};

export default ResidentNotification; 