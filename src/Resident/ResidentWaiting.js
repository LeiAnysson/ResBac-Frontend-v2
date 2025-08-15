import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentWaiting.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';

const ResidentWaiting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data passed from the call screen
  const callData = location.state || {};
  
  const [emergencyReport, setEmergencyReport] = useState({
    id: '',
    type: callData.incidentType || '',
    description: '',
    location: '',
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    status: 'pending',
    submittedAt: callData.timestamp || new Date().toISOString(),
    estimatedResponseTime: '5-10 minutes',
    assignedDispatcher: null,
    priority: 'medium',
    callDuration: callData.callDuration || 0,
    fromWitnessReport: callData.fromWitnessReport || false,
    fromSOS: callData.fromSOS || false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulate fetching emergency report data from backend
  useEffect(() => {
    const fetchEmergencyReport = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/emergency-reports/current');
        // const data = await response.json();
        
        // If no call data is present, redirect to report page
        if (!callData.incidentType && !callData.fromWitnessReport && !callData.fromSOS) {
          console.warn('No incident data provided, redirecting to report page');
          navigate('/resident/report');
          return;
        }
        
        // Mock data for demonstration
        const mockData = {
          id: 'ER-2024-001',
          type: callData.incidentType || (callData.fromSOS ? 'Emergency' : 'Witness Report'),
          description: callData.fromSOS 
            ? 'SOS emergency call completed - high priority dispatch'
            : callData.fromWitnessReport 
              ? 'Witness report submitted - under review'
              : 'Emergency call completed - awaiting dispatch',
          location: '123 Main Street, Bocaue',
          coordinates: {
            latitude: 14.7995,
            longitude: 120.9267
          },
          status: 'pending',
          submittedAt: callData.timestamp || new Date().toISOString(),
          estimatedResponseTime: callData.fromSOS ? '2-5 minutes' : '5-10 minutes',
          assignedDispatcher: null,
          priority: callData.fromSOS ? 'critical' : 'high',
          callDuration: callData.callDuration || 0,
          fromWitnessReport: callData.fromWitnessReport || false,
          fromSOS: callData.fromSOS || false
        };
        
        setEmergencyReport(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load emergency report details');
        console.error('Error fetching emergency report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyReport();
  }, [callData, navigate]);

  // TODO: Add map data fetching when backend API is ready
  // useEffect(() => {
  //   const fetchMapData = async () => {
  //     try {
  //       // const response = await fetch('/api/map/locations');
  //       // const mapData = await response.json();
  //       // setMapData(mapData);
  //     } catch (err) {
  //       console.error('Error fetching map data:', err);
  //     }
  //   };
  //   
  //   fetchMapData();
  // }, []);

  // Function to handle canceling the emergency report
  const handleCancelReport = async () => {
    if (window.confirm('Are you sure you want to cancel this emergency report?')) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/emergency-reports/${emergencyReport.id}/cancel`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' }
        // });
        
        navigate('/resident');
      } catch (err) {
        setError('Failed to cancel emergency report');
        console.error('Error canceling report:', err);
      }
    }
  };

  // Function to handle updating report status
  const handleUpdateStatus = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/emergency-reports/${emergencyReport.id}/status`);
      // const data = await response.json();
      // setEmergencyReport(prev => ({ ...prev, ...data }));
      
      console.log('Checking for status updates...');
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };



  // Auto-refresh status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (emergencyReport.status === 'pending') {
        handleUpdateStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [emergencyReport.status]);

  if (loading) {
    return (
      <div className="waiting-container">
        <Header />
        <div className="loading-overlay">
          <p>Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="waiting-container">
        <Header />
        <div className="error-overlay">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="waiting-container">
      {/* Header */}
      <Header />
      
             {/* Map Background */}
       <div className="map-background">
         {/* Map content will be rendered here when backend API is integrated */}
         <div className="map-placeholder">
           {/* TODO: Replace with actual map data from backend API */}
         </div>
       </div>

             {/* Status Card Overlay */}
       <div className="status-card" style={{width: '95%', borderRadius: '50px'}}>
         <div className="status-icon">
           <div className="processing-spinner">
             <div className="spinner-circle"></div>
           </div>
         </div>
         <div className="status-content">
           <h2 className="status-title">
             {emergencyReport.fromSOS 
               ? 'Your SOS emergency call has been successfully submitted'
               : emergencyReport.fromWitnessReport 
                 ? 'Your witness report has been successfully submitted'
                 : 'Your emergency report has been successfully submitted'
             }
           </h2>
           <p className="status-subtitle">
             {emergencyReport.fromSOS
               ? 'and is now being dispatched with high priority.'
               : emergencyReport.fromWitnessReport
                 ? 'and is now being reviewed by our response team.'
                 : 'and is now awaiting assignment by a dispatcher.'
             }
           </p>
         </div>
       </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ResidentWaiting;
