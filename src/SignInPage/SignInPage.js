import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignInPage.css';
import RegistrationPending from '../RegistrationLoading/RegistrationPending'; 
import UserAgreement from '../RegistrationLoading/UserAgreement';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  
  const [formData, setFormData] = useState({
    idType: '',
    idImage: null,
    lastName: '',
    firstName: '',
    contact: '',
    birthdate: '',
    id_number: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    const { name, value, files } = e.target;
      if (name === 'idImage') {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const fullAddress = `${formData.houseNo}, ${formData.street}, ${formData.barangay}`;

      const formPayload = new FormData();
      formPayload.append('first_name', formData.firstName);
      formPayload.append('last_name', formData.lastName);
      formPayload.append('email', formData.email);
      formPayload.append('password', formData.password);
      formPayload.append('birthdate', formData.birthdate);
      formPayload.append('address', fullAddress);
      formPayload.append('contact_num', formData.contact);

      if (formData.idImage) {
        formPayload.append('id_image', formData.idImage); 
      }

      if (formData.id_number) {
        formPayload.append('id_number', formData.id_number);
      }

      const response = await fetch(`${process.env.REACT_APP_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formPayload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.');
      }

      console.log('Registration successful!', result);
      setShowAgreement(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <>
      {showAgreement ? (
        <UserAgreement onAgree={() => {
          setShowAgreement(false);
          setRegistrationComplete(true);
        }} />
      ) : registrationComplete ? (
        <RegistrationPending onBack={() => navigate('/login')} />
      ) : (
      <div className="login-root">
        {/* Left Section */}
        <div className="login-left">
          <Link to="/">
            <img src="/LogoB.png" alt="Bocaue Rescue Logo" className="login-logo" />
          </Link>
          <div className="login-org-name">BOCAUE RESCUE EMS</div>
          <div className="login-org-desc">
            MUNICIPAL EMERGENCY ASSISTANCE AND<br />INCIDENT RESPONSE
          </div>
        </div>

        {/* Right Section */}
        <div className="login-right" style={{ background: "url('/municipal-hall.jpg') center center / cover no-repeat" }}>
          <div className="login-form-container">
            <h2 className="login-title">Sign Up</h2>
            
            <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {/* ID Type and Upload */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="idType" className="form-label">Select ID Type</label>
                <select id="idType" name="idType" value={formData.idType} onChange={handleChange} className="login-input">
                  <option value="">--</option>
                  <option value="PhilHealth">PhilHealth</option>
                  <option value="SSS">SSS</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div className="form-field">
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="idImage"
                    name="idImage"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <label htmlFor="idImage" className="file-upload-label">
                    Upload Valid ID
                  </label>
                  {formData.idImage && (
                    <span className="file-upload-filename">{formData.idImage.name}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Last and First Name */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="login-input" />
              </div>
              <div className="form-field">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="login-input" />
              </div>
            </div>

            {/* Contact and DOB */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="contact" className="form-label">Contact</label>
                <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className="login-input" />
              </div>
              <div className="form-field">
                <label htmlFor="dob" className="form-label">Date of Birth</label>
                <input type="date" id="birthdate" name="birthdate" value={formData.birthdate} onChange={handleChange} className="login-input" />
              </div>
            </div>

            {/* Address Label */}
            <p className="form-label">Address</p>

            {/* House No, Street, Barangay */}
            <div className="form-row three-cols">
              <div className="form-field">
                <label htmlFor="houseNo" className="form-label">House No.</label>
                <input type="text" id="houseNo" name="houseNo" value={formData.houseNo} onChange={handleChange} className="login-input" />
              </div>
              <div className="form-field">
                <label htmlFor="street" className="form-label">Street</label>
                <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} className="login-input" />
              </div>
              <div className="form-field">
                <label htmlFor="barangay" className="form-label">Barangay</label>
                <input type="text" id="barangay" name="barangay" value={formData.barangay} onChange={handleChange} className="login-input" />
              </div>
            </div>

            {/* City and Province */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="city" className="form-label">City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="login-input" />
              </div>
              <div className="form-field">
                <label htmlFor="province" className="form-label">Province</label>
                <input type="text" id="province" name="province" value={formData.province} onChange={handleChange} className="login-input" />
              </div>
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="login-input full-width" />
            </div>

            {/* Password */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="login-input" />
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="login-input" />
            </div>

            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

            <div className="login-signup-row">
              <span>Already have an account?</span>
              <a href="/login" className="login-register-link">Login</a>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SignInPage;
