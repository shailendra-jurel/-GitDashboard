// services/apiService.js
import axios from 'axios';

// Default to production URL, fallback to local development for flexibility
const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com';
console.log('API_URL set to:', API_URL);

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json'
      },
      // Setting withCredentials for CORS with credentials
      withCredentials: true
    });
    
    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('github_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor to handle common errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        // Enhanced error logging
        if (error.response) {
          console.error('API error response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          console.error('API request error (no response received):', error.request);
        } else {
          console.error('API error:', error.message);
        }
        
        // Handle auth errors
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('Authentication error, removing token');
          localStorage.removeItem('github_token');
          // Redirect to login if needed
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Set auth token explicitly
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token set in API service');
    } else {
      console.warn('Attempted to set null/undefined auth token');
    }
  }
  
  // Clear auth token
  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
    console.log('Auth token cleared from API service');
  }
  
  // GET request
  async get(endpoint, config = {}) {
    try {
      return await this.api.get(endpoint, config);
    } catch (error) {
      console.error(`GET request to ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  // POST request
  async post(endpoint, data, config = {}) {
    try {
      return await this.api.post(endpoint, data, config);
    } catch (error) {
      console.error(`POST request to ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  // PUT request
  async put(endpoint, data, config = {}) {
    try {
      return await this.api.put(endpoint, data, config);
    } catch (error) {
      console.error(`PUT request to ${endpoint} failed:`, error);
      throw error;
    }
  }
  
  // DELETE request
  async delete(endpoint, config = {}) {
    try {
      return await this.api.delete(endpoint, config);
    } catch (error) {
      console.error(`DELETE request to ${endpoint} failed:`, error);
      throw error;
    }
  }
}

export default new ApiService();