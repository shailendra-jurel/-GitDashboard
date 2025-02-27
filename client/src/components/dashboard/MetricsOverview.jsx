import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  PullRequestOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  BranchesOutlined, 
  UserOutlined 
} from '@ant-design/icons';

const MetricsOverview = () => {
  const { metrics, contributors } = useSelector(state => state.dashboard);

  // Summary metrics (from old version)
  const totalPRs = metrics?.summary?.totalPRs || 0;
  const mergedPRs = metrics?.summary?.mergedPRs || 0;
  const avgTimeToMergeHours = metrics?.summary?.avgTimeToMergeHours || 0;

  // Detailed metrics (from updated version)
  const totalMergedPRs = metrics?.prMerged?.reduce((sum, item) => sum + item.value, 0) || 0;

  const avgTimeToMerge = metrics?.prTimeToMerge?.length
    ? metrics.prTimeToMerge.reduce((sum, item) => sum + item.value, 0) / metrics.prTimeToMerge.length
    : 0;

  const totalBranchActivity = metrics?.branchActivity?.reduce(
    (sum, item) => sum + item.created + item.deleted, 
    0
  ) || 0;

  const totalContributors = contributors?.length || 0;

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        {/* Total Pull Requests */}
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Total Pull Requests"
              value={totalPRs}
              prefix={<PullRequestOutlined />}
            />
          </Card>
        </Col>

        {/* Merged Pull Requests */}
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Merged Pull Requests"
              value={mergedPRs}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        {/* Avg. Time to Merge (from summary) */}
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Avg. Time to Merge"
              value={avgTimeToMergeHours.toFixed(1)}
              suffix="hours"
              prefix={<ClockCircleOutlined />}
              precision={1}
            />
          </Card>
        </Col>

        {/* Avg. Time to Merge (calculated) */}
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full">
            <Statistic
              title="Avg. Time to Merge (Detailed)"
              value={avgTimeToMerge.toFixed(1)}
              suffix="hours"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        {/* Branch Activity */}
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

        {/* Contributors */}
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
