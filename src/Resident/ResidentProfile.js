import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentProfile.css';
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png'
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const ResidentProfile = () => {
  const navigate = useNavigate();
  
  // State for toggling password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Placeholder handler for password update (backend ready)
  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // TODO: Integrate with backend
    alert('Password updated!');
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <Header />
      <div className='title-container'>
            <button className="back-button" onClick={() => navigate(-1)}>
            <img className='back-button-icon' src={BackButton}/>
          </button>
          <h1>Profile</h1>
      </div>
      
        {/* First Container: Avatar, Name, Edit Profile */}
        <div className="top-container">
          <div className="view-profile-avatar">
            <img
              src="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
              alt="Profile"
            />
          </div>
          <p className="profile-name">User Name</p>
          <button className="edit-profile-button" onClick={() => navigate('/resident/edit-profile')}>
            <span className="edit-profile-text">Edit Profile</span>
          </button>
        </div>
        
        {/* Second Container: Basic Information or Password Form */}
        <div className="info-container">
          <div className="info-header">
            <span className="info-header-icon">i</span>
            <span className="info-header-text"> Basic Information</span>
          </div>
          
                     {!showPasswordForm ? (
             <div className="info-content">
               <div className="info-row">
                 <span className="info-label">Full Name:</span>
                 <span className="info-value">-</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Address:</span>
                 <span className="info-value">-</span>
               </div>
               <div className="info-row">
                 <span className="info-label">User ID:</span>
                 <span className="info-value">-</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Email:</span>
                 <span className="info-value">-</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Phone:</span>
                 <span className="info-value">-</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Age:</span>
                 <span className="info-value">-</span>
               </div>
             </div>
          ) : (
            <div className="password-form-container">
              <h2 className="reset-password-title">Reset Password</h2>
              <label className="label">Current Password:</label>
              <input
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
              />
              <label className="label">New Password:</label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
              />
              <label className="label">Confirm Password:</label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
              />
              <button className="save-btn" onClick={handlePasswordUpdate}>
                <span className="save-btn-text">Confirm</span>
              </button>
              <button className="cancel-btn" onClick={() => setShowPasswordForm(false)}>
                <span className="cancel-btn-text">Cancel</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Show Change Password and Logout buttons only when not in password form */}
        {!showPasswordForm && (
          <div className="action-buttons">
            <button className="change-password-btn" onClick={() => setShowPasswordForm(true)}>
              <span className="change-password-text">Change Password</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="logout-text">Log out</span>
            </button>
          </div>
        )}
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ResidentProfile; 