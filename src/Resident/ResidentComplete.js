import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentComplete.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx'

function ResidentComplete(){
return (
    <div className="complete-container">
      {/* Header */}
      <Header />
      
      {/* Map Background */}
      <div className="map-background">
        {/* Map content will be rendered here when backend API is integrated */}
        <div className="map-placeholder">
          {/* TODO: Replace with actual map tiles or API integration */}
        </div>
      </div>

      {/* Completion Status Card Overlay */}
      <div className="status-card" style={{width: '90%', borderRadius: '30px'}}>
        <div className="status-content">
          <div className="completion-icon">
            <div className="success-circle">
              <span className="checkmark">✓</span>
            </div>
          </div>
          <div className="completion-message">
            <span className="completion-text">The responder has reached your location</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav/>
    </div>
  );
}

export default ResidentComplete;
