import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Resident/ResidentNotification.css';
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png';
import ResponderHeader from  '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';

const ResponderNotification = () => {
  const navigate = useNavigate();
  const notifications = [];

  return (
    <div className="notification-container">
      {/* Header */}
      <ResponderHeader />
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
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">No notifications available</p>
        )}
      </div>

      {/* Bottom Navigation */}
      <ResponderBottomNav/>
    </div>
  );
};

export default ResponderNotification;
