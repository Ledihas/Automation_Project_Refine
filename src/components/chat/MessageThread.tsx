import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Button, Space, Typography, Spin, Divider, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  MoreOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { Chat, Message } from '../../utility/chatTypes';
import EvolutionChatClient from '../../utility/evolutionChatClient';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import {
  getChatDisplayName,
  groupMessagesByDate,
  formatMessageDate,
} from '../../utility/chatUtils';

const { Text } = Typography;

interface MessageThreadProps {
  chat: Chat;
  chatClient: EvolutionChatClient;
  onChatUpdate: () => void;
  onBack?: () => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  chat,
  chatClient,
  onChatUpdate,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages
  const loadMessages = async () => {
    try {
      // Usar remoteJid si está disponible, sino usar id
      const chatId = chat.remoteJid || chat.id;
      if (!chatId) {
        console.error('❌ No chat ID available');
        return;
      }
      console.log('🔄 Cargando mensajes para:', chatId);
      const msgs = await chatClient.fetchMessages(chatId);
      setMessages(msgs);

      // Mark as read if there are unread messages
      if (msgs.length > 0) {
        const lastMessage = msgs[msgs.length - 1];
        if (!lastMessage.key.fromMe) {
          await chatClient.markAsRead(chatId, lastMessage.key.id);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load profile picture
  const loadProfilePicture = async () => {
    try {
      // Usar remoteJid si está disponible, sino usar id
      const jid = chat.remoteJid || chat.id;
      if (!jid) {
        console.error('❌ No JID available');
        return;
      }
      const pic = await chatClient.getProfilePicture(jid);
      setProfilePic(pic);
    } catch (error) {
      console.error('❌ Error cargando foto de perfil:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadMessages();
    loadProfilePicture();

    // Auto-refresh every 10 seconds
    intervalRef.current = setInterval(() => {
      loadMessages();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chat.remoteJid]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message sent
  const handleMessageSent = () => {
    // Reload messages immediately
    loadMessages();
    // Notify parent to update chat list
    onChatUpdate();
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#efeae2',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#f0f2f5',
          padding: '12px 16px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space size="middle">
          {onBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{ color: '#54656f' }}
            />
          )}
          <Avatar
            size={40}
            src={profilePic}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#25D366' }}
          />
          <div>
            <Text strong style={{ fontSize: 16, display: 'block' }}>
              {getChatDisplayName(chat)}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {chat.isGroup ? 'Grupo' : 'Contacto'}
            </Text>
          </div>
        </Space>

        <Space size="small">
          <Button
            type="text"
            icon={<PhoneOutlined />}
            size="large"
            style={{ color: '#54656f' }}
          />
          <Button
            type="text"
            icon={<VideoCameraOutlined />}
            size="large"
            style={{ color: '#54656f' }}
          />
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="large"
            style={{ color: '#54656f' }}
          />
        </Space>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23efeae2\'/%3E%3Cpath d=\'M20 10h60v2H20zm0 20h60v2H20zm0 20h60v2H20zm0 20h60v2H20z\' fill=\'%23d1d7db\' opacity=\'.1\'/%3E%3C/svg%3E")',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Cargando mensajes...</Text>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <Empty
            description="No hay mensajes en esta conversación"
            style={{ marginTop: 50 }}
          />
        ) : (
          <>
            {Array.from(groupedMessages.entries()).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div style={{ textAlign: 'center', margin: '16px 0' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      padding: '6px 12px',
                      borderRadius: 8,
                      boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {date}
                    </Text>
                  </div>
                </div>

                {/* Messages for this date */}
                {msgs.map((message, index) => (
                  <MessageBubble
                    key={message.key.id || index}
                    message={message}
                    isGroup={chat.isGroup}
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        chatId={chat.remoteJid}
        chatClient={chatClient}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default MessageThread;
