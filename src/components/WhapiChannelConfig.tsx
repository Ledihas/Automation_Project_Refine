import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Spin, Typography, Alert, Divider, Tag, Steps } from 'antd';
import {
  CheckCircleOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  WhatsAppOutlined,
  QrcodeOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { whapiClient } from '../utility';
import { notify } from '../utility/notifications';

const { Title, Text, Paragraph } = Typography;

interface ChannelStatus {
  connected: boolean;
  phone?: string;
  name?: string;
  loading: boolean;
}

export const WhapiChannelConfig: React.FC = () => {
  const [status, setStatus] = useState<ChannelStatus>({
    connected: false,
    loading: true
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [configuring, setConfiguring] = useState(false);

  const qrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    checkStatus();
    return () => {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);

  const checkStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }));

    try {
      const result = await whapiClient.getMe();

      if (result.success && result.data) {
        setStatus({
          connected: true,
          phone: result.data.id || result.data.phone,
          name: result.data.pushname || result.data.name,
          loading: false
        });
        // Limpiar intervalos si está conectado
        if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        setQrCode(null);
      } else {
        setStatus({
          connected: false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus({
        connected: false,
        loading: false
      });
    }
  };

  const getQRCode = async () => {
    setLoadingQR(true);
    setQrCode(null);

    try {
      const result = await whapiClient.getQR();

      // Manejar error 409: canal ya autenticado
      if (result.error?.includes('409') || result.error?.includes('already authenticated')) {
        notify.info({
          message: 'Canal ya conectado',
          description: 'El canal de WhatsApp ya está autenticado. Actualizando estado...',
          duration: 5
        });
        await checkStatus();
        return;
      }

      // La API devuelve { status, expire, base64 }
      const qrBase64 = result.data?.base64 || result.data?.qr;
      
      if (result.success && qrBase64) {
        setQrCode(qrBase64);
        notify.success({
          message: 'QR generado',
          description: 'Escanea el código con WhatsApp',
          duration: 5
        });

        // Auto-actualizar QR cada 30 segundos
        qrIntervalRef.current = setInterval(async () => {
          const newQR = await whapiClient.getQR();
          // Si el canal ya está autenticado, detener y actualizar
          if (newQR.error?.includes('409') || newQR.error?.includes('already authenticated')) {
            if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            setQrCode(null);
            await checkStatus();
            return;
          }
          const newQrBase64 = newQR.data?.base64 || newQR.data?.qr;
          if (newQR.success && newQrBase64) {
            setQrCode(newQrBase64);
          }
        }, 30000);

        // Verificar conexión cada 5 segundos
        checkIntervalRef.current = setInterval(async () => {
          const meResult = await whapiClient.getMe();
          if (meResult.success && meResult.data) {
            if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            setQrCode(null);
            setStatus({
              connected: true,
              phone: meResult.data.id || meResult.data.phone,
              name: meResult.data.pushname || meResult.data.name,
              loading: false
            });
            notify.success({
              message: '¡Conectado!',
              description: 'WhatsApp conectado exitosamente'
            });
          }
        }, 5000);

      } else {
        notify.error({
          message: 'Error al obtener QR',
          description: result.error || 'No se pudo generar el código QR'
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo obtener el código QR'
      });
    } finally {
      setLoadingQR(false);
    }
  };

  const configureWebhook = async () => {
    setConfiguring(true);

    try {
      const webhookUrl = import.meta.env.VITE_WHAPI_WEBHOOK_URL;

      const result = await whapiClient.setWebhook(webhookUrl);

      if (result.success) {
        notify.success({
          message: 'Configuración actualizada',
          description: `Webhook configurado: ${webhookUrl}`,
          duration: 5
        });
      } else {
        notify.error({
          message: 'Error al configurar',
          description: result.error
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo configurar el canal'
      });
    } finally {
      setConfiguring(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);

    try {
      const result = await whapiClient.logout();

      if (result.success) {
        notify.success({
          message: 'Canal desconectado',
          description: 'El canal de WhatsApp se ha desconectado correctamente'
        });
        setStatus({
          connected: false,
          loading: false
        });
        setQrCode(null);
      } else {
        notify.error({
          message: 'Error al desconectar',
          description: result.error
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo desconectar el canal'
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const cancelQR = () => {
    if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    setQrCode(null);
  };

  if (status.loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 16 }}>Verificando estado del canal...</Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header con estado */}
      <Card style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: status.connected
                ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                : 'linear-gradient(135deg, #999 0%, #666 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WhatsAppOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>Canal de WhatsApp</Title>
              <Text type="secondary">Canal único empresarial</Text>
            </div>
          </Space>
          {status.connected ? (
            <Tag color="success" style={{ fontSize: 14, padding: '6px 16px' }}>
              <CheckCircleOutlined /> Conectado
            </Tag>
          ) : (
            <Tag color="warning" style={{ fontSize: 14, padding: '6px 16px' }}>
              Desconectado
            </Tag>
          )}
        </Space>
      </Card>

      {/* Estado conectado */}
      {status.connected && (
        <Card title="Canal activo">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>Número de WhatsApp:</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue" style={{ fontSize: 16, padding: '8px 16px' }}>
                  {status.phone || 'N/A'}
                </Tag>
              </div>
            </div>

            {status.name && (
              <div>
                <Text strong>Nombre:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{status.name}</Text>
                </div>
              </div>
            )}

            <Alert
              message="Canal conectado correctamente"
              description="El asistente ACO está recibiendo y respondiendo mensajes automáticamente."
              type="success"
              showIcon
            />

            <Divider />

            <Space>
              <Button
                icon={<LinkOutlined />}
                onClick={configureWebhook}
                loading={configuring}
              >
                Configurar webhook
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={checkStatus}
              >
                Actualizar estado
              </Button>
              <Button
                danger
                icon={<DisconnectOutlined />}
                onClick={handleDisconnect}
                loading={disconnecting}
              >
                Desconectar
              </Button>
            </Space>
          </Space>
        </Card>
      )}

      {/* Estado desconectado */}
      {!status.connected && (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
            <Alert
              message="Canal desconectado"
              description="Conecta un número de WhatsApp para comenzar a usar el asistente ACO."
              type="warning"
              showIcon
              style={{ width: '100%' }}
            />

            {!qrCode && (
              <Button
                type="primary"
                size="large"
                icon={<QrcodeOutlined />}
                onClick={getQRCode}
                loading={loadingQR}
              >
                Generar código QR
              </Button>
            )}

            {qrCode && (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <Title level={4}>Escanea este código QR</Title>

                <div style={{
                  maxWidth: 300,
                  margin: '0 auto',
                  padding: 20,
                  background: '#fff',
                  borderRadius: 12,
                  border: '2px solid #25D366'
                }}>
                  <img
                    src={qrCode}
                    alt="QR Code"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>

                <Steps
                  direction="vertical"
                  size="small"
                  current={-1}
                  style={{ textAlign: 'left', maxWidth: 400, margin: '24px auto 0' }}
                  items={[
                    {
                      title: 'Abre WhatsApp en tu teléfono',
                      description: 'Usa el dispositivo principal'
                    },
                    {
                      title: 'Ve a Dispositivos vinculados',
                      description: 'Menú → Dispositivos vinculados'
                    },
                    {
                      title: 'Vincular un dispositivo',
                      description: 'Toca "Vincular un dispositivo"'
                    },
                    {
                      title: 'Escanea el código',
                      description: 'Apunta la cámara al código QR'
                    }
                  ]}
                />

                <Button
                  style={{ marginTop: 24 }}
                  onClick={cancelQR}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* Info adicional */}
      <Card style={{ marginTop: 16 }}>
        <Alert
          message="Información importante"
          description={
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              <li>Este es el canal único para toda la empresa</li>
              <li>Una vez conectado, el asistente responderá automáticamente</li>
              <li>Los mensajes se procesan en: {import.meta.env.VITE_WHAPI_WEBHOOK_URL}</li>
              <li>No cierres sesión en WhatsApp Web/Desktop</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};
