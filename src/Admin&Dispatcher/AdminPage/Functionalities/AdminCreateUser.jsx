import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from '../../../utils/apiFetch';
import "./ComponentsTeam&User.css";

const AdminCreateUser = ({ mode }) => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const isCreating = mode === "create";
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    dateOfBirth: '',
    address: '',
    role: 'Responder',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!isCreating) {
      const fetchUser = async () => {
        try {
          const user = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users/${userId}`);
          setFormData({
            firstName: user.first_name,
            lastName: user.last_name,
            contact: user.contact,
            dateOfBirth: user.date_of_birth,
            address: user.address,
            role: user.role,
            email: user.email,
            password: '',
            confirmPassword: ''
          });
          if (user.photo_url) setPhoto(user.photo_url);
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      };
      fetchUser();
    }
  }, [userId, isCreating]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(file);
  };

  const handleCancel = () => navigate('/admin/user-management');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => payload.append(key, val));
      if (photo && photo instanceof File) payload.append('photo', photo);

      if (isCreating) {
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users/create`, {
          method: 'POST',
          body: payload
        });
        alert("User created!");
      } else {
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users/${userId}/edit`, {
          method: 'PUT',
          body: payload
        });
        alert("User updated!");
      }

      navigate('/admin/user-management');
    } catch (err) {
      console.error("Failed to submit user:", err);
      alert("Error submitting user. Check console.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="create-user-wrapper compact">
            <div className="cu-header">
              <div className="cu-header-icon">👤</div>
              <h2>{isCreating ? "Create User" : "Edit User"}</h2>
            </div>
            <form className="cu-form" onSubmit={handleSubmit}>
              <div className="cu-grid compact">
                {/* form fields same as before */}
                <div className="cu-col">
                  <label>First Name:</label>
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="cu-input" required />
                  <label>Last Name:</label>
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="cu-input" required />
                  <label>Contact:</label>
                  <input name="contact" value={formData.contact} onChange={handleInputChange} className="cu-input" required />
                  <label>Date of Birth:</label>
                  <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} className="cu-input" required />
                  <label>Address:</label>
                  <input name="address" value={formData.address} onChange={handleInputChange} className="cu-input" required />
                </div>
                <div className="cu-col">
                  <label>Role:</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="cu-input" required>
                    <option value="Admin">Admin</option>
                    <option value="MDRRMO">MDRRMO</option>
                    <option value="Responder">Responder</option>
                    <option value="Resident">Resident</option>
                  </select>
                  <label>Email:</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="cu-input" required />
                  <label>Password:</label>
                  <input name="password" type="password" value={formData.password} onChange={handleInputChange} className="cu-input" required={isCreating} />
                  <label>Confirm Password:</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className="cu-input" required={isCreating} />
                </div>
                <div className="cu-upload-col">
                  <label>Upload Photo:</label>
                  <div className="cu-upload-box" onClick={() => document.getElementById('photo').click()}>
                    {photo ? (
                      <img src={photo instanceof File ? URL.createObjectURL(photo) : photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (<div className="ud-plus">+</div>)}
                  </div>
                  <input type="file" id="photo" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </div>
              </div>
              <div className="cu-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isCreating ? "Create" : "Save"}</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCreateUser;
