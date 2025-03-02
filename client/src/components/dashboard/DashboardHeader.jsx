import { 
  GithubOutlined, 
  HomeOutlined, 
  ReloadOutlined, 
  SwapOutlined,
  StarOutlined,
  ForkOutlined,
  EyeOutlined,
  BranchesOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { 
  Breadcrumb, 
  Button, 
  Radio, 
  Space, 
  Tooltip, 
  Typography,
  Dropdown,
  Tag,
  Divider,
  Skeleton,
  Card
} from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setTimeRange, fetchDashboardData } from '../../store/slices/dashboardSlice';

const { Title, Text } = Typography;

const DashboardHeader = ({ repository }) => {
  const dispatch = useDispatch();
  const { timeRange, loading } = useSelector(state => state.dashboard);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Extract repository information consistently
  if (!repository) {
    return null;
  }

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

  if (!ownerName || !repoName) {
    return null;
  }

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
      label: (
        <Link to={`https://github.com/${ownerName}/${repoName}`} target="_blank" className="flex items-center">
          <GithubOutlined className="mr-2" /> View on GitHub
        </Link>
      )
    },
    {
      key: '2',
      label: <div className="flex items-center"><SwapOutlined className="mr-2" /> Change Repository</div>,
      onClick: () => window.location.href = "/select-repositories"
    },
    {
      key: '3',
      label: repository.description ? 'Hide Description' : 'Show Description',
      icon: <InfoCircleOutlined className="mr-2" />,
      onClick: () => setShowMoreInfo(!showMoreInfo)
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 w-full z-10 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-full p-6">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="text-sm mb-4">
          <Breadcrumb.Item>
            <Link to="/dashboard" className="flex items-center">
              <HomeOutlined className="mr-1 text-gray-500" /> Dashboard
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`https://github.com/${ownerName}`} target="_blank" className="text-gray-600">
              {ownerName}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`https://github.com/${ownerName}/${repoName}`} target="_blank" className="text-gray-800 font-medium">
              {repoName}
            </Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          {/* Repository info section */}
          <div className="flex flex-col">
            <div className="flex items-center mb-2 gap-3">
              <Link 
                to={`https://github.com/${ownerName}/${repoName}`} 
                target="_blank"
                className="text-black hover:text-blue-600 transition-colors dark:text-white"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3 dark:bg-blue-900">
                    <GithubOutlined className="text-xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <Title level={3} className="m-0 inline">
                    {repoName}
                  </Title>
                </div>
              </Link>
              
              {repository.private && (
                <Tag color="gold" className="font-medium">Private</Tag>
              )}
              
              {repository.fork && (
                <Tag color="purple" className="font-medium">Fork</Tag>
              )}
            </div>
            
            <div className="flex items-center flex-wrap gap-4 mt-1 mb-2">
              <div className="text-gray-600 flex items-center dark:text-gray-300">
                <Tooltip title="Owner">
                  <Link to={`https://github.com/${ownerName}`} target="_blank" className="text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300">
                    {ownerName}
                  </Link>
                </Tooltip>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {repository.stargazers_count !== undefined && (
                  <Tooltip title="Stars">
                    <span className="flex items-center">
                      <StarOutlined className="mr-1 text-amber-500" />
                      {repository.stargazers_count.toLocaleString()}
                    </span>
                  </Tooltip>
                )}
                
                {repository.forks_count !== undefined && (
                  <Tooltip title="Forks">
                    <span className="flex items-center">
                      <ForkOutlined className="mr-1 text-blue-500" />
                      {repository.forks_count.toLocaleString()}
                    </span>
                  </Tooltip>
                )}
                
                {repository.watchers_count !== undefined && (
                  <Tooltip title="Watchers">
                    <span className="flex items-center">
                      <EyeOutlined className="mr-1 text-green-500" />
                      {repository.watchers_count.toLocaleString()}
                    </span>
                  </Tooltip>
                )}
                
                {repository.default_branch && (
                  <Tooltip title="Default Branch">
                    <span className="flex items-center">
                      <BranchesOutlined className="mr-1 text-purple-500" />
                      {repository.default_branch}
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>
            
            {/* Extra repo info if description exists */}
            {repository.description && showMoreInfo && (
              <div className="mt-3 mb-2 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 max-w-3xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                <Text>{repository.description}</Text>
                
                {/* If we have additional info like language, updated date - for future expansion */}
                <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {repository.language && (
                    <span className="mr-4 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                      {repository.language}
                    </span>
                  )}
                  
                  {repository.updated_at && (
                    <span className="mr-4 flex items-center">
                      <CalendarOutlined className="mr-1" />
                      Updated: {new Date(repository.updated_at).toLocaleDateString()}
                    </span>
                  )}
                  
                  {repository.html_url && (
                    <Link to={repository.html_url} target="_blank" className="flex items-center text-blue-500 hover:text-blue-600">
                      <LinkOutlined className="mr-1" />
                      Repository URL
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Controls section */}
          <div className="flex flex-col gap-3 min-w-max">
            <div className="flex flex-wrap gap-2 justify-end">
              <Radio.Group 
                value={timeRange} 
                onChange={handleTimeRangeChange}
                buttonStyle="solid"
                disabled={loading}
                optionType="button"
                className="shadow-sm"
              >
                <Radio.Button value="1w" className="font-medium">7 Days</Radio.Button>
                <Radio.Button value="1m" className="font-medium">30 Days</Radio.Button>
                <Radio.Button value="3m" className="font-medium">3 Months</Radio.Button>
                <Radio.Button value="1y" className="font-medium">1 Year</Radio.Button>
              </Radio.Group>
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh} 
                loading={loading}
                disabled={loading}
                className="shadow-sm font-medium"
              >
                Refresh
              </Button>
              
              <Dropdown 
                menu={{ items: menuItems }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <Button type="default" className="shadow-sm font-medium">
                  More <InfoCircleOutlined />
                </Button>
              </Dropdown>
            </div>
            
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              Viewing data for: <span className="font-medium">{timeRangeDisplay[timeRange]}</span>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="pt-2">
            <Skeleton.Button active size="small" className="w-full h-2" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;