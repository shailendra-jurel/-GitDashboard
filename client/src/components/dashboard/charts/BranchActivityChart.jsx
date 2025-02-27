import { Card, Empty, Radio, Spin, Typography } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const { Title } = Typography;

const BranchActivityChart = () => {
  const [viewType, setViewType] = React.useState('stacked');
  const { metrics, loading } = useSelector(state => state.dashboard);
  
  // Get the branch activity data
  const branchData = metrics.branchActivity || [];

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
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

  if (!branchData || branchData.length === 0) {
    return (
      <Card className="h-full">
        <Title level={4}>Branch Activity</Title>
        <div className="flex items-center justify-center h-64">
          <Empty description="No data available" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="m-0">Branch Activity</Title>
        <Radio.Group value={viewType} onChange={handleViewTypeChange} buttonStyle="solid">
          <Radio.Button value="stacked">Stacked</Radio.Button>
          <Radio.Button value="grouped">Grouped</Radio.Button>
        </Radio.Group>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={branchData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="created" 
              name="Branches Created" 
              stroke="#52c41a" 
              fill="#52c41a" 
              fillOpacity={0.3} 
              stackId="1"
            />
            <Area 
              type="monotone" 
              dataKey="deleted" 
              name="Branches Deleted" 
              stroke="#f5222d" 
              fill="#f5222d" 
              fillOpacity={0.3} 
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BranchActivityChart;