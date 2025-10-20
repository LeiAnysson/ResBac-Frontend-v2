import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
import { encryptPasswordData } from '../utils/crypto';
import { AuthContext } from "../context/AuthContext";
import Spinner from '../utils/Spinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 
  const { login, loading } = useContext(AuthContext);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');


    useEffect(() => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (token && user) {
        if (user.role_id === 1) navigate("/admin");
        else if (user.role_id === 2) navigate("/dispatcher");
        else if (user.role_id === 3) navigate("/responder");
        else if (user.role_id === 4) navigate("/resident/report");
        else navigate("/");
      }
    }, [navigate]);

    if(loading) return <Spinner message="Loading..." />;

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');

      const savedUser = JSON.parse(localStorage.getItem("user"));
      const savedToken = localStorage.getItem("token");

      if (savedUser && savedToken && savedUser.email === email) {
        try {
          const verifyRes = await fetch(`${process.env.REACT_APP_URL}/api/me`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              Accept: "application/json",
            },
          });

          if (verifyRes.ok) {
            console.log("Reusing existing session...");

            if (savedUser.role_id === 1) navigate("/admin");
            else if (savedUser.role_id === 2) navigate("/dispatcher");
            else if (savedUser.role_id === 3) navigate("/responder");
            else if (savedUser.role_id === 4) navigate("/resident/report");
            return; 
          } else {
            console.log("Old token expired, doing fresh login...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.log("Error verifying token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

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
          localStorage.clear();
          login(data.user, data.token);

          if (data.user.role_id === 4 && data.user.residency_status === 'pending') {
            alert('Your residency is still pending approval.');
            return; 
          }

          if (data.user.role_id === 1) navigate('/admin');
          else if (data.user.role_id === 2) navigate('/dispatcher');
          else if (data.user.role_id === 3) navigate('/responder');
          else if (data.user.role_id === 4) navigate('/resident/report');
          else navigate('/');
        } else {
          setError(data.message || 'Invalid login');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('Something went wrong');
      }
    };
  
  const handleSendResetEmail = async () => {
    setResetError('');
    setResetMessage('');

    if (!resetEmail) {
      setResetError('Please enter your email');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage('Password reset link sent! Check your email.');
      } else {
        setResetError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setResetError('Something went wrong');
    }
  };

  return (
    <div className="login-root">
      {/* Left Section */}
      <div className="login-left">
        <Link to="/">
          <img src="/LogoB.png" alt="Bocaue Rescue Logo" className="login-logo" />
        </Link>
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
            <div className="login-forgot" onClick={() => setShowResetModal(true)} style={{ cursor: 'pointer', color: '#23408e' }}>
              Forgot password?
            </div>
            <button className="login-btn" type="submit">Login</button>
          </form>
          <div className="login-signup-row">
            <span>Don't have an account yet?</span>
            <a href="/signup" className="login-signin-link">Register</a>
          </div>

          {showResetModal && (
          <div className="rp-modal-overlay">
            <div className="rp-modal-content">
              <h3>Reset Password</h3>
              <p>Enter your email to receive a password reset link.</p>
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="login-input"
              />
              {resetError && <div style={{ color: 'red' }}>{resetError}</div>}
              {resetMessage && <div style={{ color: 'green' }}>{resetMessage}</div>}
              <div className="rp-modal-buttons">
                <button onClick={() => setShowResetModal(false)} className="login-btn" style={{ background: '#ccc', color: '#000' }}>Cancel</button>
                <button onClick={handleSendResetEmail} className="login-btn">Send Link</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;