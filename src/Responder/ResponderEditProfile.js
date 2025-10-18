import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderEditProfile.css';
import '../Components/Shared/SharedComponents.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import BackButton from '../assets/backbutton.png';
import { AuthContext } from '../context/AuthContext';

const ResponderEditProfile = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const storedUser = localStorage.getItem('user');
  const id = storedUser ? JSON.parse(storedUser).id : null;

  const [responder, setResponder] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [role] = useState('Responder');
  const [team, setTeam] = useState(''); 

  useEffect(() => {
    if (!id) return;

    fetch(`${process.env.REACT_APP_URL}/api/responders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setResponder(data);
        setFullName(`${data.first_name} ${data.last_name}`);
        setEmail(data.email);
        setPhone(data.contact_num);
        setAddress(data.address);
        setTeam(data.team || '-');
      })
      .catch((err) => console.error('Failed to fetch responder profile:', err));
  }, [id]);

  const handleSave = async () => {
    if (!responder) return;

    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/api/responders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ first_name, last_name, email, contact_num: phone, address }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updatedData = await res.json();
      alert('Profile updated successfully!');
      setResponder(updatedData.data);
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="responder-edit-profile">
      <ResponderHeader />

      <div className="title-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img className="back-button-icon" src={BackButton} alt="Back" />
        </button>
        <h1>Edit Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <img
            src="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
            alt="Profile"
          />
        </div>
        <button className="change-photo-btn">Change Photo</button>
      </div>

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
            <label className="field-label">Address:</label>
            <input
              className="text-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />
          </div>
          <div className="col">
            <label className="field-label">Role:</label>
            <div className="readonly-chip">{role}</div>
            <div className="subtext">Role cannot be changed</div>
          </div>
        </div>

        <div className="col">
          <label className="field-label">Team:</label>
          <div className="readonly-chip">{team}</div>
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
