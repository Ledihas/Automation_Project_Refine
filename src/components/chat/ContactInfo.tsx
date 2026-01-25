import React from 'react';
import { Drawer, Avatar, Typography, Space, Button, Divider } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  DeleteOutlined,
  InboxOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { Chat } from '../../utility/chatTypes';
import { getChatDisplayName, formatPhoneNumber } from '../../utility/chatUtils';

const { Title, Text } = Typography;

interface ContactInfoProps {
  chat: Chat;
  visible: boolean;
  onClose: () => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  chat,
  visible,
  onClose,
}) => {
  const displayName = getChatDisplayName(chat);
  const phoneNumber = formatPhoneNumber(chat.id);

  const handleArchiveChat = () => {
    // TODO: Implement archive functionality
    console.log('Archivar chat:', chat.id);
  };

  const handleDeleteChat = () => {
    // TODO: Implement delete functionality
    console.log('Eliminar chat:', chat.id);
  };

  const handleBlockContact = () => {
    // TODO: Implement block functionality
    console.log('Bloquear contacto:', chat.id);
  };

  return (
    <Drawer
      title="Información del contacto"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Profile section */}
        <div style={{ textAlign: 'center' }}>
          <Avatar
            size={120}
            src={chat.profilePictureUrl}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#25D366', marginBottom: 16 }}
          />
          <Title level={4} style={{ margin: 0 }}>
            {displayName}
          </Title>
          <Text type="secondary">{phoneNumber}</Text>
        </div>

        <Divider />

        {/* Contact info */}
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Número de teléfono
            </Text>
            <Space>
              <PhoneOutlined style={{ color: '#25D366' }} />
              <Text strong>{phoneNumber}</Text>
            </Space>
          </div>

          {chat.isGroup && (
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Tipo
              </Text>
              <Space>
                <UserOutlined style={{ color: '#25D366' }} />
                <Text strong>Grupo de WhatsApp</Text>
              </Space>
            </div>
          )}
        </Space>

        <Divider />

        {/* Actions */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button
            icon={<InboxOutlined />}
            block
            onClick={handleArchiveChat}
          >
            Archivar conversación
          </Button>
          <Button
            icon={<StopOutlined />}
            block
            onClick={handleBlockContact}
            danger
          >
            Bloquear contacto
          </Button>
          <Button
            icon={<DeleteOutlined />}
            block
            onClick={handleDeleteChat}
            danger
            type="primary"
          >
            Eliminar conversación
          </Button>
        </Space>

        <Divider />

        {/* Additional info */}
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Los mensajes y llamadas están cifrados de extremo a extremo. Nadie fuera de este chat,
            ni siquiera WhatsApp, puede leerlos o escucharlos.
          </Text>
        </div>
      </Space>
    </Drawer>
  );
};

export default ContactInfo;
