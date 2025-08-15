import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentReport.css';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png'
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'

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
    } else if (reporterType === 'Victim') {
      navigate('/resident/call', { state: { incidentType: incidentType.label } });
    }
  };

  return (
    <div className="report-container">
      <Header />
      <div className='title-container'>
            <button className="back-button" onClick={() => navigate(-1)}>
            <img className='back-button-icon' src={BackButton}/>
          </button>
          <h1>Report</h1>
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
      <BottomNav />
    </div>
  );
};

export default ResidentReport;
