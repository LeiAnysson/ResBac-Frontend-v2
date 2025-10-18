import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentProfile.css';
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const ResidentProfile = () => {
  const navigate = useNavigate();
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!user || !token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_URL}/api/residents/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setResident(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    alert('Password updated!');
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading profile...</p>;

  return (
    <div className="profile-container">
      <Header />
      <div className="title-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img className="back-button-icon" src={BackButton} alt="Back" />
        </button>
        <h1>Profile</h1>
      </div>

      <div className="top-container">
        <div className="view-profile-avatar">
          <img
            src="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
            alt="Profile"
          />
        </div>
        <p className="profile-name">
          {resident ? `${resident.first_name} ${resident.last_name}` : 'User Name'}
        </p>
        <button className="edit-profile-button" onClick={() => navigate('/resident/edit-profile')}>
          <span className="edit-profile-text">Edit Profile</span>
        </button>
      </div>

      <div className="info-container">
        <div className="info-header">
          <span className="info-header-icon">i</span>
          <span className="info-header-text"> Basic Information</span>
        </div>

        {!showPasswordForm ? (
          <div className="info-content">
            <div className="info-row">
              <span className="info-label">Full Name:</span>
              <span className="info-value">
                {resident ? `${resident.first_name} ${resident.last_name}` : '-'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span className="info-value">{resident?.address || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{resident?.email || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{resident?.contact_num || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Birthdate:</span>
              <span className="info-value">
                {resident?.birthdate? new Date(resident.birthdate).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric', })
                : '-'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Age:</span>
              <span className="info-value">{resident?.age || '-'}</span>
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

      <BottomNav />
    </div>
  );
};

export default ResidentProfile;
