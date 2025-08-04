import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignInPage.css';

const SignInPage = () => {
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

  const handleSignIn = async (e) => {
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
      // Add authentication logic here if needed
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/admin'); // Redirect to admin dashboard after sign in
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
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
    <div 
      className="signin-root" 
      style={{ 
        background: isMobile 
          ? "linear-gradient(135deg, rgba(4, 47, 127, 0.9) 0%, rgba(35, 64, 142, 0.8) 100%)"
          : "url('/municipal-hall.jpg') center center / cover no-repeat"
      }}
    >
      <div className="signin-bg" />
      <div className="signin-form-container">
        <h2 className="signin-title">Sign In</h2>
        <form className="signin-form" onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => handleInputChange('email', e.target.value)}
            className="signin-input"
            autoComplete="email"
            autoFocus={!isMobile}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => handleInputChange('password', e.target.value)}
            className="signin-input"
            autoComplete="current-password"
            disabled={isLoading}
            required
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
          <button 
            className="signin-btn" 
            type="submit"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>


          <div className="login-signup-row">
            <span>Already have an account?</span>
            <a href="/login" className="login-register-link">Login</a>
          </div>
        </div>
      </div>
  );
};

export default SignInPage;
