import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentProfile.css';
import '../Components/Shared/SharedComponents.css';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import Spinner from '../utils/Spinner';

const DEFAULT_PROFILE = "https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg";

const ResidentProfile = () => {
  const navigate = useNavigate();
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      if (!user || !token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_URL}/api/residents/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setResident(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_URL}/api/residents/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Password updated!');
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  if(loading) return <Spinner message="Loading..." />;

  const profileImageUrl = resident?.profile_image_url
    ? `${process.env.REACT_APP_URL}${resident.profile_image_url}`
    : DEFAULT_PROFILE;

  return (
    <div className="profile-container">
      <Header />
      <div className="title-container">
        <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)}/>
        <h1>Profile</h1>
      </div>

      <div className="top-container">
        <div className="view-profile-avatar">
          <img
            src={profileImageUrl}
            alt={`${resident?.first_name || ''} ${resident?.last_name || ''}`}
            className="profile-img"
            onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
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
              <span className="info-value">{resident?.first_name} {resident?.last_name}</span>
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
                {resident?.birthdate ? new Date(resident.birthdate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '-'}
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
            <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" />
            <label className="label">New Password:</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
            <label className="label">Confirm Password:</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
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
