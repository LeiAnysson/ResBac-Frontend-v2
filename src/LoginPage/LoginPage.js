import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      // Basic validation
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          if (data.user.role_id === 1) {
            navigate('/admin');
          } else if (data.user.role_id === 2) {
            navigate('/dispatcher');
          } else {
            navigate('/resident'); 
          }
        } else {
          setError(data.message || 'Invalid login credentials');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('Network error. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleForgotPassword = () => {
      // For now, just show an alert
      alert('Please contact your administrator to reset your password.');
    };

    const handleInputChange = (field, value) => {
      setError(''); // Clear error when user starts typing
      if (field === 'email') {
        setEmail(value);
      } else if (field === 'password') {
        setPassword(value);
      }
    };

  return (
    <div className="login-root">
      {/* Left Section */}
      <div className="login-left">
        <img 
          src="/bocaue-logo.png" 
          alt="Bocaue Rescue Logo" 
          className="login-logo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="login-org-name">BOCAUE RESCUE EMS</div>
        <div className="login-org-desc">
          MUNICIPAL EMERGENCY ASSISTANCE AND<br />INCIDENT RESPONSE
        </div>
      </div>
      
      {/* Right Section */}
      <div 
        className="login-right" 
        style={{ 
          background: isMobile 
            ? "linear-gradient(135deg, rgba(4, 47, 127, 0.9) 0%, rgba(35, 64, 142, 0.8) 100%)"
            : "url('/municipal-hall.jpg') center center / cover no-repeat"
        }}
      >
        <div className="login-form-container">
          <h2 className="login-title">Welcome</h2>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => handleInputChange('email', e.target.value)}
              className="login-input"
              autoComplete="email"
              autoFocus={!isMobile}
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => handleInputChange('password', e.target.value)}
              className="login-input"
              autoComplete="current-password"
              disabled={isLoading}
            />
            {error && (
              <div style={{ 
                color: '#e74c3c', 
                marginBottom: '1em', 
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '0.5rem',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(231, 76, 60, 0.2)'
              }}>
                {error}
              </div>
            )}
            <div 
              className="login-forgot" 
              onClick={handleForgotPassword}
              style={{ cursor: 'pointer' }}
            >
              Forgot password?
            </div>
            <button 
              className="login-btn" 
              type="submit"
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="login-signup-row">
            <span>Don't have an account yet?</span>
            <a href="/signin" className="login-register-link">Register</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;