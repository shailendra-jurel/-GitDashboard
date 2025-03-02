import { ConfigProvider, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import apiService from './services/apiService';
import store from './store';
import createTheme from './theme';

// Components
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import RepositorySelection from './components/repositories/RepositorySelection';

// Styles
import 'antd/dist/reset.css';
import './App.css';

const LoadingScreen = ({ message }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#f6f8fa'
  }}>
    <div style={{ 
      textAlign: 'center', 
      padding: 32, 
      background: '#fff', 
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      maxWidth: '1200px'
    }}>
      <Spin size="large" />
      <div style={{ marginTop: 16, color: '#666' }}>{message}</div>
    </div>
  </div>
);

const PrivateRoute = ({ isAuthenticated, isLoading }) => {
  if (isLoading) {
    return <LoadingScreen message="Verifying authentication..." />;
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Create theme based on light/dark mode
  const theme = createTheme(isDarkMode);
  
  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference if no saved preference
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
    }
  }, []);
  
  // Toggle theme function (can be passed to components)
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('github_token');
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        try {
          apiService.setAuthToken(token);
          const data = await apiService.get('/auth/verify');
          
          if (data && data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('github_token');
            setIsAuthenticated(false);
          }
        } catch (err) {
          localStorage.removeItem('github_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('github_token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuthChange = (status) => {
    setIsAuthenticated(status);
  };

  if (loading) {
    return <LoadingScreen message="Loading application..." />;
  }

  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <Router>
          <div style={{ 
            minHeight: '100vh', 
            backgroundColor: theme.token.colorBgContainer === '#ffffff' ? '#f6f8fa' : '#0d1117' 
          }}>
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
                <Route path="/dashboard" element={<Dashboard toggleTheme={toggleTheme} isDarkMode={isDarkMode} />} />
                <Route path="/select-repositories" element={<RepositorySelection toggleTheme={toggleTheme} isDarkMode={isDarkMode} />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;