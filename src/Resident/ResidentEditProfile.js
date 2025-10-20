import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResidentEditProfile.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import '../Components/Shared/SharedComponents.css';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const DEFAULT_PROFILE = "https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg";

const ResidentEditProfile = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const storedUser = localStorage.getItem("user");
  const id = storedUser ? JSON.parse(storedUser).id : null;
  const [profileImage, setProfileImage] = useState(''); 
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/residents/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setAddress(data.address || '');
          setEmail(data.email || '');
          setPhone(data.contact_num || '');
          setAge(data.age || '');
          setBirthdate(data.birthdate || '');
          setProfileImage(data.profile_image_url || '');
        }
      })
      .catch((err) => console.error('Failed to fetch profile:', err));
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const updatedData = {
      first_name: firstName,
      last_name: lastName,
      address,
      email,
      contact_num: phone,
      age,
      birthdate,
    };

    try {
      const resProfile = await fetch(`${process.env.REACT_APP_URL}/api/residents/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!resProfile.ok) throw new Error('Failed to update profile');
      const profileData = await resProfile.json();

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const resImage = await fetch(`${process.env.REACT_APP_URL}/api/residents/profile-image`, {
          method: 'POST',
          headers: {
            Accept: 'application/json', 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        const data = await resImage.json(); 
        console.log('Uploaded image:', data);
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, ...updatedData, profile_image_url: profileImage };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      alert('Profile updated successfully!');
      navigate(-1);

    } catch (err) {
      console.error(err);
      alert('Failed to update profile. Check console for details.');
    }
  };

  const profileImageUrl = profileImage
    ? profileImage.startsWith('http') || profileImage.startsWith('data:')
      ? profileImage
      : `${process.env.REACT_APP_URL}${profileImage}`
    : DEFAULT_PROFILE;

  return (
    <>
      <div className="edit-profile-container">
        <Header />
        <div className="title-container">
          <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)}/>
          <h1>Edit Profile</h1>
        </div>

        <div className="avatar-card">
          <div className="profile-avatar">
            <img
              src={profileImageUrl}
              alt={`${firstName} ${lastName}`}
              className="profile-img"
              onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
            />
          </div>
          <p className="profile-name">
            {firstName} {lastName}
          </p>
          <button
            className="change-photo-btn"
            onClick={() => document.getElementById('profileImageInput').click()}
          >
            <span className="change-photo-text">Change Photo</span>
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
          <input
            type="text"
            className="input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
          />

          <label className="label">Last Name:</label>
          <input
            type="text"
            className="input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
          />

          <label className="label">Address:</label>
          <input
            type="text"
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />

          <label className="label">Phone:</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />

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
              <label className="label">Birthdate:</label>
              <input
                type="date"
                className="input"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
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

        <div className="button-row">
          <button className="btn cancel" onClick={() => navigate(-1)}>
            <span className="btn-text">Cancel</span>
          </button>
          <button className="btn save" onClick={handleSave}>
            <span className="btn-text">Save</span>
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default ResidentEditProfile;
