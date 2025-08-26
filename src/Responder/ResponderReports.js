import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResponderReports.css';
import '../Components/Shared/SharedComponents.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import BackButton from '../assets/backbutton.png';

const ResponderReports = () => {
	const navigate = useNavigate();
	// Backend-ready: dynamic list, but no fetching here
	const [reports] = useState([]);

	const getStatusClass = (status) => {
		if (!status) return '';
		const normalized = String(status).toLowerCase();
		if (normalized.includes('cancel')) return 'status-cancelled';
		if (normalized.includes('resolve')) return 'status-resolved';
		if (normalized.includes('route') || normalized.includes('en route')) return 'status-enroute';
		return 'status-pending';
	};

	const prettyStatus = (status) => {
		if (!status) return '';
		const s = String(status).toLowerCase();
		if (s.includes('cancel')) return 'Cancelled';
		if (s.includes('resolve')) return 'Resolved';
		if (s.includes('route') || s.includes('en route')) return 'En Route';
		return 'Pending';
	};

	return (
		<div className="responder-reports">
			{/* Header */}
			<ResponderHeader />

			{/* Title row */}
			<div className="title-container reports-title">
				<button className="back-button" onClick={() => navigate(-1)}>
					<img className="back-button-icon" src={BackButton} alt="Back" />
				</button>
				<h1>Assigned Reports</h1>
			</div>

			{/* Reports card */}
			<div className="reports-card">
				{reports.length > 0 ? (
					<div className="reports-list">
						{reports.map((report) => (
							<div key={report.id} className="report-row">
								<div className="report-info">
									<p className="report-datetime">{report.dateTime}</p>
									<p className="report-incident">Incident Type: <span className="incident-type">{report.incidentType}</span></p>
									<p className="report-location">{report.location}</p>
								</div>
								{report.status ? (
									<span className={`status-label ${getStatusClass(report.status)}`}>{prettyStatus(report.status)}</span>
								) : null}
							</div>
						))}
					</div>
				) : (
					<p className="empty-text reports-empty">No assigned reports</p>
				)}
			</div>

			{/* Bottom Navigation */}
			<ResponderBottomNav />
		</div>
	);
};

export default ResponderReports;
