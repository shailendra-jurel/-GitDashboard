import React, { useState, useEffect } from 'react';
import { Layout, Drawer, Button, theme } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const { Content, Sider } = Layout;

// Responsive breakpoints
const MOBILE_BREAKPOINT = 768;

const AppLayout = ({ 
  children, 
  showSidebar = true, 
  sidebarContent,
  breadcrumb,
  headerContent,
  pageTitle,
  headerActions 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { token } = theme.useToken();

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    if (isMobile) {
      setDrawerVisible(!drawerVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', width: '100%', maxWidth: '100%' }}>
      <Navbar
        onToggleSidebar={toggleCollapsed}
        sidebarCollapsed={collapsed}
        showSidebarToggle={showSidebar}
      />
      
      <Layout>
        {showSidebar && !isMobile && (
          <Sider
            width={240}
            theme="light"
            collapsible
            collapsed={collapsed}
            trigger={null}
            collapsedWidth={80}
            style={{ 
              height: 'calc(100vh - 64px)', 
              position: 'sticky', 
              top: 64, 
              overflowY: 'auto',
              background: token.colorBgContainer,
              borderRight: `1px solid ${token.colorBorder}`
            }}
          >
            {sidebarContent}
          </Sider>
        )}

        {showSidebar && isMobile && (
          <Drawer
            title="Menu"
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={240}
            bodyStyle={{ padding: 0 }}
          >
            {sidebarContent}
          </Drawer>
        )}
        
        <Content style={{ 
          padding: isMobile ? 12 : 24, 
          background: token.colorBgContainer === '#ffffff' ? '#f6f8fa' : '#0d1117' ,
           width: '100%',
            maxWidth: '100%'

        }}>
          {headerContent && (
            <div
              style={{
                padding: isMobile ? '12px 16px' : '16px 24px',
                borderRadius: token.borderRadius,
                marginBottom: 16,
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  {breadcrumb && <div style={{ marginBottom: 8 }}>{breadcrumb}</div>}
                  {pageTitle}
                </div>
                {headerActions && (
                  <div>{headerActions}</div>
                )}
              </div>
            </div>
          )}
          
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;