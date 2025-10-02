import React, { useState } from 'react';
import './RegistrationPending.css';

const UserAgreement = ({ onAgree }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="pending-root">
      <div className="pending-container">
        <div className="pending-message" style={{ textAlign: "left" }}>
          <h2>User Agreement</h2>
          <p>
            Welcome to <strong>ResBac</strong>, your official emergency reporting tool. 
            By using this app, you agree to the following terms:
          </p>

          <h3>1. Responsible Use Only</h3>
          <p>
            This app is strictly for real emergencies requiring help from the <strong>MDRRMO</strong>
            <br />
            Please be honest. False reports waste critical resources and put lives at risk.
          </p>

          <h3>2. No Fake Reports</h3>
          <p>You agree NOT to:</p>
          <ul>
            <li>Fake any emergency situation.</li>
            <li>Cause panic or confusion.</li>
            <li>Misuse the app to disturb public order or authorities.</li>
          </ul>

          <h3>3. Legal Warning</h3>
          <p>
            Anyone who files a fake emergency can be prosecuted under:
          </p>
          <ul>
            <li>Article 154 of the Revised Penal Code (Unlawful Utterances)</li>
            <li>Republic Act No. 10175 (Cybercrime Prevention Act of 2012)</li>
            <li>Republic Act No. 8484 (Access Device Regulation Act)</li>
          </ul>
          <p>You may face fines, jail time, and permanent ban from the app.</p>

          <h3>4. Monitoring</h3>
          <p>
            All submissions are logged and monitored. Verified false reports 
            will be turned over to the authorities for investigation and legal action.
          </p>

          <h3>5. Your Agreement</h3>
          <p>
            By continuing, you confirm that:
          </p>
          <ul>
            <li>All reports you send are real and accurate.</li>
            <li>You understand that false reporting has serious legal consequences.</li>
            <li>You agree to all terms of this agreement.</li>
          </ul>

          <div style={{ marginTop: "1rem" }}>
            <input 
              type="checkbox" 
              id="agree" 
              checked={checked} 
              onChange={(e) => setChecked(e.target.checked)} 
            />
            <label htmlFor="agree" style={{ marginLeft: "8px" }}>
              I agree to the terms and conditions
            </label>
          </div>
        </div>

        <button 
          className="pending-btn" 
          disabled={!checked} 
          onClick={onAgree}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default UserAgreement;
