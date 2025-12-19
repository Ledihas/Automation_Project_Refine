import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Switch,
  Typography,
  Space,
  Spin,
  Tooltip,
  Tag,
  Divider,
  Row,
  Col,
  Alert,
  Checkbox,
} from 'antd';
import type { CheckboxOptionType } from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UndoOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloudOutlined,
  GlobalOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { notify } from '../utility/notifications';

const { Title, Text } = Typography;

// Tipos para la configuración de Whapi
interface WebhookEvent {
  type: string;
  method: string;
}

interface WebhookConfig {
  url: string;
  events: WebhookEvent[];
  mode: string;
  headers?: Record<string, string>;
}

interface MediaConfig {
  auto_download: string[];
  init_avatars: boolean;
}

interface WhapiSettings {
  media: MediaConfig;
  webhooks: WebhookConfig[];
  offline_mode: boolean;
  full_history: boolean;
  proxy?: string;
}

const WHAPI_URL = import.meta.env.VITE_WHAPI_API_URL || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = import.meta.env.VITE_WHAPI_TOKEN;

const DEFAULT_WEBHOOK_URL = 'https://n8m.agentedecargaonline.com/webhook/8efdc19f-6581-4811-aa80-fbb321082d1e/webhook';

const defaultSettings: WhapiSettings = {
  media: {
    auto_download: ['image', 'audio', 'voice', 'document'],
    init_avatars: true,
  },
  webhooks: [
    {
      url: DEFAULT_WEBHOOK_URL,
      events: [{ type: 'messages', method: 'post' }],
      mode: 'body',
    },
  ],
  offline_mode: true,
  full_history: true,
  proxy: '',
};

const mediaOptions: CheckboxOptionType[] = [
  { label: 'Imágenes', value: 'image' },
  { label: 'Audio', value: 'audio' },
  { label: 'Notas de voz', value: 'voice' },
  { label: 'Documentos', value: 'document' },
];

export const AssistantConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedConfig, setSavedConfig] = useState<WhapiSettings>(defaultSettings);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Cargar configuración actual desde Whapi
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`${WHAPI_URL}/settings`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${WHAPI_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const config: WhapiSettings = {
        media: {
          auto_download: data.media?.auto_download || defaultSettings.media.auto_download,
          init_avatars: data.media?.init_avatars ?? defaultSettings.media.init_avatars,
        },
        webhooks: data.webhooks?.length > 0 ? data.webhooks : defaultSettings.webhooks,
        offline_mode: data.offline_mode ?? defaultSettings.offline_mode,
        full_history: data.full_history ?? defaultSettings.full_history,
        proxy: data.proxy || '',
      };

      // Mapear a campos del formulario
      form.setFieldsValue({
        auto_download: config.media.auto_download,
        init_avatars: config.media.init_avatars,
        webhook_url: config.webhooks[0]?.url || '',
        offline_mode: config.offline_mode,
        full_history: config.full_history,
        proxy: config.proxy,
      });

      setSavedConfig(config);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading config:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setLoadError(errorMsg);
      notify.error({
        message: 'Error al cargar configuración',
        description: errorMsg,
      });
      // Usar valores por defecto si falla la carga
      form.setFieldsValue({
        auto_download: defaultSettings.media.auto_download,
        init_avatars: defaultSettings.media.init_avatars,
        webhook_url: defaultSettings.webhooks[0]?.url || '',
        offline_mode: defaultSettings.offline_mode,
        full_history: defaultSettings.full_history,
        proxy: defaultSettings.proxy,
      });
      setSavedConfig(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Guardar configuración en Whapi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: WhapiSettings = {
        media: {
          auto_download: values.auto_download || [],
          init_avatars: values.init_avatars ?? true,
        },
        webhooks: [
          {
            url: values.webhook_url,
            events: [{ type: 'messages', method: 'post' }],
            mode: 'body',
          },
        ],
        offline_mode: values.offline_mode ?? true,
        full_history: values.full_history ?? true,
      };

      // Solo agregar proxy si tiene valor
      if (values.proxy?.trim()) {
        payload.proxy = values.proxy.trim();
      }

      const response = await fetch(`${WHAPI_URL}/settings`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${WHAPI_TOKEN}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Config saved:', result);

      setSavedConfig(payload);
      setHasChanges(false);
      notify.success({
        message: '¡Configuración guardada!',
        description: 'Los cambios se aplicaron correctamente en Whapi.',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      notify.error({
        message: 'Error al guardar',
        description: errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  // Descartar cambios
  const handleDiscard = () => {
    form.setFieldsValue({
      auto_download: savedConfig.media.auto_download,
      init_avatars: savedConfig.media.init_avatars,
      webhook_url: savedConfig.webhooks[0]?.url || '',
      offline_mode: savedConfig.offline_mode,
      full_history: savedConfig.full_history,
      proxy: savedConfig.proxy,
    });
    setHasChanges(false);
    notify.info({
      message: 'Cambios descartados',
      description: 'Se restauró la última configuración guardada.',
    });
  };

  // Restaurar valores por defecto
  const handleRestoreDefaults = () => {
    form.setFieldsValue({
      auto_download: defaultSettings.media.auto_download,
      init_avatars: defaultSettings.media.init_avatars,
      webhook_url: defaultSettings.webhooks[0]?.url || '',
      offline_mode: defaultSettings.offline_mode,
      full_history: defaultSettings.full_history,
      proxy: defaultSettings.proxy,
    });
    setHasChanges(true);
    notify.warning({
      message: 'Valores por defecto cargados',
      description: 'Recuerda guardar para aplicar los cambios.',
    });
  };

  // Detectar cambios en el formulario
  const handleValuesChange = () => {
    setHasChanges(true);
  };

  // Tab 1: Webhook y Conexiones
  const renderWebhookTab = () => (
    <div>
      <Alert
        message="Configuración del Webhook"
        description="El webhook recibe los mensajes entrantes de WhatsApp para procesarlos con tu asistente."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        name="webhook_url"
        label={
          <Space>
            <span>URL del Webhook</span>
            <Tooltip title="URL donde se enviarán los mensajes entrantes de WhatsApp">
              <InfoCircleOutlined style={{ color: '#8696A0' }} />
            </Tooltip>
          </Space>
        }
        rules={[
          { required: true, message: 'La URL del webhook es requerida' },
          { type: 'url', message: 'Ingresa una URL válida' },
        ]}
      >
        <Input
          placeholder="https://tu-servidor.com/webhook"
          style={{ maxWidth: 600 }}
        />
      </Form.Item>

      <Divider />

      <Form.Item
        name="proxy"
        label={
          <Space>
            <span>Proxy (opcional)</span>
            <Tag color="blue">Avanzado</Tag>
            <Tooltip title="Proxy SOCKS5 para la conexión. Formato: socks5://user:pass@host:port">
              <InfoCircleOutlined style={{ color: '#8696A0' }} />
            </Tooltip>
          </Space>
        }
      >
        <Input
          placeholder="socks5://usuario:contraseña@host:puerto"
          style={{ maxWidth: 600 }}
        />
      </Form.Item>
    </div>
  );

  // Tab 2: Media y Descargas
  const renderMediaTab = () => (
    <div>
      <Alert
        message="Descarga automática de medios"
        description="Selecciona qué tipos de archivos se descargarán automáticamente cuando lleguen mensajes."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        name="auto_download"
        label={
          <Space>
            <span>Tipos de media a descargar</span>
            <Tooltip title="Los archivos seleccionados se descargarán automáticamente">
              <InfoCircleOutlined style={{ color: '#8696A0' }} />
            </Tooltip>
          </Space>
        }
      >
        <Checkbox.Group options={mediaOptions} />
      </Form.Item>

      <Divider />

      <Form.Item
        name="init_avatars"
        label={
          <Space>
            <span>Cargar avatares de contactos</span>
            <Tooltip title="Descarga las fotos de perfil de los contactos automáticamente">
              <InfoCircleOutlined style={{ color: '#8696A0' }} />
            </Tooltip>
          </Space>
        }
        valuePropName="checked"
      >
        <Switch checkedChildren="Sí" unCheckedChildren="No" />
      </Form.Item>
    </div>
  );

  // Tab 3: Comportamiento
  const renderBehaviorTab = () => (
    <div>
      <Alert
        message="Configuración de comportamiento"
        description="Estos ajustes controlan cómo el canal de WhatsApp maneja las conexiones y el historial."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="offline_mode"
            label={
              <Space>
                <span>Modo offline</span>
                <Tooltip title="Permite recibir mensajes incluso cuando el dispositivo principal está desconectado">
                  <InfoCircleOutlined style={{ color: '#8696A0' }} />
                </Tooltip>
              </Space>
            }
            valuePropName="checked"
          >
            <Switch checkedChildren="Activado" unCheckedChildren="Desactivado" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recomendado: Activado para no perder mensajes
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="full_history"
            label={
              <Space>
                <span>Historial completo</span>
                <Tooltip title="Sincroniza todo el historial de mensajes al conectar">
                  <InfoCircleOutlined style={{ color: '#8696A0' }} />
                </Tooltip>
              </Space>
            }
            valuePropName="checked"
          >
            <Switch checkedChildren="Activado" unCheckedChildren="Desactivado" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recomendado: Activado para tener contexto completo
          </Text>
        </Col>
      </Row>
    </div>
  );

  const tabItems = [
    {
      key: 'webhook',
      label: (
        <Space>
          <GlobalOutlined />
          Webhook
        </Space>
      ),
      children: renderWebhookTab(),
    },
    {
      key: 'media',
      label: (
        <Space>
          <DownloadOutlined />
          Media
        </Space>
      ),
      children: renderMediaTab(),
    },
    {
      key: 'behavior',
      label: (
        <Space>
          <SettingOutlined />
          Comportamiento
        </Space>
      ),
      children: renderBehaviorTab(),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Cargando configuración de Whapi...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CloudOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Configuración de Whapi</Title>
            <Text type="secondary">Ajustes del canal de WhatsApp</Text>
          </div>
          {hasChanges && (
            <Tag color="orange" icon={<ExclamationCircleOutlined />}>
              Cambios sin guardar
            </Tag>
          )}
          {!hasChanges && !loadError && (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Sincronizado
            </Tag>
          )}
        </div>
      </div>

      {loadError && (
        <Alert
          message="Error al cargar configuración"
          description={`${loadError}. Se están usando valores por defecto.`}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={loadConfig}>
              Reintentar
            </Button>
          }
        />
      )}

      <Card
        style={{ borderRadius: 16 }}
        styles={{ body: { padding: '24px' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          <Tabs items={tabItems} />
        </Form>
      </Card>

      {/* Footer con acciones */}
      <Card
        style={{
          marginTop: 16,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.02) 0%, rgba(37, 211, 102, 0.08) 100%)',
        }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Button
              icon={<UndoOutlined />}
              onClick={handleDiscard}
              disabled={!hasChanges || saving}
            >
              Descartar cambios
            </Button>
            <Button
              onClick={handleRestoreDefaults}
              disabled={saving}
            >
              Valores por defecto
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadConfig}
              disabled={saving}
            >
              Recargar
            </Button>
          </Space>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
            size="large"
            style={{ minWidth: 180 }}
          >
            Guardar configuración
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AssistantConfig;
