// components/dashboard/Dashboard.js
import { Alert, Empty, Layout, Spin, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContributors, fetchDashboardData } from '../../store/slices/dashboardSlice';
import { fetchRepositories } from '../../store/slices/repositorySlice';
import Sidebar from '../layout/Sidebar';
import BranchActivityChart from './charts/BranchActivityChart';
import PullRequestsChart from './charts/PullRequestsChart';
import TimeToMergeChart from './charts/TimeToMergeChart';
import ContributorsList from './ContributorsList';
import DashboardHeader from './DashboardHeader';
import MetricsOverview from './MetricsOverview';

const { Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { selected, currentRepository, loading: repoLoading } = useSelector(state => state.repositories);
  const { loading: dashboardLoading, error, timeRange } = useSelector(state => state.dashboard);

  useEffect(() => {
    // Only fetch if no repositories are loaded
    if (!selected.length) {
      dispatch(fetchRepositories());
    }
  }, [dispatch, selected.length]);

 // Replace the second useEffect in Dashboard.jsx with this:
useEffect(() => {
  if (currentRepository) {
    // Consistent extraction of owner and repo name with fallbacks
    let ownerName;
    let repoName;

    // Handle different repository object structures
    if (currentRepository.full_name) {
      // For API response format
      const parts = currentRepository.full_name.split('/');
      ownerName = parts[0];
      repoName = parts[1];
    } else if (currentRepository.fullName) {
      // For custom format
      const parts = currentRepository.fullName.split('/');
      ownerName = parts[0];
      repoName = parts[1];
    } else {
      // Direct properties
      ownerName = currentRepository.owner?.login || 
                 currentRepository.owner?.name;
      repoName = currentRepository.name;
    }

    // Add debug logging
    console.log('Fetching dashboard data for:', { ownerName, repoName, timeRange });

    if (ownerName && repoName) {
      dispatch(fetchDashboardData({ 
        owner: ownerName,
        repo: repoName,
        timeRange 
      }));
      
      dispatch(fetchContributors({ 
        owner: ownerName,
        repo: repoName 
      }));
    } else {
      console.error('Missing repository information:', currentRepository);
    }
  }
}, [dispatch, currentRepository, timeRange]);

  if (repoLoading && selected.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!repoLoading && selected.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Empty 
          description="No repositories selected" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
        <Alert
          message="Please select at least one repository to monitor"
          type="info"
          action={
            <a href="/select-repositories" className="text-blue-500">
              Select Repositories
            </a>
          }
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Layout>
        <Sider
          width={250}
          theme="light"
          className="overflow-auto h-screen-minus-header"
          breakpoint="lg"
          collapsedWidth="0"
          zeroWidthTriggerStyle={{ top: 64 }}
        >
          <Sidebar />
        </Sider>
        <Content className="p-6">
          {currentRepository ? (
            <>
              <DashboardHeader repository={currentRepository} />
              
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Spin size="large" />
                </div>
              ) : error ? (
                <Alert
                  message="Error loading dashboard data"
                  description={error}
                  type="error"
                  className="mb-6"
                />
              ) : (
                <>
                  <MetricsOverview />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <PullRequestsChart />
                    <TimeToMergeChart />
                  </div>
                  
                  <div className="mb-6">
                    <BranchActivityChart />
                  </div>
                  
                  <ContributorsList />
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <Title level={3} className="text-gray-400">
                Select a repository to view dashboard
              </Title>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
