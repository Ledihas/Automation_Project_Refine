import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Typography, Row, Col, Spin, notification, Modal, Input, Form, App } from 'antd';
import { PlusOutlined, DeleteOutlined, WhatsAppOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetIdentity } from '@refinedev/core';
import { appwriteClient } from '../utility/appwriteClient';
import { Databases, Query } from '@refinedev/appwrite';
import { validateInstanceName, generateInstanceName } from '../utility/instanceUtils';
import { useNavigate } from 'react-router';

const { Title, Text } = Typography;

interface Instance {
  $id: string;
  instance_name: string;
  status: 'pending' | 'connected';
  user_id: string;
  created_at: string;
  $createdAt: string;
}

export const InstanceManager: React.FC = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [nameError, setNameError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: identity } = useGetIdentity<{ $id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { modal } = App.useApp();

  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const collectionId = import.meta.env.VITE_APPWRITE_WHATSAPP_COLLECTION_ID;
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const apiKey = import.meta.env.VITE_API_KEY;
  const botacoWebhookUrl = import.meta.env.VITE_BOTACO_WEBHOOK_URL || 'http://n8n:5678/webhook/botaco';
  
  // En desarrollo local usa localhost, en Docker usa la red interna
  const instanceApiUrl = typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/instance'
    : 'http://evolution-api:8080/instance';
  
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
      notification.error({
        message: 'Error',
        description: 'No se pudieron cargar las instancias',
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
      return <Badge status="success" text="Conectado al Asistente ACO" />;
    }
    return <Badge status="warning" text="Pendiente de Conexión" />;
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
    setNewInstanceName('');
    setNameError('');
    form.resetFields();
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewInstanceName('');
    setNameError('');
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

  const handleCreateInstance = async () => {
    if (!newInstanceName || nameError || !identity?.$id) return;

    setCreating(true);

    try {
      // Generate full instance name with 4-digit suffix
      const fullInstanceName = generateInstanceName(newInstanceName);

      // Call EvolutionAPI to create instance
      console.log('Creating instance with:', {
        instanceName: fullInstanceName,
        apiUrl: instanceApiUrl,
        apiKey: apiKey ? '***' : 'MISSING'
      });

      const evolutionResponse = await fetch(`${instanceApiUrl}/create`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: fullInstanceName,
          integration: 'WHATSAPP-BAILEYS',
          qrcode: false,
          alwaysOnline: true,
          groupsIgnore: false,
          webhook: {
            url: botacoWebhookUrl,
            byEvents: false,
            base64: true,
            events: ['MESSAGES_UPSERT']
          }
        }),
      });

      // Read response body for error handling
      const responseText = await evolutionResponse.text();
      console.log('Evolution API response:', {
        status: evolutionResponse.status,
        ok: evolutionResponse.ok,
        headers: {
          'content-type': evolutionResponse.headers.get('content-type')
        },
        bodyPreview: responseText.substring(0, 200)
      });

      if (!evolutionResponse.ok) {
        const errorMsg = `Evolution API error (${evolutionResponse.status}): ${responseText || 'Sin respuesta'}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Try to parse response as JSON
      let evolutionData;
      try {
        evolutionData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse Evolution API response as JSON:', responseText);
        throw new Error(`Respuesta inválida de Evolution API: ${responseText.substring(0, 100)}`);
      }

      // Save instance to Appwrite
      await databases.createDocument(
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

      notification.success({
        message: 'Instancia creada',
        description: `La instancia ${fullInstanceName} ha sido creada exitosamente`,
      });

      // Close modal and redirect to QR scan page
      handleCloseModal();
      navigate(`/whatsapp/scan/${fullInstanceName}`);
    } catch (error) {
      console.error('Error creating instance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notification.error({
        message: 'Error al crear instancia',
        description: errorMessage.length > 100 
          ? errorMessage.substring(0, 100) + '...' 
          : errorMessage,
        duration: 0, // No auto-close para que usuario pueda leer
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteInstance = (instanceId: string, instanceName: string) => {
    console.log('handleDeleteInstance called:', { instanceId, instanceName });
    
    modal.confirm({
      title: '¿Eliminar instancia?',
      icon: <ExclamationCircleOutlined />,
      content: `¿Estás seguro de que deseas eliminar la instancia "${instanceName}"? Esta acción no se puede deshacer.`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        console.log('Delete confirmed');
        setDeletingId(instanceId);

        try {
          // Delete from EvolutionAPI first
          console.log('Attempting to delete from EvolutionAPI:', {
            url: `${instanceApiUrl}/delete/${instanceName}`,
            instanceName
          });

          const evolutionResponse = await fetch(
            `${instanceApiUrl}/delete/${instanceName}`,
            {
              method: 'DELETE',
              headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json',
              },
            }
          );

          const responseText = await evolutionResponse.text();
          console.log('Evolution API response:', {
            status: evolutionResponse.status,
            ok: evolutionResponse.ok,
            responseText
          });

          if (!evolutionResponse.ok) {
            const errorMsg = `Evolution API error: ${evolutionResponse.status} - ${responseText || 'No response'}`;
            throw new Error(errorMsg);
          }

          // Delete from Appwrite only if EvolutionAPI deletion succeeds
          await databases.deleteDocument(
            databaseId,
            collectionId,
            instanceId
          );

          // Remove from UI
          setInstances((prev: any[]) => prev.filter((inst) => inst.$id !== instanceId));

          notification.success({
            message: 'Instancia eliminada',
            description: `La instancia ${instanceName} ha sido eliminada exitosamente`,
          });
        } catch (error) {
          console.error('Error deleting instance:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          notification.error({
            message: 'Error al eliminar',
            description: errorMessage,
            duration: 0, // No auto-close so user can read the full error
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenModal}
        >
          Nueva Instancia
        </Button>
      </div>

      {instances.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <WhatsAppOutlined style={{ fontSize: '48px', color: '#25D366', marginBottom: '16px' }} />
            <Title level={4}>No tienes instancias creadas</Title>
            <Text type="secondary">
              Crea tu primera instancia para conectar WhatsApp con el Asistente de IA de ACO
            </Text>
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {instances.map((instance) => (
            <Col xs={24} sm={12} lg={8} key={instance.$id}>
              <Card hoverable>
                <div style={{ marginBottom: '12px' }}>
                  <WhatsAppOutlined style={{ fontSize: '24px', color: '#25D366', marginRight: '8px' }} />
                  <Text strong style={{ fontSize: '16px' }}>
                    {instance.instance_name}
                  </Text>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  {getStatusBadge(instance.status)}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Creado: {formatDate(instance.created_at || instance.$createdAt)}
                  </Text>
                </div>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingId === instance.$id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteInstance(instance.$id, instance.instance_name);
                  }}
                  block
                >
                  Eliminar
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Nueva Instancia de WhatsApp"
        open={showCreateModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal} disabled={creating}>
            Cancelar
          </Button>,
          <Button
            key="create"
            type="primary"
            disabled={!newInstanceName || !!nameError}
            loading={creating}
            onClick={handleCreateInstance}
          >
            Crear Instancia
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nombre de la instancia"
            validateStatus={nameError ? 'error' : ''}
            help={nameError}
          >
            <Input
              placeholder="Ej: Tienda_Ropa"
              value={newInstanceName}
              onChange={handleNameChange}
              maxLength={50}
            />
          </Form.Item>

          {newInstanceName && !nameError && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'InfoText' , 
              borderRadius: '4px',
              marginTop: '8px'
            }}>
              <InfoCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
              <Text type="secondary">
                Se agregará un código único al final
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Text strong>Vista previa: </Text>
                <Text code>{getPreviewName()}</Text>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};
