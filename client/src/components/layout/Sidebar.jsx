import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Input, 
  Empty, 
  Button, 
  List, 
  Avatar, 
  Tag, 
  Space, 
  Modal,
  Tooltip,
  message,
  Spin,
  theme
} from 'antd';
import { 
  BookOutlined, 
  SearchOutlined,
  PlusOutlined,
  CloseOutlined,
  StarOutlined,
  ForkOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContributors, fetchDashboardData } from '../../store/slices/dashboardSlice';
import { setCurrentRepository, removeSelectedRepository } from '../../store/slices/repositorySlice';

const { Search } = Input;

const Sidebar = ({ collapsed = false }) => {
  const dispatch = useDispatch();
  const { selected, currentRepository, loading } = useSelector(state => state.repositories);
  const { timeRange } = useSelector(state => state.dashboard);
  const [searchTerm, setSearchTerm] = useState('');
  const [repoToRemove, setRepoToRemove] = useState(null);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const { token } = theme.useToken();

  const handleRepositorySelect = (repo) => {
    dispatch(setCurrentRepository(repo));
    dispatch(fetchDashboardData({ 
      owner: repo.owner.login, 
      repo: repo.name, 
      timeRange 
    }));
    
    dispatch(fetchContributors({ 
      owner: repo.owner.login, 
      repo: repo.name 
    }));
  };
  
  const confirmRemoveRepository = (repo) => {
    setRepoToRemove(repo);
    setIsRemoveModalVisible(true);
  };
  
  const handleRemoveRepository = () => {
    if (!repoToRemove) return;
    
    dispatch(removeSelectedRepository(repoToRemove.id));
    
    // If the current repository is removed, set it to the first one in the list
    if (currentRepository && currentRepository.id === repoToRemove.id) {
      if (selected.length > 1) {
        const nextRepo = selected.find(r => r.id !== repoToRemove.id);
        if (nextRepo) handleRepositorySelect(nextRepo);
      }
    }
    
    setIsRemoveModalVisible(false);
    setRepoToRemove(null);
    message.success('Repository removed from dashboard');
  };

  // Filter repositories by search term
  const filteredRepos = selected.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.owner?.login || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRefreshRepo = (repo) => {
    if (!repo) return;
    
    dispatch(fetchDashboardData({ 
      owner: repo.owner.login, 
      repo: repo.name, 
      timeRange,
      forceRefresh: true 
    }));
    
    message.info(`Refreshing data for ${repo.name}`);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 24,
        height: '100%'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 12, color: token.colorTextSecondary }}>Loading repositories...</div>
      </div>
    );
  }

  // Empty state
  if (!selected || selected.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 24,
        height: '100%'
      }}>
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="No repositories added"
        />
        <Link to="/select-repositories" style={{ marginTop: 16 }}>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Repositories
          </Button>
        </Link>
      </div>
    );
  }

  // Render sidebar content
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!collapsed && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 12 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: token.colorText,
              fontWeight: 500
            }}>
              <BookOutlined style={{ marginRight: 8 }} /> Repositories
            </div>
            <Space>
              <Tooltip title="Add repositories">
                <Link to="/select-repositories">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<PlusOutlined />} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  />
                </Link>
              </Tooltip>
            </Space>
          </div>
          
          <Search
            placeholder="Filter repositories..."
            allowClear
            onChange={e => setSearchTerm(e.target.value)}
            style={{ marginBottom: 12 }}
            prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
          />
        </div>
      )}
      
      <div style={{ 
        overflowY: 'auto', 
        overflowX: 'hidden',
        flex: 1,
        padding: collapsed ? 8 : 16
      }}>
        <List
          dataSource={filteredRepos}
          renderItem={repo => (
            <List.Item 
              style={{ 
                padding: 0,
                border: 'none',
                marginBottom: 8
              }}
            >
              <div 
                onClick={() => handleRepositorySelect(repo)}
                style={{ 
                  cursor: 'pointer', 
                  width: '100%',
                  borderRadius: token.borderRadius,
                  border: currentRepository?.id === repo.id 
                    ? `1px solid ${token.colorPrimary}` 
                    : `1px solid ${token.colorBorder}`,
                  backgroundColor: currentRepository?.id === repo.id 
                    ? token.colorPrimaryBg 
                    : token.colorBgContainer,
                  padding: collapsed ? 8 : 12,
                  transition: 'all 0.3s',
                  opacity: 1,
                  '&:hover': {
                    opacity: 0.85,
                    borderColor: currentRepository?.id === repo.id 
                      ? token.colorPrimary 
                      : token.colorPrimaryBorderHover
                  }
                }}
              >
                {collapsed ? (
                  <Tooltip title={`${repo.owner?.login}/${repo.name}`} placement="right">
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      textAlign: 'center' 
                    }}>
                      <BookOutlined style={{ fontSize: 16, marginBottom: 4 }} />
                      <div style={{ fontSize: 12, width: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {repo.name.slice(0, 1).toUpperCase()}
                      </div>
                    </div>
                  </Tooltip>
                ) : (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start', 
                      marginBottom: 4
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', maxWidth: 'calc(100% - 48px)' }}>
                        <Avatar 
                          size="small" 
                          src={repo.owner?.avatar_url}
                          style={{ marginRight: 8, flexShrink: 0 }}
                        >
                          {repo.owner?.login?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <div style={{ 
                          fontWeight: 500, 
                          fontSize: 14, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {repo.name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <Tooltip title="Refresh repository data">
                          <Button 
                            type="text" 
                            size="small"
                            icon={<ReloadOutlined />} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              height: 20,
                              width: 20,
                              fontSize: 12,
                              padding: 0
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefreshRepo(repo);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Remove from dashboard">
                          <Button 
                            type="text" 
                            size="small"
                            danger
                            icon={<CloseOutlined />} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              height: 20,
                              width: 20,
                              fontSize: 12,
                              padding: 0
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmRemoveRepository(repo);
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: 12, 
                      color: token.colorTextSecondary, 
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {repo.owner?.login || 'Unknown owner'}
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 12,
                      color: token.colorTextSecondary 
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>
                        <StarOutlined style={{ color: '#e3b341', marginRight: 4, fontSize: 12 }} />
                        {repo.stargazers_count || 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <ForkOutlined style={{ color: token.colorPrimary, marginRight: 4, fontSize: 12 }} />
                        {repo.forks_count || 0}
                      </span>
                      {repo.private && (
                        <Tag 
                          color="gold" 
                          style={{ 
                            marginLeft: 8, 
                            fontSize: 10, 
                            lineHeight: '16px', 
                            height: 16, 
                            padding: '0 4px' 
                          }}
                        >
                          Private
                        </Tag>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </List.Item>
          )}
          locale={{
            emptyText: searchTerm 
              ? <div style={{ padding: 16, textAlign: 'center' }}>No repositories match your search</div>
              : <div style={{ padding: 16 }}>No repositories available</div>
          }}
        />
      </div>
      
      {/* Confirmation Modal for Repository Removal */}
      <Modal
        title="Remove Repository"
        open={isRemoveModalVisible}
        onOk={handleRemoveRepository}
        onCancel={() => setIsRemoveModalVisible(false)}
        okText="Remove"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to remove <strong>{repoToRemove?.name}</strong> from the dashboard?</p>
        <p style={{ color: token.colorTextSecondary }}>This will only remove it from your dashboard, not from GitHub.</p>
      </Modal>
    </div>
  );
};

export default Sidebar;