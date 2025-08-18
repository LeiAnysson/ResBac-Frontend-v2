import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentArrived.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import  BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx'

function ResidentArrived() {
return (
    <div className="arrived-container">
      {/* Header */}
      <Header />
      
      {/* Map Background */}
      <div className="map-background">
        {/* Map content will be rendered here when backend API is integrated */}
        <div className="map-placeholder">
          {/* TODO: Replace with actual map tiles or API integration */}
        </div>
      </div>

      {/* Status Card Overlay */}
      <div className="status-card" style={{width: '95%', borderRadius: '30px'}}>
        <div className="status-content">
          <div className="location-info">
            <div className="location-icon">📍</div>
            <div className="location-text">
              <span className="location-address">Location</span>
            </div>
          </div>
          <div className="status-message">
            <span className="status-text">Responder is on their way</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
export default ResidentArrived;
