import React from 'react';
import './TopBar.css';

const TopBar = () => (
  <header className="topbar">
    <img className="topbar-logo" src="/LogoB.png" alt="Logo" />
    <span className="topbar-title"></span>
    <div className="topbar-actions">
      <span className="topbar-notification">
        <i className="fa fa-bell"></i>
        <span className="topbar-notification-badge">1</span>
      </span>
 
    </div>
  </header>
);

export default TopBar;

