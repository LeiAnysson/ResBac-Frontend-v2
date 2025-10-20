import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Resident/ResidentProfile.css';
import '../Components/Shared/SharedComponents.css';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';
import ResponderHeader from '../Components/NewComponentsHeaderWebApp/ResponderHeader';
import ResponderBottomNav from '../Components/NewComponentsBottomNavWebApp/ResponderBottomNav';
import { AuthContext } from '../context/AuthContext';

const DEFAULT_PROFILE = "https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg";

const ResponderProfile = () => {
	const navigate = useNavigate();
	const { logout } = useContext(AuthContext);

	const [responder, setResponder] = useState(null);
	const [profileImage, setProfileImage] = useState('');
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const storedUser = localStorage.getItem('user');
	const id = storedUser ? JSON.parse(storedUser).id : null;

	useEffect(() => {
		if (!id) return;

		fetch(`${process.env.REACT_APP_URL}/api/responders/${id}`, {
		headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
		})
		.then((res) => res.json())
		.then((data) => {
			setResponder(data);
			setProfileImage(data.profile_image_url || '');
		})
		.catch((err) => console.error('Failed to fetch responder profile:', err));
	}, [id]);

	const profileImageUrl = profileImage
		? profileImage.startsWith('http') || profileImage.startsWith('data:') || profileImage.startsWith('blob:')
		? profileImage
		: `${process.env.REACT_APP_URL}${profileImage}`
		: DEFAULT_PROFILE;

	const handleLogout = async () => {
		if (!window.confirm('Are you sure you want to log out?')) return;

		const token = localStorage.getItem('token');
		try {
		const res = await fetch(`${process.env.REACT_APP_URL}/api/logout`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		});
		if (!res.ok) console.warn('Backend logout failed, clearing locally anyway');
		} catch (err) {
		console.error('Logout request failed:', err);
		}

		logout();
	};

	const handlePasswordUpdate = async () => {
		if (newPassword !== confirmPassword) {
		alert('Passwords do not match');
		return;
		}

		try {
		const token = localStorage.getItem('token');
		const res = await fetch(`${process.env.REACT_APP_URL}/api/residents/change-password`, {
			method: 'POST',
			headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			},
			body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword,
			new_password_confirmation: confirmPassword,
			}),
		});

		const data = await res.json();
		if (res.ok) {
			alert(data.message || 'Password updated successfully!');
			setShowPasswordForm(false);
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		} else {
			alert(data.message || 'Failed to update password');
		}
		} catch (err) {
		console.error('Error updating password:', err);
		alert('Something went wrong');
		}
	};

	return (
		<div className="profile-container">
		<ResponderHeader />
		<div className="title-container">
			<MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)} />
			<h1>Profile</h1>
		</div>

		<div className="top-container">
			<div className="profile-avatar">
			<img
				src={profileImageUrl}
				alt={`${responder?.first_name || ''} ${responder?.last_name || ''}`}
				className="profile-img"
				onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
			/>
			</div>
			<p className="profile-name">
				{responder ? `${responder.first_name} ${responder.last_name}` : 'Loading...'}
			</p>
			<button
				className="edit-profile-button"
				onClick={() => navigate('/responder/edit-profile')}
				>
				<span className="edit-profile-text">Edit Profile</span>
			</button>
		</div>

		<div className="info-container">
			<div className="info-header">
			<span className="info-header-icon">i</span>
			<span className="info-header-text"> Basic Information</span>
			</div>

			{!showPasswordForm ? (
			<div className="info-content">
				<div className="info-row">
				<span className="info-label">Full Name:</span>
				<span className="info-value">
					{responder ? `${responder.first_name} ${responder.last_name}` : '-'}
				</span>
				</div>
				<div className="info-row">
				<span className="info-label">Role:</span>
				<span className="info-value">{responder?.role_name || '-'}</span>
				</div>
				<div className="info-row">
				<span className="info-label">Team:</span>
				<span className="info-value">Team {responder?.team || '-'}</span>
				</div>
				<div className="info-row">
				<span className="info-label">Address:</span>
				<span className="info-value">{responder?.address || '-'}</span>
				</div>
				<div className="info-row">
				<span className="info-label">Email:</span>
				<span className="info-value">{responder?.email || '-'}</span>
				</div>
				<div className="info-row">
				<span className="info-label">Phone:</span>
				<span className="info-value">{responder?.contact_num || '-'}</span>
				</div>
			</div>
			) : (
			<div className="password-form-container">
				<h2 className="reset-password-title">Reset Password</h2>
				<label className="label">Current Password:</label>
				<input
				type="password"
				className="input"
				value={currentPassword}
				onChange={(e) => setCurrentPassword(e.target.value)}
				placeholder="Current Password"
				/>
				<label className="label">New Password:</label>
				<input
				type="password"
				className="input"
				value={newPassword}
				onChange={(e) => setNewPassword(e.target.value)}
				placeholder="New Password"
				/>
				<label className="label">Confirm Password:</label>
				<input
				type="password"
				className="input"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				placeholder="Confirm Password"
				/>
				<button className="save-btn" onClick={handlePasswordUpdate}>
				<span className="save-btn-text">Confirm</span>
				</button>
				<button className="cancel-btn" onClick={() => setShowPasswordForm(false)}>
				<span className="cancel-btn-text">Cancel</span>
				</button>
			</div>
			)}
		</div>

		{!showPasswordForm && (
			<div className="action-buttons">
			<button className="change-password-btn" onClick={() => setShowPasswordForm(true)}>
				<span className="change-password-text">Change Password</span>
			</button>
			<button className="logout-btn" onClick={handleLogout}>
				<span className="logout-text">Log out</span>
			</button>
			</div>
		)}

		<ResponderBottomNav />
		</div>
	);
};

export default ResponderProfile;
