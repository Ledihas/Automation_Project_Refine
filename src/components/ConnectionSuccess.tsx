import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { CheckCircleOutlined, DashboardOutlined, WhatsAppOutlined, RobotOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ConnectionSuccessProps {
  instanceName: string;
  onContinue: () => void;
}

export const ConnectionSuccess: React.FC<ConnectionSuccessProps> = ({ 
  instanceName, 
  onContinue 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 150px)',
      padding: '24px'
    }}>
      <Card 
        style={{ 
          maxWidth: 520, 
          width: '100%',
          textAlign: 'center',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(37, 211, 102, 0.15)'
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Success Header */}
        <div style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          padding: '40px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)'
          }} />
          
          {/* Success Icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            position: 'relative'
          }}>
            <CheckCircleOutlined style={{ fontSize: 44, color: '#fff' }} />
          </div>

          <Title level={3} style={{ color: '#fff', margin: '0 0 8px' }}>
            ¡Conexión exitosa!
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
            Tu WhatsApp está listo
          </Text>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          {/* Instance Info */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 20px',
            backgroundColor: 'rgba(37, 211, 102, 0.08)',
            borderRadius: 12,
            border: '1px solid rgba(37, 211, 102, 0.2)',
            marginBottom: 24
          }}>
            <WhatsAppOutlined style={{ fontSize: 20, color: '#25D366', marginRight: 10 }} />
            <Text strong style={{ fontSize: 15 }}>{instanceName}</Text>
          </div>

          {/* Features */}
          <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 32 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: 'rgba(37, 211, 102, 0.05)',
              borderRadius: 12,
              textAlign: 'left'
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                flexShrink: 0
              }}>
                <RobotOutlined style={{ fontSize: 22, color: '#25D366' }} />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 2 }}>
                  Asistente IA Activo
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Responderá automáticamente a tus clientes
                </Text>
              </div>
            </div>

            <Paragraph type="secondary" style={{ 
              margin: 0, 
              padding: '12px 16px',
              backgroundColor: 'rgba(250, 173, 20, 0.08)',
              borderRadius: 8,
              border: '1px solid rgba(250, 173, 20, 0.2)',
              fontSize: 13
            }}>
              💡 Para desactivar el bot, elimina la instancia desde el panel de control
            </Paragraph>
          </Space>

          {/* CTA Button */}
          <Button
            type="primary"
            size="large"
            icon={<DashboardOutlined />}
            onClick={onContinue}
            block
            style={{ 
              height: 52,
              fontSize: 16,
              fontWeight: 500,
              borderRadius: 12
            }}
          >
            Ir al Panel de Control
          </Button>
        </div>
      </Card>
    </div>
  );
};
