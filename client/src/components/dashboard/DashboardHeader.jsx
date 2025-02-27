import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Radio, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setTimeRange, fetchDashboardData  } from '../../store/slices/dashboardSlice';

const { Title } = Typography;

const DashboardHeader = ({ repository }) => {
  const dispatch = useDispatch();
  const { timeRange, loading } = useSelector(state => state.dashboard);

  const handleTimeRangeChange = (e) => {
    const newTimeRange = e.target.value;
    dispatch(setTimeRange(newTimeRange));
    dispatch(fetchDashboardData({ 
      owner: repository.owner.login, 
      repo: repository.name, 
      timeRange: newTimeRange 
    }));
  };

  const handleRefresh = () => {
    dispatch(fetchDashboardData({ 
      owner: repository.owner.login, 
      repo: repository.name, 
      timeRange 
    }));
  };

  return (
    <div className="mb-6">
      <Breadcrumb className="mb-2">
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>{repository.owner.login}</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>{repository.name}</span>
        </Breadcrumb.Item>
      </Breadcrumb>
      
      <div className="flex flex-wrap justify-between items-center">
        <Title level={2} className="mb-0">
          {repository.name}
        </Title>
        
        <div className="flex items-center">
            <Radio.Group 
                  value={timeRange} 
                  onChange={handleTimeRangeChange}
                  buttonStyle="solid"
                  className="mr-4"
             >
            <Radio.Button value="1w">7 Days</Radio.Button>
            <Radio.Button value="1m">30 Days</Radio.Button>
            <Radio.Button value="3m">3 Months</Radio.Button>
            <Radio.Button value="1y">1 Year</Radio.Button>
          </Radio.Group>
          
          <Link to="/select-repositories">
            <Button icon={<SettingOutlined />}>Change Repository</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;