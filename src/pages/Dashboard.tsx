import React from 'react';
import { Typography, Space, Button } from 'antd';
import { WhatsAppOutlined, RobotOutlined } from '@ant-design/icons';
import { InstanceManager } from '../components';
import { useNavigate } from 'react-router';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
    }}>
      {/* Welcome Header Section */}
      <div style={{ 
        marginBottom: 32,
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(18, 140, 126, 0.12) 100%)',
        borderRadius: 16,
        border: '1px solid rgba(37, 211, 102, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space align="center" size="middle">
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}>
              <WhatsAppOutlined style={{ fontSize: 26, color: '#fff' }} />
            </div>
            <div>
              <Title 
                level={3} 
                style={{ 
                  margin: 0,
                  fontSize: 'clamp(18px, 4vw, 24px)'
                }}
              >
                Gestiona tus Asistentes de WhatsApp
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Crea y administra tus conexiones con el Asistente de IA de ACO
              </Text>
            </div>
          </Space>
          <Button
            type="default"
            icon={<RobotOutlined />}
            onClick={() => navigate('/assistant-config')}
            size="large"
          >
            Configurar Asistente
          </Button>
        </div>
      </div>

      {/* Instance Manager Component */}
      <InstanceManager />
    </div>
  );
};
