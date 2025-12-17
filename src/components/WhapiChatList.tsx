import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  List,
  Avatar,
  Badge,
  Typography,
  Spin,
  Empty,
  Tag,
  Space,
  Drawer,
  Button,
  Input,
  Modal
} from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  SendOutlined,
  PictureOutlined,
  FileOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { whapiClient } from '../utility';
import { notify } from '../utility/notifications';

const { Text, Paragraph } = Typography;

interface Chat {
  id: string;
  type: string;
  timestamp: number;
  unread?: number;
  not_spam?: boolean;
  last_message?: {
    id: string;
    from_me: boolean;
    type: string;
    timestamp: number;
    text?: { body: string };
    from: string;
    from_name?: string;
  };
}

interface Message {
  id: string;
  from_me: boolean;
  type: string;
  chat_id: string;
  timestamp: number;
  source: string;
  status?: string;
  text?: { body: string };
  from: string;
  from_name?: string;
  action?: { type: string };
}

export const WhapiChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para el drawer de mensajes
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para el modal de previsualización de imagen
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState('');

  // Estado para envío de documentos
  const [sendingDocument, setSendingDocument] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChats();
    const interval = setInterval(() => {
      loadChats(true);
    }, 90000);
    return () => clearInterval(interval);
  }, []);

  const loadChats = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await whapiClient.getChats(500);
      if (result.success && result.data) {
        const validChats = (result.data.chats || []).filter(
          (chat: Chat) => chat.type === 'contact' && chat.id !== '0@s.whatsapp.net'
        );
        setChats(validChats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const result = await whapiClient.getMessages(chatId, 100);
      if (result.success && result.data) {
        const validMessages = (result.data.messages || [])
          .filter((msg: Message) => msg.type !== 'action')
          .sort((a: Message, b: Message) => a.timestamp - b.timestamp);
        setMessages(validMessages);
        // Scroll al final después de cargar
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const result = await whapiClient.sendText(selectedChat.id, messageText.trim());
      if (result.success && result.data?.message) {
        // Agregar mensaje a la lista
        setMessages((prev) => [...prev, result.data.message]);
        setMessageText('');
        setTimeout(() => scrollToBottom(), 100);
      } else {
        notify.error({
          message: 'Error al enviar',
          description: result.error || 'No se pudo enviar el mensaje'
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo enviar el mensaje'
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocumentClick = () => {
    documentInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      notify.error({
        message: 'Archivo inválido',
        description: 'Solo se permiten archivos de imagen'
      });
      return;
    }

    // Crear URL de previsualización
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
    setImageCaption('');
    setImagePreviewOpen(true);

    // Limpiar input para permitir seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    // Limpiar input
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }

    setSendingDocument(true);
    try {
      const result = await whapiClient.sendDocumentFromFile(selectedChat.id, file);
      if (result.success && result.data?.message) {
        setMessages((prev) => [...prev, result.data.message]);
        setTimeout(() => scrollToBottom(), 100);
        notify.success({
          message: 'Documento enviado',
          description: `${file.name} se envió correctamente`
        });
      } else {
        notify.error({
          message: 'Error al enviar documento',
          description: result.error || 'No se pudo enviar el documento'
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo enviar el documento'
      });
    } finally {
      setSendingDocument(false);
    }
  };

  const handleCancelImagePreview = () => {
    setImagePreviewOpen(false);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedFile(null);
    setImagePreviewUrl('');
    setImageCaption('');
  };

  const handleSendImage = async () => {
    if (!selectedFile || !selectedChat) return;

    setSendingImage(true);
    setImagePreviewOpen(false);

    try {
      const result = await whapiClient.sendImageFromFile(
        selectedChat.id,
        selectedFile,
        imageCaption.trim() || undefined
      );
      if (result.success && result.data?.message) {
        setMessages((prev) => [...prev, result.data.message]);
        setTimeout(() => scrollToBottom(), 100);
        notify.success({
          message: 'Imagen enviada',
          description: 'La imagen se envió correctamente'
        });
      } else {
        notify.error({
          message: 'Error al enviar imagen',
          description: result.error || 'No se pudo enviar la imagen'
        });
      }
    } catch (error) {
      notify.error({
        message: 'Error',
        description: 'No se pudo enviar la imagen'
      });
    } finally {
      setSendingImage(false);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setSelectedFile(null);
      setImagePreviewUrl('');
      setImageCaption('');
    }
  };

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
    setDrawerOpen(true);
    loadMessages(chat.id);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedChat(null);
    setMessages([]);
  };

  const formatPhone = (id: string): string => {
    return id.replace('@s.whatsapp.net', '').replace('@c.us', '');
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getLastMessagePreview = (chat: Chat): string => {
    if (!chat.last_message) return 'Sin mensajes';

    const msg = chat.last_message;
    const prefix = msg.from_me ? 'Tú: ' : '';

    if (msg.type === 'text' && msg.text?.body) {
      const body = msg.text.body;
      return prefix + (body.length > 50 ? body.substring(0, 50) + '...' : body);
    }

    const typeLabels: Record<string, string> = {
      image: '📷 Imagen',
      video: '🎥 Video',
      audio: '🎵 Audio',
      voice: '🎤 Nota de voz',
      document: '📄 Documento',
      location: '📍 Ubicación',
      contact: '👤 Contacto',
      sticker: '🎨 Sticker',
      action: '⚡ Acción'
    };

    return prefix + (typeLabels[msg.type] || `[${msg.type}]`);
  };

  const getMessageContent = (msg: Message): React.ReactNode => {
    if (msg.type === 'text' && msg.text?.body) {
      return <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text.body}</span>;
    }

    const typeLabels: Record<string, string> = {
      image: '📷 Imagen',
      video: '🎥 Video',
      audio: '🎵 Audio',
      voice: '🎤 Nota de voz',
      document: '📄 Documento',
      location: '📍 Ubicación',
      contact: '👤 Contacto',
      sticker: '🎨 Sticker'
    };

    return <Text type="secondary" italic>{typeLabels[msg.type] || `[${msg.type}]`}</Text>;
  };

  const getStatusIcon = (status?: string) => {
    if (status === 'read') {
      return <CheckCircleOutlined style={{ color: '#34B7F1', fontSize: 12 }} />;
    }
    if (status === 'delivered') {
      return <CheckOutlined style={{ color: '#999', fontSize: 12 }} />;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 16 }}>Cargando conversaciones...</Paragraph>
        </div>
      </Card>
    );
  }


  return (
    <>
      <Card
        title={
          <Space>
            <MessageOutlined />
            <span>Conversaciones recientes</span>
            <Tag color="blue">{chats.length}</Tag>
          </Space>
        }
        extra={
          <ReloadOutlined
            spin={refreshing}
            onClick={() => loadChats(true)}
            style={{ cursor: 'pointer', fontSize: 16 }}
          />
        }
      >
        {chats.length === 0 ? (
          <Empty description="No hay conversaciones" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={chats}
            style={{ maxHeight: 400, overflow: 'auto' }}
            renderItem={(chat) => (
              <List.Item
                style={{ padding: '12px 0', cursor: 'pointer' }}
                onClick={() => handleChatClick(chat)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={chat.unread || 0} size="small">
                      <Avatar
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: chat.unread ? '#25D366' : '#ccc'
                        }}
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong>{formatPhone(chat.id)}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatTime(chat.timestamp)}
                      </Text>
                    </Space>
                  }
                  description={
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        fontWeight: chat.unread ? 500 : 400
                      }}
                    >
                      {getLastMessagePreview(chat)}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Drawer con historial de mensajes */}
      <Drawer
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCloseDrawer}
            />
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#25D366' }} />
            <div>
              <div style={{ fontWeight: 600 }}>
                {selectedChat ? formatPhone(selectedChat.id) : ''}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {selectedChat?.last_message?.from_name || 'Contacto'}
              </div>
            </div>
          </Space>
        }
        placement="right"
        width={400}
        onClose={handleCloseDrawer}
        open={drawerOpen}
        closable={false}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
      >
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 16,
            background: '#e5ddd5',
            backgroundImage:
              'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xMkMEa+wAAABNSURBVGhD7c8BDQAwDASh+je9Gx4gIJBkJgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOBfDXwAAQFNqwYAAAAASUVORK5CYII=")'
          }}
        >
          {loadingMessages ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin />
              <div style={{ marginTop: 8, color: '#666' }}>Cargando mensajes...</div>
            </div>
          ) : messages.length === 0 ? (
            <Empty description="No hay mensajes" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.from_me ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: msg.from_me ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      backgroundColor: msg.from_me ? '#dcf8c6' : '#fff',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ fontSize: 14, color: '#000' }}>{getMessageContent(msg)}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 4
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatMessageTime(msg.timestamp)}
                      </Text>
                      {msg.from_me && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input para enviar mensaje */}
        <div
          style={{
            padding: 12,
            borderTop: '1px solid #e8e8e8',
            background: '#f0f0f0',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end'
          }}
        >
          {/* Input oculto para seleccionar imagen */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          {/* Input oculto para seleccionar documento */}
          <input
            type="file"
            ref={documentInputRef}
            onChange={handleDocumentChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            style={{ display: 'none' }}
          />
          {/* Botón para adjuntar imagen */}
          <Button
            type="text"
            icon={<PictureOutlined />}
            onClick={handleImageClick}
            loading={sendingImage}
            disabled={sending || sendingDocument}
            style={{
              width: 40,
              height: 40,
              minWidth: 40,
              color: '#54656f'
            }}
            title="Enviar imagen"
          />
          {/* Botón para adjuntar documento */}
          <Button
            type="text"
            icon={<FileOutlined />}
            onClick={handleDocumentClick}
            loading={sendingDocument}
            disabled={sending || sendingImage}
            style={{
              width: 40,
              height: 40,
              minWidth: 40,
              color: '#54656f'
            }}
            title="Enviar documento"
          />
          <Input.TextArea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe un mensaje..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ borderRadius: 20, resize: 'none', flex: 1 }}
            disabled={sending || sendingImage || sendingDocument}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={!messageText.trim() || sendingImage || sendingDocument}
            style={{
              borderRadius: '50%',
              width: 40,
              height: 40,
              minWidth: 40,
              backgroundColor: '#25D366',
              borderColor: '#25D366'
            }}
          />
        </div>
      </Drawer>

      {/* Modal de previsualización de imagen */}
      <Modal
        title={
          <Space>
            <PictureOutlined />
            <span>Enviar imagen</span>
          </Space>
        }
        open={imagePreviewOpen}
        onCancel={handleCancelImagePreview}
        footer={[
          <Button key="cancel" onClick={handleCancelImagePreview} icon={<CloseOutlined />}>
            Cancelar
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSendImage}
            loading={sendingImage}
            icon={<SendOutlined />}
            style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
          >
            Enviar
          </Button>
        ]}
        centered
        width={450}
      >
        {imagePreviewUrl && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img
              src={imagePreviewUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: 300,
                borderRadius: 8,
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        <Input.TextArea
          value={imageCaption}
          onChange={(e) => setImageCaption(e.target.value)}
          placeholder="Añadir un comentario (opcional)..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ borderRadius: 8 }}
        />
      </Modal>
    </>
  );
};
