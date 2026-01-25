import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Typography, Button } from 'antd';
import { WhatsAppOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useGetIdentity } from '@refinedev/core';
import { Databases, Query } from '@refinedev/appwrite';
import { appwriteClient } from '../utility/appwriteClient';
import { ChatLayout } from '../components/chat';
import type { WhatsAppAccount } from '../utility/chatTypes';

const { Title, Text } = Typography;

const ChatPage: React.FC = () => {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: identity } = useGetIdentity<{ $id: string }>();
  const navigate = useNavigate();

  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const collectionId = import.meta.env.VITE_APPWRITE_WHATSAPP_COLLECTION_ID;
  const databases = React.useMemo(() => new Databases(appwriteClient), []);

  const loadAccounts = useCallback(async () => {
    if (!identity?.$id) return;
    
    setLoading(true);
    try {
      console.log('📥 Cargando TODAS las instancias de WhatsApp del sistema...');
      
      // Cargar TODAS las instancias sin filtrar por user_id (multiagente)
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('status', 'connected')] // Solo filtrar por status conectado
      );

      const connected = response.documents as unknown as WhatsAppAccount[];

      console.log(`✅ ${connected.length} instancias conectadas encontradas (de todos los usuarios)`);
      setAccounts(connected);
    } catch (error) {
      console.error('❌ Error cargando instancias:', error);
    } finally {
      setLoading(false);
    }
  }, [identity?.$id, databases, databaseId, collectionId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Cargando instancias de WhatsApp...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
            }}
          >
            <WhatsAppOutlined style={{ fontSize: 50, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 12 }}>
            No hay instancias conectadas en el sistema
          </Title>
          <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 24 }}>
            Para usar el chat multiagente, primero necesitas que alguien cree y conecte al menos una
            instancia de WhatsApp. Todos los agentes podrán acceder a las instancias conectadas.
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/')}
            style={{ height: 48, paddingInline: 32 }}
          >
            Crear instancia de WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return <ChatLayout accounts={accounts} />;
};

export default ChatPage;
