import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Validate username is not empty
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Validate email format
    const emailRegex = /^[\w+.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/[-()\s+]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Validate password match
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await api.auth.register({
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });

      setSuccess(true);
      setErrors({});
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Sign Up</h2>

        {errors.general && <div className="error-message">{errors.general}</div>}
        {success && <div className="success-message">Registration successful! Redirecting to login...</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px', textAlign: 'left' }}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={`auth-input ${errors.username ? 'input-error' : ''}`}
            />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px', textAlign: 'left' }}>Email</label>
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
            <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px', textAlign: 'left' }}>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`auth-input ${errors.phoneNumber ? 'input-error' : ''}`}
            />
            {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px', textAlign: 'left' }}>Password</label>
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

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px', textAlign: 'left' }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`auth-input ${errors.confirmPassword ? 'input-error' : ''}`}
            />
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="auth-button">
            Sign Up
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <button className="link-button" onClick={() => navigate('/login')}>Log in</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;