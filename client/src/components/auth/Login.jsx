// components/auth/Login.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, Card } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { fetchUserData } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const Login = ({ setIsAuthenticated }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('github_token', data.token);
            setIsAuthenticated(true);
            await dispatch(fetchUserData());
            navigate('/select-repositories');
          }
        } catch (error) {
          console.error('Auth callback error:', error);
        }
      }
    };

    if (location.pathname === '/auth/callback') {
      handleCallback();
    }
  }, [location, dispatch, navigate, setIsAuthenticated]);

  const handleLogin = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'repo user';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-lg">
        <div className="text-center">
          <GithubOutlined className="text-6xl mb-4" />
          <Title level={2}>GitHub Repository Dashboard</Title>
          <Text className="block mb-8">
            Visualize your repository activity and team contributions
          </Text>
          <Button 
            type="primary" 
            size="large" 
            icon={<GithubOutlined />} 
            onClick={handleLogin}
            className="w-full h-12 flex items-center justify-center"
          >
            Login with GitHub
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;

// // components/common/PrivateRoute.js
// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const PrivateRoute = ({ children, isAuthenticated }) => {
//   return isAuthenticated ? children : <Navigate to="/" />;
// };

// export default PrivateRoute;