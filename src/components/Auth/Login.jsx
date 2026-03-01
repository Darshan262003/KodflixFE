import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Validate email format
    const emailRegex = /^[\w+.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error for the field being edited
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.auth.login({
        email: formData.email,
        password: formData.password
      });

      // Store JWT token
      const token = response.token || response.data?.token || response.jwt;
      if (token) {
        api.setAuthToken(token);
      }
      
      // Update authentication state and navigate to main app
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate('/');
    } catch (err) {
      setErrors({ general: err.message || 'Invalid credentials. Please try again.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Login</h2>
        
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`auth-input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          
          <button type="submit" className="auth-button">
            Login
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <button className="link-button" onClick={() => navigate('/signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;