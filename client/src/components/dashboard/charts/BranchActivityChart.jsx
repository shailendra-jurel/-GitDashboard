import { BranchesOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Card, Empty, Radio, Skeleton, Tooltip, Typography, Segmented, Statistic } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart
} from 'recharts';

const { Title, Text } = Typography;

// Custom tooltip component for chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-700 font-medium mb-2 dark:text-gray-200">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center mb-1">
            <div 
              className="w-3 h-3 mr-2 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 mr-1 dark:text-gray-300">
              {entry.name}:
            </span>
            <span className="font-medium dark:text-white">{entry.value}</span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="border-t border-gray-200 mt-2 pt-2 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 rounded-sm bg-gray-400" />
              <span className="text-gray-600 mr-1 dark:text-gray-300">
                Total:
              </span>
              <span className="font-medium dark:text-white">
                {payload[0].value + payload[1].value}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const BranchActivityChart = ({ fullWidth = false }) => {
  const [viewType, setViewType] = useState('stacked');
  const [chartType, setChartType] = useState('area');
  const { metrics, loading } = useSelector(state => state.dashboard);
  
  // Get the branch activity data
  const branchData = metrics?.branchActivity || [];

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
  };

  if (loading) {
    return (
      <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <BranchesOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Branch Activity</Title>
        </div>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (!branchData || branchData.length === 0) {
    return (
      <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <BranchesOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Branch Activity</Title>
        </div>
        <Empty 
          description={
            <Text type="secondary" className="dark:text-gray-400">No branch activity data available</Text>
          } 
        />
      </Card>
    );
  }

  // Calculate totals for summary
  const totalCreated = branchData.reduce((sum, item) => sum + (item.created || 0), 0);
  const totalDeleted = branchData.reduce((sum, item) => sum + (item.deleted || 0), 0);
  const netChange = totalCreated - totalDeleted;
  
  // Calculate the percentage of the highest value for scaling
  const maxCreated = Math.max(...branchData.map(item => item.created || 0));
  const maxDeleted = Math.max(...branchData.map(item => item.deleted || 0));
  const maxValue = Math.max(maxCreated, maxDeleted);
  
  // Calculate completion percentage for deleted vs created
  const completionPercentage = totalCreated > 0 
    ? Math.round((totalDeleted / totalCreated) * 100) 
    : 0;

  return (
    <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center">
          <BranchesOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Branch Activity</Title>
          <Tooltip title="Shows branches created and deleted over time">
            <InfoCircleOutlined className="ml-2 text-gray-400 dark:text-gray-500" />
          </Tooltip>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Segmented
            options={[
              { value: 'area', label: 'Area' },
              { value: 'bar', label: 'Bar' }
            ]}
            value={chartType}
            onChange={setChartType}
            className="dark:bg-gray-700 dark:text-gray-300"
          />
          
          <Radio.Group 
            value={viewType} 
            onChange={handleViewTypeChange} 
            buttonStyle="solid"
            className="dark:bg-gray-700 dark:text-gray-300"
          >
            <Radio.Button value="stacked">Stacked</Radio.Button>
            <Radio.Button value="separate">Separate</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-purple-50 p-4 rounded-md border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
          <Statistic 
            title={<span className="text-gray-500 dark:text-gray-400">Branches Created</span>}
            value={totalCreated}
            valueStyle={{ color: '#2da44e', fontWeight: '600' }} 
            className="dark:text-white"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total new branches
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-md border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
          <Statistic 
            title={<span className="text-gray-500 dark:text-gray-400">Branches Deleted</span>}
            value={totalDeleted}
            valueStyle={{ color: '#cf222e', fontWeight: '600' }} 
            className="dark:text-white"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {completionPercentage}% completion rate
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-md border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800">
          <Statistic 
            title={<span className="text-gray-500 dark:text-gray-400">Net Branch Change</span>}
            value={netChange}
            prefix={netChange >= 0 ? '+' : ''}
            valueStyle={{ 
              color: netChange >= 0 ? '#2da44e' : '#cf222e', 
              fontWeight: '600' 
            }} 
            className="dark:text-white"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {netChange >= 0 ? 'Branch growth' : 'Branch reduction'}
          </div>
        </div>
      </div>
      
      <div className={fullWidth ? "h-96" : "h-80"}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={branchData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2da44e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2da44e" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorDeleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cf222e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#cf222e" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
              />
              <Area 
                type="monotone" 
                dataKey="created" 
                name="Branches Created" 
                stroke="#2da44e" 
                fillOpacity={1}
                fill="url(#colorCreated)" 
                stackId={viewType === 'stacked' ? '1' : undefined}
              />
              <Area 
                type="monotone" 
                dataKey="deleted" 
                name="Branches Deleted" 
                stroke="#cf222e" 
                fillOpacity={1}
                fill="url(#colorDeleted)" 
                stackId={viewType === 'stacked' ? '1' : undefined}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={branchData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
              />
              <Bar 
                dataKey="created" 
                name="Branches Created" 
                fill="#2da44e" 
                stackId={viewType === 'stacked' ? '1' : undefined}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="deleted" 
                name="Branches Deleted" 
                fill="#cf222e" 
                stackId={viewType === 'stacked' ? '1' : undefined}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BranchActivityChart;