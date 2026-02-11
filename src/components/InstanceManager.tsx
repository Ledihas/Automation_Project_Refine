import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Typography, Row, Col, Spin, Modal, Input, Form, App, Steps, Switch, InputNumber, Collapse, Divider, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, WhatsAppOutlined, InfoCircleOutlined, ExclamationCircleOutlined, SettingOutlined, LinkOutlined, ApiOutlined } from '@ant-design/icons';
import { useGetIdentity } from '@refinedev/core';
import { appwriteClient } from '../utility/appwriteClient';
import { Databases, Query } from '@refinedev/appwrite';
import { validateInstanceName, generateInstanceName } from '../utility/instanceUtils';
import { notify } from '../utility/notifications';
import { useNavigate } from 'react-router';
import { Color } from 'antd/es/color-picker';
import { text } from 'stream/consumers';

const { Title, Text } = Typography;

// Chatwoot configuration interface
export interface ChatwootConfig {
  chatwoot_url: string;
  chatwoot_account_id: string;
  chatwoot_token: string;
  chatwoot_sign_msg: boolean;
  chatwoot_reopen_conversation: boolean;
  chatwoot_conversation_pending: boolean;
  chatwoot_name_inbox: string;
  chatwoot_merge_brazil_contacts: boolean;
  chatwoot_import_contacts: boolean;
  chatwoot_import_messages: boolean;
  chatwoot_days_limit_import: number;
  chatwoot_organization: string;
  chatwoot_logo: string;
}

// Default Chatwoot configuration
const defaultChatwootConfig: ChatwootConfig = {
  chatwoot_url: '',
  chatwoot_account_id: '',
  chatwoot_token: '',
  chatwoot_sign_msg: true,
  chatwoot_reopen_conversation: true,
  chatwoot_conversation_pending: false,
  chatwoot_name_inbox: '',
  chatwoot_merge_brazil_contacts: true,
  chatwoot_import_contacts: true,
  chatwoot_import_messages: true,
  chatwoot_days_limit_import: 3,
  chatwoot_organization: 'ACO Assistant',
  chatwoot_logo: '',
};

interface Instance {
  $id: string;
  instance_name: string;
  status: 'pending' | 'connected';
  user_id: string;
  created_at: string;
  $createdAt: string;
  chatwoot_account_id?: string;
  chatwoot_name_inbox?: string;
  chatwoot_url?: string;
  chatwoot_token?: string;
  chatwoot_sign_msg?: boolean;
  chatwoot_reopen_conversation?: boolean;
  chatwoot_conversation_pending?: boolean;
  chatwoot_merge_brazil_contacts?: boolean;
  chatwoot_import_contacts?: boolean;
  chatwoot_import_messages?: boolean;
  chatwoot_days_limit_import?: number;
  chatwoot_organization?: string;
  chatwoot_logo?: string;
}

export const InstanceManager: React.FC = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [nameError, setNameError] = useState('');
  const [chatwootConfig, setChatwootConfig] = useState<ChatwootConfig>(defaultChatwootConfig);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [createdInstanceName, setCreatedInstanceName] = useState('');
  const { data: identity } = useGetIdentity<{ $id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { modal } = App.useApp();

  // URL del video tutorial de Loom
  const tutorialVideoUrl = 'https://www.loom.com/share/87af31c301dd4245bbf136b4846c4254';
  const tutorialVideoEmbedUrl = 'https://www.loom.com/embed/87af31c301dd4245bbf136b4846c4254';

  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const collectionId = import.meta.env.VITE_APPWRITE_WHATSAPP_COLLECTION_ID;
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const apiKey = import.meta.env.VITE_API_KEY;
  const defaultChatwootUrl = import.meta.env.VITE_CHATWOOT_URL || '';
  const botacoWebhookUrl = import.meta.env.VITE_BOTACO_WEBHOOK_URL || 'http://n8n:5678/webhook/botaco';
  
  const databases = React.useMemo(() => new Databases(appwriteClient), []);

  const fetchInstances = React.useCallback(async () => {
    if (!identity?.$id) return;

    setLoading(true);
    try {
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('user_id', identity.$id)]
      );

      setInstances(response.documents as unknown as Instance[]);
    } catch (error) {
      console.error('Error fetching instances:', error);
      notify.error({
        message: 'Error al cargar',
        description: 'No se pudieron cargar las instancias. Verifica tu conexión.',
      });
    } finally {
      setLoading(false);
    }
  }, [identity?.$id, databases, databaseId, collectionId]);

  useEffect(() => {
    if (identity?.$id) {
      fetchInstances();
    }
  }, [identity?.$id, fetchInstances]);

  const getStatusBadge = (status: string) => {
    if (status === 'connected') {
      return (
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          padding: '4px 12px', 
          backgroundColor: 'rgba(37, 211, 102, 0.1)', 
          borderRadius: '16px',
          border: '1px solid rgba(37, 211, 102, 0.3)'
        }}>
          <Badge status="success" />
          <span style={{ marginLeft: 6, color: '#25D366', fontWeight: 500, fontSize: 13 }}>
            Conectado
          </span>
        </div>
      );
    }
    return (
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        padding: '4px 12px', 
        backgroundColor: 'rgba(250, 173, 20, 0.1)', 
        borderRadius: '16px',
        border: '1px solid rgba(250, 173, 20, 0.3)'
      }}>
        <Badge status="warning" />
        <span style={{ marginLeft: 6, color: '#faad14', fontWeight: 500, fontSize: 13 }}>
          Pendiente
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenModal = () => {
    setShowCreateModal(true);
    setCurrentStep(0);
    setNewInstanceName('');
    setNameError('');
    setChatwootConfig(defaultChatwootConfig);
    form.resetFields();
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCurrentStep(0);
    setNewInstanceName('');
    setNameError('');
    setChatwootConfig(defaultChatwootConfig);
    form.resetFields();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewInstanceName(value);

    if (!value) {
      setNameError('El nombre es requerido');
    } else if (!validateInstanceName(value)) {
      setNameError('Solo se permiten letras, números y guiones bajos');
    } else {
      setNameError('');
    }
  };

  const getPreviewName = () => {
    if (!newInstanceName) return '';
    return `${newInstanceName}_XXXX`;
  };

  const handleNextStep = () => {
    if (currentStep === 0 && (!newInstanceName || nameError)) return;
    
    // Validar Chatwoot es OBLIGATORIO en Step 1 (paso 2)
    if (currentStep === 1) {
      const chatwootUrl = chatwootConfig.chatwoot_url || defaultChatwootUrl;
      if (!chatwootUrl || !chatwootConfig.chatwoot_account_id || !chatwootConfig.chatwoot_token) {
        notify.error({
          message: 'Chatwoot incompleto',
          description: 'Debes configurar la URL, Account ID y Token de Chatwoot'
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const updateChatwootConfig = (field: keyof ChatwootConfig, value: any) => {
    setChatwootConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateInstance = async () => {
    if (!newInstanceName || nameError || !identity?.$id) return;

    setCreating(true);

    try {
      const fullInstanceName = generateInstanceName(newInstanceName);

      // ============================================
      // VALIDAR: Chatwoot es OBLIGATORIO
      // ============================================
      const chatwootUrl = chatwootConfig.chatwoot_url || defaultChatwootUrl;
      const accountId = parseInt(chatwootConfig.chatwoot_account_id, 10);
      
      if (!chatwootUrl || !chatwootConfig.chatwoot_account_id || !chatwootConfig.chatwoot_token) {
        setCreating(false);
        notify.error({
          message: 'Chatwoot requerido',
          description: 'URL, Account ID y Token de Chatwoot son obligatorios. Por favor completa todos los campos.'
        });
        return;
      }

      // Validar que Account ID sea un número válido
      if (isNaN(accountId) || accountId < 1) {
        setCreating(false);
        notify.error({
          message: 'Account ID inválido',
          description: 'Account ID debe ser un número mayor a 0.'
        });
        return;
      }

      console.log('🚀 Creating instance with MANDATORY Chatwoot config:', {
        instanceName: fullInstanceName,
        chatwootAccountId: accountId,
        chatwootToken: chatwootConfig.chatwoot_token ? '✅ PRESENTE' : '❌ AUSENTE',
        chatwootUrl: chatwootUrl,
      });

      // Build Evolution API request body - ESTRUCTURA CORRECTA v2
      // Asegurar que la URL no tenga / al final
      const cleanChatwootUrl = chatwootUrl.replace(/\/$/, '');
      
      const evolutionBody: any = {
        instanceName: fullInstanceName,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
        webhook: {
          url: botacoWebhookUrl,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED']
        },
        chatwoot: {
          enabled: true,
          url: cleanChatwootUrl,
          accountId: accountId,  // ✅ Ya validado y convertido a número
          token: chatwootConfig.chatwoot_token,
          nameInbox: chatwootConfig.chatwoot_name_inbox || fullInstanceName,
          signMsg: chatwootConfig.chatwoot_sign_msg,
          reopenConversation: chatwootConfig.chatwoot_reopen_conversation,
          conversationPending: chatwootConfig.chatwoot_conversation_pending,
          importContacts: chatwootConfig.chatwoot_import_contacts,
          importMessages: chatwootConfig.chatwoot_import_messages,
          daysLimitImportMessages: chatwootConfig.chatwoot_days_limit_import,
          mergeBrazilContacts: chatwootConfig.chatwoot_merge_brazil_contacts,
          organization: chatwootConfig.chatwoot_organization
        }
      };
      
      console.log('✅ Payload armado con estructura CORRECTA (Chatwoot anidado)');

      // Log full payload for debugging (ocultar token)
      const payloadDebug = {
        ...evolutionBody,
        chatwoot: {
          ...evolutionBody.chatwoot,
          token: evolutionBody.chatwoot?.token ? '[OCULTO]' : undefined
        }
      };
      console.log('📤 PAYLOAD COMPLETO a EvolutionAPI:', JSON.stringify(payloadDebug, null, 2));

      const evolutionResponse = await fetch(`${serverUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evolutionBody),
      });

      const responseText = await evolutionResponse.text();
      console.log('📥 Evolution API response status:', evolutionResponse.status);
      console.log('📥 Evolution API response body:', responseText.substring(0, 500));

      if (!evolutionResponse.ok) {
        throw new Error(`Evolution API error (${evolutionResponse.status}): ${responseText || 'Sin respuesta'}`);
      }

      // Parse response
      let evolutionData;
      try {
        evolutionData = JSON.parse(responseText);
        console.log('✅ Instancia creada en EvolutionAPI:', evolutionData);
      } catch (e) {
        throw new Error(`Respuesta inválida de Evolution API: ${responseText.substring(0, 100)}`);
      }

      // ============================================
      // GUARDAR EN APPWRITE - Solo datos esenciales
      // (Chatwoot es manejado 100% por EvolutionAPI)
      // ============================================
      const appwriteDoc = await databases.createDocument(
        databaseId,
        collectionId,
        'unique()',
        {
          user_id: identity.$id,
          instance_name: fullInstanceName,
          status: 'pending',
          api_key: apiKey,
          created_at: new Date().toISOString(),
        }
      );

      console.log('✅ Documento guardado en Appwrite:', appwriteDoc.$id);

      // Notificar respuesta de Evolution API
      const evolutionInfo = evolutionData?.instance || evolutionData;
      notify.success({
        message: '¡Instancia creada exitosamente!',
        description: (
          <div>
            <p><strong>{fullInstanceName}</strong></p>
            <p>✅ Integración Chatwoot activada</p>
            {evolutionInfo?.status && <p>Estado: {evolutionInfo.status}</p>}
            {evolutionInfo?.instanceId && <p>ID: {evolutionInfo.instanceId}</p>}
          </div>
        ),
        duration: 6,
      });

      // Navegar directamente al QR sin mostrar video
      setCreatedInstanceName(fullInstanceName);
      handleCloseModal();
      navigate(`/whatsapp/scan/${fullInstanceName}`);
    } catch (error) {
      console.error('Error creating instance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notify.apiError('crear instancia', errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteInstance = (instanceId: string, instanceName: string) => {
    modal.confirm({
      title: '¿Eliminar instancia?',
      icon: <ExclamationCircleOutlined />,
      content: `¿Estás seguro de que deseas eliminar la instancia "${instanceName}"? Esta acción no se puede deshacer.`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        setDeletingId(instanceId);

        try {
          const evolutionResponse = await fetch(
            `${serverUrl}/instance/delete/${instanceName}`,
            {
              method: 'DELETE',
              headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json',
              },
            }
          );

          const responseText = await evolutionResponse.text();

          if (!evolutionResponse.ok) {
            throw new Error(`Evolution API error: ${evolutionResponse.status} - ${responseText || 'No response'}`);
          }

          await databases.deleteDocument(databaseId, collectionId, instanceId);
          setInstances((prev) => prev.filter((inst) => inst.$id !== instanceId));

          notify.instanceDeleted(instanceName);
        } catch (error) {
          console.error('Error deleting instance:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          notify.apiError('eliminar instancia', errorMessage);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // Step 1: Instance Name
  const renderStep1 = () => (
    <Form form={form} layout="vertical">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <WhatsAppOutlined style={{ fontSize: 32, color: '#fff' }} />
        </div>
        <Title level={5} style={{ margin: 0 }}>Nombra tu instancia</Title>
        <Text type="secondary">Elige un nombre descriptivo para identificarla</Text>
      </div>

      <Form.Item
        validateStatus={nameError ? 'error' : ''}
        help={nameError}
      >
        <Input
          placeholder="Ej: Tienda_Ropa, Soporte_Clientes"
          value={newInstanceName}
          onChange={handleNameChange}
          maxLength={50}
          size="large"
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      {newInstanceName && !nameError && (
        <div style={{ 
          padding: '16px', 
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(37, 211, 102, 0.1) 100%)',
          borderRadius: 12,
          border: '1px solid rgba(37, 211, 102, 0.2)',
          marginTop: 8
        }}>
          <InfoCircleOutlined style={{ color: '#25D366', marginRight: 8 }} />
          <Text style={{ color: '#128C7E' }}>Se agregará un código único automáticamente</Text>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Vista previa:</Text>
            <div style={{ 
              marginTop: 4,
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: 8,
              display: 'inline-block'
            }}>
              <Text strong style={{ fontSize: 16, fontFamily: 'monospace' }}>{getPreviewName()}</Text>
            </div>
          </div>
        </div>
      )}
    </Form>
  );

  // Step 2: Chatwoot Configuration (MANDATORY)
  const renderStep2 = () => (
    <Form layout="vertical">
      <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'rgba(37, 211, 102, 0.08)', borderRadius: 8, border: '1px solid rgba(37, 211, 102, 0.2)' }}>
        <Text style={{ color: '#128C7E' }}>
          <strong>⚠️ Chatwoot es obligatorio</strong> para esta instancia. Completa todos los campos requeridos:
        </Text>
      </div>

      <Form.Item 
        label={
          <span>
            <LinkOutlined style={{ marginRight: 6, color: '#34B7F1' }} />
            URL de Chatwoot <span style={{ color: '#ff4d4f' }}>*</span>
          </span>
        }
        required
        validateStatus={!chatwootConfig.chatwoot_url && !defaultChatwootUrl ? 'error' : ''}
        help={!chatwootConfig.chatwoot_url && !defaultChatwootUrl ? 'URL es requerida' : ''}
      >
        <Input
          placeholder={defaultChatwootUrl || "https://tu-chatwoot.com"}
          value={chatwootConfig.chatwoot_url}
          onChange={(e) => updateChatwootConfig('chatwoot_url', e.target.value)}
          addonBefore="https://"
        />
        {defaultChatwootUrl && !chatwootConfig.chatwoot_url && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Se usará por defecto: {defaultChatwootUrl}
          </Text>
        )}
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item 
            label={
              <span>
                Account ID <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            required
            validateStatus={!chatwootConfig.chatwoot_account_id ? 'error' : ''}
            help={!chatwootConfig.chatwoot_account_id ? 'Account ID es requerido (número)' : ''}
          >
            <InputNumber
              placeholder="Ej: 1"
              value={chatwootConfig.chatwoot_account_id ? parseInt(chatwootConfig.chatwoot_account_id, 10) : undefined}
              onChange={(value) => updateChatwootConfig('chatwoot_account_id', value?.toString() || '')}
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item 
            label={
              <span>
                Token de API <span style={{ color: '#ff4d4f' }}>*</span>
              </span>
            }
            required
            validateStatus={!chatwootConfig.chatwoot_token ? 'error' : ''}
            help={!chatwootConfig.chatwoot_token ? 'Token es requerido' : ''}
          >
            <Input.Password
              placeholder="Token de acceso"
              value={chatwootConfig.chatwoot_token}
              onChange={(e) => updateChatwootConfig('chatwoot_token', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Nombre del Inbox">
            <Input
              placeholder="Nombre para el inbox (opcional)"
              value={chatwootConfig.chatwoot_name_inbox}
              onChange={(e) => updateChatwootConfig('chatwoot_name_inbox', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Organización">
            <Input
              placeholder="Nombre de la organización"
              value={chatwootConfig.chatwoot_organization}
              onChange={(e) => updateChatwootConfig('chatwoot_organization', e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="URL del Logo (opcional)">
        <Input
          placeholder="https://ejemplo.com/logo.png"
          value={chatwootConfig.chatwoot_logo}
          onChange={(e) => updateChatwootConfig('chatwoot_logo', e.target.value)}
        />
      </Form.Item>

      <Divider orientation="left">
        <SettingOutlined /> Opciones Avanzadas
      </Divider>

      <Collapse ghost>
        <Collapse.Panel header="Configuración de mensajes y conversaciones" key="1">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Firmar mensajes">
                <Switch
                  checked={chatwootConfig.chatwoot_sign_msg}
                  onChange={(checked) => updateChatwootConfig('chatwoot_sign_msg', checked)}
                />
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  Agregar firma del agente
                </Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Reabrir conversaciones">
                <Switch
                  checked={chatwootConfig.chatwoot_reopen_conversation}
                  onChange={(checked) => updateChatwootConfig('chatwoot_reopen_conversation', checked)}
                />
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  Reabrir al recibir mensaje
                </Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Conversación pendiente">
                <Switch
                  checked={chatwootConfig.chatwoot_conversation_pending}
                  onChange={(checked) => updateChatwootConfig('chatwoot_conversation_pending', checked)}
                />
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  Crear como pendiente
                </Text>
              </Form.Item>
            </Col>
          </Row>
        </Collapse.Panel>

        <Collapse.Panel header="Importación de datos" key="2">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Importar contactos">
                <Switch
                  checked={chatwootConfig.chatwoot_import_contacts}
                  onChange={(checked) => updateChatwootConfig('chatwoot_import_contacts', checked)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Importar mensajes">
                <Switch
                  checked={chatwootConfig.chatwoot_import_messages}
                  onChange={(checked) => updateChatwootConfig('chatwoot_import_messages', checked)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Días límite importación">
                <InputNumber
                  min={1}
                  max={30}
                  value={chatwootConfig.chatwoot_days_limit_import}
                  onChange={(value) => updateChatwootConfig('chatwoot_days_limit_import', value || 3)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Unificar contactos Brasil">
                <Switch
                  checked={chatwootConfig.chatwoot_merge_brazil_contacts}
                  onChange={(checked) => updateChatwootConfig('chatwoot_merge_brazil_contacts', checked)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Collapse.Panel>
      </Collapse>
    </Form>
  );

  // Step 3: Review
  const renderStep3 = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={5} style={{ margin: 0 }}>Todo listo para crear</Title>
        <Text type="secondary">Revisa la configuración antes de continuar</Text>
      </div>
      
      <Card 
        size="small" 
        style={{ 
          marginBottom: 16, 
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(37, 211, 102, 0.1) 100%)',
          border: '1px solid rgba(37, 211, 102, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WhatsAppOutlined style={{ fontSize: 24, color: '#25D366', marginRight: 12 }} />
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Nombre de instancia</Text>
            <div><Text strong style={{ fontSize: 16 }}>{getPreviewName()}</Text></div>
          </div>
        </div>
      </Card>

      {(chatwootConfig.chatwoot_account_id && chatwootConfig.chatwoot_token) || (defaultChatwootUrl && chatwootConfig.chatwoot_account_id && chatwootConfig.chatwoot_token) ? (
        <Card 
          size="small" 
          title={<><ApiOutlined style={{ marginRight: 8, color: '#34B7F1' }} />✅ Chatwoot Configurado</>}
          style={{ marginBottom: 16, borderRadius: 12, border: '1px solid rgba(37, 211, 102, 0.3)' }}
        >
          <Row gutter={[8, 12]}>
            <Col span={12}><Text type="secondary">URL:</Text></Col>
            <Col span={12}>
              <Text strong style={{ wordBreak: 'break-all' }}>
                {chatwootConfig.chatwoot_url || defaultChatwootUrl || 'Auto-configurada'}
              </Text>
            </Col>
            
            <Col span={12}><Text type="secondary">Account ID:</Text></Col>
            <Col span={12}><Text strong>{chatwootConfig.chatwoot_account_id}</Text></Col>
            
            <Col span={12}><Text type="secondary">Inbox:</Text></Col>
            <Col span={12}><Text strong>{chatwootConfig.chatwoot_name_inbox || 'Auto-generado'}</Text></Col>
            
            <Col span={12}><Text type="secondary">Organización:</Text></Col>
            <Col span={12}><Text strong>{chatwootConfig.chatwoot_organization}</Text></Col>
          </Row>
        </Card>
      ) : (
        <Card 
          size="small" 
          style={{ 
            marginBottom: 16, 
            borderRadius: 12,
            backgroundColor: 'rgba(255, 77, 79, 0.08)',
            border: '1px solid rgba(255, 77, 79, 0.3)'
          }}
        >
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
          <Text style={{ color: '#ff4d4f' }}><strong>Chatwoot REQUERIDO</strong> - Completa todos los campos obligatorios antes de continuar</Text>
        </Card>
      )}

      <div style={{ 
        padding: 16, 
        background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(37, 211, 102, 0.15) 100%)',
        borderRadius: 12, 
        border: '1px solid rgba(37, 211, 102, 0.3)',
        textAlign: 'center'
      }}>
        <Text style={{ color: '#128C7E' }}>
          🎉 Al crear, serás redirigido para escanear el código QR con tu WhatsApp
        </Text>
      </div>
    </div>
  );

  const steps = [
    { title: 'Nombre', content: renderStep1() },
    { title: 'Chatwoot', content: renderStep2() },
    { title: 'Confirmar', content: renderStep3() },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleOpenModal}>
          Nueva Instancia
        </Button>
      </div>

      {instances.length === 0 ? (
        <Card 
          style={{ 
            borderRadius: 16, 
            border: '2px dashed rgba(37, 211, 102, 0.3)',
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.02) 0%, rgba(37, 211, 102, 0.08) 100%)'
          }}
        >
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)'
            }}>
              <WhatsAppOutlined style={{ fontSize: '40px', color: '#fff' }} />
            </div>
            <Title level={4} style={{ marginBottom: 8 }}>No tienes instancias creadas</Title>
            <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 24 }}>
              Crea tu primera instancia para conectar WhatsApp con el Asistente de IA de ACO
            </Text>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />} 
              onClick={handleOpenModal}
              style={{ height: 48, paddingInline: 32, fontSize: 15 }}
            >
              Crear mi primera instancia
            </Button>
          </div>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {instances.map((instance) => (
            <Col xs={24} sm={12} lg={8} key={instance.$id}>
              <Card 
                hoverable
                style={{ 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: instance.status === 'connected' 
                    ? '1px solid rgba(37, 211, 102, 0.3)' 
                    : '1px solid rgba(0,0,0,0.06)'
                }}
                styles={{
                  body: { padding: '20px' }
                }}
              >
                {/* Header with icon and name */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    flexShrink: 0
                  }}>
                    <WhatsAppOutlined style={{ fontSize: 22, color: '#fff' }} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <Tooltip title={instance.instance_name}>
                      <Text strong style={{ 
                        fontSize: 15, 
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {instance.instance_name}
                      </Text>
                    </Tooltip>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(instance.created_at || instance.$createdAt)}
                    </Text>
                  </div>
                </div>

                {/* Status badges */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}>{getStatusBadge(instance.status)}</div>
                  {instance.chatwoot_account_id && (
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      padding: '4px 12px', 
                      backgroundColor: 'rgba(52, 183, 241, 0.1)', 
                      borderRadius: '16px',
                      border: '1px solid rgba(52, 183, 241, 0.3)',
                      marginTop: 8
                    }}>
                      <ApiOutlined style={{ color: '#34B7F1', marginRight: 6 }} />
                      <span style={{ color: '#34B7F1', fontWeight: 500, fontSize: 12 }}>
                        {instance.chatwoot_name_inbox || 'Chatwoot'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {instance.status === 'pending' && (
                    <Button
                      type="default"
                      icon={<LinkOutlined />}
                      onClick={() => navigate(`/whatsapp/scan/${instance.instance_name}`)}
                      style={{ flex: 1 }}
                    >
                      Conectar
                    </Button>
                  )}
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    loading={deletingId === instance.$id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInstance(instance.$id, instance.instance_name);
                    }}
                    style={{ flex: instance.status === 'connected' ? 1 : 'none' }}
                  >
                    {instance.status === 'connected' ? 'Eliminar' : ''}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={null}
        open={showCreateModal}
        onCancel={handleCloseModal}
        width={640}
        centered
        styles={{
          content: { borderRadius: 16, padding: 0 },
          body: { padding: '24px 32px 32px' }
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
            <div>
              {currentStep > 0 && (
                <Button key="back" onClick={handlePrevStep} disabled={creating} size="large">
                  ← Anterior
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button key="cancel" onClick={handleCloseModal} disabled={creating} size="large">
                Cancelar
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  key="next"
                  type="primary"
                  onClick={handleNextStep}
                  disabled={(() => {
                    if (currentStep === 0) return !newInstanceName || !!nameError;
                    if (currentStep === 1) {
                      const chatwootUrl = chatwootConfig.chatwoot_url || defaultChatwootUrl;
                      return !chatwootUrl || !chatwootConfig.chatwoot_account_id || !chatwootConfig.chatwoot_token;
                    }
                    return false;
                  })()}
                  size="large"
                >
                  Siguiente →
                </Button>
              ) : (
                <Button
                  key="create"
                  type="primary"
                  loading={creating}
                  onClick={handleCreateInstance}
                  size="large"
                  icon={<WhatsAppOutlined />}
                >
                  Crear Instancia
                </Button>
              )}
            </div>
          </div>
        }
      >
        <Steps 
          current={currentStep} 
          items={steps.map(s => ({ title: s.title }))} 
          style={{ marginBottom: 32 }}
          size="small"
        />
        <div style={{ minHeight: 280 }}>
          {steps[currentStep].content}
        </div>
      </Modal>

      {/* Modal de Video Tutorial */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <WhatsAppOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <div>
              <Title level={5} style={{ margin: 0 }}>¡Instancia creada!</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Mira el video para los siguientes pasos</Text>
            </div>
          </div>
        }
        open={showVideoModal}
        onCancel={() => {
          setShowVideoModal(false);
          navigate(`/whatsapp/scan/${createdInstanceName}`);
        }}
        width={800}
        centered
        styles={{
          content: { borderRadius: 16 },
          body: { padding: '24px' }
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              onClick={() => window.open(tutorialVideoUrl, '_blank')}
              icon={<LinkOutlined />}
            >
              Abrir en nueva pestaña
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<WhatsAppOutlined />}
              onClick={() => {
                setShowVideoModal(false);
                navigate(`/whatsapp/scan/${createdInstanceName}`);
              }}
            >
              Continuar a escanear QR
            </Button>
          </div>
        }
      >
        <div style={{ 
          background: '#000', 
          borderRadius: 12, 
          overflow: 'hidden',
          marginBottom: 16
        }}>
          <iframe
            src={tutorialVideoEmbedUrl}
            width="100%"
            height="400"
            style={{ border: 'none' }}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen"
            title="Tutorial - Siguientes pasos"
          />
        </div>
        <div style={{ 
          padding: 16, 
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(37, 211, 102, 0.15) 100%)',
          borderRadius: 12, 
          border: '1px solid rgba(37, 211, 102, 0.3)',
        }}>
          <Title level={5} style={{ margin: '0 0 8px 0', color: '#128C7E' }}>
            📱 Próximo paso: Escanear código QR
          </Title>
          <Text>
            Después de ver el video, haz clic en "Continuar" para escanear el código QR con tu WhatsApp 
            y activar la instancia <strong>{createdInstanceName}</strong>.
          </Text>
        </div>
      </Modal>
    </div>
  );
};
