import { ClearOutlined, FilterOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Empty, List, Tag } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedContributors, toggleContributor } from '../../store/slices/dashboardSlice';

const ContributorsList = () => {
  const dispatch = useDispatch();
  const { contributors, selectedContributors } = useSelector(state => state.dashboard);

  const handleToggleContributor = (contributor) => {
    dispatch(toggleContributor(contributor.login));
  };

  const handleClearFilters = () => {
    dispatch(clearSelectedContributors());
  };

  if (!contributors || contributors.length === 0) {
    return (
      <Card 
        title="Contributors" 
        className="mb-6"
        extra={
          <Button icon={<FilterOutlined />} disabled>
            Filter Charts
          </Button>
        }
      >
        <Empty description="No contributor data available" />
      </Card>
    );
  }

  return (
    <Card 
      title="Contributors" 
      className="mb-6"
      extra={
        selectedContributors.length > 0 ? (
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        ) : (
          <span className="text-gray-500">
            <FilterOutlined className="mr-2" />
            Select contributors to filter charts
          </span>
        )
      }
    >
      <List
        grid={{ gutter: 16, column: 4, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={contributors}
        renderItem={contributor => (
          <List.Item>
            <div 
              className={`
                border rounded-lg p-4 transition-all cursor-pointer
                ${selectedContributors.includes(contributor.login) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}
              `}
              onClick={() => handleToggleContributor(contributor)}
            >
              <div className="flex items-center">
                <Avatar 
                  src={contributor.avatar_url} 
                  icon={<UserOutlined />}
                  size="large"
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{contributor.login}</div>
                  <Tag color="blue">{contributor.contributions} commits</Tag>
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ContributorsList;