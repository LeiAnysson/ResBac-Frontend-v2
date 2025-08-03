import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentEditProfile.css';
import homeIcon from '../assets/home.png';
import historyIcon from '../assets/history.png';
import announcementIcon from '../assets/announcement.png';
import reportIcon from '../assets/report.png';
import notificationIcon from '../assets/notification.png';

const ResidentEditProfile = () => {
  const navigate = useNavigate();

  // State for form fields (empty, backend-ready)
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [userId] = useState(''); // User ID is disabled and empty
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');

  // Placeholder save handler (backend logic to be added)
  const handleSave = () => {
    // TODO: Integrate with backend
    navigate(-1);
  };

  return (
    <div className="edit-profile-container">
      {/* Header */}
      <div className="header">
        <div className="header-left"></div>
        <button className="account-button" onClick={() => navigate('/resident/profile')}>
          <div className="avatar">
            <span>👤</span>
          </div>
        </button>
      </div>
      
      <div className="scroll-container">
        {/* Title row with back button and Edit Profile text */}
        <div className="title-row">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-button-icon">←</span>
          </button>
          <h1 className="title">Edit Profile</h1>
        </div>
        
        {/* Avatar Card */}
        <div className="avatar-card">
          <div className="profile-avatar">
            <span>👤</span>
          </div>
          <p className="profile-name">{fullName || ' '}</p>
          <button className="change-photo-btn">
            <span className="change-photo-text">Change Photo</span>
          </button>
        </div>
        
        {/* Form Fields */}
        <div className="form-group">
          <label className="label">Full Name:</label>
          <input
            type="text"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
          />

          <label className="label">Address:</label>
          <input
            type="text"
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />

          <label className="label">User ID:</label>
          <input
            type="text"
            className="input-disabled"
            value={userId}
            disabled
            placeholder="User ID"
          />
          <p className="input-note">User ID cannot be changed</p>

          <label className="label">Email:</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />

          <div className="phone-age-row">
            <div className="phone-field">
              <label className="label">Phone:</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="age-field">
              <label className="label">Age:</label>
              <input
                type="number"
                className="input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
              />
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="button-row">
          <button className="cancel-btn" onClick={() => navigate(-1)}>
            <span className="cancel-btn-text">Cancel</span>
          </button>
          <button className="save-btn" onClick={handleSave}>
            <span className="save-btn-text">Save</span>
          </button>
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

export default ResidentEditProfile; 