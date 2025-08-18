import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentCall.css';
import muteIcon from '../assets/mute.png';
import videoIcon from '../assets/video.png';
import speakerIcon from '../assets/speaker.png';
import addIcon from '../assets/add.png';
import holdIcon from '../assets/hold.png';
import endCallIcon from '../assets/endcall.png';
import keypadIcon from '../assets/keypad.png';


const ResidentCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidentType, setIncidentType] = useState(location.state?.incidentType || '');
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const timerRef = useRef(null);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Validate incident type on component mount
  useEffect(() => {
    if (!incidentType) {
      console.warn('No incident type provided, redirecting to report page');
      navigate('/resident/report');
    }
  }, [incidentType, navigate]);

  const handleStartCall = async () => {
    try {
      // Validate that incident type is present
      if (!incidentType) {
        alert('Error: No incident type specified. Please go back and select an incident type.');
        navigate('/resident/report');
        return;
      }

      setCallStatus('calling');
      
      // Simulate API call to backend
      // const response = await fetch('/api/emergency-call/start', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     incidentType,
      //     userId: 'current-user-id', // Get from auth context
      //     location: 'user-location', // Get from GPS
      //     timestamp: new Date().toISOString()
      //   })
      // });
      
      // if (response.ok) {
      //   const callData = await response.json();
      //   console.log('Call initiated:', callData);
      // }

      // Simulate call connection after 3 seconds
      setTimeout(() => {
        setCallStatus('connected');
        startCallTimer();
      }, 3000);
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('idle');
    }
  };

  const handleEndCallClick = () => {
    // Directly end the call without confirmation
    handleEndCall();
  };

  const handleEndCall = async () => {
    try {
      // Validate call status before ending
      if (callStatus !== 'connected' && callStatus !== 'calling') {
        console.warn('Cannot end call: Call is not active');
        return;
      }

      // Simulate API call to backend to end the call
      // await fetch('/api/emergency-call/end', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     callId: 'current-call-id',
      //     duration: callDuration,
      //     endTime: new Date().toISOString()
      //   })
      // });

      // Simulate API call to create emergency report
      // const reportResponse = await fetch('/api/emergency-reports/create', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     incidentType,
      //     userId: 'current-user-id',
      //     location: 'user-location',
      //     callDuration,
      //     timestamp: new Date().toISOString(),
      //     status: 'pending'
      //   })
      // });

      setCallStatus('ended');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
      
      // Navigate to waiting screen after call ends
      setTimeout(() => {
        navigate('/resident/waiting', {
          state: {
            incidentType,
            callDuration,
            timestamp: new Date().toISOString(),
            fromWitnessReport: location.state?.fromWitnessReport || false,
            fromSOS: location.state?.fromSOS || false
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = async () => {
    try {
      // Simulate API call to backend
      // await fetch('/api/emergency-call/mute', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     callId: 'current-call-id',
      //     muted: !isMuted
      //   })
      // });

      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleVideoToggle = async () => {
    try {
      // Simulate API call to backend
      // await fetch('/api/emergency-call/video', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     callId: 'current-call-id',
      //     videoEnabled: !isVideoEnabled
      //   })
      // });

      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const handleAddCall = () => {
    // Implement add call functionality
    console.log('Add call functionality');
  };

  const handleKeypad = () => {
    // Implement keypad functionality
    console.log('Keypad functionality');
  };

  const handleHold = async () => {
    try {
      // Simulate API call to backend
      // await fetch('/api/emergency-call/hold', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     callId: 'current-call-id',
      //     onHold: !isOnHold
      //   })
      // });

      setIsOnHold(!isOnHold);
    } catch (error) {
      console.error('Error toggling hold:', error);
    }
  };

  return (
    <div className="call-container">
      
      <div className="content-scroll">
        {/* Call Interface */}
        <div className="call-interface">
          {/* Top Menu */}
          <div className="call-menu">
            <button className="menu-button">
              <span className="menu-dots">⋮</span>
            </button>
          </div>

          {/* Call Info */}
          <div className="call-info">
            <h1 className="caller-name">Responder</h1>
            {callStatus === 'connected' && (
              <p className="call-duration">{formatTime(callDuration)}</p>
            )}
            {callStatus === 'calling' && (
              <p className="call-status-text">Connecting...</p>
            )}
            {callStatus === 'idle' && (
              <p className="call-status-text">Ready to call</p>
            )}
          </div>

          {/* Call Controls Grid */}
          <div className="call-controls">
            {/* Top Row */}
            <div className="control-row">
              <button 
                className={`control-button ${isMuted ? 'active' : ''}`}
                onClick={handleMuteToggle}
                disabled={callStatus !== 'connected'}
              >
                <div className="control-icon">
                  <img src={muteIcon} alt="Mute" className="control-img" />
                </div>
                <span className="control-label">Mute</span>
              </button>

              <button 
                className={`control-button ${isVideoEnabled ? 'active' : ''}`}
                onClick={handleVideoToggle}
                disabled={callStatus !== 'connected'}
              >
                <div className="control-icon">
                  <img src={videoIcon} alt="Video Call" className="control-img" />
                </div>
                <span className="control-label">Video Call</span>
              </button>

              <button 
                className={`control-button ${isSpeakerOn ? 'active' : ''}`}
                onClick={handleSpeakerToggle}
                disabled={callStatus !== 'connected'}
              >
                <div className="control-icon">
                  <img src={speakerIcon} alt="Speaker" className="control-img" />
                </div>
                <span className="control-label">Speaker</span>
              </button>
            </div>

            {/* Middle Row */}
            <div className="control-row">
              <button 
                className="control-button"
                onClick={handleAddCall}
                disabled={callStatus !== 'connected'}
              >
                <div className="control-icon">
                  <img src={addIcon} alt="Add Call" className="control-img" />
                </div>
                <span className="control-label">Add Call</span>
              </button>

                             <button 
                 className="control-button"
                 onClick={handleKeypad}
                 disabled={callStatus !== 'connected'}
               >
                 <div className="control-icon">
                   <img src={keypadIcon} alt="Keypad" className="control-img" />
                 </div>
                 <span className="control-label">Keypad</span>
               </button>

              <button 
                className={`control-button ${isOnHold ? 'active' : ''}`}
                onClick={handleHold}
                disabled={callStatus !== 'connected'}
              >
                <div className="control-icon">
                  <img src={holdIcon} alt="Hold" className="control-img" />
                </div>
                <span className="control-label">Hold</span>
              </button>
            </div>

            {/* Bottom Row - End Call */}
            <div className="control-row">
              <button 
                className="control-button end-call"
                onClick={callStatus === 'idle' ? handleStartCall : handleEndCallClick}
              >
                <div className="control-icon">
                  <img src={endCallIcon} alt="End Call" className="control-img" />
                </div>
                <span className="control-label">
                  {callStatus === 'idle' ? 'Start Call' : 'End Call'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog removed */}
    </div>
  );
};

export default ResidentCall; 