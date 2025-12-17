import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Typography,
  Spin,
  Empty,
  Space,
  Drawer,
  Button,
  Avatar,
  Popconfirm,
  Select
} from 'antd';
import {
  TagsOutlined,
  ReloadOutlined,
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { whapiClient } from '../utility';
import { notify } from '../utility/notifications';

const { Text } = Typography;

interface Label {
  id: string | number;
  name: string;
  color: number;
  count?: number;
}

interface LabelContact {
  id: string;
  name?: string;
  type?: string;
}

// Colores de WhatsApp para etiquetas
const LABEL_COLORS: Record<number, string> = {
  0: '#00a884',
  1: '#53bdeb',
  2: '#ffd279',
  3: '#ff7eb6',
  4: '#a695e7',
  5: '#ff9a76',
  6: '#20c997',
  7: '#6c757d',
};

export const WhapiLabels: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para drawer de contactos
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [contacts, setContacts] = useState<LabelContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Estado para añadir contacto
  const [allChats, setAllChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await whapiClient.getLabels();
      if (result.success && result.data) {
        setLabels(result.data || []);
      }
    } catch (error) {
      console.error('Error loading labels:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLabelContacts = async (labelId: string | number) => {
    setLoadingContacts(true);
    try {
      const result = await whapiClient.getLabelContacts(labelId);
      if (result.success && result.data) {
        setContacts(result.data.chats || result.data.contacts || []);
      }
    } catch (error) {
      console.error('Error loading label contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadAllChats = async () => {
    setLoadingChats(true);
    try {
      const result = await whapiClient.getChats(100);
      if (result.success && result.data) {
        const validChats = (result.data.chats || []).filter(
          (chat: any) => chat.type === 'contact' && chat.id !== '0@s.whatsapp.net'
        );
        setAllChats(validChats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleLabelClick = (label: Label) => {
    setSelectedLabel(label);
    setDrawerOpen(true);
    loadLabelContacts(label.id);
    loadAllChats();
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedLabel(null);
    setContacts([]);
    setSelectedContact(null);
  };

  const handleAddContact = async () => {
    if (!selectedContact || !selectedLabel) return;

    setAdding(true);
    try {
      const result = await whapiClient.addContactToLabel(selectedLabel.id, selectedContact);
      if (result.success) {
        notify.success({
          message: 'Contacto añadido',
          description: 'El contacto se asoció a la etiqueta'
        });
        loadLabelContacts(selectedLabel.id);
        loadLabels(true);
        setSelectedContact(null);
      } else {
        notify.error({
          message: 'Error',
          description: result.error || 'No se pudo añadir el contacto'
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo añadir el contacto'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!selectedLabel) return;

    try {
      const result = await whapiClient.removeContactFromLabel(selectedLabel.id, contactId);
      if (result.success) {
        notify.success({
          message: 'Contacto eliminado',
          description: 'Se eliminó la asociación con la etiqueta'
        });
        loadLabelContacts(selectedLabel.id);
        loadLabels(true);
      } else {
        notify.error({
          message: 'Error',
          description: result.error || 'No se pudo eliminar el contacto'
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo eliminar el contacto'
      });
    }
  };

  const formatPhone = (id: string): string => {
    return id.replace('@s.whatsapp.net', '').replace('@c.us', '');
  };

  const getLabelColor = (colorIndex: number): string => {
    return LABEL_COLORS[colorIndex] || LABEL_COLORS[0];
  };

  // Filtrar chats que no están ya en la etiqueta
  const availableChats = allChats.filter(
    (chat) => !contacts.some((c) => c.id === chat.id)
  );

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Cargando etiquetas...</div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <TagsOutlined />
            <span>Etiquetas</span>
            <Tag color="blue">{labels.length}</Tag>
          </Space>
        }
        extra={
          <ReloadOutlined
            spin={refreshing}
            onClick={() => loadLabels(true)}
            style={{ cursor: 'pointer', fontSize: 16 }}
          />
        }
      >
        {labels.length === 0 ? (
          <Empty description="No hay etiquetas" />
        ) : (
          <List
            dataSource={labels}
            style={{ maxHeight: 300, overflow: 'auto' }}
            renderItem={(label) => (
              <List.Item
                style={{ padding: '12px 0', cursor: 'pointer' }}
                onClick={() => handleLabelClick(label)}
              >
                <Space>
                  <Tag color={getLabelColor(label.color)} style={{ margin: 0 }}>
                    {label.name}
                  </Tag>
                  {label.count !== undefined && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {label.count} contactos
                    </Text>
                  )}
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Drawer con contactos de la etiqueta */}
      <Drawer
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCloseDrawer}
            />
            {selectedLabel && (
              <Tag color={getLabelColor(selectedLabel.color)}>
                {selectedLabel.name}
              </Tag>
            )}
          </Space>
        }
        placement="right"
        width={400}
        onClose={handleCloseDrawer}
        open={drawerOpen}
        closable={false}
      >
        {/* Añadir contacto */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Añadir contacto
          </Text>
          <Space.Compact style={{ width: '100%' }}>
            <Select
              style={{ flex: 1 }}
              placeholder="Seleccionar contacto..."
              value={selectedContact}
              onChange={setSelectedContact}
              loading={loadingChats}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableChats.map((chat) => ({
                value: chat.id,
                label: formatPhone(chat.id)
              }))}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddContact}
              loading={adding}
              disabled={!selectedContact}
              style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
            />
          </Space.Compact>
        </div>

        {/* Lista de contactos */}
        {loadingContacts ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
            <div style={{ marginTop: 8, color: '#666' }}>Cargando contactos...</div>
          </div>
        ) : contacts.length === 0 ? (
          <Empty description="No hay contactos en esta etiqueta" />
        ) : (
          <List
            dataSource={contacts}
            renderItem={(contact) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="delete"
                    title="¿Eliminar de esta etiqueta?"
                    onConfirm={() => handleRemoveContact(contact.id)}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#25D366' }} />
                  }
                  title={contact.name || formatPhone(contact.id)}
                  description={contact.name ? formatPhone(contact.id) : undefined}
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
};
