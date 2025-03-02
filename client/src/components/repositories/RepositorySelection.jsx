import React, { useEffect, useState } from 'react';
import { 
  Input, 
  List, 
  Button, 
  Card, 
  Checkbox, 
  Empty, 
  Spin, 
  Typography, 
  message, 
  Tag, 
  Space, 
  Select, 
  Affix,
  Divider,
  Badge,
  theme
} from 'antd';
import { 
  SearchOutlined, 
  StarOutlined, 
  ForkOutlined, 
  PlusOutlined, 
  ArrowRightOutlined,
  HomeOutlined,
  FilterOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchRepositories, saveSelectedRepositories } from '../../store/slices/repositorySlice';
import AppLayout from '../layout/AppLayout';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const RepositorySelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { available: repositories, selected, loading, error } = useSelector(state => state.repositories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [sortOrder, setSortOrder] = useState('stars');
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private', 'forks'
  const { token } = theme.useToken();

  // Fetch repositories when component mounts
  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  // Update filtered repositories when repositories or search/filter criteria changes
  useEffect(() => {
    if (repositories && repositories.length > 0) {
      // First apply search filter
      let filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      // Then apply type filter
      if (filter === 'public') {
        filtered = filtered.filter(repo => !repo.private);
      } else if (filter === 'private') {
        filtered = filtered.filter(repo => repo.private);
      } else if (filter === 'forks') {
        filtered = filtered.filter(repo => repo.fork);
      }
      
      // Then sort
      filtered = [...filtered].sort((a, b) => {
        switch (sortOrder) {
          case 'stars':
            return (b.stargazers_count || 0) - (a.stargazers_count || 0);
          case 'forks':
            return (b.forks_count || 0) - (a.forks_count || 0);
          case 'updated':
            return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
      
      setFilteredRepos(filtered);
    } else {
      setFilteredRepos([]);
    }
  }, [repositories, searchTerm, sortOrder, filter]);

  const handleSearch = value => {
    setSearchTerm(value);
  };

  // Toggle repository selection
  const handleSelectRepository = (repo) => {
    const isSelected = selected.some(r => r.id === repo.id);
    const newSelected = isSelected
      ? selected.filter(r => r.id !== repo.id)
      : [...selected, repo];
    
    dispatch(saveSelectedRepositories(newSelected));
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      message.error('Please select at least one repository');
      return;
    }
    message.success(`${selected.length} repositories selected successfully`);
    navigate('/dashboard');
  };

  // Handle clearing all selections
  const handleClearSelections = () => {
    dispatch(saveSelectedRepositories([]));
    message.info('All selections cleared');
  };

  // Breadcrumb component
  const breadcrumb = (
    <div style={{ marginBottom: 8 }}>
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', color: token.colorTextSecondary }}>
        <HomeOutlined style={{ marginRight: 4 }} /> Home
      </Link>
      <span style={{ margin: '0 8px', color: token.colorTextSecondary }}>/</span>
      <span style={{ fontWeight: 500 }}>Select Repositories</span>
    </div>
  );

  // Page title component
  const pageTitle = (
    <div>
      <Title level={3} style={{ margin: '0 0 8px 0' }}>Select Repositories</Title>
      <Paragraph style={{ color: token.colorTextSecondary, maxWidth: 600, margin: 0 }}>
        Choose which GitHub repositories you want to analyze and track in your dashboard
      </Paragraph>
    </div>
  );

  // Action buttons for header
  const headerActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      {selected.length > 0 && (
        <Button onClick={handleClearSelections}>
          Clear Selection ({selected.length})
        </Button>
      )}
      <Button 
        type="primary" 
        onClick={handleContinue}
        disabled={selected.length === 0}
        icon={<ArrowRightOutlined />}
      >
        Continue to Dashboard
      </Button>
    </div>
  );

  // Loading state
  if (loading && (!repositories || repositories.length === 0)) {
    return (
      <AppLayout
        breadcrumb={breadcrumb}
        pageTitle={pageTitle}
        showSidebar={false}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400 
        }}>
          <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: token.colorTextSecondary }}>
              Loading GitHub repositories...
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout
        breadcrumb={breadcrumb}
        pageTitle={pageTitle}
        showSidebar={false}
      >
        <Card>
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Title level={3} style={{ color: token.colorError }}>
              Failed to load repositories
            </Title>
            <Paragraph style={{ color: token.colorTextSecondary, marginBottom: 24 }}>
              Please check your connection and try again.
            </Paragraph>
            <Button type="primary" onClick={() => dispatch(fetchRepositories())}>
              Try Again
            </Button>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumb={breadcrumb}
      pageTitle={pageTitle}
      headerActions={headerActions}
      showSidebar={false}
    >
      <Card>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16, 
          marginBottom: 16 
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12 
          }}>
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              flexDirection: 'column', 
              flexWrap: 'wrap', 
              '@media (min-width: 768px)': { 
                flexDirection: 'row' 
              } 
            }}>
              <div style={{ flex: 1 }}>
                <Search
                  placeholder="Search repositories by name or description..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: 8, 
                flexWrap: 'wrap', 
                alignItems: 'center' 
              }}>
                <Select
                  defaultValue="all"
                  style={{ width: 140 }}
                  onChange={value => setFilter(value)}
                  size="large"
                >
                  <Option value="all">All Types</Option>
                  <Option value="public">Public Only</Option>
                  <Option value="private">Private Only</Option>
                  <Option value="forks">Forks Only</Option>
                </Select>
                
                <Select
                  defaultValue="stars"
                  style={{ width: 140 }}
                  onChange={value => setSortOrder(value)}
                  size="large"
                >
                  <Option value="stars">Sort by Stars</Option>
                  <Option value="forks">Sort by Forks</Option>
                  <Option value="updated">Sort by Updated</Option>
                  <Option value="name">Sort by Name</Option>
                </Select>
              </div>
            </div>
          </div>
          
          {selected.length > 0 && (
            <div style={{
              padding: 16,
              backgroundColor: token.colorPrimaryBg,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorPrimaryBorder}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: 12 
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge count={selected.length} overflowCount={99} color={token.colorPrimary}>
                    <Text strong style={{ marginRight: 12 }}>
                      Selected Repositories
                    </Text>
                  </Badge>
                  <div style={{ 
                    display: 'flex', 
                    gap: 4, 
                    flexWrap: 'wrap', 
                    maxWidth: 500, 
                    overflow: 'hidden' 
                  }}>
                    {selected.slice(0, 3).map(repo => (
                      <Tag key={repo.id}>
                        {repo.name}
                      </Tag>
                    ))}
                    {selected.length > 3 && (
                      <Tag>+{selected.length - 3} more</Tag>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={handleClearSelections}>
                    Clear All
                  </Button>
                  <Button 
                    type="primary"
                    onClick={handleContinue}
                    icon={<ArrowRightOutlined />}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          {filteredRepos.length > 0 ? (
            <List
              grid={{ 
                gutter: 16, 
                xs: 1, 
                sm: 1, 
                md: 2, 
                lg: 3, 
                xl: 3, 
                xxl: 4 
              }}
              dataSource={filteredRepos}
              renderItem={repo => (
                <List.Item>
                  <Card 
                    hoverable
                    onClick={() => handleSelectRepository(repo)}
                    style={{ 
                      cursor: 'pointer',
                      borderColor: selected.some(r => r.id === repo.id) 
                        ? token.colorPrimary 
                        : token.colorBorder,
                      boxShadow: selected.some(r => r.id === repo.id) 
                        ? `0 0 0 2px ${token.colorPrimaryBg}` 
                        : 'none',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          marginBottom: 12 
                        }}>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ 
                              fontWeight: 600, 
                              fontSize: 16, 
                              marginBottom: 4,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {repo.name}
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 8 
                            }}>
                              {repo.private && <Tag color="gold">Private</Tag>}
                              {repo.fork && <Tag color="purple">Fork</Tag>}
                            </div>
                          </div>
                          <Checkbox 
                            checked={selected.some(r => r.id === repo.id)} 
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginLeft: 12 }}
                          />
                        </div>
                        
                        <div style={{ 
                          color: token.colorTextSecondary, 
                          fontSize: 14, 
                          marginBottom: 12,
                          height: 42,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {repo.description || 'No description available'}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 16,
                          fontSize: 13,
                          color: token.colorTextSecondary
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <StarOutlined style={{ color: '#e3b341', marginRight: 4 }} />
                            {repo.stargazers_count || 0}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <ForkOutlined style={{ color: token.colorPrimary, marginRight: 4 }} />
                            {repo.forks_count || 0}
                          </span>
                          {repo.language && (
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                backgroundColor: '#3178c6', 
                                marginRight: 4 
                              }}></span>
                              {repo.language}
                            </span>
                          )}
                          {repo.updated_at && (
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarOutlined style={{ marginRight: 4 }} />
                              {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={
                <div>
                  <Text strong style={{ fontSize: 16 }}>No repositories found</Text>
                  <Paragraph style={{ color: token.colorTextSecondary }}>
                    Try adjusting your search or filter criteria
                  </Paragraph>
                </div>
              }
              style={{ padding: 48 }}
            />
          )}
        </div>
      </Card>
      
      {/* Fixed action bar at bottom of screen */}
      <Affix offsetBottom={0}>
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          backgroundColor: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge count={selected.length} overflowCount={99} color={token.colorPrimary}>
              <Text style={{ marginRight: 16 }}>Selected:</Text>
            </Badge>
            {selected.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.slice(0, 2).map(repo => (
                  <Tag key={repo.id} closable onClose={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectRepository(repo);
                  }}>
                    {repo.name}
                  </Tag>
                ))}
                {selected.length > 2 && (
                  <Tag>+{selected.length - 2} more</Tag>
                )}
              </div>
            ) : (
              <Text type="secondary">No repositories selected</Text>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {selected.length > 0 && (
              <Button onClick={handleClearSelections}>
                Clear All
              </Button>
            )}
            <Button 
              type="primary" 
              onClick={handleContinue}
              disabled={selected.length === 0}
              icon={<ArrowRightOutlined />}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </Affix>
    </AppLayout>
  );
};

export default RepositorySelection;