import { Card, Empty } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PullRequestsChart = () => {
  const { metrics, selectedContributors } = useSelector(state => state.dashboard);
  
  if (!metrics.prMerged || metrics.prMerged.length === 0) {
    return (
      <Card title="Pull Request Activity" className="h-full">
        <div className="h-64 flex items-center justify-center">
          <Empty description="No pull request data available" />
        </div>
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
    value: '#1890ff', // Default color for total
  };

  // Get all contributors from the data
  const contributors = Object.keys(chartData[0] || {}).filter(key => 
    key !== 'date' && key !== 'timestamp' && key !== 'value'
  );

  // Generate colors for each contributor
  const colorPalette = ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];
  contributors.forEach((contributor, index) => {
    contributorColors[contributor] = colorPalette[index % colorPalette.length];
  });

  return (
    <Card title="Pull Request Activity" className="h-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          
          {/* If no specific contributors selected, show total */}
          {(selectedContributors.length === 0) && (
            <Bar dataKey="value" name="Total PRs" fill="#1890ff" />
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
              />
            ))
          }
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PullRequestsChart;

