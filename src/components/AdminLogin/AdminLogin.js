import React, { useState } from 'react';
import './AdminLogin.css';
import { signInWithEmail, signUpWithEmail } from '../../services/firebaseAuth';
import { 
  MdEco, 
  MdInsertChart,
  MdMonitorHeart,
  MdPsychology,
  MdEmail,
  MdLock,
  MdCheckCircle,
  MdWarning,
  MdLogin,
  MdPersonAdd
} from 'react-icons/md';

const AdminLogin = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return false;
    }
    
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    // Password strength validation for signup
    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        // Handle sign up
        const { user, error: signUpError } = await signUpWithEmail(email, password);
        
        if (signUpError) {
          setError(signUpError);
        } else {
          // Successfully signed up and logged in
          setSuccessMessage('Account created successfully!');
          setTimeout(() => {
            onLogin(user);
          }, 1000);
        }
      } else {
        // Handle login
        const { user, error: loginError } = await signInWithEmail(email, password);
        
        if (loginError) {
          setError(loginError);
        } else {
          // Successfully logged in
          onLogin(user);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMessage('');
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="app-logo">
              <div className="logo-icon"><MdEco /></div>
              <h1>Agriculture</h1>
            </div>
            <h2>Crop Yield Management</h2>
            <p>Optimize your farming with data-driven insights and ML-powered recommendations</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon"><MdInsertChart /></div>
                <div className="feature-text">Day-by-day growth planning</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><MdMonitorHeart /></div>
                <div className="feature-text">Real-time monitoring</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><MdPsychology /></div>
                <div className="feature-text">ML-powered recommendations</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p>{isSignUp 
                ? 'Sign up to access crop management tools' 
                : 'Sign in to your account to continue'}</p>
            </div>

            {error && (
              <div className="auth-message error">
                <span className="message-icon"><MdWarning /></span>
                <span className="message-text">{error}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="auth-message success">
                <span className="message-icon"><MdCheckCircle /></span>
                <span className="message-text">{successMessage}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <div className="input-container">
                  <span className="input-icon"><MdEmail /></span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <span className="input-icon"><MdLock /></span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {isSignUp && (
                <div className="form-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-container">
                    <span className="input-icon"><MdLock /></span>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    {isSignUp ? <MdPersonAdd className="button-icon" /> : <MdLogin className="button-icon" />}
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              <p>
                {isSignUp 
                  ? 'Already have an account?' 
                  : 'Don\'t have an account?'
                }
                <button 
                  type="button"
                  className="switch-button"
                  onClick={toggleAuthMode}
                  disabled={loading}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;