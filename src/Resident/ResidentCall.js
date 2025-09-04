import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentCall.css';
import endCallIcon from '../assets/endcall.png';
import * as Ably from 'ably';

const ably = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });

const ResidentCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidentType, setIncidentType] = useState(location.state?.incidentType || '');
  const [callStatus, setCallStatus] = useState('calling'); 
  const [callDuration, setCallDuration] = useState(0);
  const [timerRef, setTimerRef] = useState(null);

  const residentId = localStorage.getItem('userId');
  const privateChannelName = `resident.${residentId}`;

  useEffect(() => {
    if (!incidentType) {
      navigate('/resident/report');
    }
  }, [incidentType, navigate]);

  useEffect(() => {
    if (!residentId) return;

    const channel = ably.channels.get(privateChannelName);

    const handleCallAccepted = (msg) => {
      console.log('Call accepted by dispatcher:', msg.data);
      setCallStatus('connected');
    };

    channel.subscribe('CallAccepted', handleCallAccepted);

    return () => {
      channel.unsubscribe('CallAccepted', handleCallAccepted);
    };
  }, [residentId]);

  useEffect(() => {
    if (callStatus === 'connected') {
      const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      setTimerRef(timer);
      return () => clearInterval(timer);
    }
  }, [callStatus]);

  const handleEndCall = () => {
    if (timerRef) clearInterval(timerRef);
    setCallStatus('ended');

    navigate('/resident/waiting', {
      state: {
        incidentType,
        callDuration,
        timestamp: new Date().toISOString(),
        fromSOS: location.state?.fromSOS || false,
      },
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-container">
      <div className="content-scroll">
        <div className="call-interface">
          <div className="call-info">
            <h1 className="caller-name">MDRRMO</h1>
            {callStatus === 'calling' && <p className="call-status-text">Calling...</p>}
            {callStatus === 'connected' && <p className="call-duration">{formatTime(callDuration)}</p>}
            {callStatus === 'ended' && <p className="call-status-text">Call Ended</p>}
          </div>

          {callStatus !== 'ended' && (
            <div className="call-controls">
              <button className="control-button end-call" onClick={handleEndCall}>
                <div className="control-icon">
                  <img src={endCallIcon} alt="End Call" className="control-img" />
                </div>
                <span className="control-label">End Call</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentCall;
