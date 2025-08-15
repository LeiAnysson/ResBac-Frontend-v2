import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentAnnouncement.css';
//import homeIcon from '../assets/home.png';
//import historyIcon from '../assets/history.png';
//import announcementIcon from '../assets/announcement.png';
//import reportIcon from '../assets/report.png';
//import notificationIcon from '../assets/notification.png';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'; 
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import BackButton from '../assets/backbutton.png';

const ResidentAnnouncement = () => {
  const navigate = useNavigate();

  // Backend-ready: announcements should be fetched from backend or passed as props
  const announcements = [];
  //onClick={() => navigate(-1)}

  return (
    <>
      {/* Header */}
      

    <div className="announcement-container">
    <Header />
      <div className='title-container'>
            <button className="back-button" onClick={() => navigate(-1)}>
            <img className='back-button-icon' src={BackButton}/>
          </button>
          <h1>Announcement</h1>
      </div>
      

      {/* Announcements Container */}
        {announcements.length === 0 ? (
          <>
          <div className='card-container'>
            <div className="announcement-card">
              <p className="empty-text">No announcements available.</p>
            </div>
            <div className="announcement-card">
              <p className="empty-text">No announcements available.</p>
            </div>
            <div className="announcement-card">
              <p className="empty-text">No announcements available.</p>
            </div>
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

      {/* BOTTOM NAVIGATION */}
        <BottomNav/>
    </div>
    </>
  );
};

export default ResidentAnnouncement;
