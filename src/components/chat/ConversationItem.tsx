import React from 'react';
import { Avatar, Badge, Typography, Space } from 'antd';
import { UserOutlined, TeamOutlined, CheckOutlined } from '@ant-design/icons';
import type { Chat } from '../../utility/chatTypes';
import {
  getChatDisplayName,
  getMessageText,
  formatLastMessageTime,
} from '../../utility/chatUtils';

const { Text } = Typography;

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
  const lastMessageText = chat.lastMessage ? getMessageText(chat.lastMessage) : 'Sin mensajes';
  const lastMessageTime = chat.conversationTimestamp
    ? formatLastMessageTime(chat.conversationTimestamp)
    : '';
  const hasUnread = (chat.unreadCount || 0) > 0;
  const isFromMe = chat.lastMessage?.key.fromMe || false;

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
            src={chat.profilePictureUrl}
            icon={chat.isGroup ? <TeamOutlined /> : <UserOutlined />}
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
                  color: chat.lastMessage?.status === 'READ' ? '#34B7F1' : '#667781',
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
