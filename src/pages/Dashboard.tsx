import React from 'react';
import { Typography, Space } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import { InstanceManager } from '../components';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
    }}>
      {/* Welcome Header Section */}
      <Space 
        direction="vertical" 
        size="small" 
        style={{ 
          marginBottom: '32px',
          width: '100%'
        }}
      >
        <Space align="center" size="middle">
          <WhatsAppOutlined 
            style={{ 
              fontSize: '32px', 
              color: '#25D366' 
            }} 
          />
          <Title 
            level={2} 
            style={{ 
              margin: 0,
              fontSize: 'clamp(20px, 4vw, 28px)'
            }}
          >
            Gestiona tus Asistentes de WhatsApp
          </Title>
        </Space>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: '14px',
            display: 'block',
            marginLeft: '44px'
          }}
        >
          Crea y administra tus conexiones con el Asistente de IA de ACO
        </Text>
      </Space>

      {/* Instance Manager Component */}
      <InstanceManager />
    </div>
  );
};
