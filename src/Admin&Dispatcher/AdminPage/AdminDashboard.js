import NavBar from '../../Components/ComponentsNavBar/NavBar';
import TopBar from '../../Components/ComponentsTopBar/TopBar';
import './AdminDashboard.css';
import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0); 
  //const [reportsThisWeek, setReportsThisWeek] = useState(0);
  const [pendingResidents, setPendingResidents] = useState(0);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/api/admin/users/total-users`)
      .then(res => res.json())
      .then(data => {
        setUserCount(data.total_users); 
      })
      .catch(error => {
        console.error('Error fetching user count:', error);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    fetch(`${process.env.REACT_APP_URL}/api/admin/residents/pending-residents`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch pending residents");
        }
        return response.json();
      })
      .then((data) => {
        setPendingResidents(data.pending_residents);
      })
      .catch((error) => {
        console.error("Error fetching pending residents:", error);
      });
  }, []);



  // useEffect(() => {
  //   fetch('${process.env.REACT_APP_URL}/api/incidents/weekly-reports')
  //     .then(res => res.json())
  //     .then(data => {
  //       setReportsThisWeek(data.weekly_reports);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching weekly resolved reports:', error);
  //     });
  // }, []);


  
  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="dashboard-greeting">
              <h2 className="dashboard-title">Dashboard Overview</h2>
              <span className="dashboard-welcome">Welcome Back, Admin!</span>
          </div>
          <section className="dashboard-header">
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-label">Total Registered Users</span>
                <span className="stat-value">{userCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Ongoing Emergency Reports</span>
                <span className="stat-value stat-danger">21</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Residents Awaiting Approval</span>
                <span className="stat-value stat-warning">{pendingResidents}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Reports Resolved this Week</span>
                <span className="stat-value stat-success">12</span>
              </div>
            </div>
          </section>

          <section className="dashboard-lower-section">
            <div className="lower-grid">
              <div className="incident-heatmap">
                <h3>Incident Heat Map</h3>
                <div className="heatmap-placeholder">Map Placeholder</div>
              </div>
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <ul className="activity-list">
                  <li>ADM001 deleted an account <span className="activity-time">3 mins ago</span></li>
                  <li>ADM001 created an account <span className="activity-time">3 mins ago</span></li>
                  <li>New Report #102 <span className="activity-time">3 mins ago</span></li>
                </ul>
              </div>
              <div className="latest-emergency-report">
                <h3>Latest Emergency Report</h3>
                <ul className="emergency-report-list">
                  <li>
                    <span className="report-status assigned">Assigned</span>
                    <span className="report-title">Car Accident</span>
                    <span className="report-time">5 mins ago</span>
                    <div className="report-details">
                      789 Duhat, Bocaue - Road Rage | McArthur Highway<br />
                      Responder: <span className="responder-name">Lei Anysson Marquez</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
