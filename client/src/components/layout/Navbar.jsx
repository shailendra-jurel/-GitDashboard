// components/layout/Navbar.js
import { DashboardOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Replace the useEffect in Navbar.jsx with this:
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('github_token');
      if (!token) return;

      // Use apiService instead of direct fetch
      import('../../services/apiService').then(async ({ default: apiService }) => {
        try {
          console.log('Fetching user profile data');
          const userData = await apiService.get('/auth/user');
          console.log('User profile data received:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data via apiService:', error);
        }
      });
    } catch (error) {
      console.error('Error in user data fetch:', error);
    }
  };

  fetchUserData();
}, []);

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    navigate('/');
    window.location.reload();
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="repositories" icon={<SettingOutlined />}>
        <Link to="/select-repositories">Repositories</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="bg-white border-b flex justify-between items-center px-4 h-16">
      <div className="flex items-center">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
          GitHub Analytics
        </Link>
      </div>
      
      <div>
        {user ? (
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar 
                src={user.avatarUrl} 
                icon={<UserOutlined />} 
                size="small" 
                className="mr-2"
              />
              <span className="mr-1">{user.login}</span>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => navigate('/')}>
            Sign In
          </Button>
        )}
      </div>
    </Header>
  );
};

export default Navbar;

