import { GithubOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Typography, Alert, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const errorParam = params.get('error');
      
      if (errorParam) {
        setError(errorParam === 'auth_failed' 
          ? 'Authentication failed. Please try again.' 
          : 'An error occurred during login.');
        return;
      }
      
      if (token && location.pathname === '/auth/callback') {
        try {
          setLoading(true);
          
          // Verify token is valid before saving
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            localStorage.setItem('github_token', token);
            setIsAuthenticated(true);
            navigate('/dashboard');
          } else {
            setError('Invalid or expired token. Please try again.');
            console.error('Token verification failed');
          }
        } catch (err) {
          console.error('Error during callback processing:', err);
          setError('Error processing login. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    handleCallback();
  }, [location, navigate, setIsAuthenticated]);
  
  const handleLogin = () => {
    setLoading(true);
    setError(null);
    
    // Clear any existing token before starting new auth flow
    localStorage.removeItem('github_token');
    
    // Redirect to GitHub OAuth
    window.location.href = '/api/auth/github';
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
      </Card>
    </div>
  );
};

export default Login;