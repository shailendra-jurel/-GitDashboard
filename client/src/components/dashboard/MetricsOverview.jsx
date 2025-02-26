// components/dashboard/MetricsOverview.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  PullRequestOutlined, 
  ClockCircleOutlined, 
  BranchesOutlined,
  UserOutlined 
} from '@ant-design/icons';

const MetricsOverview = () => {
  const { metrics } = useSelector(state => state.dashboard);
  const { contributors } = useSelector(state => state.dashboard);

  // Calculate metrics
  const totalPRs = metrics.prMerged.reduce((sum, item) => sum + item.value, 0);
  
  // Average PR merge time in hours
  const avgTimeToMerge = metrics.prTimeToMerge.length > 0
    ? metrics.prTimeToMerge.reduce((sum, item) => sum + item.value, 0) / metrics.prTimeToMerge.length
    : 0;
  
  // Total branch activity
  const totalBranchActivity = metrics.branchActivity.reduce((sum, item) => sum + item.created + item.deleted, 0);
  
  // Total contributors
  const totalContributors = contributors.length;

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Pull Requests Merged"
              value={totalPRs}
              prefix={<PullRequestOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Avg. Time to Merge"
              value={avgTimeToMerge.toFixed(1)}
              suffix="hours"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Branch Activity"
              value={totalBranchActivity}
              prefix={<BranchesOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Contributors"
              value={totalContributors}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MetricsOverview;

