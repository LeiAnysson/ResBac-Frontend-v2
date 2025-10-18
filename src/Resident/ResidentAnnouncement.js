import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentAnnouncement.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'; 
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import BackButton from '../assets/backbutton.png';

const ResidentAnnouncement = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/resident/announcements`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch announcements:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="announcement-container">
      <Header />
      <div className='title-container'>
        <button className="back-button" onClick={() => navigate(-1)}>
          <img className='back-button-icon' src={BackButton} alt="Back"/>
        </button>
        <h1>Announcements</h1>
      </div>

      {loading ? (
        <p className="loading-text">Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <div className='card-container'>
          <div className="announcement-card">
            <p className="empty-text">No announcements available.</p>
          </div>
        </div>
      ) : (
        <div className='card-container'>
          {announcements.map((item) => (
            <div key={item.id} className="announcement-card">
              <h2 className="announcement-title">{item.title}</h2>
              <p className="announcement-content" dangerouslySetInnerHTML={{ __html: item.content }} />
              <p className="announcement-poster">Posted by: {item.poster.name}</p>
              <p className="announcement-date">{new Date(item.posted_at).toLocaleString()}</p>

              {item.images?.length > 0 && (
                <div className="announcement-image">
                  {item.images.map(img => (
                    <img 
                      key={img.id} 
                      src={`${process.env.REACT_APP_URL}${img.file_path}`} 
                      alt={item.title} 
                      className="announcement-img" 
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomNav/>
    </div>
  );
};

export default ResidentAnnouncement;
