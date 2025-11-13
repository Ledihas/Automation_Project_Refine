import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { CheckCircleOutlined, DashboardOutlined } from '@ant-design/icons';

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
      minHeight: '100vh',
      padding: '24px'
    }}>
      <Card 
        style={{ 
          maxWidth: '600px', 
          width: '100%',
          textAlign: 'center',
          borderRadius: '8px'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Success Icon */}
          <CheckCircleOutlined 
            style={{ 
              fontSize: '72px', 
              color: '#4CAF50',
              marginBottom: '8px'
            }} 
          />

          {/* Main Heading */}
          <Title level={2} style={{ marginBottom: '8px', color: '#4CAF50' }}>
            ¡Conectado exitosamente al Asistente de IA de ACO!
          </Title>

          {/* Instance Name */}
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Instancia: <Text strong>{instanceName}</Text>
          </Text>

          {/* Information Text */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f6ffed', 
            borderRadius: '8px',
            border: '1px solid #b7eb8f',
            marginTop: '16px'
          }}>
            <Paragraph style={{ marginBottom: '12px', fontSize: '15px' }}>
              Tu asistente de IA está activo y responderá automáticamente a tus clientes en WhatsApp.
            </Paragraph>
          </div>

          {/* Instruction Text */}
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fff7e6', 
            borderRadius: '8px',
            border: '1px solid #ffd591',
            marginTop: '8px'
          }}>
            <Paragraph style={{ marginBottom: 0, fontSize: '14px' }}>
              <Text strong>Nota:</Text> Para desactivar el bot, elimina la instancia desde el panel de control.
            </Paragraph>
          </div>

          {/* Continue Button */}
          <Button
            type="primary"
            size="large"
            icon={<DashboardOutlined />}
            onClick={onContinue}
            style={{ 
              marginTop: '24px',
              height: '48px',
              fontSize: '16px',
              fontWeight: 500
            }}
          >
            Ir al Panel de Control
          </Button>
        </Space>
      </Card>
    </div>
  );
};
