import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  InputNumber,
  Typography,
  Space,
  Spin,
  Tooltip,
  Tag,
  Divider,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UndoOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  ApiOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { notify } from '../utility/notifications';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ConfigData {
  system_prompt: string;
  api_key_wapi: string;
  sub_agent_system_prompt: string;
  batch_size: number;
  max_iterations: number;
}

const defaultConfig: ConfigData = {
  system_prompt: 'Eres ACO, un asistente virtual inteligente especializado en atención al cliente. Tu objetivo es ayudar a los usuarios de manera amable, profesional y eficiente.',
  api_key_wapi: '',
  sub_agent_system_prompt: 'Eres un agente especializado que asiste al agente principal. Tu rol es proporcionar información específica y detallada cuando se te solicite.',
  batch_size: 10,
  max_iterations: 5,
};

export const AssistantConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedConfig, setSavedConfig] = useState<ConfigData>(defaultConfig);
  const [loadError, setLoadError] = useState<string | null>(null);

  const webhookUrl = import.meta.env.VITE_CONFIG_WEBHOOK_URL || 'https://n8m.agentedecargaonline.com/webhook/configBot';

  // Cargar configuración actual
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      // La respuesta viene como array, tomamos el primer elemento
      const data = Array.isArray(responseData) ? responseData[0] : responseData;
      
      if (!data) {
        throw new Error('No se encontró configuración guardada');
      }

      const config: ConfigData = {
        system_prompt: data.system_prompt || defaultConfig.system_prompt,
        api_key_wapi: data.api_key_wapi || '',
        sub_agent_system_prompt: data.sub_agent_system_prompt || defaultConfig.sub_agent_system_prompt,
        batch_size: data.batch_size ?? defaultConfig.batch_size,
        max_iterations: data.max_iterations ?? defaultConfig.max_iterations,
      };

      form.setFieldsValue(config);
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
      form.setFieldsValue(defaultConfig);
      setSavedConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, [form, webhookUrl]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Guardar configuración
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Config saved:', result);

      setSavedConfig(values);
      setHasChanges(false);
      notify.success({
        message: '¡Configuración guardada!',
        description: 'Los cambios se aplicarán en las próximas conversaciones.',
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
    form.setFieldsValue(savedConfig);
    setHasChanges(false);
    notify.info({
      message: 'Cambios descartados',
      description: 'Se restauró la última configuración guardada.',
    });
  };

  // Restaurar valores por defecto
  const handleRestoreDefaults = () => {
    form.setFieldsValue(defaultConfig);
    setHasChanges(true);
    notify.warning({
      message: 'Valores por defecto cargados',
      description: 'Recuerda guardar para aplicar los cambios.',
    });
  };

  // Detectar cambios en el formulario
  const handleValuesChange = () => {
    const currentValues = form.getFieldsValue();
    const changed = JSON.stringify(currentValues) !== JSON.stringify(savedConfig);
    setHasChanges(changed);
  };

  // Tab 1: Prompts del Sistema
  const renderPromptsTab = () => (
    <div>
      <Alert
        message="Consejos para escribir buenos prompts"
        description={
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Sé específico sobre el rol y personalidad del asistente</li>
            <li>Define el tono de comunicación (formal, amigable, técnico)</li>
            <li>Incluye instrucciones sobre qué hacer y qué evitar</li>
            <li>Menciona el contexto del negocio si es relevante</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        name="system_prompt"
        label={
          <Space>
            <span>Prompt del Sistema Principal</span>
            <Tooltip title="Este es el prompt principal que define la personalidad y comportamiento del asistente ACO">
              <InfoCircleOutlined style={{ color: '#8696A0' }} />
            </Tooltip>
          </Space>
        }
        rules={[
          { required: true, message: 'El prompt del sistema es requerido' },
          { min: 50, message: 'El prompt debe tener al menos 50 caracteres' },
        ]}
      >
        <TextArea
          rows={8}
          placeholder="Ej: Eres ACO, un asistente virtual inteligente..."
          showCount
          maxLength={5000}
        />
      </Form.Item>

      <Divider />

      <Form.Item
        name="sub_agent_system_prompt"
        label={
          <Space>
            <span>Prompt del Sub-Agente</span>
            <Tag color="blue">Opcional</Tag>
            <Tooltip title="Prompt para el agente secundario que asiste en tareas específicas">
              <InfoCircleOutlined style={{ color: '#8696A0' }} />
            </Tooltip>
          </Space>
        }
      >
        <TextArea
          rows={5}
          placeholder="Ej: Eres un agente especializado que asiste al agente principal..."
          showCount
          maxLength={3000}
        />
      </Form.Item>
    </div>
  );

  // Tab 2: API y Conexiones
  const renderApiTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card size="small" style={{ backgroundColor: 'rgba(52, 183, 241, 0.05)', border: '1px solid rgba(52, 183, 241, 0.2)' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <ApiOutlined style={{ color: '#34B7F1' }} />
                <Text strong>Webhook de Configuración</Text>
              </Space>
              <Text type="secondary" copyable={{ text: webhookUrl }}>
                {webhookUrl}
              </Text>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Form.Item
            name="api_key_wapi"
            label={
              <Space>
                <span>API Key de WhatsApp</span>
                <Tag color="green">Seguro</Tag>
                <Tooltip title="Clave de API para la integración con WhatsApp Business">
                  <InfoCircleOutlined style={{ color: '#8696A0' }} />
                </Tooltip>
              </Space>
            }
          >
            <Input.Password
              placeholder="Ingresa tu API key..."
              style={{ maxWidth: 500 }}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // Tab 3: Parámetros Avanzados
  const renderAdvancedTab = () => (
    <div>
      <Alert
        message="Parámetros de rendimiento"
        description="Estos valores afectan cómo el asistente procesa las conversaciones. Modifica con precaución."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="batch_size"
            label={
              <Space>
                <span>Tamaño de Lote (batch_size)</span>
                <Tooltip title="Número de mensajes que se procesan en cada iteración. Valores más altos pueden mejorar el rendimiento pero consumen más recursos.">
                  <InfoCircleOutlined style={{ color: '#8696A0' }} />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: 'Este campo es requerido' }]}
          >
            <InputNumber
              min={1}
              max={50}
              style={{ width: '100%' }}
              addonAfter="mensajes"
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recomendado: 5-15 para uso normal
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="max_iterations"
            label={
              <Space>
                <span>Máximo de Iteraciones</span>
                <Tooltip title="Número máximo de veces que el agente puede iterar para completar una tarea compleja.">
                  <InfoCircleOutlined style={{ color: '#8696A0' }} />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: 'Este campo es requerido' }]}
          >
            <InputNumber
              min={1}
              max={20}
              style={{ width: '100%' }}
              addonAfter="iteraciones"
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recomendado: 3-7 para balance óptimo
          </Text>
        </Col>
      </Row>
    </div>
  );

  const tabItems = [
    {
      key: 'prompts',
      label: (
        <Space>
          <RobotOutlined />
          Prompts del Sistema
        </Space>
      ),
      children: renderPromptsTab(),
    },
    {
      key: 'api',
      label: (
        <Space>
          <ApiOutlined />
          API y Conexiones
        </Space>
      ),
      children: renderApiTab(),
    },
    {
      key: 'advanced',
      label: (
        <Space>
          <SettingOutlined />
          Parámetros Avanzados
        </Space>
      ),
      children: renderAdvancedTab(),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Cargando configuración...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <RobotOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Configuración del Asistente ACO</Title>
            <Text type="secondary">Personaliza el comportamiento y parámetros del asistente</Text>
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
          initialValues={defaultConfig}
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
