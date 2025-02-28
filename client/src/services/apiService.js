const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com';

/**
 * Makes API requests with proper authentication headers
 */
const apiService = {
  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @returns {Promise} - The fetch promise
   */
  async get(endpoint) {
    const token = localStorage.getItem('github_token');
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {Object} data - Data to send
   * @returns {Promise} - The fetch promise
   */
  async post(endpoint, data) {
    const token = localStorage.getItem('github_token');
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
    
    return response.json();
  },
};

export default apiService;
