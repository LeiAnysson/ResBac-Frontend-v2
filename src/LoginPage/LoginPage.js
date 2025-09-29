import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { encryptPasswordData } from '../utils/crypto';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();  

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');

      const { encryptedPassword, secretKeyName } = encryptPasswordData(password);

      const blendedLogin = `${email}|${secretKeyName}${encryptedPassword}`;

      try {
        const response = await fetch(`${process.env.REACT_APP_URL}/api/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            auth: blendedLogin 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          if (data.user.role_id === 4 && data.user.residency_status === 'pending') {
            alert('Your residency is still pending approval.');
            return; 
          }

          if (data.user.role_id === 1) {
            navigate('/admin');
          } else if (data.user.role_id === 2) {
            navigate('/dispatcher');
          } else if (data.user.role_id === 4) {
            navigate('/resident'); 
          } else if (data.user.role_id === 3) {
            navigate('/responder');
          }else {
            navigate('/');
          }
        } else {
          setError(data.message || 'Invalid login');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('Something went wrong');
      }
    };

  return (
    <div className="login-root">
      {/* Left Section */}
      <div className="login-left">
        <img src="/bocaue-logo.png" alt="Bocaue Rescue Logo" className="login-logo" />
        <div className="login-org-name">BOCAUE RESCUE EMS</div>
        <div className="login-org-desc">
          MUNICIPAL EMERGENCY ASSISTANCE AND<br />INCIDENT RESPONSE
        </div>
      </div>
      {/* Right Section */}
      <div className="login-right" style={{ background: "url('/municipal-hall.jpg') center center / cover no-repeat" }}>
        <div className="login-form-container">
          <h2 className="login-title">Welcome</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
            />
            {error && <div style={{ color: 'red', marginBottom: '1em' }}>{error}</div>}
            <div className="login-forgot">Forgot password?</div>
            <button className="login-btn" type="submit">Login</button>
          </form>
          <div className="login-signup-row">
            <span>Don't have an account yet?</span>
            <a href="/signup" className="login-signin-link">Register</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;