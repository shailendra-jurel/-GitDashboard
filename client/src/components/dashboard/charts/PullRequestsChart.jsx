// components/dashboard/charts/PullRequestsChart.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Typography, Empty, Spin } from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const { Title } = Typography;

const PullRequestsChart = () => {
  const { metrics, contributors, selectedContributors, loading } = useSelector(state => state.dashboard);
  
  // Get the team data
  const teamData = metrics.prMerged || [];
  
  // Get data for selected contributors
  const contributorsData = {};
  if (selectedContributors.length > 0 && metrics.contributorPRs) {
    selectedContributors.forEach(contributorId => {
      const contributor = contributors.find(c => c.id === contributorId);
      if (contributor && metrics.contributorPRs[contributorId]) {
        contributorsData[contributorId] = {
          name: contributor.login,
          data: metrics.contributorPRs[contributorId]
        };
      }
    });
  }
  
  // Generate random colors for contributors
  const getContributorColor = (index) => {
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-64">
          <Spin />
        </div>
      </Card>
    );
  }

  if (!teamData || teamData.length === 0) {
    return (
      <Card className="h-full">
        <Title level={4}>Pull Requests Merged</Title>
        <div className="flex items-center justify-center h-64">
          <Empty description="No data available" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <Title level={4}>Pull Requests Merged</Title>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={teamData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Team"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            
            {/* Render lines for selected contributors */}
            {Object.entries(contributorsData).map(([id, contributor], index) => (
              <Line
                key={id}
                type="monotone"
                data={contributor.data}
                dataKey="value"
                name={contributor.name}
                stroke={getContributorColor(index)}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PullRequestsChart;

