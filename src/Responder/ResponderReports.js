import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderReports.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import BackButton from '../assets/backbutton.png';
import { apiFetch } from '../utils/apiFetch';

const ResponderReports = () => {
  	const navigate = useNavigate();
  	const [reports, setReports] = useState([]);
	const [assignedIncidents, setAssignedIncidents] = useState([]);

	useEffect(() => {
		const fetchReports = async () => {
		try {
			const data = await apiFetch(`${process.env.REACT_APP_URL}/api/responder/reports`);

			const reportsArray = Array.isArray(data) ? data : Object.values(data);

			setReports(reportsArray);
			setAssignedIncidents(reportsArray);
		} catch (err) {
			console.error('Failed to load reports:', err);
		}
		};

		fetchReports();
	}, []);

	useEffect(() => {
		const handler = (e) => {
			setReports(prev => [e.detail, ...prev]);
			setAssignedIncidents(prev => [e.detail, ...prev]);
			
			setTimeout(() => {
				setAssignedIncidents(prev => prev.filter(i => i.id !== e.detail.id));
			}, 5000);
		};

		window.addEventListener("incidentAssigned", handler);

		return () => window.removeEventListener("incidentAssigned", handler);
	}, []);



	return (
		<div className="responder-reports">
			<ResponderHeader />

			<div className="title-container">
				<button className="back-button" onClick={() => navigate(-1)}>
				<img className="back-button-icon" src={BackButton} alt="Back" />
				</button>
				<h1>Assigned Reports</h1>
			</div>

			<div className="responder-reports-card">
				{reports.length > 0 ? (
				<div className="responder-reports-list">
					{reports.map((report) => (
					<div
						key={report.id}
						className="report-row"
						onClick={() => navigate(`/responder/reports/view-report/${report.id}`)}
						style={{ cursor: 'pointer' }}
					>
						<div className="report-info">
						<p className="a-report-datetime">{report.date}</p>
						<p className="a-report-incident">Incident Type: <span className="a-incident-type">{report.type}</span></p>
						<p className="a-report-location">{report.landmark || (report.latitude && report.longitude ? `${report.latitude}, ${report.longitude}` : "Unknown Location")}</p>
						</div>
						{report.status && (
							<span className={`a-status-label status-${report.status.toLowerCase().replace(/\s+/g, '-')}`}>
								{report.status}
							</span>
						)}
					</div>
					))}
				</div>
				) : (
				<p className="empty-text reports-empty">No assigned reports</p>
				)}
			</div>

			<ResponderBottomNav />
		</div>
	);
};

export default ResponderReports;
