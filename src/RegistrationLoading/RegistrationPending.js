import React from 'react';
import './RegistrationPending.css';

const RegistrationPending = ({ onBack }) => {
  return (
    <div className="pending-root">
      <div className="pending-container">
        <div className="pending-icon">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" stroke="#4ade80" strokeWidth="4" fill="none" strokeDasharray="44" strokeDashoffset="10">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1.2s" repeatCount="indefinite"/>
            </circle>
            <polyline points="32,16 32,32 44,32" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="pending-message">
          Registration complete! Your account is now pending approval by the administrator.<br />
          You will be notified once your account is verified.
        </div>
        <button className="pending-btn" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};
export default RegistrationPending;

