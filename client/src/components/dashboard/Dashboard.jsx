import React, { useEffect, useState } from 'react';
import { 
  Spin, 
  Empty, 
  Breadcrumb, 
  Typography, 
  Tabs, 
  Button, 
  FloatButton, 
  Alert,
  Row,
  Col,
  theme
} from 'antd';
import { 
  HomeOutlined, 
  BookOutlined, 
  PlusOutlined, 
  ExclamationCircleOutlined,
  UpOutlined,
  GithubOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchContributors, fetchDashboardData } from '../../store/slices/dashboardSlice';
import { fetchRepositories } from '../../store/slices/repositorySlice';

// Components
import AppLayout from '../layout/AppLayout';
import Sidebar from '../layout/Sidebar';
import MetricsOverview from './MetricsOverview';
import BranchActivityChart from './charts/BranchActivityChart';
import PullRequestsChart from './charts/PullRequestsChart';
import TimeToMergeChart from './charts/TimeToMergeChart';
import ContributorsList from './ContributorsList';
import RepositoryHeader from './RepositoryHeader';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { selected, currentRepository, loading: repoLoading } = useSelector(state => state.repositories);
  const { loading: dashboardLoading, error, timeRange } = useSelector(state => state.dashboard);
  const [activeTab, setActiveTab] = useState('overview');
  const { token } = theme.useToken();
  const [fetchAttempts, setFetchAttempts] = useState(0);


  useEffect(() => {
    // Check if we need to load repositories
    if (!selected.length && !repoLoading && fetchAttempts <3) {
      setFetchAttempts(prev => prev+1);

      dispatch(fetchRepositories());
    }
  }, [dispatch, fetchAttempts, repoLoading, selected.length]);

  useEffect(() => {
    if (currentRepository) {
      // Consistent extraction of owner and repo name with fallbacks
      let ownerName;
      let repoName;

      // Handle different repository object structures
      if (currentRepository.full_name) {
        const parts = currentRepository.full_name.split('/');
        ownerName = parts[0];
        repoName = parts[1];
      } else if (currentRepository.fullName) {
        const parts = currentRepository.fullName.split('/');
        ownerName = parts[0];
        repoName = parts[1];
      } else {
        ownerName = currentRepository.owner?.login || 
                  currentRepository.owner?.name;
        repoName = currentRepository.name;
      }

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
      }
    }
  }, [dispatch, currentRepository, timeRange]);

  // Loader for repositories
  if (repoLoading && selected.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: token.colorBgContainer === '#ffffff' ? '#f6f8fa' : '#0d1117'
      }}>
        <div style={{
          padding: 32,
          textAlign: 'center',
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadius,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          maxWidth: '1200px'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: token.colorTextSecondary }}>
            Loading GitHub repositories...
          </div>
        </div>
      </div>
    );
  }

  // No repositories selected
  if (!repoLoading && selected.length === 0) {
    return (
      <AppLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 64px)',
          padding: 24
        }}>
          <div style={{
            padding: 40,
            textAlign: 'center',
            backgroundColor: token.colorBgContainer,
            borderRadius: token.borderRadius,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            maxWidth: '1200px'
          }}>
            <div style={{ fontSize: 48, marginBottom: 24, color: token.colorPrimary }}>
              <BookOutlined />
            </div>
            <Title level={3}>No repositories to analyze</Title>
            <Paragraph style={{ color: token.colorTextSecondary, marginBottom: 24 }}>
              Get started by selecting GitHub repositories you'd like to track and analyze.
            </Paragraph>
            <Link to="/select-repositories">
              <Button type="primary" size="large" icon={<PlusOutlined />}>
                Add Repositories
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <>
          <div style={{ marginBottom: 24 }}>
            <MetricsOverview />
          </div>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} xl={12}>
              <PullRequestsChart />
            </Col>
            <Col xs={24} xl={12}>
              <TimeToMergeChart />
            </Col>
          </Row>
          
          <div style={{ marginTop: 24 }}>
            <BranchActivityChart />
          </div>
        </>
      )
    },
    {
      key: 'contributors',
      label: 'Contributors',
      children: <ContributorsList />
    },
    {
      key: 'pulls',
      label: 'Pull Requests',
      children: (
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <PullRequestsChart fullWidth />
          </Col>
          <Col span={24}>
            <TimeToMergeChart fullWidth />
          </Col>
        </Row>
      )
    },
    {
      key: 'branches',
      label: 'Branches',
      children: <BranchActivityChart fullWidth />
    }
  ];

  // Breadcrumb for current repository
  const repositoryBreadcrumb = currentRepository && (
    <Breadcrumb items={[
      {
        title: <Link to="/dashboard"><HomeOutlined /> Dashboard</Link>,
      },
      {
        title: <Link to={`https://github.com/${currentRepository.owner?.login}`} target="_blank" rel="noopener noreferrer">
          {currentRepository.owner?.login}
        </Link>,
      },
      {
        title: <span style={{ fontWeight: 500 }}>{currentRepository.name}</span>,
      }
    ]} />
  );

  // Repository header content
  const repositoryHeader = currentRepository && (
    <RepositoryHeader repository={currentRepository} />
  );

  // No repository selected state
  const noRepositoryContent = !currentRepository && (
    <div style={{ 
      textAlign: 'center', 
      padding: 48,
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadius,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
    }}>
      <ExclamationCircleOutlined style={{ 
        fontSize: 48, 
        color: token.colorTextQuaternary,
        marginBottom: 24
      }} />
      <Title level={4} style={{ 
        fontWeight: 'normal', 
        color: token.colorTextSecondary,
        marginBottom: 16
      }}>
        Select a repository from the sidebar to view analytics
      </Title>
      <Paragraph style={{ 
        color: token.colorTextQuaternary,
        marginBottom: 24,
        maxWidth: '1200px',
        margin: '0 auto 24px'
      }}>
        Choose from your added repositories or add new ones to get started with detailed GitHub analytics
      </Paragraph>
      <Link to="/select-repositories">
        <Button type="primary" icon={<PlusOutlined />}>
          Add Repositories
        </Button>
      </Link>
    </div>
  );

  // Dashboard content
  const dashboardContent = currentRepository && (
    dashboardLoading ? (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: 300,
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadius,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: token.colorTextSecondary }}>
            Loading repository data...
          </div>
        </div>
      </div>
    ) : error ? (
      <Alert
        message="Error loading dashboard data"
        description={error}
        type="error"
        showIcon
        style={{ marginBottom: 24 }}
      />
    ) : (
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{
          backgroundColor: token.colorBgContainer,
          padding: 16,
          borderRadius: token.borderRadius,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}
      />
    )
  );

  return (
    <AppLayout
      sidebarContent={<Sidebar />}
      headerContent={repositoryHeader}
      breadcrumb={repositoryBreadcrumb}
    >
      <FloatButton.Group
        trigger="hover"
        style={{ right: 24, bottom: 24 }}
        icon={<GithubOutlined />}
      >
        <FloatButton 
          icon={<PlusOutlined />}
          tooltip="Add Repositories"
          onClick={() => window.location.href = '/select-repositories'}
        />
        <FloatButton.BackTop icon={<UpOutlined />} />
      </FloatButton.Group>
      
      {currentRepository ? dashboardContent : noRepositoryContent}
    </AppLayout>
  );
};

export default Dashboard;