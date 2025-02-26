// components/layout/Sidebar.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Typography, Spin, Empty } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { setCurrentRepository } from '../../store/slices/repositorySlice';
import { fetchDashboardData, fetchContributors } from '../../store/slices/dashboardSlice';

const { Text } = Typography;

const Sidebar = () => {
  const dispatch = useDispatch();
  const { selected, currentRepository, loading } = useSelector(state => state.repositories);
  const { timeRange } = useSelector(state => state.dashboard);

  const handleRepositorySelect = (repo) => {
    dispatch(setCurrentRepository(repo));
    dispatch(fetchDashboardData({ repoId: repo.id, timeRange }));
    dispatch(fetchContributors(repo.id));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-8">
        <Spin />
      </div>
    );
  }

  if (!selected || selected.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-8">
        <Empty 
          description="No repositories selected" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </div>
    );
  }

  return (
    <div className="border-r h-full py-4">
      <div className="px-4 mb-4">
        <Text strong className="text-gray-500 uppercase text-xs">
          Repositories
        </Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentRepository?.id.toString()]}
        className="border-r-0"
      >
        {selected.map(repo => (
          <Menu.Item 
            key={repo.id.toString()} 
            icon={<BookOutlined />}
            onClick={() => handleRepositorySelect(repo)}
          >
            <div className="truncate" title={repo.name}>
              {repo.name}
            </div>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default Sidebar;