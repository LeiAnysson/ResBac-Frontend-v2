import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentHistory.css';
import '../Components/Shared/SharedComponents.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import { apiFetch } from '../utils/apiFetch';
import { PiSirenFill } from "react-icons/pi";
import { MdOutlineArrowCircleLeft } from 'react-icons/md';

const ResidentHistory = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/resident/reports`);
        setReports(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const statusClass = (status = '') =>
    status.toLowerCase().replace(/\s+/g, '-'); 

  return (
    <div className="history-container">
      <Header />
      <div className='title-container' style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)}/>
          <h1 style={{ fontSize: '22px' }}>History</h1>
        </div>
        <button className="report-button" onClick={() => navigate('/resident/report')}>
          <span className="report-button-text">Report <PiSirenFill style={{ position: "relative", left: "5px", top: "2px" }}/>
          </span>
        </button>
      </div>

      <div className="container">
        {loading ? (
          <p className="empty-text">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="empty-text">No reports available.</p>
        ) : (
          <div className="reports-list">
            {reports.map((item, idx) => (
              <div
                key={item.id}
                className={`report-card ${idx !== reports.length - 1 ? 'report-card-border' : ''}`}
              >
                <table className="report-table" role="presentation">
                  <tbody>
                    <tr className="row-date">
                      <td className="date-cell" colSpan="2">{item.date}</td>
                    </tr>

                    <tr className="row-type-status">
                      <td className="type-cell">
                        <span style={{ color: '#e53935' }}>Incident Type: {item.type}</span>
                      </td>
                      <td className="status-cell" style={{ textAlign: 'right' }}>
                        <span className={`a-status-label status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>

                    <tr className="row-landmark">
                      <td className="landmark-cell" colSpan="2">
                        {item.landmark || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ResidentHistory;
