import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import "./ComponentsTeam&User.css";

const AdminCreateUser = () => {
  const navigate = useNavigate();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Switch to display mode to show user information
    setIsDisplayMode(true);
    console.log('Form submitted:', formData, photo);
  };

  const handleCancel = () => {
    navigate('/admin/user-management');
  };

  const handleApprove = () => {
    // TODO: Implement approval logic
    console.log('User approved:', formData);
    alert('User approved successfully!');
    navigate('/admin/user-management');
  };

  const handleReject = () => {
    // TODO: Implement rejection logic
    console.log('User rejected:', formData);
    alert('User rejected!');
    navigate('/admin/user-management');
  };

  const handleBackToForm = () => {
    setIsDisplayMode(false);
  };

  // Display Mode - Show User Information Details
  if (isDisplayMode) {
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <div className="user-display-wrapper">
              {/* Header */}
              <div className="ud-header">
                <div className="ud-header-icon">i</div>
                <h2>Resident Registration Details</h2>
              </div>

              {/* Content */}
              <div className="ud-content">
                {/* Details Section */}
                <div className="ud-details-section">
                  <h3>Resident Registration Details</h3>
                  <div className="ud-details-list">
                    <div className="ud-detail-item">
                      <label>Full Name:</label>
                      <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="ud-detail-item">
                      <label>Contact:</label>
                      <span>{formData.contact}</span>
                    </div>
                    <div className="ud-detail-item">
                      <label>Date of Birth:</label>
                      <span>{formData.dateOfBirth}</span>
                    </div>
                    <div className="ud-detail-item">
                      <label>Address:</label>
                      <span>{formData.address}</span>
                    </div>
                    <div className="ud-detail-item">
                      <label>Email:</label>
                      <span>{formData.email}</span>
                    </div>
                    <div className="ud-detail-item">
                      <label>Valid ID:</label>
                      <span>{formData.role}</span>
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="ud-image-section">
                  <h3>Image Attachment</h3>
                  <div className="ud-image-container">
                    {photo ? (
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt="Profile" 
                        className="ud-id-image"
                      />
                    ) : (
                      <div className="ud-no-image">
                        No photo uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="ud-actions">
                <button 
                  type="button" 
                  className="btn btn-reject" 
                  onClick={handleReject}
                >
                  Reject
                </button>
                <button 
                  type="button" 
                  className="btn btn-approve" 
                  onClick={handleApprove}
                >
                  Approve
                </button>
              </div>

              {/* Back to Form Button */}
              <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleBackToForm}
                >
                  Back to Form
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Form Mode - Original Create User Form
  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="create-user-wrapper compact">
            {/* Header */}
            <div className="cu-header">
              <div className="cu-header-icon">i</div>
              <h2>Create user</h2>
            </div>

            {/* Form */}
            <form className="cu-form" onSubmit={handleSubmit}>
              <div className="cu-grid compact">
                {/* Column 1 */}
                <div className="cu-col">
                  <label htmlFor="firstName">First Name:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="cu-input"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />

                  <label htmlFor="lastName">Last Name:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="cu-input"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />

                  <label htmlFor="contact">Contact:</label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    className="cu-input"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                    required
                  />
                </div>

                {/* Column 2 */}
                <div className="cu-col">
                  <label htmlFor="dateOfBirth">Date of Birth:</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="cu-input"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />

                  <label htmlFor="address">Address:</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="cu-input"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    required
                  />

                  <label htmlFor="role">Role:</label>
                  <select
                    id="role"
                    name="role"
                    className="cu-input"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Admin">Admin</option>
                    <option value="MDRRMO">MDRRMO</option>
                    <option value="Responder">Responder</option>
                    <option value="Resident">Resident</option>
                  </select>
                </div>

                {/* Column 3 */}
                <div className="cu-col">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="cu-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />

                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="cu-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                  />

                  <label htmlFor="confirmPassword">Confirm Password:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="cu-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                {/* Upload Column */}
                <div className="cu-upload-col">
                  <label htmlFor="photo">Upload Photo:</label>
                  <div className="cu-upload-box" onClick={() => document.getElementById('photo').click()}>
                    {photo ? (
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      <div className="ud-plus">+</div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="cu-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCreateUser;

