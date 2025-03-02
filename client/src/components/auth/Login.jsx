import { GithubOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Typography, Alert, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://gitdashboard.onrender.com';

const { Title, Text } = Typography;

const Login = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Determine if we're in the OAuth callback flow
    const isCallback = location.pathname === '/auth/callback';
    
    // Extract token and error from URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const errorParam = params.get('error');
    
    // Debug logging
    console.log("Auth check - Current URL:", window.location.href);
    console.log("Auth check - Is callback:", isCallback);
    console.log("Auth check - Error in URL:", errorParam);
    console.log("Auth check - Token present:", token ? "Yes" : "No");
    
    const handleCallback = async () => {
      if (errorParam) {
        setError(errorParam === 'auth_failed' 
          ? 'Authentication failed. Please try again.' 
          : 'An error occurred during login.');
        return;
      }
      
      if (token && isCallback) {
        try {
          setLoading(true);
          console.log("Processing authentication callback with token");
          
          // Store token first
          localStorage.setItem('github_token', token);
          
          // Verify token with backend
          try {
            // Set the Authorization header for all future requests
            apiService.setAuthToken(token);
            
            const data = await apiService.get('/auth/verify');
            
            if (data && data.valid) {
              console.log("Token verified successfully");
              setIsAuthenticated(true);
              navigate('/dashboard', { replace: true });
            } else {
              setError('Invalid or expired token. Please try again.');
              localStorage.removeItem('github_token');
              console.error('Token verification failed');
            }
          } catch (err) {
            console.error('Error verifying token:', err);
            localStorage.removeItem('github_token');
            setError('Error processing login. Please try again.');
          }
        } catch (err) {
          console.error('Error during callback processing:', err);
          setError('Error processing login. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (isCallback || errorParam) {
      handleCallback();
    }
  }, [location, navigate, setIsAuthenticated]);
  
  const handleLogin = () => {
    setLoading(true);
    setError(null);
    
    // Clear any existing token before starting new auth flow
    localStorage.removeItem('github_token');
    apiService.clearAuthToken();
    
    // Log the redirect URL
    const authUrl = `${API_URL}/api/auth/github`;
    console.log("Redirecting to GitHub OAuth:", authUrl);
    
    // Redirect to GitHub OAuth
    window.location.href = authUrl;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-lg p-10 shadow-xl rounded-lg border border-gray-200 bg-white">
          <div className="text-center">
            <Spin size="large" />
            <Text className="block mt-4">Authenticating with GitHub...</Text>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-lg p-10 shadow-xl rounded-lg border border-gray-200 bg-white">
        <div className="text-center mb-8">
          <GithubOutlined className="text-6xl text-gray-700 mb-4" />
          <Title level={2} className="mb-2">GitHub Repository Analytics</Title>
          <Text className="text-gray-500 block">
            Sign in with GitHub to access insights about your repositories.
          </Text>
        </div>
        
        {error && (
          <Alert
            message="Login Error"
            description={error}
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            className="mb-6"
            closable
            onClose={() => setError(null)}
          />
        )}
        
        <Button
          type="primary"
          icon={<GithubOutlined />}
          size="large"
          onClick={handleLogin}
          loading={loading}
          block
          className="h-14 text-lg font-semibold flex items-center justify-center"
        >
          Sign in with GitHub
        </Button>
        
        <div className="mt-4 text-center text-gray-500 text-xs">
          {import.meta.env.MODE === 'development' 
            ? 'Running in development mode' 
            : 'Running in production mode'
          }
        </div>
      </Card>
    </div>
  );
};

export default Login;