import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, Spin } from 'antd';
import store from './store';

// Components
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import RepositorySelection from './components/repositories/RepositorySelection';
import Navbar from './components/layout/Navbar';

// Styles
import './App.css';
import 'antd/dist/reset.css';

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
        
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('github_token');
            setIsAuthenticated(false);
          }
        } else {
          localStorage.removeItem('github_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('github_token');
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
                <Route  path="/" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />}   />
                <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/select-repositories" element={<RepositorySelection />} />
                </Route>
                <Route  path="/auth/callback" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route  path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
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