import React from 'react';
import { Avatar, Badge, Typography } from 'antd';
import { UserOutlined, TeamOutlined, CheckOutlined } from '@ant-design/icons';
import type { Chat } from '../../utility/chatTypes';
import {
  getChatDisplayName,
  formatLastMessageTime,
} from '../../utility/chatUtils';

const { Text } = Typography;

/**
 * Extraer texto del mensaje del formato nuevo de Evolution API
 * @param message - objeto message de lastMessage
 * @returns string de texto o descripción del tipo
 */
function getLastMessageText(message: any): string {
  if (!message) return 'Mensaje';
  
  // Si es un string directo
  if (typeof message === 'string') {
    return message;
  }
  
  // Si es un objeto, buscar propiedades de contenido
  if (typeof message === 'object') {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage) return message.imageMessage.caption || '📷 Imagen';
    if (message.videoMessage) return message.videoMessage.caption || '🎥 Video';
    if (message.documentMessage) return `📄 ${message.documentMessage.fileName || 'Documento'}`;
    if (message.audioMessage) return message.audioMessage.ptt ? '🎤 Audio de voz' : '🎵 Audio';
    if (message.stickerMessage) return '🎨 Sticker';
    if (message.locationMessage) return '📍 Ubicación';
    if (message.contactMessage) return `👤 ${message.contactMessage.displayName}`;
    if (message.call) return '📞 Llamada';
  }
  
  return 'Mensaje';
}

interface ConversationItemProps {
  chat: Chat;
  selected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  chat,
  selected,
  onClick,
}) => {
  const displayName = getChatDisplayName(chat);
  
  // Manejar lastMessage del nuevo formato
  let lastMessageText = 'Sin mensajes';
  let lastMessageTime = '';
  let messageStatus = '';
  
  if (chat.lastMessage) {
    // Formato nuevo de Evolution API - procesar message correctamente
    lastMessageText = getLastMessageText(chat.lastMessage.message);
    
    // Convertir timestamp a número (puede venir como número o string)
    if (chat.lastMessage.messageTimestamp) {
      const timestamp = typeof chat.lastMessage.messageTimestamp === 'string'
        ? parseInt(chat.lastMessage.messageTimestamp)
        : chat.lastMessage.messageTimestamp;
      lastMessageTime = formatLastMessageTime(timestamp);
    }
    
    messageStatus = chat.lastMessage.status || '';
  }
  
  // Usar updatedAt como fallback para el tiempo
  if (!lastMessageTime && chat.updatedAt) {
    const timestamp = Math.floor(new Date(chat.updatedAt).getTime() / 1000);
    lastMessageTime = formatLastMessageTime(timestamp);
  }
  
  const hasUnread = (chat.unreadCount || 0) > 0;
  
  // Determinar si el mensaje es propio (no disponible en el nuevo formato directamente)
  // Por ahora asumimos que no es propio si hay unreadCount
  const isFromMe = false;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: selected ? '#f0f2f5' : '#fff',
        borderBottom: '1px solid #e8e8e8',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = '#fff';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <Badge count={chat.unreadCount || 0} offset={[-5, 5]}>
          <Avatar
            size={48}
            src={chat.profilePicUrl || chat.profilePictureUrl}
            icon={(chat.isGroup === true) ? <TeamOutlined /> : <UserOutlined />}
            style={{ backgroundColor: '#25D366', flexShrink: 0 }}
          />
        </Badge>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name and time */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Text
              strong={hasUnread}
              style={{
                fontSize: 16,
                color: '#111',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {displayName}
            </Text>
            {lastMessageTime && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  color: hasUnread ? '#25D366' : '#667781',
                  marginLeft: 8,
                  flexShrink: 0,
                }}
              >
                {lastMessageTime}
              </Text>
            )}
          </div>

          {/* Last message */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isFromMe && (
              <CheckOutlined
                style={{
                  fontSize: 12,
                  color: 
                    chat.lastMessage && 'message' in chat.lastMessage && chat.lastMessage.status === 'READ' 
                      ? '#34B7F1' 
                      : '#667781',
                  flexShrink: 0,
                }}
              />
            )}
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                color: hasUnread ? '#111' : '#667781',
                fontWeight: hasUnread ? 500 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {lastMessageText}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
