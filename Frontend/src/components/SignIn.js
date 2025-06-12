import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', formData);
      const userData = {
        ...response.data.user,
        email: response.data.user.email || formData.email
      };
      login(userData, response.data.token);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-welcome-section">
        <div className="welcome-content">
          <h1>Welcome Back!</h1>
          <p>Secure your digital life with our advanced password manager</p>
          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <span>Bank-level encryption</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <span>Access anywhere, anytime</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Auto-fill & sync across devices</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-form-section">
        <div className="auth-form">
          <h2>Sign In</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-btn" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
