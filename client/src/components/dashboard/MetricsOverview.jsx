import { 
  BranchesOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  PullRequestOutlined, 
  TeamOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Tooltip, Statistic, Typography, Progress } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

const { Text } = Typography;

const MetricCard = ({ 
  title, 
  value, 
  prefix, 
  suffix, 
  iconColor, 
  iconBackground, 
  tooltip, 
  loading,
  trend = null, // can be positive, negative, or null
  trendValue = null,
  trendSuffix = '%',
  progressValue = null
}) => {
  // Get trend direction styles
  const getTrendColor = () => {
    if (trend === 'positive') return 'text-green-500';
    if (trend === 'negative') return 'text-red-500';
    return 'text-gray-500';
  };
  
  const getTrendIcon = () => {
    if (trend === 'positive') return <ArrowUpOutlined />;
    if (trend === 'negative') return <ArrowDownOutlined />;
    return null;
  };

  return (
    <Card 
      className="h-full shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:bg-gray-800 dark:border-gray-700" 
      bordered={false}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</div>
            <Tooltip title={tooltip}>
              <div className="text-xs text-gray-500 cursor-help dark:text-gray-400">
                <InfoCircleOutlined />
              </div>
            </Tooltip>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="flex items-start">
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${iconBackground}`}
              >
                <span className={iconColor}>{prefix}</span>
              </div>
              
              <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white">
                  {value}
                  {suffix && <span className="text-sm font-normal text-gray-500 ml-1 dark:text-gray-400">{suffix}</span>}
                </div>
                
                {trend && trendValue !== null && (
                  <div className={`text-xs flex items-center mt-1 ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="ml-1">
                      {trendValue > 0 && '+'}{trendValue}{trendSuffix} from previous period
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {progressValue !== null && (
            <div className="mt-4">
              <Progress 
                percent={progressValue} 
                size="small" 
                showInfo={false}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {progressValue}% of total activity
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const MetricsOverview = () => {
  const { metrics, contributors, loading } = useSelector(state => state.dashboard);

  // Summary metrics
  const totalPRs = metrics?.summary?.totalPRs || 0;
  const mergedPRs = metrics?.summary?.mergedPRs || 0;
  const avgTimeToMergeHours = metrics?.summary?.avgTimeToMergeHours || 0;

  // Calculate merge percentage
  const mergePercentage = totalPRs > 0 ? ((mergedPRs / totalPRs) * 100).toFixed(1) : 0;

  // More detailed metrics
  const totalBranchActivity = metrics?.branchActivity?.reduce(
    (sum, item) => sum + (item.created || 0) + (item.deleted || 0), 
    0
  ) || 0;

  const totalContributors = contributors?.length || 0;

  // Calculate activity percentages for progress bars
  const totalActivity = totalPRs + totalBranchActivity + totalContributors;
  const prActivityPercentage = totalActivity > 0 ? Math.round((totalPRs / totalActivity) * 100) : 0;
  const branchActivityPercentage = totalActivity > 0 ? Math.round((totalBranchActivity / totalActivity) * 100) : 0;

  // Mock trends (you'd calculate these from real data)
  const prTrend = { direction: 'positive', value: 12.3 };
  const timeTrend = { direction: 'negative', value: 8.7 };
  const branchTrend = { direction: 'positive', value: 5.2 };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <div className="text-lg font-semibold text-gray-800 dark:text-white">Key Metrics</div>
        <Tooltip title="Data from the selected time period">
          <div className="text-sm text-gray-500 cursor-help flex items-center dark:text-gray-400">
            <InfoCircleOutlined className="mr-1" /> Performance Overview
          </div>
        </Tooltip>
      </div>
      
      <Row gutter={[20, 20]}>
        {/* Total Pull Requests */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <MetricCard 
            title="Total Pull Requests"
            value={totalPRs}
            prefix={<PullRequestOutlined className="text-xl" />}
            iconColor="text-white"
            iconBackground="bg-blue-500"
            tooltip="Total number of pull requests in the selected time period"
            loading={loading}
            trend={prTrend.direction}
            trendValue={prTrend.value}
            progressValue={prActivityPercentage}
          />
        </Col>

        {/* Merged Pull Requests */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <MetricCard 
            title="Merged Pull Requests"
            value={mergedPRs}
            suffix={`(${mergePercentage}%)`}
            prefix={<CheckCircleOutlined className="text-xl" />}
            iconColor="text-white"
            iconBackground="bg-green-500"
            tooltip="Number of successfully merged pull requests"
            loading={loading}
          />
        </Col>

        {/* Avg. Time to Merge */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <MetricCard 
            title="Avg. Time to Merge"
            value={avgTimeToMergeHours.toFixed(1)}
            suffix="hours"
            prefix={<ClockCircleOutlined className="text-xl" />}
            iconColor="text-white"
            iconBackground="bg-amber-500"
            tooltip="Average time to merge pull requests in hours"
            loading={loading}
            trend={timeTrend.direction}
            trendValue={timeTrend.value}
          />
        </Col>

        {/* Branch Activity */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <MetricCard 
            title="Branch Activity"
            value={totalBranchActivity}
            suffix="events"
            prefix={<BranchesOutlined className="text-xl" />}
            iconColor="text-white"
            iconBackground="bg-purple-500"
            tooltip="Total number of branches created and deleted"
            loading={loading}
            trend={branchTrend.direction}
            trendValue={branchTrend.value}
            progressValue={branchActivityPercentage}
          />
        </Col>

        {/* Contributors */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <MetricCard 
            title="Contributors"
            value={totalContributors}
            prefix={<TeamOutlined className="text-xl" />}
            iconColor="text-white"
            iconBackground="bg-red-500"
            tooltip="Number of unique contributors"
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  );
};

export default MetricsOverview;