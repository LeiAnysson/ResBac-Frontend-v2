import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import "./TopBar.css";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const popupRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/notifications/${userId}`);
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const latestNotifications = notifications.slice(0, 5); 

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

          {open && (
            <div className="notification-popup">
              <ul>
                {latestNotifications.length > 0 ? (
                  latestNotifications.map((item) => (
                    <li key={item.id}>
                      <p className="topbar-notification-text">{item.message}</p>
                      <span className="topbar-notification-time">{timeAgo(item.created_at)}</span>
                    </li>
                  ))
                ) : (
                  <li className="empty-text">No notifications available</li>
                )}
              </ul>
              <div
                className="view-all"
                onClick={() => navigate("/notifications")}
              >
                View All
              </div>
            </div>
          )}
        </span>
      </div>
    </header>
  );
};

export default TopBar;
