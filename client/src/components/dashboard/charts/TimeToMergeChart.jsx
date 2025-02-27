import { Card, Empty } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const TimeToMergeChart = () => {
  const { metrics, selectedContributors } = useSelector(state => state.dashboard);
  
  if (!metrics.prTimeToMerge || metrics.prTimeToMerge.length === 0) {
    return (
      <Card title="Time to Merge (Hours)" className="h-full">
        <div className="h-64 flex items-center justify-center">
          <Empty description="No time to merge data available" />
        </div>
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
    value: '#13c2c2', // Default color for average
  };

  // Get all contributors from the data
  const contributors = Object.keys(chartData[0] || {}).filter(key => 
    key !== 'date' && key !== 'timestamp' && key !== 'value'
  );

  // Generate colors for each contributor
  const colorPalette = ['#13c2c2', '#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];
  contributors.forEach((contributor, index) => {
    contributorColors[contributor] = colorPalette[index % colorPalette.length];
  });

  return (
    <Card title="Time to Merge (Hours)" className="h-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          
          {/* If no specific contributors selected, show average */}
          {(selectedContributors.length === 0) && (
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Average" 
              stroke="#13c2c2" 
              activeDot={{ r: 8 }} 
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
                activeDot={{ r: 6 }}
              />
            ))
          }
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TimeToMergeChart;

