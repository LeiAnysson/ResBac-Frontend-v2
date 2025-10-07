import React, { useState, useRef, useEffect } from "react";
import "./TopBar.css";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <img className="topbar-logo" src="/LogoB.png" alt="Logo" />
      <span className="topbar-title"></span>
      <div className="topbar-actions">
        <span
          className="topbar-notification"
          onClick={() => setOpen(!open)}
          ref={popupRef}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/5000/5000039.png"
            alt="Notification"
            className="topbar-notification-icon"
          />
          <span className="topbar-notification-badge">3</span>

          {open && (
            <div className="notification-popup">
              <ul>
                <li>New incident reported</li>
                <li>Dispatcher assigned</li>
                <li>Duplicate report detected</li>
              </ul>
            </div>
          )}
        </span>
      </div>
    </header>
  );
};

export default TopBar;
