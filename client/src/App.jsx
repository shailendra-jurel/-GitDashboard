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

const PrivateRoute = ({ isAuthenticated, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Verifying authentication..." />
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('github_token');
        
        console.log('App - Checking auth status, token exists:', !!token);
        
        if (!token) {
          console.log('App - No token found, setting unauthenticated');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Use the API service for verification
        try {
          console.log('App - Setting auth token and verifying');
          apiService.setAuthToken(token);
          
          const data = await apiService.get('/auth/verify');
          
          if (data && data.valid) {
            console.log('App - Token verified successfully');
            setIsAuthenticated(true);
          } else {
            console.log('App - Token verification failed, clearing token');
            localStorage.removeItem('github_token');
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('App - Error verifying token:', err);
          localStorage.removeItem('github_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('App - Auth verification error:', error);
        localStorage.removeItem('github_token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle auth changes
  const handleAuthChange = (status) => {
    console.log('App - Auth status changed to:', status);
    setIsAuthenticated(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading application..." />
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
                <Route  
                  path="/" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={handleAuthChange} />}   
                />
                
                <Route 
                  path="/login" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={handleAuthChange} />} 
                />
                
                <Route 
                  path="/auth/callback" 
                  element={<Login setIsAuthenticated={handleAuthChange} />} 
                />
                
                <Route element={<PrivateRoute isAuthenticated={isAuthenticated} isLoading={loading} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/select-repositories" element={<RepositorySelection />} />
                </Route>
                
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