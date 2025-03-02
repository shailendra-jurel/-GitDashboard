import { ConfigProvider, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import apiService from './services/apiService';
import store from './store';

// Components
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import RepositorySelection from './components/repositories/RepositorySelection';

// Styles
import 'antd/dist/reset.css';
import './App.css';

const PrivateRoute = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('github_token');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Set token for API service
        apiService.setAuthToken(token);
        
        // Use the API service for verification
        const data = await apiService.get('/auth/verify');
        if (data && data.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('github_token');
          apiService.clearAuthToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('github_token');
        apiService.clearAuthToken();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <Provider store={store}>
      <ConfigProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {isAuthenticated && <Navbar />}
            <div className="container mx-auto px-4">
              <Routes>
                <Route path="/" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/select-repositories" element={<RepositorySelection />} />
                </Route>
                <Route path="/auth/callback" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;