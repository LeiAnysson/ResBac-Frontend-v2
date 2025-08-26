import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResponderViewReport.css';
import '../Components/Shared/SharedComponents.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import BackButton from '../assets/backbutton.png';

const ResponderViewReport = () => {
	const navigate = useNavigate();
	const { id } = useParams();

	// Backend-ready placeholders; no fetching yet
	const [report] = useState(null);
	const [status, setStatus] = useState('En Route');
	const [shareLocation, setShareLocation] = useState(true);
	const [showBackupModal, setShowBackupModal] = useState(false);
	const [backupType, setBackupType] = useState('');
	const [backupReason, setBackupReason] = useState('');
	const [showRequestSent, setShowRequestSent] = useState(false);

	return (
		<div className="responder-view-report">
			{/* Header */}
			<ResponderHeader />

			{/* Title row aligned with other screens */}
			<div className='title-container'>
				<button className="back-button" onClick={() => navigate(-1)}>
					<img className='back-button-icon' src={BackButton}/>
				</button>
				<h1>Report Details</h1>
			</div>

			{/* Map Section */}
			<div className="map-section">
				<div className="map-placeholder" />
			</div>

			{/* Details Card */}
			<div className="details-card">
				<div className="details-row top-row">
					<p className="report-datetime">{report?.dateTime || ''}</p>
					<div className="toggle-wrap">
						<label className="switch">
							<input type="checkbox" checked={shareLocation} onChange={(e) => setShareLocation(e.target.checked)} />
							<span className="slider" />
						</label>
						<span className="toggle-label">Location</span>
					</div>
				</div>

				{/* Hidden placeholder to reserve space for dynamic report details */}
				<div className="details-placeholder" aria-hidden="true" />

				<div className="details-body">
					<p className="report-name">{report?.reporterName || ''}</p>
					<p className="report-address">{report?.address || ''}</p>
					<p className="report-incident">Incident Type : <span className="incident-type">{report?.incidentType || ''}</span></p>
				</div>

				<div className="form-group">
					<label className="field-label">Current Report Status:</label>
					<div className="select-wrap">
						<select className="status-select" value={status} onChange={(e) => setStatus(e.target.value)}>
							<option>En Route</option>
							<option>On Scene</option>
							<option>Resolved</option>
						</select>
						<span className="chevron">▾</span>
					</div>
				</div>

				<div className="actions">
					<button className="btn btn-backup" onClick={() => setShowBackupModal(true)}>Request Backup</button>
					<button className="btn btn-primary">Update Status</button>
				</div>
			</div>

			{/* Backup Request Modal */}
			{showBackupModal && (
				<div className="modal-backdrop" onClick={() => setShowBackupModal(false)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<h3 className="modal-title">Backup Request</h3>
						<div className="modal-content">
							<label className="modal-label">Select Backup Type</label>
							<div className="modal-select-wrap">
								<select className="modal-select" value={backupType} onChange={(e) => setBackupType(e.target.value)}>
									<option value="" hidden>Select</option>
									<option value="Medical Sevice"> Emergency Medical Service</option>
									<option value="LGU">LGU</option>
									<option value="LGU">LGU</option>
								</select>
								<span className="modal-chevron">▾</span>
							</div>

							<label className="modal-label">Reason for Backup:</label>
							<div className="modal-select-wrap">
								<select className="modal-select" value={backupReason} onChange={(e) => setBackupReason(e.target.value)}>
									<option value="" hidden>Select</option>
									<option value="overwhelmed">Insufficient manpower</option>
									<option value="injury">Responder injury or fatigue</option>
									<option value="escalation">Large-scale incident</option>
									<option value="others">Others</option>
								</select>
								<span className="modal-chevron">▾</span>
							</div>
						</div>
						<div className="modal-actions">
							<button className="modal-request-btn" onClick={() => { setShowBackupModal(false); setShowRequestSent(true); }}>Request</button>
						</div>
					</div>
				</div>
			)}

			{/* Request Sent Modal */}
			{showRequestSent && (
				<div className="modal-backdrop" onClick={() => setShowRequestSent(false)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="success-icon" aria-hidden="true" />
						<p className="success-text">Your request has been sent,
						<br/>Please wait for backup.</p>
						<div className="modal-actions">
							<button className="modal-request-btn" onClick={() => setShowRequestSent(false)}>Proceed</button>
						</div>
					</div>
				</div>
			)}

			{/* Bottom Navigation */}
			<ResponderBottomNav />
		</div>
	);
};

export default ResponderViewReport;
