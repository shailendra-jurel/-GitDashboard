// components/dashboard/DashboardHeader.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Radio, Space, Button, Tag } from 'antd';
import { GithubOutlined, ReloadOutlined } from '@ant-design/icons';
import { setTimeRange } from '../../store/slices/dashboardSlice';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';

const { Title, Text } = Typography;

const DashboardHeader = ({ repository }) => {
  const dispatch = useDispatch();
  const { timeRange, loading } = useSelector(state => state.dashboard);

  const handleTimeRangeChange = (e) => {
    const newTimeRange = e.target.value;
    dispatch(setTimeRange(newTimeRange));
    dispatch(fetchDashboardData({ repoId: repository.id, timeRange: newTimeRange }));
  };


  const handleRefresh = () => {
    dispatch(fetchDashboardData({ repoId: repository.id, timeRange }));
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="mb-4 md:mb-0">
          <Title level={3} className="mb-1">
            {repository.name}
          </Title>
          <Text className="text-gray-500">
            {repository.description || 'No description provided'}
          </Text>
          <div className="mt-2">
            <a 
              href={repository.htmlUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <GithubOutlined className="mr-1" />
              View on GitHub
            </a>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <Radio.Group 
            value={timeRange} 
            onChange={handleTimeRangeChange}
            optionType="button"
            buttonStyle="solid"
            className="mb-2 sm:mb-0 sm:mr-4"
          >
            <Radio.Button value="3months">3 Months</Radio.Button>
            <Radio.Button value="6months">6 Months</Radio.Button>
            <Radio.Button value="1year">1 Year</Radio.Button>
          </Radio.Group>
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="mt-2">
        <Space size="small">
          <Tag color="blue">{repository.language || 'Unknown'}</Tag>
          <Tag>{repository.visibility || 'private'}</Tag>
          {repository.isArchived && <Tag color="orange">Archived</Tag>}
        </Space>
      </div>
    </div>
  );
};

export default DashboardHeader;