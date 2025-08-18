import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentWitReport.css';
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const ResidentWitReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidentType, setIncidentType] = useState(location.state?.incidentType || '');
  const [locationText, setLocationText] = useState('');

  const handleSubmitReport = () => {
    // Handle report submission logic here
    console.log('Submitting witness report:', {
      incidentType,
      location: locationText
    });
    // Navigate back or to confirmation page
    navigate('/resident/report');
  };

  return (
    <div className="witness-report-container">
      {/* Header */}
      <Header />
      <div className='title-container'>
            <button className="back-button" onClick={() => navigate(-1)}>
            <img className='back-button-icon' src={BackButton}/>
          </button>
          <h1>Report Incident</h1>
      </div>
        

        {/* Incident Type */}
        <div className="form-section">
          <label className="label">Incident Type:</label>
          <div className="input-box">
            <span className="input-text">{incidentType}</span>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <label className="label">Location:</label>
          <div className="input-box">
            <input
              type="text"
              className="input-field"
              placeholder="Enter location details"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </div>
        </div>

        {/* Pin Location */}
        <div className="form-section">
          <label className="label">Pin Location:</label>
          <div className="map-box">
            {/* Map placeholder - you can integrate with Google Maps or other mapping service */}
            <div className="map-placeholder">
              <span>Map will be displayed here</span>
            </div>
          </div>
          {/* Button under map */}
        <button className="submit-button" onClick={() => navigate('/resident/call', {
          state: {
            incidentType,
            fromWitnessReport: true
          }
        })}>
          <span className="submit-button-text">Submit Report</span>
        </button>
        </div>

        

      {/* BOTTOM NAVIGATION */}
      <BottomNav/>
    </div>
  );
};

export default ResidentWitReport; 