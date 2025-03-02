import { 
  ClearOutlined, 
  FilterOutlined, 
  SearchOutlined, 
  TeamOutlined,
  UserOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CodeOutlined,
  AppstoreOutlined,
  BarsOutlined,
  GithubOutlined,
  ExportOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  Avatar, 
  Button, 
  Card, 
  Empty, 
  Input, 
  List, 
  Space, 
  Tag, 
  Tooltip, 
  Typography,
  Dropdown,
  Segmented,
  Badge,
  Skeleton,
  Alert
} from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedContributors, toggleContributor } from '../../store/slices/dashboardSlice';

const { Title, Text, Paragraph } = Typography;

const SORT_OPTIONS = {
  MOST_CONTRIBUTIONS: 'most-contributions',
  LEAST_CONTRIBUTIONS: 'least-contributions',
  ALPHABETICAL: 'alphabetical',
};

const ContributorsList = () => {
  const dispatch = useDispatch();
  const { contributors, selectedContributors, loading } = useSelector(state => state.dashboard);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.MOST_CONTRIBUTIONS);
  const [viewType, setViewType] = useState('grid');

  const handleToggleContributor = (contributor) => {
    dispatch(toggleContributor(contributor.login));
  };

  const handleClearFilters = () => {
    dispatch(clearSelectedContributors());
  };

  // Filter contributors based on search term
  const filteredContributors = contributors?.filter(contributor => 
    contributor.login.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Sort contributors based on selected option
  const sortedContributors = [...filteredContributors].sort((a, b) => {
    switch (sortOption) {
      case SORT_OPTIONS.MOST_CONTRIBUTIONS:
        return b.contributions - a.contributions;
      case SORT_OPTIONS.LEAST_CONTRIBUTIONS:
        return a.contributions - b.contributions;
      case SORT_OPTIONS.ALPHABETICAL:
        return a.login.localeCompare(b.login);
      default:
        return 0;
    }
  });

  const sortMenu = [
    {
      key: SORT_OPTIONS.MOST_CONTRIBUTIONS,
      label: 'Most contributions',
      icon: <SortDescendingOutlined />,
      onClick: () => setSortOption(SORT_OPTIONS.MOST_CONTRIBUTIONS)
    },
    {
      key: SORT_OPTIONS.LEAST_CONTRIBUTIONS,
      label: 'Least contributions',
      icon: <SortAscendingOutlined />,
      onClick: () => setSortOption(SORT_OPTIONS.LEAST_CONTRIBUTIONS)
    },
    {
      key: SORT_OPTIONS.ALPHABETICAL,
      label: 'Alphabetically',
      icon: <SortAscendingOutlined />,
      onClick: () => setSortOption(SORT_OPTIONS.ALPHABETICAL)
    }
  ];

  if (loading) {
    return (
      <Card 
        className="shadow-sm dark:bg-gray-800 dark:border-gray-700"
        title={
          <div className="flex items-center">
            <TeamOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
            <span className="dark:text-white">Contributors</span>
          </div>
        }
      >
        <Skeleton active />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton.Node key={i} active>
              <UserOutlined style={{ fontSize: 40 }} />
            </Skeleton.Node>
          ))}
        </div>
      </Card>
    );
  }

  if (!contributors || contributors.length === 0) {
    return (
      <Card 
        className="shadow-sm dark:bg-gray-800 dark:border-gray-700"
        title={
          <div className="flex items-center">
            <TeamOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
            <span className="dark:text-white">Contributors</span>
          </div>
        }
      >
        <Empty 
          description={
            <Text type="secondary" className="dark:text-gray-400">No contributor data available</Text>
          } 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  // Determine if list or grid view should be used
  const ContributorListItem = ({ contributor }) => (
    <List.Item 
      className={`
        border rounded-lg transition-all cursor-pointer
        ${selectedContributors.includes(contributor.login) 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600'}
      `}
      onClick={() => handleToggleContributor(contributor)}
    >
      <div className="flex items-center w-full p-3">
        <Avatar 
          src={contributor.avatar_url} 
          icon={<UserOutlined />}
          size={40}
          className="mr-3"
        />
        <div className="flex-grow">
          <div className="font-medium text-gray-800 dark:text-gray-200">{contributor.login}</div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <CodeOutlined className="mr-1" />
            {contributor.contributions} commits
          </div>
        </div>
        {selectedContributors.includes(contributor.login) && (
          <Badge status="processing" color="#1890ff" />
        )}
      </div>
    </List.Item>
  );

  const ContributorGridItem = ({ contributor }) => (
    <div 
      className={`
        border rounded-lg p-4 transition-all cursor-pointer hover:shadow-sm
        ${selectedContributors.includes(contributor.login) 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
          : 'hover:border-gray-300 border-gray-200 dark:border-gray-700 dark:hover:border-gray-600'}
      `}
      onClick={() => handleToggleContributor(contributor)}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar 
            src={contributor.avatar_url} 
            icon={<UserOutlined />}
            size={64}
            className="mb-3"
          />
          {selectedContributors.includes(contributor.login) && (
            <Badge 
              status="processing" 
              color="#1890ff"
              className="absolute top-0 right-0"
            />
          )}
        </div>
        
        <div className="font-medium text-gray-800 mb-1 truncate w-full dark:text-gray-200">
          {contributor.login}
        </div>
        
        <div className="flex flex-col gap-1 items-center">
          <Tag color="blue" className="dark:bg-blue-900/50">{contributor.contributions} commits</Tag>
          
          <a 
            href={`https://github.com/${contributor.login}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center mt-1"
          >
            <GithubOutlined className="mr-1" /> View Profile
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <Card 
      className="shadow-sm dark:bg-gray-800 dark:border-gray-700"
      title={
        <div className="flex items-center">
          <TeamOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <span className="dark:text-white">Contributors</span>
          {contributors.length > 0 && (
            <Tag color="blue" className="ml-2 dark:bg-blue-900/50">
              {contributors.length}
            </Tag>
          )}
        </div>
      }
      extra={
        <Space>
          {selectedContributors.length > 0 && (
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClearFilters}
              className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white"
            >
              Clear Filters
            </Button>
          )}
          
          <Segmented
            options={[
              {
                value: 'grid',
                icon: <AppstoreOutlined />
              },
              {
                value: 'list',
                icon: <BarsOutlined />
              }
            ]}
            value={viewType}
            onChange={setViewType}
            className="dark:bg-gray-700 dark:text-gray-300"
          />
        </Space>
      }
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex-grow max-w-md">
          <Input 
            placeholder="Search contributors..." 
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Dropdown menu={{ items: sortMenu }}>
            <Button className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              <Space>
                Sort
                {sortOption === SORT_OPTIONS.MOST_CONTRIBUTIONS && <SortDescendingOutlined />}
                {sortOption === SORT_OPTIONS.LEAST_CONTRIBUTIONS && <SortAscendingOutlined />}
                {sortOption === SORT_OPTIONS.ALPHABETICAL && <SortAscendingOutlined />}
              </Space>
            </Button>
          </Dropdown>
          
          <Tooltip title="Filter charts by contributor">
            <Button 
              type="primary" 
              ghost 
              icon={<FilterOutlined />}
              className="dark:text-blue-400 dark:border-blue-500 dark:hover:text-blue-300"
            >
              {selectedContributors.length} selected
            </Button>
          </Tooltip>
        </div>
      </div>
      
      {sortedContributors.length > 0 ? (
        viewType === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedContributors.map(contributor => (
              <ContributorGridItem key={contributor.login} contributor={contributor} />
            ))}
          </div>
        ) : (
          <List
            dataSource={sortedContributors}
            renderItem={contributor => (
              <ContributorListItem contributor={contributor} />
            )}
            grid={{ gutter: 16, column: 1 }}
          />
        )
      ) : (
        <Empty 
          description={
            <Text type="secondary" className="dark:text-gray-400">
              {searchTerm 
                ? "No contributors match your search" 
                : "No contributors available"}
            </Text>
          } 
        />
      )}
      
      {selectedContributors.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50">
          <Space align="center">
            <FilterOutlined className="text-blue-600 dark:text-blue-400" />
            <Text strong className="dark:text-gray-200">
              {selectedContributors.length} contributor{selectedContributors.length !== 1 ? 's' : ''} selected
            </Text>
            <Text type="secondary" className="hidden md:inline dark:text-gray-400">
              Charts will display data only for the selected contributors
            </Text>
            <Button 
              size="small" 
              type="text" 
              icon={<ClearOutlined />} 
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear
            </Button>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default ContributorsList;