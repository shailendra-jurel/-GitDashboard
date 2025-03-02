import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Dropdown, 
  Avatar, 
  Space, 
  Badge, 
  Tooltip,
  theme
} from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  DashboardOutlined, 
  CodeOutlined, 
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  GithubOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header } = Layout;

const Navbar = ({ onToggleSidebar, sidebarCollapsed, showSidebarToggle = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = theme.useToken();
  
  const isDarkMode = token.colorBgContainer !== '#ffffff';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('github_token');
        if (!token) {
          setLoading(false);
          return;
        }

        import('../../services/apiService').then(async ({ default: apiService }) => {
          try {
            const userData = await apiService.get('/auth/user');
            setUser(userData);
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          } finally {
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error in user data fetch:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    navigate('/');
  };
  
  // Find current active menu item
  const selectedKey = location.pathname === '/dashboard' 
    ? 'dashboard' 
    : location.pathname === '/select-repositories'
      ? 'repositories'
      : '';

  // Menu items for dropdown
  const userMenu = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 'bold' }}>{user?.login || 'User'}</div>
          <div style={{ color: token.colorTextSecondary, fontSize: '0.85rem' }}>{user?.email || 'GitHub User'}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'repositories',
      icon: <CodeOutlined />,
      label: 'Repositories',
      onClick: () => navigate('/select-repositories')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      onClick: handleLogout
    }
  ];

  // Navigation items
  const navItems = [
    {
      key: 'dashboard',
      label: <Link to="/dashboard">Dashboard</Link>
    },
    {
      key: 'repositories',
      label: <Link to="/select-repositories">Repositories</Link>
    },
    // {
    //   key: 'analytics',
    //   label: <Link to="/analytics">Analytics</Link>
    // }
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorder}`,
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: 64,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {showSidebarToggle && (
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleSidebar}
            style={{ marginRight: 16 }}
          />
        )}
        
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            style={{ 
              background: '#0969da', 
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8
            }}
          >
            <GithubOutlined style={{ color: 'white', fontSize: 18 }} />
          </div>
          <span style={{ 
            fontWeight: 600, 
            fontSize: 18, 
            color: token.colorText,
            display: 'block',
          }}>
            GitInsight
          </span>
        </Link>

        <div style={{   display: window.innerWidth >= 768 ? 'block' : 'none'}}>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={navItems}
            style={{ 
              border: 'none', 
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tooltip title="Notifications">
          <Badge count={0} size="small">
            <Button type="text" shape="circle" icon={<BellOutlined />} />
          </Badge>
        </Tooltip>

        {!loading && user && (
          <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
            <Avatar 
              src={user.avatarUrl} 
              icon={!user.avatarUrl && <UserOutlined />}
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        )}

        {!loading && !user && (
          <Link to="/login">
            <Button type="primary" icon={<GithubOutlined />} size="middle">
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </Header>
  );
};

export default Navbar;