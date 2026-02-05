import React, { useState } from 'react';
import { Input, Button, Space, Typography, Spin, Empty } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Chat } from '../../utility/chatTypes';
import ConversationItem from './ConversationItem';
import { sortChatsByTimestamp, getChatDisplayName } from '../../utility/chatUtils';

const { Text } = Typography;

interface ConversationListProps {
  chats: Chat[];
  loading: boolean;
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onRefresh: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  chats,
  loading,
  selectedChat,
  onSelectChat,
  onRefresh,
}) => {
  const [searchText, setSearchText] = useState('');

  // Filter chats by search text
  const filteredChats = chats.filter((chat) => {
    const displayName = getChatDisplayName(chat).toLowerCase();
    return displayName.includes(searchText.toLowerCase());
  });

  // Filter to show only @s.whatsapp.net remoteJid (or first variant if no @s.whatsapp.net)
  const displayedChats = filteredChats.reduce((acc, chat) => {
    const chatId = chat.id || chat.remoteJid;
    
    // Si ya tenemos este chat (por id), no agreguemos duplicados
    if (acc.some(c => (c.id || c.remoteJid) === chatId)) {
      return acc;
    }
    
    // Priorizar el que termina en @s.whatsapp.net
    const variant = filteredChats.find(
      c => (c.id || c.remoteJid) === chatId && c.remoteJid?.endsWith('@s.whatsapp.net')
    );
    
    if (variant) {
      acc.push(variant);
    } else {
      // Si no hay @s.whatsapp.net, usar el primero disponible
      const firstVariant = filteredChats.find(c => (c.id || c.remoteJid) === chatId);
      if (firstVariant) {
        acc.push(firstVariant);
      }
    }
    
    return acc;
  }, [] as Chat[]);

  // Sort chats by timestamp
  const sortedChats = sortChatsByTimestamp(displayedChats);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Search bar */}
      <div style={{ padding: '12px 16px', backgroundColor: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Buscar conversación..."
            prefix={<SearchOutlined style={{ color: '#54656f' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            title="Actualizar conversaciones"
          />
        </Space.Compact>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Cargando conversaciones...</Text>
            </div>
          </div>
        ) : sortedChats.length === 0 ? (
          <Empty
            description={
              searchText
                ? 'No se encontraron conversaciones'
                : 'No hay conversaciones disponibles'
            }
            style={{ marginTop: 50 }}
          />
        ) : (
          sortedChats.map((chat) => (
            <ConversationItem
              key={chat.remoteJid}
              chat={chat}
              selected={selectedChat?.remoteJid === chat.remoteJid}
              onClick={() => onSelectChat(chat)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
