// API service for backend communication
const API_BASE_URL = 'https://kodflix-fe-ectn.vercel.app';

// Create axios instance with base configuration
const api = {
  // User authentication endpoints
  auth: {
    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return response.json();
    },
    
    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return response.json();
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