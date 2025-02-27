import { GithubOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token && location.pathname === '/auth/callback') {
      localStorage.setItem('github_token', token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    }
  }, [location, navigate, setIsAuthenticated]);
  
  const handleLogin = () => {
    window.location.href = '/api/auth/github';
  };
  
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
        
        <Button
          type="primary"
          icon={<GithubOutlined />}
          size="large"
          onClick={handleLogin}
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
