import './NavBar.css';
import {
  MdHome, MdPeople, MdAssessment, MdNotificationsActive,
  MdCampaign, MdSettings, MdLogout
} from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');  
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) return;

    fetch('http://127.0.0.1:8000/api/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch(err => {
        console.error('Error fetching user:', err);
      });
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-profile">
          <img
            className="navbar-profile-img"
            src="https://i.ibb.co/6bQQP4r/avatar-placeholder.png"
            alt="Profile"
          />
          <div className="navbar-profile-name">{user ? `${user.name ?? user.first_name}` : 'Loading...'}</div>
          <div className="navbar-profile-role">
            {user?.role?.name
            ? user.role.name === 'Admin'
              ? 'Administrator'
              : user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1)
            : `Role ID: ${user?.role_id}`}</div>
          </div>

        <hr className="navbar-divider"/>
        <div className="navbar-menu">
          {/* Dashboard */}
          {user?.role?.name === 'Admin' ? (
            <Link
              to="/admin"
              className={`navbar-menu-item${location.pathname === "/admin" ? " active" : ""}`}
            >
              <MdHome className="navbar-menu-icon" />
              <span>Dashboard</span>
            </Link>
          ) : user?.role?.name === 'MDRRMO' ? (
            <Link
              to="/dispatcher"
              className={`navbar-menu-item${location.pathname === "/dispatcher" ? " active" : ""}`}
            >
              <MdHome className="navbar-menu-icon" />
              <span>Dashboard</span>
            </Link>
          ) : null}

          {/* Admin-only */}
          {user?.role?.name === 'Admin' && (
            <Link
              to="/admin/user-management"
              className={`navbar-menu-item${location.pathname === "/admin/user-management" ? " active" : ""}`}
            >
              <MdPeople className="navbar-menu-icon" />
              <span>User Management</span>
            </Link>
          )}

          {/* Admin + MDRRMO shared */}
          {(user?.role?.name === 'Admin' || user?.role?.name === 'MDRRMO') && (
            <>
              <Link
                to="/admin/emergency-reports"
                className={`navbar-menu-item${location.pathname === "/admin/emergency-reports" ? " active" : ""}`}
              >
                <MdAssessment className="navbar-menu-icon" />
                <span>Emergency Reports</span>
              </Link>

              <Link
                to="/admin/response-team"
                className={`navbar-menu-item${location.pathname === "/admin/response-team" ? " active" : ""}`}
              >
                <MdNotificationsActive className="navbar-menu-icon" />
                <span>Response Team</span>
              </Link>

              <Link
                to="/admin/announcement"
                className={`navbar-menu-item${location.pathname === "/admin/announcement" ? " active" : ""}`}
              >
                <MdCampaign className="navbar-menu-icon" />
                <span>Announcement</span>
              </Link>
            </>
          )}

        {/* Admin-only: */}
        {user?.role?.name === 'Admin' && (
          <Link
            to="/admin/settings"
            className={`navbar-menu-item${location.pathname === "/admin/settings" ? " active" : ""}`}
            style={{ marginTop: 'auto' }}
          >
            <MdSettings className="navbar-menu-icon" />
            <span>Settings</span>
          </Link>
        )}
        
        <div className="navbar-logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <MdLogout className="navbar-menu-icon" />
          <span>Logout</span>
        </div>
      </div>
      </div>  
    </nav>
  );
};

export default NavBar;
