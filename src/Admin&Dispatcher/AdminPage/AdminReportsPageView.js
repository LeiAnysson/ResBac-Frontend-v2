import { useParams } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminReportsPage.css"; 
import React, { useState, useEffect } from 'react';
import ReportDetailsCard from "./Functionalities/ReportDetailsCard";
import { apiFetch } from '../../utils/apiFetch';

const AdminReportPageView = ({ reportFromCall }) => {
  const { id } = useParams();
  const [report, setReport] = useState(reportFromCall || null);
  const [loading, setLoading] = useState(!reportFromCall);

  useEffect(() => {
    if (!reportFromCall && id) {
      const getReport = async () => {
        try {
          const data = await apiFetch(`http://127.0.0.1:8000/api/incidents/${id}`);
          setReport(data);
        } catch (err) {
          console.error("Failed to fetch report: ", err);
        } finally {
          setLoading(false);
        }
      };
      getReport();
    }
  }, [id, reportFromCall]);

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h2>Loading report...</h2>
          </main>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h2>Report Not Found</h2>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h1 className="report-title">Report</h1>
          <div className="emergency-report-wrapper">
            <span className="emergency-report-badge">
              <span role="img" aria-label="alert">🚨</span> Emergency Incident and Disaster Reports
            </span>

            <ReportDetailsCard report={report} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReportPageView;
