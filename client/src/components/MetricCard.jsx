import React from 'react';
import { Card, Tooltip, Skeleton, theme } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined } from '@ant-design/icons';

const MetricCard = ({ 
  title, 
  value, 
  icon,
  iconColor,
  iconBackground,
  suffix, 
  tooltip, 
  loading,
  trend = null, // 'positive', 'negative', or null
  trendValue = null,
  trendSuffix = '%',
  footer = null,
  style = {}
}) => {
  const { token } = theme.useToken();
  
  // Get trend direction styles
  const getTrendColor = () => {
    if (trend === 'positive') return token.colorSuccess;
    if (trend === 'negative') return token.colorError;
    return token.colorTextSecondary;
  };
  
  const getTrendIcon = () => {
    if (trend === 'positive') return <ArrowUpOutlined />;
    if (trend === 'negative') return <ArrowDownOutlined />;
    return null;
  };

  return (
    <Card 
      style={{ 
        height: '100%',
        ...style
      }}
      bodyStyle={{ 
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      bordered
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: 12
          }}>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 500, 
              color: token.colorTextSecondary 
            }}>
              {title}
            </div>
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined style={{ 
                  color: token.colorTextSecondary,
                  cursor: 'help'
                }} />
              </Tooltip>
            )}
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'flex-start',
            flex: 1
          }}>
            {icon && (
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: token.borderRadius, 
                backgroundColor: iconBackground || token.colorPrimaryBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                color: iconColor || token.colorPrimary,
                fontSize: 20
              }}>
                {icon}
              </div>
            )}
            
            <div>
              <div style={{ 
                fontSize: 24, 
                fontWeight: 600, 
                color: token.colorText,
                lineHeight: 1.2
              }}>
                {value}
                {suffix && (
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: 400, 
                    color: token.colorTextSecondary,
                    marginLeft: 4
                  }}>
                    {suffix}
                  </span>
                )}
              </div>
              
              {trend && trendValue !== null && (
                <div style={{ 
                  fontSize: 12, 
                  display: 'flex', 
                  alignItems: 'center',
                  marginTop: 4,
                  color: getTrendColor()
                }}>
                  {getTrendIcon()}
                  <span style={{ marginLeft: 4 }}>
                    {trendValue > 0 && '+'}{trendValue}{trendSuffix} from previous period
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {footer && (
            <div style={{ marginTop: 12 }}>
              {footer}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default MetricCard;