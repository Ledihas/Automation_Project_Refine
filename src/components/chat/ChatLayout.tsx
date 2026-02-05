import React, { useState, useEffect } from 'react';
import { Layout, Typography } from 'antd';
import type { WhatsAppAccount, Chat } from '../../utility/chatTypes';
import EvolutionChatClient from '../../utility/evolutionChatClient';
import InstanceSelector from './InstanceSelector';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';

const { Sider, Content } = Layout;
const { Text } = Typography;

interface ChatLayoutProps {
  accounts: WhatsAppAccount[];
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ accounts }) => {
  const [selectedAccount, setSelectedAccount] = useState<WhatsAppAccount | null>(null);
  const [chatClient, setChatClient] = useState<EvolutionChatClient | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);

  // Initialize chat client when account is selected
  useEffect(() => {
    if (selectedAccount) {
      console.log('🔌 Conectando a instancia:', selectedAccount.instance_name);
      const client = new EvolutionChatClient(selectedAccount.instance_name);
      setChatClient(client);
      loadChats(client);
    } else {
      setChatClient(null);
      setChats([]);
      setSelectedChat(null);
    }
  }, [selectedAccount]);

  // Load chats for selected account
  const loadChats = async (client: EvolutionChatClient) => {
    setLoadingChats(true);
    try {
      const fetchedChats = await client.fetchChats();
      setChats(fetchedChats);
      // Proporcionar al cliente todos los chats para poder cargar mensajes de variantes multi-device
      client.setAllChats(fetchedChats);
    } catch (error) {
      console.error('❌ Error cargando chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  // Handle chat update (refresh chat list)
  const handleChatUpdate = () => {
    if (chatClient) {
      loadChats(chatClient);
    }
  };

  // Handle back from message thread (mobile view)
  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <Layout style={{ height: 'calc(100vh - 64px)', backgroundColor: '#fff' }}>
      {/* Left sidebar - Instance selector + Conversation list */}
      <Sider
        width={400}
        style={{
          backgroundColor: '#fff',
          borderRight: '1px solid #e8e8e8',
          overflow: 'hidden',
          display: selectedChat ? 'none' : 'block',
        }}
        breakpoint="lg"
        collapsedWidth={0}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Instance selector */}
          <InstanceSelector
            accounts={accounts}
            selectedAccount={selectedAccount}
            onSelectAccount={setSelectedAccount}
          />

          {/* Conversation list */}
          {selectedAccount && chatClient ? (
            <ConversationList
              chats={chats}
              loading={loadingChats}
              selectedChat={selectedChat}
              onSelectChat={handleChatSelect}
              onRefresh={() => loadChats(chatClient)}
            />
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <Text type="secondary">
                Selecciona una instancia de WhatsApp para ver las conversaciones
              </Text>
            </div>
          )}
        </div>
      </Sider>

      {/* Main content - Message thread */}
      <Content
        style={{
          backgroundColor: '#efeae2',
          display: selectedChat ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selectedChat && chatClient ? (
          <MessageThread
            chat={selectedChat}
            chatClient={chatClient}
            onChatUpdate={handleChatUpdate}
            onBack={handleBack}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
              }}
            >
              <Text style={{ fontSize: 40 }}>💬</Text>
            </div>
            <Text style={{ fontSize: 18, color: '#667781', display: 'block', marginBottom: 8 }}>
              Chat Multiagente de WhatsApp
            </Text>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Selecciona una conversación para comenzar a chatear
            </Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default ChatLayout;
