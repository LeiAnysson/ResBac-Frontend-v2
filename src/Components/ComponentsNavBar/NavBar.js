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

  const isAdmin = user?.role?.name === 'Admin';
  const isDispatcher = user?.role?.name === 'MDRRMO';
  
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${process.env.REACT_APP_URL}/api/logout`, {
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

    fetch(`${process.env.REACT_APP_URL}/api/me`, {
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
            src="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
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
          {isAdmin && <Link to="/admin" className={`navbar-menu-item${location.pathname === "/admin" ? " active" : ""}`}><MdHome className="navbar-menu-icon" /><span>Dashboard</span></Link>}
          {isDispatcher && <Link to="/dispatcher" className={`navbar-menu-item${location.pathname === "/dispatcher" ? " active" : ""}`}><MdHome className="navbar-menu-icon" /><span>Dashboard</span></Link>}

          {/* Admin-only */}
          {isAdmin && <Link to="/admin/user-management" className={`navbar-menu-item${location.pathname === "/admin/user-management" ? " active" : ""}`}><MdPeople className="navbar-menu-icon" /><span>User Management</span></Link>}

          {/* Shared links */}
          {(isAdmin || isDispatcher) && <>
            <Link to={isAdmin ? "/admin/emergency-reports" : "/dispatcher/emergency-reports"} className={`navbar-menu-item${location.pathname.includes("emergency-reports") ? " active" : ""}`}><MdAssessment className="navbar-menu-icon" /><span>Emergency Reports</span></Link>
            <Link to={isAdmin ? "/admin/response-team" : "/dispatcher/response-team"} className={`navbar-menu-item${location.pathname.includes("response-team") ? " active" : ""}`}><MdNotificationsActive className="navbar-menu-icon" /><span>Response Team</span></Link>
            <Link to={isAdmin ? "/admin/announcements" : "/dispatcher/announcements"} className={`navbar-menu-item${location.pathname.includes("announcement") ? " active" : ""}`}><MdCampaign className="navbar-menu-icon" /><span>Announcement</span></Link>
          </>}

          {/* Admin-only settings */}
          {isAdmin && <Link to="/admin/settings" className={`navbar-menu-item${location.pathname === "/admin/settings" ? " active" : ""}`} style={{ marginTop: 'auto' }}><MdSettings className="navbar-menu-icon" /><span>Settings</span></Link>}

          {/* Logout */}
          <div className="navbar-logout" onClick={handleLogout} style={{ cursor: 'pointer' }}><MdLogout className="navbar-menu-icon" /><span>Logout</span></div>
        </div>
      </div>  
    </nav>
  );
};

export default NavBar;