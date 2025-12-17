import React from 'react';
import { Card, Row, Col, Space, Typography } from 'antd';
import { SettingOutlined, RobotOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { WhapiStatus, WhapiLabels, WhapiChatList } from '../components';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
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
              <Title level={3} style={{ margin: 0 }}>Dashboard - Asistente ACO</Title>
              <Text type="secondary">Panel de administración del asistente de IA</Text>
            </div>
          </Space>
          <WhapiStatus />
        </Space>
      </Card>

      {/* Etiquetas y Chats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <WhapiLabels />
        </Col>
        <Col xs={24} lg={14}>
          <WhapiChatList />
        </Col>
      </Row>

      {/* Accesos rápidos */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={() => navigate('/whapi-config')}
            style={{ cursor: 'pointer', height: '100%' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SettingOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>Configurar Canal</Title>
                <Text type="secondary">
                  Conectar/desconectar WhatsApp
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            hoverable
            onClick={() => navigate('/assistant-config')}
            style={{ cursor: 'pointer', height: '100%' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RobotOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>Configurar Asistente</Title>
                <Text type="secondary">
                  Personalizar comportamiento de IA
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
