import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderEditProfile.css';
import '../Components/Shared/SharedComponents.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';
import { AuthContext } from '../context/AuthContext';

const DEFAULT_PROFILE = "https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg";

const ResponderEditProfile = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const storedUser = localStorage.getItem('user');
  const id = storedUser ? JSON.parse(storedUser).id : null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [team, setTeam] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [role] = useState('Responder');

  useEffect(() => {
    if (!id) return;

    fetch(`${process.env.REACT_APP_URL}/api/responders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setPhone(data.contact_num || '');
        setAddress(data.address || '');
        setTeam(data.team || '-');
        setProfileImage(data.profile_image_url || '');
      })
      .catch(err => console.error('Failed to fetch responder profile:', err));
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file)); 
    }
  };

  const handleSave = async () => {
    const updatedData = { first_name: firstName, last_name: lastName, email, contact_num: phone, address };

    try {
      const resProfile = await fetch(`${process.env.REACT_APP_URL}/api/responders/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!resProfile.ok) throw new Error('Failed to update profile');

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        await fetch(`${process.env.REACT_APP_URL}/api/responders/profile-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, ...updatedData, profile_image_url: profileImage };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      alert('Profile updated successfully!');
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile. Check console for details.');
    }
  };

  const profileImageUrl = profileImage
    ? profileImage.startsWith('http') || profileImage.startsWith('data:') || profileImage.startsWith('blob:')
      ? profileImage
      : `${process.env.REACT_APP_URL}${profileImage}`
    : DEFAULT_PROFILE;

  return (
    <>
      <div className="edit-profile-container">
        <ResponderHeader />
        <div className="title-container">
          <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)} />
          <h1>Edit Profile</h1>
        </div>

        <div className="avatar-card">
          <div className="profile-avatar">
            <img
              src={profileImageUrl}
              alt={`${firstName} ${lastName}`.trim() || 'Profile'}
              className="profile-img"
              onError={e => { e.currentTarget.src = DEFAULT_PROFILE; }}
            />
          </div>
          <p className="profile-name">{firstName} {lastName}</p>
          <button
            className="change-photo-btn"
            onClick={() => document.getElementById('profileImageInput').click()}
          >
            Change Photo
          </button>
          <input
            type="file"
            id="profileImageInput"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="form-group">
          <label className="label">First Name:</label>
          <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <label className="label">Last Name:</label>
          <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} />
          <label className="label">Address:</label>
          <input className="input" value={address} onChange={e => setAddress(e.target.value)} />
          <label className="label">Phone:</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
          <label className="label">Email:</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
          <label className="label">Team:</label>
          <input className="input" value={team} readOnly />
          <label className="label">Role:</label>
          <input className="input" value={role} readOnly />
        </div>

        <div className="button-row">
          <button className="btn cancel" onClick={() => navigate(-1)}><span className="btn-text">Cancel</span></button>
          <button className="btn save" onClick={handleSave}><span className="btn-text">Save</span></button>
        </div>
      </div>
      <ResponderBottomNav />
    </>
  );
};

export default ResponderEditProfile;
