import { ForkOutlined, SearchOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Empty, Input, List, Spin, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRepositories, saveSelectedRepositories } from '../../store/slices/repositorySlice';

const { Title, Text } = Typography;
const { Search } = Input;

const RepositorySelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Use destructuring that matches your Redux store structure
  const { available: repositories, selected, loading, error } = useSelector(state => state.repositories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRepos, setFilteredRepos] = useState([]);

  // Fetch repositories when component mounts
  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  // Update filtered repositories when repositories or search term changes
  useEffect(() => {
    if (repositories && repositories.length > 0) {
      setFilteredRepos(
        repositories.filter(repo =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredRepos([]);
    }
  }, [repositories, searchTerm]);

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
    message.success('Repositories selected successfully');
    navigate('/dashboard');
  };

  // Handle loading state
  if (loading && (!repositories || repositories.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="mt-8 text-center">
        <Typography.Title level={3} className="text-red-500">
          Failed to load repositories
        </Typography.Title>
        <Typography.Text>
          Please check your connection and try again.
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Title level={2} className="mb-6">Select Repositories to Monitor</Title>
      
      <div className="mb-6">
        <Search
          placeholder="Search repositories..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      {filteredRepos.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={filteredRepos}
          renderItem={repo => (
            <List.Item>
              <Card 
                hoverable 
                className={`transition-all ${selected.some(r => r.id === repo.id) ? 'border-blue-500 border-2' : ''}`}
                onClick={() => handleSelectRepository(repo)}
              >
                <Checkbox 
                  checked={selected.some(r => r.id === repo.id)} 
                  className="float-right"
                  onChange={(e) => {
                    // Prevent event propagation to avoid double triggering with Card click
                    e.stopPropagation();
                    handleSelectRepository(repo);
                  }}
                />
                <Title level={4} className="mb-1">{repo.name}</Title>
                <Text type="secondary" ellipsis className="block mb-3">
                  {repo.description || 'No description available'}
                </Text>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">
                    <StarOutlined className="mr-1" />
                    {repo.stargazers_count || 0}
                  </span>
                  <span>
                    <ForkOutlined className="mr-1" />
                    {repo.forks_count || 0}
                  </span>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No repositories found" />
      )}
      
      <div className="mt-8 flex justify-between items-center">
        <Text>{selected.length} repositories selected</Text>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleContinue}
          disabled={selected.length === 0}
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default RepositorySelection;