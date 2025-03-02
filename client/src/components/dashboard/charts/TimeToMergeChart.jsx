import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Card, Empty, Skeleton, Tooltip, Typography, Segmented, Space, Tag, Statistic } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart,
  Bar,
  BarChart,
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
            <span className="font-medium dark:text-white">{entry.value.toFixed(1)} hours</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TimeToMergeChart = ({ fullWidth = false }) => {
  const [chartType, setChartType] = useState('line');
  const { metrics, selectedContributors, loading } = useSelector(state => state.dashboard);
  
  if (loading) {
    return (
      <Card className="shadow-sm h-full dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <ClockCircleOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Time to Merge</Title>
        </div>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }
  
  if (!metrics.prTimeToMerge || metrics.prTimeToMerge.length === 0) {
    return (
      <Card className="shadow-sm h-full dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <ClockCircleOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Time to Merge</Title>
        </div>
        <Empty 
          description={
            <Text type="secondary" className="dark:text-gray-400">No time to merge data available</Text>
          } 
        />
      </Card>
    );
  }

  // Filter data if contributors are selected
  const chartData = metrics.prTimeToMerge.map(item => {
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
    value: '#2da44e', // Default color for average (GitHub green)
  };

  // Get all contributors from the data
  const contributors = Object.keys(chartData[0] || {}).filter(key => 
    key !== 'date' && key !== 'timestamp' && key !== 'value'
  );

  // Generate colors for each contributor - using GitHub-inspired colors
  const colorPalette = [
    '#2da44e', // GitHub green
    '#0969da', // GitHub blue
    '#8250df', // GitHub purple
    '#bf8700', // GitHub yellow
    '#cf222e', // GitHub red
    '#1f883d', // Another green
    '#6639ba', // Another purple
  ];
  
  contributors.forEach((contributor, index) => {
    contributorColors[contributor] = colorPalette[index % colorPalette.length];
  });

  // Calculate average time to merge for the summary
  const avgTimeToMerge = selectedContributors.length > 0
    ? chartData.reduce((sum, item) => {
        let count = 0;
        let total = 0;
        selectedContributors.forEach(contributor => {
          if (item[contributor]) {
            total += item[contributor];
            count++;
          }
        });
        return count > 0 ? sum + (total / count) : sum;
      }, 0) / chartData.length
    : metrics.prTimeToMerge.reduce((sum, item) => sum + item.value, 0) / metrics.prTimeToMerge.length;

  // Find min and max time to merge
  const allValues = chartData.flatMap(item => {
    if (selectedContributors.length > 0) {
      return selectedContributors
        .filter(contributor => item[contributor] !== undefined)
        .map(contributor => item[contributor]);
    }
    return [item.value];
  }).filter(Boolean);
  
  const minTimeToMerge = Math.min(...allValues);
  const maxTimeToMerge = Math.max(...allValues);

  // Calculate improvement from average to min
  const improvementPercentage = avgTimeToMerge > 0 
    ? ((avgTimeToMerge - minTimeToMerge) / avgTimeToMerge * 100).toFixed(1)
    : 0;

  return (
    <Card className="shadow-sm h-full dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-gray-500 dark:text-gray-400" />
          <Title level={4} className="m-0 dark:text-white">Time to Merge</Title>
          <Tooltip title="Average time (in hours) to merge pull requests">
            <InfoCircleOutlined className="ml-2 text-gray-400 dark:text-gray-500" />
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {avgTimeToMerge.toFixed(1)} hours avg
            </div>
          </div>
          
          <Segmented
            options={[
              { value: 'line', label: 'Line' },
              { value: 'bar', label: 'Bar' },
              { value: 'area', label: 'Area' }
            ]}
            value={chartType}
            onChange={setChartType}
            className="dark:bg-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      
      {selectedContributors.length > 0 && (
        <div className="mb-4 px-4 py-3 bg-green-50 rounded-md border border-green-100 dark:bg-green-900/20 dark:border-green-800">
          <Space align="center" wrap>
            <Text className="text-gray-700 dark:text-gray-300">
              Showing data for {selectedContributors.length} selected contributor{selectedContributors.length !== 1 ? 's' : ''}:
            </Text>
            {selectedContributors.map(contributor => (
              <Tag 
                key={contributor} 
                className="mr-1"
                color="green"
                style={{ backgroundColor: contributorColors[contributor], color: '#fff' }}
              >
                {contributor}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 p-4 rounded-md border border-green-100 dark:bg-green-900/20 dark:border-green-800">
          <Statistic 
            title={<span className="text-gray-500 dark:text-gray-400">Average Time</span>}
            value={avgTimeToMerge.toFixed(1)}
            suffix="hours"
            valueStyle={{ color: '#2da44e', fontWeight: '600' }} 
            className="dark:text-white"
          />
        </div>
        <div className="bg-green-50 p-4 rounded-md border border-green-100 dark:bg-green-900/20 dark:border-green-800">
          <Statistic 
            title={<span className="text-gray-500 dark:text-gray-400">Minimum Time</span>}
            value={minTimeToMerge.toFixed(1)}
            suffix="hours"
            valueStyle={{ color: '#0969da', fontWeight: '600' }} 
            className="dark:text-white"
          />
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {improvementPercentage}% faster than average
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-md border border-green-100 dark:bg-green-900/20 dark:border-green-800">
          <Statistic 
            title={<span className="text-gray-500 dark:text-gray-400">Maximum Time</span>}
            value={maxTimeToMerge.toFixed(1)}
            suffix="hours"
            valueStyle={{ color: '#cf222e', fontWeight: '600' }} 
            className="dark:text-white"
          />
        </div>
      </div>
      
      <div className={fullWidth ? "h-96" : "h-72"}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
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
              
              {/* If no specific contributors selected, show average */}
              {(selectedContributors.length === 0) && (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Average" 
                  stroke="#2da44e" 
                  strokeWidth={2}
                  dot={{ fill: '#2da44e', r: 4 }}
                  activeDot={{ r: 6, fill: '#1f883d' }}
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
          ) : chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
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
              
              {/* If no specific contributors selected, show average */}
              {(selectedContributors.length === 0) && (
                <Bar 
                  dataKey="value" 
                  name="Average" 
                  fill="#2da44e"
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
                  />
                ))
              }
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2da44e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2da44e" stopOpacity={0.1}/>
                </linearGradient>
                
                {contributors
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
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
              />
              
              {/* If no specific contributors selected, show average */}
              {(selectedContributors.length === 0) && (
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Average" 
                  stroke="#2da44e"
                  fill="url(#colorValue)" 
                  fillOpacity={1}
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
                    fill={`url(#color-${contributor})`}
                    fillOpacity={1}
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

export default TimeToMergeChart;