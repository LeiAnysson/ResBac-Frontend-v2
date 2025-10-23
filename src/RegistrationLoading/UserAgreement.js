import React, { useState } from 'react';
import '../SignInPage/SignInPage.css'; 
import RegistrationPending from './RegistrationPending';
import { Link } from 'react-router-dom';

const UserAgreement = ({ onAgree }) => {
  const [checked, setChecked] = useState(false);
  const [showPending, setShowPending] = useState(false);

  const handleAgree = () => {
    setShowPending(true);
  };

  const handleClosePending = () => {
    setShowPending(false);
    onAgree(); 
  };

  return (
    <div className="login-root">
      {/* Left Section */}
      <div className="login-left">
        <Link to="/">
          <img src="/LogoB.png" alt="Bocaue Rescue Logo" className="login-logo" />
        </Link>
        <div className="login-org-name">BOCAUE RESCUE EMS</div>
        <div className="login-org-desc">
          MUNICIPAL EMERGENCY ASSISTANCE AND<br />INCIDENT RESPONSE
        </div>
      </div>

      {/* Right Section */}
      <div
        className="login-right"
        style={{ background: "url('/municipal-hall.jpg') center center / cover no-repeat" }}
      >
        <div className="ua-form-container" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <h2 className="login-title">User Agreement</h2>
          <div className="agreement-content" style={{ textAlign: "left", fontSize: "14px", lineHeight: "1.6" }}>
            <p>
              Welcome to <strong>ResBac</strong>, your official emergency reporting tool.
              By using this app, you agree to the following terms:
            </p>

            <h3>1. Responsible Use Only</h3>
            <p>
              This app is strictly for real emergencies requiring help from the <strong>MDRRMO</strong>.
              Please be honest. False reports waste critical resources and put lives at risk.
            </p>

            <h3>2. No Fake Reports</h3>
            <ul>
              <li>Do not fake any emergency situation.</li>
              <li>Do not cause panic or confusion.</li>
              <li>Do not misuse the app to disturb public order or authorities.</li>
            </ul>

            <h3>3. Legal Warning</h3>
            <p>Anyone who files a fake emergency can be prosecuted under:</p>
            <ul>
              <li>Article 154 of the Revised Penal Code (Unlawful Utterances)</li>
              <li>Republic Act No. 10175 (Cybercrime Prevention Act of 2012)</li>
              <li>Republic Act No. 8484 (Access Device Regulation Act)</li>
            </ul>

            <p>You may face fines, jail time, and permanent ban from the app.</p>

            <h3>4. Monitoring</h3>
            <p>
              All submissions are logged and monitored. Verified false reports will be turned over
              to the authorities for investigation and legal action.
            </p>

            <h3>5. Your Agreement</h3>
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
            className="register-btn"
            style={{ marginTop: "1.5rem" }}
            disabled={!checked}
            onClick={onAgree}
          >
            Continue
          </button>
        </div>
      </div>

      {showPending && <RegistrationPending onBack={handleClosePending} />}
    </div>
  );
};

export default UserAgreement;
