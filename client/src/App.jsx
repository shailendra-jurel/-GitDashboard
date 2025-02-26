import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate , Outlet, } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import store from './store';

// Components
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import RepositorySelection from './components/repositories/RepositorySelection';
// import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/layout/Navbar';

// Styles
import './App.css';
import 'antd/dist/reset.css';


// const PrivateRoute = ({ children, isAuthenticated }) => {
//   return isAuthenticated ? children : <Navigate to="/" />;
// };
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
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('github_token');
            setIsAuthenticated(false);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Provider store={store}>
      <ConfigProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {isAuthenticated && <Navbar />}
            <div className="container mx-auto px-4">
              <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/select-repositories" element={<RepositorySelection />} />
                </Route>
                <Route path="/auth/callback" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              </Routes>
            </div>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
