import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminReportsPage.css";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { reverseGeocode } from '../../utils/hereApi';

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });

  const fetchReports = async (page = 1) => {
    try {
      const data = await apiFetch(`${process.env.REACT_APP_URL}/api/incidents?page=${page}`);

      const processedReports = await Promise.all(
        data.data.map(async (report) => {
          let location = '—';
          if (report.latitude && report.longitude) {
            const address = await reverseGeocode(report.latitude, report.longitude);
            location = address || 'Unknown location';
          }

          const landmark = report.landmark || '—';

          return { ...report, location, landmark };
        })
      );

      setReports(processedReports);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
      });
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 4: return '#fd3d40ff'; 
      case 3: return '#f96567ff';
      case 2: return '#fa8789ff';
      case 1: return '#fca8a9ff';
      default: return '#ff6666'; 
    }
  };

  const getBasePath = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role_id === 2
      ? "/dispatcher/emergency-reports"
      : "/admin/emergency-reports";
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchReports(newPage);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h1 className="emergency-reports-title">Emergency Reports Overview</h1>
          <div className="emergency-reports-card">
            <div className="emergency-reports-controls">
              <input className="search-input search-input-filled" placeholder="Search..." />
              <button className="search-btn search-btn-primary">
                <span className="search-icon">🔍</span> Search
              </button>
            </div>
            <table className="emergency-reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>

                    <td>
                      <span
                        className="type-badge"
                        style={{ backgroundColor: getPriorityColor(report.incident_type?.priority?.priority_level) }}
                      >
                        {report.incident_type?.name || 'Unknown'}
                      </span>
                    </td>

                    <td>{report.location || '—'}</td>

                    <td>{new Date(report.reported_at).toLocaleString()}</td>

                    <td>
                      <span className={`status-badge status-${report.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {report.status}
                      </span>
                    </td>

                    <td>
                      <button className="view-btn"
                        onClick={() => navigate(`${getBasePath()}/${report.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="emergency-reports-pagination">
                <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
                  &lt; Prev
                </button>
                <span>
                  Page <b>{pagination.current_page}</b> of {pagination.last_page}
                </span>
                <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
                  Next &gt;
                </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReportsPage;
