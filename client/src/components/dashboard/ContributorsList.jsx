// components/dashboard/ContributorsList.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, List, Avatar, Button, Typography, Tooltip, Badge } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, UserOutlined } from '@ant-design/icons';
import { toggleContributor, clearSelectedContributors } from '../../store/slices/dashboardSlice';

const { Title, Text } = Typography;

const ContributorsList = () => {
  const dispatch = useDispatch();
  const { contributors, selectedContributors, loading } = useSelector(state => state.dashboard);

  const handleToggleContributor = (contributorId) => {
    dispatch(toggleContributor(contributorId));
  };

  const handleClearSelection = () => {
    dispatch(clearSelectedContributors());
  };

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <Title level={4} className="m-0">Contributors</Title>
          {selectedContributors.length > 0 && (
            <Button size="small" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          )}
        </div>
      }
      className="mb-6"
    >
      <List
        loading={loading}
        dataSource={contributors}
        renderItem={contributor => (
          <List.Item
            key={contributor.id}
            className={selectedContributors.includes(contributor.id) ? 'bg-blue-50' : ''}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={contributor.avatarUrl}>
                  {!contributor.avatarUrl && <UserOutlined />}
                </Avatar>
              }
              title={
                <div className="flex items-center">
                  <a 
                    href={contributor.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mr-2"
                  >
                    {contributor.login}
                  </a>
                  {contributor.name && (
                    <Text type="secondary" className="text-sm">
                      ({contributor.name})
                    </Text>
                  )}
                </div>
              }
              description={
                <div>
                  <Badge 
                    count={contributor.contributions} 
                    style={{ backgroundColor: '#108ee9' }}
                    showZero
                    className="mr-2"
                  />
                  <Text type="secondary" className="text-xs">
                    contributions
                  </Text>
                </div>
              }
            />
            <Tooltip title={selectedContributors.includes(contributor.id) ? "Hide contributions" : "Show contributions"}>
              <Button
                type={selectedContributors.includes(contributor.id) ? "primary" : "default"}
                shape="circle"
                icon={selectedContributors.includes(contributor.id) ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={() => handleToggleContributor(contributor.id)}
                size="small"
              />
            </Tooltip>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ContributorsList;