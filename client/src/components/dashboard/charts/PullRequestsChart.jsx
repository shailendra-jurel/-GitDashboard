import { InfoCircleOutlined, PullRequestOutlined } from '@ant-design/icons';
import { Card, Empty, Skeleton, Tooltip, Typography, Segmented, Tabs, Space, Tag } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line,
  LineChart,
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis,
  Area,
  AreaChart
} from 'recharts';

const { Title, Text, Paragraph } = Typography;

// Custom tooltip for chart
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
      </div>
    );
  }
  return null;
};

const PullRequestsChart = ({ fullWidth = false }) => {
  const [chartType, setChartType] = useState('bar');
  const { metrics, selectedContributors, loading } = useSelector(state => state.dashboard);
  
  if (loading) {
    return (
      <Card className="shadow-sm h-full dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <PullRequestOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Pull Request Activity</Title>
        </div>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }
  
  if (!metrics.prMerged || metrics.prMerged.length === 0) {
    return (
      <Card className="shadow-sm h-full dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <PullRequestOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Pull Request Activity</Title>
        </div>
        <Empty 
          description={
            <Text type="secondary" className="dark:text-gray-400">No pull request data available</Text>
          } 
        />
      </Card>
    );
  }

  // Filter data if contributors are selected
  const chartData = metrics.prMerged.map(item => {
    const filteredData = { ...item };
    
    if (selectedContributors.length > 0) {
      // Only keep the selected contributors' data
      Object.keys(filteredData).forEach(key => {
        // Skip date/time fields
        if (key !== 'date' && key !== 'timestamp' && key !== 'value') {
          if (!selectedContributors.includes(key)) {
            delete filteredData[key];
          }
        }
      });
    }
    
    return filteredData;
  });

  // Determine colors for different contributors
  const contributorColors = {
    value: '#0969da', // Default color for total (GitHub blue)
  };

  // Get all contributors from the data
  const contributors = Object.keys(chartData[0] || {}).filter(key => 
    key !== 'date' && key !== 'timestamp' && key !== 'value'
  );

  // Generate colors for each contributor - using GitHub-inspired colors
  const colorPalette = [
    '#0969da', // GitHub blue
    '#2da44e', // GitHub green
    '#8250df', // GitHub purple
    '#bf8700', // GitHub yellow
    '#cf222e', // GitHub red
    '#1f883d', // Another green
    '#6639ba', // Another purple
    '#9a6700', // Another yellow
  ];
  
  contributors.forEach((contributor, index) => {
    contributorColors[contributor] = colorPalette[index % colorPalette.length];
  });

  // Calculate the total PRs for the summary
  const totalPRCount = chartData.reduce((sum, item) => {
    if (selectedContributors.length > 0) {
      // Sum selected contributors
      let itemSum = 0;
      selectedContributors.forEach(contributor => {
        if (item[contributor]) {
          itemSum += item[contributor];
        }
      });
      return sum + itemSum;
    } else {
      // Use the total value
      return sum + (item.value || 0);
    }
  }, 0);

  // Average PRs per period
  const avgPRs = totalPRCount / (chartData.length || 1);

  // Determine highest value for Y-axis scaling
  const maxValue = chartData.reduce((max, item) => {
    if (selectedContributors.length > 0) {
      // Get sum of selected contributors for this item
      let itemSum = 0;
      selectedContributors.forEach(contributor => {
        if (item[contributor]) itemSum += item[contributor];
      });
      return Math.max(max, itemSum);
    }
    return Math.max(max, item.value || 0);
  }, 0);

  // Add 10% padding to the top
  const yAxisDomain = [0, Math.ceil(maxValue * 1.1)];

  return (
    <Card className="shadow-sm h-full dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center">
          <PullRequestOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Pull Request Activity</Title>
          <Tooltip title="Number of pull requests merged over time">
            <InfoCircleOutlined className="ml-2 text-gray-400 dark:text-gray-500" />
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{totalPRCount} PRs</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ~{avgPRs.toFixed(1)}/period
            </div>
          </div>
          
          <Segmented
            options={[
              { value: 'bar', label: 'Bar' },
              { value: 'line', label: 'Line' },
              { value: 'area', label: 'Area' }
            ]}
            value={chartType}
            onChange={setChartType}
            className="dark:bg-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      
      {selectedContributors.length > 0 && (
        <div className="mb-4 px-4 py-3 bg-blue-50 rounded-md border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
          <Space align="center" wrap>
            <Text className="text-gray-700 dark:text-gray-300">
              Showing data for {selectedContributors.length} selected contributor{selectedContributors.length !== 1 ? 's' : ''}:
            </Text>
            {selectedContributors.map(contributor => (
              <Tag 
                key={contributor} 
                className="mr-1"
                color="blue"
                style={{ backgroundColor: contributorColors[contributor], color: '#fff' }}
              >
                {contributor}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      
      <div className={fullWidth ? "h-96" : "h-72"}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
                domain={yAxisDomain}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
              />
              
              {/* If no specific contributors selected, show total */}
              {(selectedContributors.length === 0) && (
                <Bar 
                  dataKey="value" 
                  name="Total PRs" 
                  fill="#0969da"
                  radius={[4, 4, 0, 0]} 
                />
              )}
              
              {/* Otherwise show individual contributors */}
              {selectedContributors.length > 0 && contributors
                .filter(contributor => selectedContributors.includes(contributor))
                .map((contributor, index) => (
                  <Bar 
                    key={contributor}
                    dataKey={contributor}
                    name={contributor}
                    fill={contributorColors[contributor]}
                    radius={[4, 4, 0, 0]}
                    stackId={selectedContributors.length > 3 ? "stack" : undefined}
                  />
                ))
              }
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
                domain={yAxisDomain}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
              />
              
              {/* If no specific contributors selected, show total */}
              {(selectedContributors.length === 0) && (
                <Line 
                  type="monotone"
                  dataKey="value" 
                  name="Total PRs" 
                  stroke="#0969da"
                  strokeWidth={2}
                  dot={{ fill: '#0969da', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              
              {/* Otherwise show individual contributors */}
              {selectedContributors.length > 0 && contributors
                .filter(contributor => selectedContributors.includes(contributor))
                .map((contributor, index) => (
                  <Line
                    key={contributor}
                    type="monotone"
                    dataKey={contributor}
                    name={contributor}
                    stroke={contributorColors[contributor]}
                    strokeWidth={2}
                    dot={{ fill: contributorColors[contributor], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))
              }
            </LineChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                {(selectedContributors.length === 0) && (
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0969da" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0969da" stopOpacity={0.1}/>
                  </linearGradient>
                )}
                
                {selectedContributors.length > 0 && contributors
                  .filter(contributor => selectedContributors.includes(contributor))
                  .map((contributor) => (
                    <linearGradient 
                      key={`color-${contributor}`} 
                      id={`color-${contributor}`} 
                      x1="0" 
                      y1="0" 
                      x2="0" 
                      y2="1"
                    >
                      <stop offset="5%" stopColor={contributorColors[contributor]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={contributorColors[contributor]} stopOpacity={0.1}/>
                    </linearGradient>
                  ))
                }
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
                domain={yAxisDomain}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
              />
              
              {/* If no specific contributors selected, show total */}
              {(selectedContributors.length === 0) && (
                <Area 
                  type="monotone"
                  dataKey="value" 
                  name="Total PRs" 
                  stroke="#0969da"
                  fillOpacity={1}
                  fill="url(#colorTotal)" 
                />
              )}
              
              {/* Otherwise show individual contributors */}
              {selectedContributors.length > 0 && contributors
                .filter(contributor => selectedContributors.includes(contributor))
                .map((contributor, index) => (
                  <Area
                    key={contributor}
                    type="monotone"
                    dataKey={contributor}
                    name={contributor}
                    stroke={contributorColors[contributor]}
                    fillOpacity={1}
                    fill={`url(#color-${contributor})`}
                    stackId={selectedContributors.length > 3 ? "stack" : undefined}
                  />
                ))
              }
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PullRequestsChart;