import React, { useState, useRef } from 'react';
import { Input, Button, Upload, Space, message as antMessage } from 'antd';
import {
  SendOutlined,
  PictureOutlined,
  PaperClipOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import EvolutionChatClient from '../../utility/evolutionChatClient';
import { notify } from '../../utility/notifications';

const { TextArea } = Input;

interface MessageInputProps {
  chatId: string;
  chatClient: EvolutionChatClient;
  onMessageSent: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  chatClient,
  onMessageSent,
}) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textAreaRef = useRef<any>(null);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Handle send text message
  const handleSendText = async () => {
    if (!text.trim() || sending) return;

    const messageText = text.trim();
    setText('');
    setSending(true);

    try {
      const number = chatClient.extractNumberFromJid(chatId);
      console.log('📤 Enviando mensaje de texto a:', number);
      
      await chatClient.sendText(number, messageText);
      
      notify.success({
        message: 'Mensaje enviado',
        description: 'El mensaje se envió correctamente',
        duration: 2,
      });

      onMessageSent();
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      notify.error({
        message: 'Error al enviar',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
      // Restore text on error
      setText(messageText);
    } finally {
      setSending(false);
      textAreaRef.current?.focus();
    }
  };

  // Handle key down (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Handle send image
  const handleSendImage = async (file: File) => {
    setSending(true);

    try {
      const number = chatClient.extractNumberFromJid(chatId);
      console.log('📤 Enviando imagen a:', number);

      // Convert to base64
      const base64 = await chatClient.fileToBase64(file);
      
      await chatClient.sendMedia({
        number,
        media: base64,
        mediatype: 'image',
        caption: text.trim() || undefined,
      });

      setText('');
      
      notify.success({
        message: 'Imagen enviada',
        description: 'La imagen se envió correctamente',
        duration: 2,
      });

      onMessageSent();
    } catch (error) {
      console.error('❌ Error al enviar imagen:', error);
      notify.error({
        message: 'Error al enviar imagen',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setSending(false);
    }
  };

  // Handle send document
  const handleSendDocument = async (file: File) => {
    setSending(true);

    try {
      const number = chatClient.extractNumberFromJid(chatId);
      console.log('📤 Enviando documento a:', number);

      // Convert to base64
      const base64 = await chatClient.fileToBase64(file);
      
      await chatClient.sendMedia({
        number,
        media: base64,
        mediatype: 'document',
        fileName: file.name,
      });

      notify.success({
        message: 'Documento enviado',
        description: 'El documento se envió correctamente',
        duration: 2,
      });

      onMessageSent();
    } catch (error) {
      console.error('❌ Error al enviar documento:', error);
      notify.error({
        message: 'Error al enviar documento',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setSending(false);
    }
  };

  // Custom upload handler
  const handleUpload = (file: File, type: 'image' | 'document') => {
    if (type === 'image') {
      // Validate image
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        antMessage.error('Solo puedes subir archivos de imagen');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        antMessage.error('La imagen debe ser menor a 10MB');
        return false;
      }
      handleSendImage(file);
    } else {
      // Validate document
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        antMessage.error('El documento debe ser menor a 20MB');
        return false;
      }
      handleSendDocument(file);
    }
    return false; // Prevent default upload
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: '#f0f2f5',
        borderTop: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {/* Attachment buttons */}
      <Space size={4}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => handleUpload(file, 'image')}
          disabled={sending}
        >
          <Button
            type="text"
            icon={<PictureOutlined />}
            size="large"
            disabled={sending}
            style={{ color: '#54656f' }}
          />
        </Upload>

        <Upload
          accept="*"
          showUploadList={false}
          beforeUpload={(file) => handleUpload(file, 'document')}
          disabled={sending}
        >
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            size="large"
            disabled={sending}
            style={{ color: '#54656f' }}
          />
        </Upload>
      </Space>

      {/* Text input */}
      <TextArea
        ref={textAreaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        autoSize={{ minRows: 1, maxRows: 5 }}
        disabled={sending}
        style={{
          flex: 1,
          borderRadius: 20,
          padding: '8px 16px',
          resize: 'none',
        }}
      />

      {/* Send button */}
      <Button
        type="primary"
        icon={<SendOutlined />}
        size="large"
        onClick={handleSendText}
        loading={sending}
        disabled={!text.trim() || sending}
        style={{
          borderRadius: '50%',
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </div>
  );
};

export default MessageInput;
