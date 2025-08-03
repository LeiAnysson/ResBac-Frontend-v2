import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentReport.css';
import homeIcon from '../assets/home.png';
import historyIcon from '../assets/history.png';
import announcementIcon from '../assets/announcement.png';
import reportIcon from '../assets/report.png';
import notificationIcon from '../assets/notification.png';

const ResidentReport = () => {
  const navigate = useNavigate();
  const [reporterType, setReporterType] = useState('Victim');

  const incidentTypes = [
    { label: 'Fire', color: '#ff6666' },
    { label: 'Medical Emergency', color: '#ff6666' },
    { label: 'Disaster\n(Earthquake, Floods, etc)', color: '#ff6666' },
    { label: 'Vehicular Accident', color: '#ff6666' },
    { label: 'Trauma', color: '#ff6666' },
    { label: 'Ambulance Services', color: '#ff6666' },
  ];

  const handleIncidentClick = (incidentType) => {
    if (reporterType === 'Witness') {
      navigate('/resident/witness-report', { state: { incidentType: incidentType.label } });
    } else {
      // You can add Victim flow here if needed
      console.log('Victim flow for:', incidentType.label);
    }
  };

  return (
    <div className="report-container">
      {/* HEADER (avatar only) */}
        <div className="header">
            <div className="header-left"></div>
                <button className="account-button" onClick={() => navigate('/resident/profile')}>
            <div className="avatar">
                <span>👤</span>
            </div>
                </button>
    </div>

      {/* Title row with back button and Report text */}
    <div className="title-row">
        <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-button-icon">←</span>
        </button>
        <h1 className="title">Report Incident</h1>
    </div>

      {/* Reporter Type Toggle */}
    <div className="toggle-row">
            <span className="toggle-label">Reporter Type:</span>
        <button
          className={`toggle-button ${reporterType === 'Victim' ? 'toggle-button-active-victim' : ''}`}
          onClick={() => setReporterType('Victim')}
        >
          <span className={`toggle-button-text ${reporterType === 'Victim' ? 'toggle-button-text-active-victim' : ''}`}>
            Victim
          </span>
        </button>
        <button
          className={`toggle-button ${reporterType === 'Witness' ? 'toggle-button-active-witness' : ''}`}
          onClick={() => setReporterType('Witness')}
        >
          <span className={`toggle-button-text ${reporterType === 'Witness' ? 'toggle-button-text-active-witness' : ''}`}>
            Witness
          </span>
        </button>
    </div>

      {/* Incident Type Container */}
      <div className="incident-container">
        <h2 className="incident-label">Incident Type:</h2>
        <div className="incident-grid">
          {incidentTypes.map((item, idx) => (
            <button
              key={idx}
              className="incident-button"
              style={{ backgroundColor: item.color }}
              onClick={() => handleIncidentClick(item)}
            >
              <span className="incident-button-text">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM NAVIGATION */}
     <div className="bottom-nav">
        <button className="nav-icon" onClick={() => navigate('/resident/history')}>
            <img src={historyIcon} alt="History" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident/announcement')}>
            <img src={announcementIcon} alt="Announcement" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident')}>
            <img src={homeIcon} alt="Home" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident/report')}>
            <img src={reportIcon} alt="Report" className="nav-img" />
        </button>
        <button className="nav-icon" onClick={() => navigate('/resident/notification')}>
            <img src={notificationIcon} alt="Notification" className="nav-img" />
        </button>
     </div>
    </div>
  );
};

export default ResidentReport;
