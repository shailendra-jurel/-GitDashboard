import React, { useState } from 'react';
import { 
  Typography, 
  Tag, 
  Button, 
  Radio, 
  Space, 
  Tooltip, 
  Dropdown,
  Skeleton,
  theme
} from 'antd';
import { 
  GithubOutlined, 
  StarOutlined, 
  ForkOutlined, 
  EyeOutlined, 
  BranchesOutlined,
  InfoCircleOutlined,
  SwapOutlined,
  ReloadOutlined,
  LinkOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTimeRange, fetchDashboardData } from '../../store/slices/dashboardSlice';

const { Title, Text, Paragraph } = Typography;

const RepositoryHeader = ({ repository }) => {
  const dispatch = useDispatch();
  const { timeRange, loading } = useSelector(state => state.dashboard);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { token } = theme.useToken();

  if (!repository) return null;

  // Extract owner and repo name with fallbacks
  let ownerName;
  let repoName = repository.name;

  if (repository.full_name) {
    const parts = repository.full_name.split('/');
    ownerName = parts[0];
    if (!repoName) repoName = parts[1];
  } else if (repository.fullName) {
    const parts = repository.fullName.split('/');
    ownerName = parts[0];
    if (!repoName) repoName = parts[1];
  } else if (repository.owner) {
    ownerName = repository.owner.login || repository.owner.name;
  }

  if (!ownerName || !repoName) return null;

  const handleTimeRangeChange = (e) => {
    const newTimeRange = e.target.value;
    dispatch(setTimeRange(newTimeRange));
    dispatch(fetchDashboardData({ 
      owner: ownerName, 
      repo: repoName, 
      timeRange: newTimeRange 
    }));
  };

  const handleRefresh = () => {
    dispatch(fetchDashboardData({ 
      owner: ownerName, 
      repo: repoName, 
      timeRange 
    }));
  };

  // Format time range for display
  const timeRangeDisplay = {
    '1w': 'Last 7 days',
    '1m': 'Last 30 days',
    '3m': 'Last 3 months',
    '1y': 'Last year'
  };
  
  // Menu items for dropdown
  const menuItems = [
    {
      key: '1',
      label: 'View on GitHub',
      icon: <GithubOutlined />,
      onClick: () => window.open(`https://github.com/${ownerName}/${repoName}`, '_blank')
    },
    {
      key: '2',
      label: 'Change Repository',
      icon: <SwapOutlined />,
      onClick: () => window.location.href = "/select-repositories"
    },
    {
      key: '3',
      label: repository.description ? 'Hide Description' : 'Show Description',
      icon: <InfoCircleOutlined />,
      onClick: () => setShowMoreInfo(!showMoreInfo)
    }
  ];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16
        }}>
          {/* Repository info and stats */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 8,
              gap: 12
            }}>
              <Link
                to={`https://github.com/${ownerName}/${repoName}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: token.colorText,
                  transition: 'color 0.3s'
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ 
                    backgroundColor: token.colorPrimaryBg,
                    padding: 8,
                    borderRadius: token.borderRadius,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <GithubOutlined style={{ 
                      fontSize: 20,
                      color: token.colorPrimary
                    }} />
                  </div>
                  <Title level={3} style={{ margin: 0 }}>
                    {repoName}
                  </Title>
                </div>
              </Link>
              
              {repository.private && (
                <Tag color="gold">Private</Tag>
              )}
              
              {repository.fork && (
                <Tag color="purple">Fork</Tag>
              )}
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 8
            }}>
              <div style={{ color: token.colorTextSecondary }}>
                <Tooltip title="Owner">
                  <Link 
                    to={`https://github.com/${ownerName}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: token.colorTextSecondary,
                      fontWeight: 500,
                      transition: 'color 0.3s'
                    }}
                  >
                    {ownerName}
                  </Link>
                </Tooltip>
              </div>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                color: token.colorTextSecondary
              }}>
                {repository.stargazers_count !== undefined && (
                  <Tooltip title="Stars">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <StarOutlined style={{ color: '#e3b341', marginRight: 4 }} />
                      {repository.stargazers_count.toLocaleString()}
                    </span>
                  </Tooltip>
                )}
                
                {repository.forks_count !== undefined && (
                  <Tooltip title="Forks">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <ForkOutlined style={{ color: token.colorPrimary, marginRight: 4 }} />
                      {repository.forks_count.toLocaleString()}
                    </span>
                  </Tooltip>
                )}
                
                {repository.watchers_count !== undefined && (
                  <Tooltip title="Watchers">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <EyeOutlined style={{ color: token.colorSuccess, marginRight: 4 }} />
                      {repository.watchers_count.toLocaleString()}
                    </span>
                  </Tooltip>
                )}
                
                {repository.default_branch && (
                  <Tooltip title="Default Branch">
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <BranchesOutlined style={{ color: '#8250df', marginRight: 4 }} />
                      {repository.default_branch}
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Time range controls */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'flex-end'
          }}>
            <Space>
              <Radio.Group 
                value={timeRange} 
                onChange={handleTimeRangeChange}
                buttonStyle="solid"
                disabled={loading}
                optionType="button"
                size="middle"
              >
                <Radio.Button value="1w">7 Days</Radio.Button>
                <Radio.Button value="1m">30 Days</Radio.Button>
                <Radio.Button value="3m">3 Months</Radio.Button>
                <Radio.Button value="1y">1 Year</Radio.Button>
              </Radio.Group>
              
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                disabled={loading}
              >
                Refresh
              </Button>
              
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Button icon={<InfoCircleOutlined />}>
                  More
                </Button>
              </Dropdown>
            </Space>
            
            <div style={{ 
              fontSize: 13,
              color: token.colorTextSecondary
            }}>
              Viewing data for: <span style={{ fontWeight: 500 }}>{timeRangeDisplay[timeRange]}</span>
            </div>
          </div>
        </div>
        
        {/* Repository description (optional) */}
        {repository.description && showMoreInfo && (
          <div style={{
            padding: 16,
            backgroundColor: token.colorPrimaryBg,
            borderRadius: token.borderRadius,
            borderLeft: `3px solid ${token.colorPrimary}`,
            maxWidth: '1200px'
          }}>
            <Paragraph style={{ margin: 0 }}>
              {repository.description}
            </Paragraph>
            
            {/* Additional repository details - could be extended */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              marginTop: 12,
              fontSize: 13,
              color: token.colorTextSecondary
            }}>
              {repository.language && (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    backgroundColor: '#3178c6', // Default color for language
                    marginRight: 6
                  }}></span>
                  {repository.language}
                </span>
              )}
              
              {repository.updated_at && (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  Updated: {new Date(repository.updated_at).toLocaleDateString()}
                </span>
              )}
              
              <Link 
                to={`https://github.com/${ownerName}/${repoName}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: token.colorPrimary
                }}
              >
                <LinkOutlined style={{ marginRight: 6 }} />
                View on GitHub
              </Link>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div style={{ height: 2 }}>
            <Skeleton.Button 
              active 
              size="small" 
              block 
              style={{ height: 2 }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryHeader;