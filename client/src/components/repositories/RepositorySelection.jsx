// components/repositories/RepositorySelection.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, List, Checkbox, Button, Typography, Input, Spin, Empty, message } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { fetchRepositories, saveSelectedRepositories } from '../../store/slices/repositorySlice';

const { Title, Text } = Typography;
const { Search } = Input;

const RepositorySelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { available, selected, loading, error } = useSelector(state => state.repositories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepos, setSelectedRepos] = useState([]);

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  useEffect(() => {
    if (selected.length > 0) {
      setSelectedRepos(selected.map(repo => repo.id));
    }
  }, [selected]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleToggleRepository = (repo) => {
    setSelectedRepos(prev => {
      if (prev.includes(repo.id)) {
        return prev.filter(id => id !== repo.id);
      } else {
        return [...prev, repo.id];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedRepos(available.map(repo => repo.id));
  };

  const handleDeselectAll = () => {
    setSelectedRepos([]);
  };

  const handleSaveSelection = async () => {
    if (selectedRepos.length === 0) {
      message.error('Please select at least one repository');
      return;
    }

    const selectedRepositories = available.filter(repo => selectedRepos.includes(repo.id));
    await dispatch(saveSelectedRepositories(selectedRepositories));
    message.success('Repositories selected successfully');
    navigate('/dashboard');
  };

  const filteredRepositories = available.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && available.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

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
    <div className="py-8">
      <Card className="shadow-md">
        <Title level={2}>Select Repositories</Title>
        <Text className="block mb-4">
          Choose the repositories you want to monitor in your dashboard
        </Text>

        <div className="mb-4 flex items-center space-x-2">
          <Search
            placeholder="Search repositories..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>

        <div className="mb-4 flex justify-between">
          <div>
            <Button onClick={handleSelectAll} className="mr-2">
              Select All
            </Button>
            <Button onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>
          <div>
            <Text className="mr-2">
              {selectedRepos.length} of {available.length} repositories selected
            </Text>
          </div>
        </div>

        {filteredRepositories.length > 0 ? (
          <List
            dataSource={filteredRepositories}
            renderItem={repo => (
              <List.Item
                key={repo.id}
                className={`border rounded-lg p-4 mb-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRepos.includes(repo.id) ? 'bg-blue-50 border-blue-300' : ''
                }`}
                onClick={() => handleToggleRepository(repo)}
              >
                <div className="flex items-center w-full">
                  <Checkbox
                    checked={selectedRepos.includes(repo.id)}
                    className="mr-4"
                    onChange={() => {}}
                  />
                  <div className="flex-grow">
                    <div className="font-semibold">{repo.name}</div>
                    {repo.description && (
                      <div className="text-gray-500 text-sm">{repo.description}</div>
                    )}
                  </div>
                  {selectedRepos.includes(repo.id) && (
                    <CheckCircleOutlined className="text-blue-500 text-lg" />
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No repositories found" />
        )}

        <div className="mt-6 flex justify-end">
          <Button
            type="primary"
            size="large"
            onClick={handleSaveSelection}
            disabled={selectedRepos.length === 0}
          >
            Continue to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RepositorySelection;