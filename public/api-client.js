/**
 * Iron Forge API Client
 * Handles all API interactions with the backend
 */

// Base API URL - change this to match your server deployment
const API_BASE_URL = 'http://localhost:3000/api'; // Updated to port 3000 to match our running server

// Authentication API
const auth = {
  // Login user
  login: async function(email, password) {
    try {
      console.log('API Client: Attempting login for', email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register new user
  register: async function(userData) {
    try {
      console.log('API Client: Attempting registration for', userData.email);
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Forgot password
  forgotPassword: async function(email) {
    try {
      console.log('API Client: Requesting password reset for', email);
      const response = await fetch(`${API_BASE_URL}/auth/forgotPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async function() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }
      
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async function() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.status === 401) {
        return null; // Not logged in
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get current user');
      }
      
      return data.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  // Check if user is logged in
  isLoggedIn: async function() {
    const user = await this.getCurrentUser();
    return !!user;
  }
};

// Export the API
const api = {
  auth
};

// Make the API available globally
window.api = api; 