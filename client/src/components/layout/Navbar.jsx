// components/layout/Navbar.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Typography } from 'antd';
import { 
  DashboardOutlined, 
  AppstoreOutlined, 
  GithubOutlined,
  UserOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { logout } from '../../store/slices/authSlice';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} disabled>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="bg-white shadow-md flex items-center justify-between px-6 h-16">
      <div className="flex items-center">
        <Link to="/dashboard" className="flex items-center mr-8">
          <GithubOutlined className="text-2xl mr-2" />
          <Text strong className="text-lg hidden md:inline">GitHub Dashboard</Text>
        </Link>
        
        <Menu mode="horizontal" className="border-0">
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="repositories" icon={<AppstoreOutlined />}>
            <Link to="/select-repositories">Repositories</Link>
          </Menu.Item>
        </Menu>
      </div>
      
      <div className="flex items-center">
        {user ? (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Button type="text" className="flex items-center">
              <Avatar 
                src={user.avatarUrl} 
                icon={<UserOutlined />} 
                size="small" 
                className="mr-2" 
              />
              <span className="hidden md:inline">{user.login}</span>
            </Button>
          </Dropdown>
        ) : (
          <Button size="small" loading>Loading...</Button>
        )}
      </div>
    </Header>
  );
};

export default Navbar;

