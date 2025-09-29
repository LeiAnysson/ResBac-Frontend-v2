import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root">
      {/* Header */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo-section">
          <div className="logo-container">
            <img    
             src="LogoB.png"
             alt = "Logo"
             className="logo-image"
            />
          </div>
          <span className="brand-name">ResBac</span>
        </div>
        <nav className="nav-links">
          <button 
            onClick={() => scrollToSection('home')} 
            className="nav-link-btn"
          >
            HOME
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="nav-link-btn"
          >
            ABOUT
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="nav-link-btn"
          >
            CONTACT
          </button>
        </nav>
        <button onClick={handleSignIn} className="sign-in-btn">
          SIGN IN
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <span className="hero-subtitle">BOCAUE RESCUE</span>
          <h1 className="hero-title">
            MUNICIPAL<br />EMERGENCY<br />ASSISTANCE AND<br />INCIDENT RESPONSE
          </h1>
          <p className="hero-description">
            Providing 24/7 emergency response and disaster management services to the community of Bocaue, Bulacan.
          </p>
        </div>

       <div className="hero-image">
  <div className="emergency-scene">
    {/* Animated Ambulance */}
    <svg className="ambulance-svg" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      {/* Ambulance Body with Gradient */}
        <defs>
        <linearGradient id="ambulanceBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#f8f9fa', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#87ceeb', stopOpacity: 0.8}} />
          <stop offset="100%" style={{stopColor: '#4682b4', stopOpacity: 0.9}} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
       
      {/* Ambulance Body */}
      <rect x="30" y="100" width="320" height="120" rx="25" fill="url(#ambulanceBody)" stroke="#333" strokeWidth="2" className="ambulance-body"/>
      
      {/* Front Window */}
      <rect x="50" y="110" width="70" height="50" rx="10" fill="url(#windowGradient)" className="window-front"/>
      <rect x="55" y="115" width="60" height="40" rx="8" fill="#ffffff" opacity="0.3"/>
      
      {/* Side Windows */}
      <rect x="200" y="110" width="70" height="50" rx="10" fill="url(#windowGradient)" className="window-side"/>
      <rect x="205" y="115" width="60" height="40" rx="8" fill="#ffffff" opacity="0.3"/>
      
      {/* Emergency Stripe with Animation */}
      <rect x="30" y="155" width="320" height="15" fill="#ff0000" className="emergency-stripe"/>
      
      {/* Emergency Cross */}
      <circle cx="330" cy="162" r="18" fill="#ff0000" className="emergency-cross"/>
      <line x1="321" y1="162" x2="339" y2="162" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" className="cross-horizontal"/>
      <line x1="330" y1="153" x2="330" y2="171" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" className="cross-vertical"/>
      
      {/* Emergency Lights with Intense Animation */}
      <circle cx="200" cy="80" r="15" fill="#ffff00" className="light-top" filter="url(#glow)"/>
      <circle cx="200" cy="60" r="10" fill="#ffff00" className="light-front" filter="url(#glow)"/>
      <circle cx="200" cy="40" r="8" fill="#ff6600" className="light-siren" filter="url(#glow)"/>
      
      {/* Wheels with Rotation */}
      <g className="wheel-front">
        <circle cx="100" cy="220" r="25" fill="#333" stroke="#666" strokeWidth="2"/>
        <circle cx="100" cy="220" r="15" fill="#666"/>
        <circle cx="100" cy="220" r="8" fill="#999"/>
        <line x1="100" y1="195" x2="100" y2="245" stroke="#999" strokeWidth="2" className="wheel-spoke"/>
        <line x1="75" y1="220" x2="125" y2="220" stroke="#999" strokeWidth="2" className="wheel-spoke"/>
      </g>
      
      <g className="wheel-back">
        <circle cx="280" cy="220" r="25" fill="#333" stroke="#666" strokeWidth="2"/>
        <circle cx="280" cy="220" r="15" fill="#666"/>
        <circle cx="280" cy="220" r="8" fill="#999"/>
        <line x1="280" y1="195" x2="280" y2="245" stroke="#999" strokeWidth="2" className="wheel-spoke"/>
        <line x1="255" y1="220" x2="305" y2="220" stroke="#999" strokeWidth="2" className="wheel-spoke"/>
      </g>
      
      {/* Front Grill */}
      <rect x="30" y="120" width="20" height="80" fill="#333" className="front-grill"/>
      <line x1="30" y1="130" x2="50" y2="130" stroke="#666" strokeWidth="1" className="grill-line"/>
      <line x1="30" y1="140" x2="50" y2="140" stroke="#666" strokeWidth="1" className="grill-line"/>
      <line x1="30" y1="150" x2="50" y2="150" stroke="#666" strokeWidth="1" className="grill-line"/>
      <line x1="30" y1="160" x2="50" y2="160" stroke="#666" strokeWidth="1" className="grill-line"/>
      <line x1="30" y1="170" x2="50" y2="170" stroke="#666" strokeWidth="1" className="grill-line"/>
      <line x1="30" y1="180" x2="50" y2="180" stroke="#666" strokeWidth="1" className="grill-line"/>
      
      {/* Side Door */}
      <rect x="150" y="110" width="80" height="100" fill="#f0f0f0" stroke="#333" strokeWidth="1" className="side-door"/>
      <line x1="190" y1="110" x2="190" y2="210" stroke="#333" strokeWidth="1" className="door-seam"/>
      
      {/* Emergency Siren */}
      <rect x="180" y="70" width="40" height="20" rx="5" fill="#ff0000" className="emergency-siren"/>
      <rect x="185" y="75" width="30" height="10" fill="#ffffff" opacity="0.8"/>
      
      {/* Motion Lines for Speed Effect */}
      <line x1="350" y1="140" x2="380" y2="140" stroke="#ffffff" strokeWidth="2" opacity="0.6" className="motion-line"/>
      <line x1="350" y1="160" x2="380" y2="160" stroke="#ffffff" strokeWidth="2" opacity="0.4" className="motion-line"/>
      <line x1="350" y1="180" x2="380" y2="180" stroke="#ffffff" strokeWidth="2" opacity="0.2" className="motion-line"/>
    </svg>
   {/* Emergency Scene Elements */}
    <div className="emergency-elements">
      <div className="pulse-circle pulse-1"></div>
      <div className="pulse-circle pulse-2"></div>
      <div className="pulse-circle pulse-3"></div>
    </div>
  </div>
</div>
      </section>

      {/* Info Section with Bocaue Hall Background */}
      <section className="info-section" id="about">
        <div className="info-bg">
          <div className="info-overlay">
            <div className="info-content">
              <div>
                <div>
                  <div>
                 
                  </div>
                </div>
              </div>
              <div className="info-text">
                <p>
                  The MDRRMO in Bocaue, Bulacan spearheads the municipality's efforts in disaster preparedness, response, recovery, and mitigation to safeguard the community from potential hazards.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Emergency Hotline Section */}
        <div className="hotline-section">
          <h3>EMERGENCY HOTLINE:</h3>
          <ul>
            <li>
              <b>Bocaue Rescue:</b> 0936-330-9020
            </li>
            <li>
              <b>Bocaue Fire Station:</b> 0936-226-1093 / 0947-732-5198
            </li>
            <li>
              <b>Bocaue Police Station:</b> 0998-598-5376
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="contact">
        <div className="footer-content">
          <div className="footer-about">
            <h2>BOCAUE RESCUE</h2>
            <p>
              Bocaue Rescue is an emergency medical and disaster response team in Bocaue, Bulacan, 
              providing 24/7 ambulance and rescue services. They actively assist during calamities 
              and emergencies, often in coordination with local government units.
            </p>
            <p>Address: Shangri-La Road, Igulot, Bocaue, Bulacan.</p>
          </div>
          <div className="footer-social">
            <h2>FOLLOW US</h2>
            <div className="social-icons">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <i className="fab fa-x-twitter"></i>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
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
