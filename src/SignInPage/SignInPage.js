import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignInPage.css';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    // Add authentication logic here if needed
    navigate('/admin'); // Redirect to admin dashboard after sign in
  };

  return (
    <div className="signin-root" style={{ background: "url('/municipal-hall.jpg') center center / cover no-repeat" }}>
      <div className="signin-bg" />
      <div className="signin-form-container">
        <h2 className="signin-title">Sign In</h2>
        <form className="signin-form" onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="signin-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="signin-input"
            required
          />
          <button className="signin-btn" type="submit">Sign In</button>
        </form>
        <div className="signin-signup-row">
          <span>Don't have an account?</span>
          <Link to="/signup" className="signin-signup-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
