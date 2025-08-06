import React from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="landing-root">
      {/* Header */}
      <header className="landing-header">
        <div className="logo-section">
          <img src="/Components/bocaue-logo.png" alt="Bocaue Rescue Logo" className="logo-img" />
          <span className="brand-name">ResBac</span>
        </div>
        <nav className="nav-links">
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
        </nav>
        <button onClick={handleSignIn} className="sign-in-btn">SIGN IN</button>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <span className="hero-subtitle">BOCAUE RESCUE</span>
          <h1 className="hero-title">
            MUNICIPAL<br />EMERGENCY<br />ASSISTANCE AND<br />INCIDENT RESPONSE
          </h1>
        </div>
        <div className="hero-image">
          <img src="/Components/ambulance.png" alt="Ambulance" />
        </div>
      </section>

      {/* Scrollable Info Section */}
      <section className="info-section" id="about">
        <div className="info-bg">
          <div className="info-overlay">
            <div className="info-text">
              <p>
                The MDRRMO in Bocaue, Bulacan spearheads the municipality's efforts in disaster preparedness, response, recovery, and mitigation to safeguard the community from potential hazards.
              </p>
            </div>
          </div>
        </div>
        <div className="hotline-section">
          <h3>EMERGENCY HOTLINE:</h3>
          <ul>
            <li><b>Bocaue Rescue:</b> 0936-330-9020</li>
            <li><b>Bocaue Fire Station:</b> 0936-226-1093 / 0947-732-5198</li>
            <li><b>Bocaue Police Station:</b> 0998-598-5376</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="contact">
        <div className="footer-content">
          <div className="footer-about">
            <h2>BOCAUE RESCUE</h2>
            <p>Bocaue Rescue is an emergency medical and disaster response team in Bocaue, Bulacan, providing 24/7 ambulance and rescue services. They actively assist during calamities and emergencies, often in coordination with local government units.</p>
            <p>Address: Shangri-La Road, Igluot, Bocaue, Bulacan.</p>
          </div>
          <div className="footer-social">
            <h2>FOLLOW US</h2>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-x-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© ResBac 2025 | Stay Safe. Stay Prepared.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
