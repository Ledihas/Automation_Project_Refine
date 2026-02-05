import React, { useState, useRef } from 'react';
import { Input, Button, Upload, Space, message as antMessage, Dropdown, Modal, Form, InputNumber } from 'antd';
import {
  SendOutlined,
  PictureOutlined,
  PaperClipOutlined,
  SmileOutlined,
  MoreOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { UploadFile, MenuProps } from 'antd';
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
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [locationForm] = Form.useForm();
  const [contactForm] = Form.useForm();
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
      console.log('📤 Enviando mensaje de texto a:', chatId);
      
      await chatClient.sendText(chatId, messageText);
      
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
      console.log('📤 Enviando imagen a:', chatId);

      // Convert to base64
      const base64 = await chatClient.fileToBase64(file);
      
      await chatClient.sendMedia({
        remoteJid: chatId,
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
      console.log('📤 Enviando documento a:', chatId);

      // Convert to base64
      const base64 = await chatClient.fileToBase64(file);
      
      await chatClient.sendMedia({
        remoteJid: chatId,
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

  // Handle send location
  const handleSendLocation = async (values: any) => {
    setSending(true);

    try {
      console.log('📍 Enviando ubicación a:', chatId);

      await chatClient.sendLocation({
        remoteJid: chatId,
        latitude: values.latitude,
        longitude: values.longitude,
        name: values.name || undefined,
        address: values.address || undefined,
      });

      notify.success({
        message: 'Ubicación enviada',
        description: 'La ubicación se envió correctamente',
        duration: 2,
      });

      setLocationModalVisible(false);
      locationForm.resetFields();
      onMessageSent();
    } catch (error) {
      console.error('❌ Error al enviar ubicación:', error);
      notify.error({
        message: 'Error al enviar ubicación',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setSending(false);
    }
  };

  // Handle send contact
  const handleSendContact = async (values: any) => {
    setSending(true);

    try {
      console.log('👤 Enviando contacto a:', chatId);

      await chatClient.sendContact({
        remoteJid: chatId,
        contact: [
          {
            fullName: values.fullName,
            phoneNumber: values.phoneNumber,
            organization: values.organization || undefined,
          },
        ],
      });

      notify.success({
        message: 'Contacto enviado',
        description: 'El contacto se envió correctamente',
        duration: 2,
      });

      setContactModalVisible(false);
      contactForm.resetFields();
      onMessageSent();
    } catch (error) {
      console.error('❌ Error al enviar contacto:', error);
      notify.error({
        message: 'Error al enviar contacto',
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

  // More options menu
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'location',
      icon: <EnvironmentOutlined />,
      label: 'Enviar ubicación',
      onClick: () => setLocationModalVisible(true),
    },
    {
      key: 'contact',
      icon: <UserOutlined />,
      label: 'Enviar contacto',
      onClick: () => setContactModalVisible(true),
    },
  ];

  return (
    <>
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

          <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              size="large"
              disabled={sending}
              style={{ color: '#54656f' }}
            />
          </Dropdown>
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

      {/* Location Modal */}
      <Modal
        title="Enviar Ubicación"
        open={locationModalVisible}
        onOk={() => locationForm.submit()}
        onCancel={() => setLocationModalVisible(false)}
        okText="Enviar"
        cancelText="Cancelar"
        confirmLoading={sending}
      >
        <Form
          form={locationForm}
          layout="vertical"
          onFinish={handleSendLocation}
        >
          <Form.Item
            label="Latitud"
            name="latitude"
            rules={[{ required: true, message: 'La latitud es requerida' }]}
          >
            <InputNumber
              placeholder="Ej: -34.6037"
              step={0.0001}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Longitud"
            name="longitude"
            rules={[{ required: true, message: 'La longitud es requerida' }]}
          >
            <InputNumber
              placeholder="Ej: -58.3816"
              step={0.0001}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Nombre del lugar"
            name="name"
          >
            <Input placeholder="Ej: Mi casa" />
          </Form.Item>

          <Form.Item
            label="Dirección"
            name="address"
          >
            <Input placeholder="Ej: Calle Principal 123" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Contact Modal */}
      <Modal
        title="Enviar Contacto"
        open={contactModalVisible}
        onOk={() => contactForm.submit()}
        onCancel={() => setContactModalVisible(false)}
        okText="Enviar"
        cancelText="Cancelar"
        confirmLoading={sending}
      >
        <Form
          form={contactForm}
          layout="vertical"
          onFinish={handleSendContact}
        >
          <Form.Item
            label="Nombre Completo"
            name="fullName"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Ej: Juan García" />
          </Form.Item>

          <Form.Item
            label="Número de Teléfono"
            name="phoneNumber"
            rules={[{ required: true, message: 'El número es requerido' }]}
          >
            <Input placeholder="Ej: 521999999999" />
          </Form.Item>

          <Form.Item
            label="Organización"
            name="organization"
          >
            <Input placeholder="Ej: Mi Empresa" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MessageInput;
