import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderEditProfile.css';
import '../Components/Shared/SharedComponents.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import BackButton from '../assets/backbutton.png';

const ResponderEditProfile = () => {
  const navigate = useNavigate();

  // Backend-ready form state (no API wiring here)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // These are read-only in UI per layout
  const [employeeId] = useState('');
  const [role] = useState('Responder');
  const [team] = useState('');

  const handleSave = () => {
    // TODO: integrate with backend update
    alert('Profile saved');
    navigate(-1);
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="responder-edit-profile">
      <ResponderHeader />

      {/* Title aligned like other screens */}
      <div className="title-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img className="back-button-icon" src={BackButton} alt="Back" />
        </button>
        <h1>Edit Profile</h1>
      </div>

      {/* Card: avatar + change photo */}
      <div className="profile-card">
        <div className="avatar-circle">👤</div>
        <button className="change-photo-btn">Change Photo</button>
      </div>

      {/* Form */}
      <div className="form-card">
        <label className="field-label">Full Name:</label>
        <input
          className="text-input"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
        />

        <div className="row-2col">
          <div className="col">
            <label className="field-label">Employee ID:</label>
            <div className="readonly-chip">{employeeId || '—'}</div>
            <div className="subtext">Employee ID cannot be changed</div>
          </div>
          <div className="col">
            <label className="field-label">Role:</label>
            <div className="readonly-chip">{role}</div>
            <div className="subtext">Role cannot be changed</div>
          </div>
        </div>

        <div className="col">
          <label className="field-label">Team:</label>
          <div className="readonly-chip">{team || '—'}</div>
          <div className="subtext">Team cannot be changed</div>
        </div>

        <label className="field-label">Email:</label>
        <input
          className="text-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />

        <label className="field-label">Phone:</label>
        <input
          className="text-input"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+63xxxxxxxxxx"
        />

        <div className="actions">
          <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>

      <ResponderBottomNav />
    </div>
  );
};

export default ResponderEditProfile;
