import React from 'react';
import { Typography, Image, Button, Space, Tag } from 'antd';
import {
  DownloadOutlined,
  FileOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { Message } from '../../utility/chatTypes';
import {
  getMessageType,
  formatMessageTime,
} from '../../utility/chatUtils';

const { Text, Link } = Typography;

interface MessageBubbleProps {
  message: Message;
  isGroup?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isGroup }) => {
  // Validar que el mensaje tenga estructura mínima
  if (!message || !message.key) {
    return null;
  }

  const isFromMe = message.key.fromMe;
  const messageType = getMessageType(message);
  const timestamp = formatMessageTime(message.messageTimestamp);

  // Bubble styles
  const bubbleStyle: React.CSSProperties = {
    maxWidth: '65%',
    padding: '8px 12px',
    borderRadius: isFromMe ? '8px 0 8px 8px' : '0 8px 8px 8px',
    backgroundColor: isFromMe ? '#d9fdd3' : '#fff',
    alignSelf: isFromMe ? 'flex-end' : 'flex-start',
    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
    marginBottom: '4px',
    wordBreak: 'break-word',
  };

  // Render text message
  const renderTextMessage = () => {
    // Validar que message.message existe
    if (!message.message) {
      return <Text type="secondary">Mensaje no disponible</Text>;
    }
    
    const text = message.message.conversation || message.message.extendedTextMessage?.text || '';
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <Text style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{text}</Text>
      </div>
    );
  };

  // Render image message
  const renderImageMessage = () => {
    if (!message.message?.imageMessage) {
      return <Text type="secondary">📷 Imagen no disponible</Text>;
    }
    const img = message.message.imageMessage;
    
    // Validar que la imagen tenga URL
    if (!img.url) {
      return (
        <div>
          {isGroup && !isFromMe && (
            <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
              {message.pushName || 'Usuario'}
            </Text>
          )}
          <Text type="secondary">📷 Imagen no disponible</Text>
          {img.caption && (
            <Text style={{ fontSize: 14, display: 'block', marginTop: 4 }}>{img.caption}</Text>
          )}
        </div>
      );
    }
    
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <Image
          src={img.url}
          alt="Imagen"
          style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 4 }}
          preview
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        {img.caption && (
          <Text style={{ fontSize: 14, display: 'block', marginTop: 4 }}>{img.caption}</Text>
        )}
      </div>
    );
  };

  // Render video message
  const renderVideoMessage = () => {
    if (!message.message?.videoMessage) {
      return <Text type="secondary">🎥 Video no disponible</Text>;
    }
    const video = message.message.videoMessage;
    
    // Validar que el video tenga URL
    if (!video.url) {
      return (
        <div>
          {isGroup && !isFromMe && (
            <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
              {message.pushName || 'Usuario'}
            </Text>
          )}
          <Text type="secondary">🎥 Video no disponible</Text>
          {video.caption && (
            <Text style={{ fontSize: 14, display: 'block', marginTop: 4 }}>{video.caption}</Text>
          )}
        </div>
      );
    }
    
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <div style={{ position: 'relative', marginBottom: 4 }}>
          {video.jpegThumbnail && (
            <img
              src={`data:image/jpeg;base64,${video.jpegThumbnail}`}
              alt="Video thumbnail"
              style={{ width: '100%', borderRadius: 8 }}
            />
          )}
          <PlayCircleOutlined
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 48,
              color: '#fff',
              opacity: 0.9,
            }}
          />
        </div>
        <Button
          type="link"
          icon={<DownloadOutlined />}
          href={video.url}
          target="_blank"
          size="small"
          style={{ padding: 0 }}
        >
          Descargar video
        </Button>
        {video.caption && (
          <Text style={{ fontSize: 14, display: 'block', marginTop: 4 }}>{video.caption}</Text>
        )}
      </div>
    );
  };

  // Render document message
  const renderDocumentMessage = () => {
    if (!message.message?.documentMessage) {
      return <Text type="secondary">📄 Documento no disponible</Text>;
    }
    const doc = message.message.documentMessage;
    const fileName = doc.fileName || doc.title || 'Documento';
    
    // Validar que el documento tenga URL
    if (!doc.url) {
      return (
        <div>
          {isGroup && !isFromMe && (
            <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
              {message.pushName || 'Usuario'}
            </Text>
          )}
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileOutlined style={{ fontSize: 32, color: '#54656f' }} />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 14, display: 'block' }}>{fileName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Documento no disponible
                </Text>
              </div>
            </div>
          </Space>
        </div>
      );
    }
    
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileOutlined style={{ fontSize: 32, color: '#54656f' }} />
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 14, display: 'block' }}>{fileName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {doc.mimetype}
                {doc.pageCount && ` • ${doc.pageCount} páginas`}
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            href={doc.url}
            target="_blank"
            size="small"
            block
          >
            Descargar
          </Button>
        </Space>
      </div>
    );
  };

  // Render audio message
  const renderAudioMessage = () => {
    if (!message.message?.audioMessage) {
      return <Text type="secondary">🔊 Audio no disponible</Text>;
    }
    const audio = message.message.audioMessage;
    const isPTT = audio.ptt; // Push-to-talk (voice note)
    
    // Validar que el audio tenga URL
    if (!audio.url) {
      return (
        <div>
          {isGroup && !isFromMe && (
            <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
              {message.pushName || 'Usuario'}
            </Text>
          )}
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Tag color={isPTT ? 'green' : 'blue'}>
              {isPTT ? '🎤 Audio de voz no disponible' : '🎵 Audio no disponible'}
            </Tag>
          </Space>
        </div>
      );
    }
    
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Tag color={isPTT ? 'green' : 'blue'}>
            {isPTT ? '🎤 Audio de voz' : '🎵 Audio'}
          </Tag>
          <audio controls style={{ width: '100%', maxWidth: 300 }}>
            <source src={audio.url} type={audio.mimetype} />
            Tu navegador no soporta audio.
          </audio>
        </Space>
      </div>
    );
  };

  // Render sticker message
  const renderStickerMessage = () => {
    if (!message.message?.stickerMessage) {
      return <Text type="secondary">✨ Sticker no disponible</Text>;
    }
    const sticker = message.message.stickerMessage;
    
    // Validar que el sticker tenga URL
    if (!sticker.url) {
      return (
        <div>
          {isGroup && !isFromMe && (
            <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
              {message.pushName || 'Usuario'}
            </Text>
          )}
          <Text type="secondary">🎨 Sticker no disponible</Text>
        </div>
      );
    }
    
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <img
          src={sticker.url}
          alt="Sticker"
          style={{ maxWidth: 150, maxHeight: 150 }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<span style="color: #8696A0;">🎨 Sticker no disponible</span>';
          }}
        />
      </div>
    );
  };

  // Render location message
  const renderLocationMessage = () => {
    if (!message.message?.locationMessage) {
      return <Text type="secondary">📍 Ubicación no disponible</Text>;
    }
    const location = message.message.locationMessage;
    const mapsUrl = `https://www.google.com/maps?q=${location.degreesLatitude},${location.degreesLongitude}`;
    
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <Space direction="vertical" size="small">
          <EnvironmentOutlined style={{ fontSize: 32, color: '#25D366' }} />
          {location.name && <Text strong>{location.name}</Text>}
          {location.address && <Text type="secondary" style={{ fontSize: 12 }}>{location.address}</Text>}
          <Link href={mapsUrl} target="_blank">
            Ver en Google Maps
          </Link>
        </Space>
      </div>
    );
  };

  // Render contact message
  const renderContactMessage = () => {
    if (!message.message?.contactMessage) {
      return <Text type="secondary">👤 Contacto no disponible</Text>;
    }
    const contact = message.message.contactMessage;
    
    return (
      <div>
        {isGroup && !isFromMe && (
          <Text strong style={{ color: '#25D366', fontSize: 13, display: 'block', marginBottom: 4 }}>
            {message.pushName || 'Usuario'}
          </Text>
        )}
        <Space direction="vertical" size="small">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UserOutlined style={{ fontSize: 32, color: '#54656f' }} />
            <div>
              <Text strong style={{ display: 'block' }}>{contact.displayName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>Contacto</Text>
            </div>
          </div>
          <Button type="primary" size="small" block>
            Guardar contacto
          </Button>
        </Space>
      </div>
    );
  };

  // Render message content based on type
  const renderMessageContent = () => {
    switch (messageType) {
      case 'text':
        return renderTextMessage();
      case 'image':
        return renderImageMessage();
      case 'video':
        return renderVideoMessage();
      case 'document':
        return renderDocumentMessage();
      case 'audio':
        return renderAudioMessage();
      case 'sticker':
        return renderStickerMessage();
      case 'location':
        return renderLocationMessage();
      case 'contact':
        return renderContactMessage();
      default:
        return <Text type="secondary">Mensaje no soportado</Text>;
    }
  };

  // Render status checks (for sent messages)
  const renderStatus = () => {
    if (!isFromMe) return null;

    const status = message.status;
    let icon = <CheckOutlined style={{ fontSize: 12, color: '#667781' }} />;

    if (status === 'READ' || status === 'PLAYED') {
      icon = (
        <>
          <CheckOutlined style={{ fontSize: 12, color: '#34B7F1', marginRight: -6 }} />
          <CheckOutlined style={{ fontSize: 12, color: '#34B7F1' }} />
        </>
      );
    } else if (status === 'DELIVERY_ACK') {
      icon = (
        <>
          <CheckOutlined style={{ fontSize: 12, color: '#667781', marginRight: -6 }} />
          <CheckOutlined style={{ fontSize: 12, color: '#667781' }} />
        </>
      );
    }

    return icon;
  };

  return (
    <div style={{ display: 'flex', justifyContent: isFromMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={bubbleStyle}>
        {renderMessageContent()}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 4, 
          marginTop: 4 
        }}>
          <Text type="secondary" style={{ fontSize: 11 }}>{timestamp}</Text>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
