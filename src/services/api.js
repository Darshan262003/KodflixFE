// API service for backend communication
const API_BASE_URL = 'https://kodflix-be.vercel.app';

// Create axios instance with base configuration
const api = {
  // User authentication endpoints
  auth: {
    register: async (userData) => {
      // Log the data being sent for debugging
      console.log('Sending registration data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration error response:', errorData);
        // Extract error message from various possible fields
        const errorMessage = errorData.message || errorData.error || errorData.msg || JSON.stringify(errorData) || 'Registration failed';
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Registration success response:', result);
      return result;
    },
    
    login: async (credentials) => {
      // Log the data being sent for debugging
      console.log('Sending login data:', credentials);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        // Extract error message from various possible fields
        const errorMessage = errorData.message || errorData.error || errorData.msg || JSON.stringify(errorData) || 'Login failed';
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Login success response:', result);
      return result;
    }
  },
  
  // Set JWT token for authenticated requests
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('jwtToken', token);
    } else {
      localStorage.removeItem('jwtToken');
    }
  },
  
  // Get stored JWT token
  getAuthToken: () => {
    return localStorage.getItem('jwtToken');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('jwtToken');
  }
};

export default api;