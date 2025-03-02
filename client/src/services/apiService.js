// services/apiService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json'
      }
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
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor to handle common errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('API error:', error.response?.data || error.message);
        
        // Handle auth errors
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('github_token');
          // Optional: redirect to login or dispatch logout action
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Set auth token explicitly
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Clear auth token
  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }
  
  // GET request
  async get(endpoint, config = {}) {
    return this.api.get(endpoint, config);
  }
  
  // POST request
  async post(endpoint, data, config = {}) {
    return this.api.post(endpoint, data, config);
  }
  
  // PUT request
  async put(endpoint, data, config = {}) {
    return this.api.put(endpoint, data, config);
  }
  
  // DELETE request
  async delete(endpoint, config = {}) {
    return this.api.delete(endpoint, config);
  }
}

export default new ApiService();