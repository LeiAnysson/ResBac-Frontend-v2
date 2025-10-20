import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Resident/ResidentNotification.css';
import '../Components/Shared/SharedComponents.css';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';
import ResponderHeader from  '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import { apiFetch } from '../utils/apiFetch';

const ResponderNotification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return; 

    const fetchNotifications = async () => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/notifications/${userId}`);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [userId]);

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };


  return (
    <div className="notification-container">
      <ResponderHeader />
      <div className='title-container'>
        <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)}/>
        <h1>Notifications</h1>
      </div>

      <div className="container">
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((item) => (
              <div className="notification-item" key={item.id}>
                <p className="notification-text">{item.message}</p>
                <span className="notification-time">{timeAgo(item.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">No notifications available</p>
        )}
      </div>

      <ResponderBottomNav/>
    </div>
  );
};

export default ResponderNotification;
