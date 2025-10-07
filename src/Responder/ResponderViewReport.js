import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResponderViewReport.css';
import '../Components/Shared/SharedComponents.css';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import BackButton from '../assets/backbutton.png';
import { apiFetch } from '../utils/apiFetch';
import Ably from 'ably';

let hereMapsLoaded = false;

const ResponderViewReport = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const ablyRef = useRef(null);
	const mapRef = useRef(null);
	const [report, setReport] = useState(null);
	const [status, setStatus] = useState('En Route');
	const [shareLocation, setShareLocation] = useState(true);
	const [showBackupModal, setShowBackupModal] = useState(false);
	const [backupType, setBackupType] = useState('');
	const [backupReason, setBackupReason] = useState('');
	const [showRequestSent, setShowRequestSent] = useState(false);
	const [responderLocation, setResponderLocation] = useState(null);

	useEffect(() => {
		const fetchReport = async () => {
		try {
			const data = await apiFetch(`${process.env.REACT_APP_URL}/api/responder/report/${id}`);
			if (data.success) {
			setReport(data.report);
			setStatus(data.report.status);
			}
		} catch (err) {
			console.error('Failed to load report:', err);
		}
		};
		fetchReport();
	}, [id]);

	useEffect(() => {
		if (!shareLocation || !report?.assignedTeam) return;

		if (!ablyRef.current) {
		ablyRef.current = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });
		}
		const channel = ablyRef.current.channels.get('responder-location');
		let lastPublished = 0;

		const watchId = navigator.geolocation.watchPosition(
		(position) => {
			const now = Date.now();
			if (now - lastPublished < 2000) return; 

			const newLocation = {
			lat: position.coords.latitude,
			lng: position.coords.longitude,
			};
			setResponderLocation(newLocation);

			channel.publish('update', {
			teamId: report.assignedTeam,
			lat: newLocation.lat,
			lng: newLocation.lng,
			timestamp: new Date().toISOString(),
			});

			lastPublished = now;
		},
		(err) => console.error('Failed to get location:', err),
		{ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, [shareLocation, report?.assignedTeam]);

	useEffect(() => {
		return () => {
		if (ablyRef.current) ablyRef.current.close();
		};
	}, []);

	useEffect(() => {
		if (!report?.latitude || !report?.longitude) return;

		const loadHereMaps = () => {
			if (window.H) return Promise.resolve();
			if (hereMapsLoaded) return Promise.resolve();

			const scripts = [
			'https://js.api.here.com/v3/3.1/mapsjs-core.js',
			'https://js.api.here.com/v3/3.1/mapsjs-service.js',
			'https://js.api.here.com/v3/3.1/mapsjs-ui.js',
			'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js',
			];

			hereMapsLoaded = true;

			return Promise.all(
			scripts.map(
				(src) =>
				new Promise((resolve, reject) => {
					const script = document.createElement('script');
					script.src = src;
					script.onload = resolve;
					script.onerror = reject;
					document.body.appendChild(script);
				})
			)
			);
		};

		let map, responderMarker, incidentMarker, routeLine, handleResize;

		loadHereMaps()
			.then(() => {
			if (!mapRef.current || mapRef.current.hasChildNodes()) return;

			const platform = new window.H.service.Platform({
				apikey: process.env.REACT_APP_HERE_API_KEY,
			});
			const defaultLayers = platform.createDefaultLayers();

			map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
				center: { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) },
				zoom: 14,
				pixelRatio: window.devicePixelRatio || 1,
			});

			handleResize = () => map.getViewPort().resize();
			window.addEventListener('resize', handleResize);

			new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
			window.H.ui.UI.createDefault(map, defaultLayers);

			incidentMarker = new window.H.map.Marker({
				lat: parseFloat(report.latitude),
				lng: parseFloat(report.longitude),
			});
			map.addObject(incidentMarker);

			const carIcon = new window.H.map.Icon('https://cdn-icons-png.flaticon.com/512/8023/8023798.png', { size: { w: 32, h: 32 } });

			responderMarker = new window.H.map.Marker(
				responderLocation || { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) },
				{ icon: carIcon }
			);
			map.addObject(responderMarker);

			if (!ablyRef.current) {
				ablyRef.current = new Ably.Realtime({ key: process.env.REACT_APP_ABLY_KEY });
			}
			const channel = ablyRef.current.channels.get('responder-location');

			const updateRoute = async (start) => {
				if (!start) return;

				try {
				const url = `https://router.hereapi.com/v8/routes?apikey=${process.env.REACT_APP_HERE_API_KEY}&transportMode=car&origin=${start.lat},${start.lng}&destination=${report.latitude},${report.longitude}&return=polyline,summary`;
				const res = await fetch(url);
				const data = await res.json();

				if (data.routes?.length) {
					const encodedPolyline = data.routes[0].sections[0].polyline;
					const lineString = window.H.geo.LineString.fromFlexiblePolyline(encodedPolyline);

					if (routeLine) map.removeObject(routeLine);

					routeLine = new window.H.map.Polyline(lineString, {
					style: { strokeColor: 'blue', lineWidth: 4 },
					});
					map.addObject(routeLine);

					map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
				}
				} catch (err) {
				console.error('Routing error (v8):', err);
				}
			};

			const watchId = navigator.geolocation.watchPosition(
				(position) => {
				const newLocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				setResponderLocation(newLocation);
				responderMarker.setGeometry(newLocation);

				channel.publish('update', {
					teamId: report.assignedTeam,
					lat: newLocation.lat,
					lng: newLocation.lng,
					timestamp: new Date().toISOString(),
				});

				updateRoute(newLocation);
				},
				(err) => console.error('Failed to get location:', err),
				{ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
			);

			return () => {
				navigator.geolocation.clearWatch(watchId);
				if (map) map.dispose();
				if (handleResize) window.removeEventListener('resize', handleResize);
			};
			})
			.catch((err) => console.error('Failed to load HERE Maps scripts:', err));
		}, [report]);


	const handleUpdateStatus = async () => {
		try {
		const res = await apiFetch(
			`${process.env.REACT_APP_URL}/api/responder/report/${id}/update-status`,
			{
			method: 'POST',
			body: JSON.stringify({ status }),
			}
		);
		if (res.success) {
			alert('Status updated successfully!');
			setReport((prev) => ({ ...prev, status: res.status }));
		}
		} catch (err) {
		console.error('Failed to update status:', err);
		alert('Failed to update status');
		}
	};

	const handleRequestBackup = async () => {
		try {
		const res = await apiFetch(
			`${process.env.REACT_APP_URL}/api/responder/report/${id}/request-backup`,
			{
			method: 'POST',
			body: JSON.stringify({ backup_type: backupType, reason: backupReason }),
			}
		);
		if (res.success) {
			setShowBackupModal(false);
			setShowRequestSent(true);
		}
		} catch (err) {
		console.error('Failed to request backup:', err);
		alert('Failed to send backup request');
		}
	};

	return (
		<div className="responder-view-report">
		<ResponderHeader />

		<div className='title-container'>
			<button className="back-button" onClick={() => navigate(-1)}>
			<img className='back-button-icon' src={BackButton}/>
			</button>
			<h1>Report Details</h1>
		</div>

		<div className="map-section">
			<div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '8px' }} />
		</div>

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

			<div className="details-placeholder" aria-hidden="true" />

			<div className="details-body">
			<p className="report-name">{report?.reporterName || ''}</p>
			<p className="report-address">{report?.address || ''}</p>
			<p className="report-incident">Incident Type : <span className="incident-type">{report?.type || ''}</span></p>
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
			<button className="btn btn-primary" onClick={handleUpdateStatus}>Update Status</button>
			</div>
		</div>

		{showBackupModal && (
			<div className="modal-backdrop" onClick={() => setShowBackupModal(false)}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<h3 className="modal-title">Backup Request</h3>
				<div className="modal-content">
				<label className="modal-label">Select Backup Type</label>
				<div className="modal-select-wrap">
					<select className="modal-select" value={backupType} onChange={(e) => setBackupType(e.target.value)}>
					<option value="" hidden>Select</option>
					<option value="Medical Service">Emergency Medical Service</option>
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
				<button className="modal-request-btn" onClick={handleRequestBackup}>Request</button>
				</div>
			</div>
			</div>
		)}

		{showRequestSent && (
			<div className="modal-backdrop" onClick={() => setShowRequestSent(false)}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="success-icon" aria-hidden="true" />
				<p className="success-text">Your request has been sent,<br/>Please wait for backup.</p>
				<div className="modal-actions">
				<button className="modal-request-btn" onClick={() => setShowRequestSent(false)}>Proceed</button>
				</div>
			</div>
			</div>
		)}

		<ResponderBottomNav />
		</div>
	);
};

export default ResponderViewReport;
