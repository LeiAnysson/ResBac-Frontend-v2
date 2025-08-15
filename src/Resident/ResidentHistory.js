import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentHistory.css';
import reportIcon from '../assets/report.png'
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png'
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const ResidentHistory = () => {
  const navigate = useNavigate();
  const reports = []; // Placeholder for reports data

  const statusColor = (status) => {
    switch (status) {
      case 'En Route': return { color: '#1041BC' };
      case 'Resolved': return { color: '#2ecc40' };
      case 'Cancelled': return { color: '#e53935' };
      case 'Pending': return { color: '#f7b84b' };
      default: return { color: '#888' };
    }
  };

  return (
    <div className="history-container">
     {/* Header */}
      <Header />
      <div className='title-container' style={{display: 'flex', justifyContent: 'space-between' }} >
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <button className="back-button" onClick={() => navigate(-1)}>
            <img className='back-button-icon' src={BackButton}/>
          </button>
          <h1 style={{fontSize: '22px'}}>History</h1>
          </div> 
          <button className="report-button" onClick={() => navigate('/resident/report')}>
          <span className="report-button-text">Report</span>
          <img src={reportIcon} alt="Report" className="report-button-icon" />
        </button>
      </div>
      
      {/* Reports Container */}
        <div className="container">
          {reports.length === 0 ? (
            <p className="empty-text">No reports available.</p>
          ) : (
            <div className="reports-list">
              {reports.map((item, idx) => (
                <div key={item.id} className={`report-card ${idx !== reports.length - 1 ? 'report-card-border' : ''}`}>
                  <div className="report-header">
                    <p className="report-date">{item.date}</p>
                    <p className="status" style={statusColor(item.status)}>{item.status}</p>
                  </div>
                  <p className="incident-type">
                    Incident Type: <strong style={{color: '#e53935'}}>{item.type}</strong>
                  </p>
                  <p className="location">{item.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      
      {/* Bottom Navigation */}
      <BottomNav/>
    </div>
  );
};

export default ResidentHistory; 