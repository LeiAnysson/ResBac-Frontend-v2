import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './LoginPage.css';
import Spinner from '../utils/Spinner';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !passwordConfirm) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirm })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner message="Resetting password..." />;

  return (
    <div className="login-root">
      <div className="login-left">
        <Link to="/">
          <img src="/LogoB.png" alt="Bocaue Rescue Logo" className="login-logo" />
        </Link>
        <div className="login-org-name">BOCAUE RESCUE EMS</div>
        <div className="login-org-desc">
          MUNICIPAL EMERGENCY ASSISTANCE AND<br />INCIDENT RESPONSE
        </div>
      </div>

      <div
        className="login-right"
        style={{ background: "url('/municipal-hall.jpg') center center / cover no-repeat" }}
      >
        <div className="login-form-container">
          <h2 className="login-title">Reset Your Password</h2>
          <p>Enter your new password below.</p>

          <form onSubmit={handleReset}>
            <div className="reset-input-group">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-input"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="login-input"
              />
            </div>

            {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
            {message && <div style={{ color: 'green', marginTop: '0.5rem' }}>{message}</div>}

            <div className="rp-modal-buttons" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="login-btn"
                style={{ background: '#ccc', color: '#000' }}
              >
                Cancel
              </button>
              <button type="submit" className="login-btn">
                Reset Password
              </button>
            </div>

            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
