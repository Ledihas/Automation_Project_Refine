import { notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import React from 'react';

// WhatsApp-style notification configurations
const notificationStyles = {
  success: {
    icon: <CheckCircleOutlined style={{ color: '#25D366' }} />,
    style: {
      borderLeft: '4px solid #25D366',
      borderRadius: '12px',
    },
  },
  error: {
    icon: <CloseCircleOutlined style={{ color: '#FF5252' }} />,
    style: {
      borderLeft: '4px solid #FF5252',
      borderRadius: '12px',
    },
  },
  warning: {
    icon: <WarningOutlined style={{ color: '#FFC107' }} />,
    style: {
      borderLeft: '4px solid #FFC107',
      borderRadius: '12px',
    },
  },
  info: {
    icon: <InfoCircleOutlined style={{ color: '#34B7F1' }} />,
    style: {
      borderLeft: '4px solid #34B7F1',
      borderRadius: '12px',
    },
  },
  loading: {
    icon: <LoadingOutlined style={{ color: '#25D366' }} spin />,
    style: {
      borderLeft: '4px solid #25D366',
      borderRadius: '12px',
    },
  },
};

interface NotifyOptions {
  message: string;
  description?: React.ReactNode;
  duration?: number;
  key?: string;
}

export const notify = {
  success: ({ message, description, duration = 4, key }: NotifyOptions) => {
    notification.success({
      message: <span style={{ fontWeight: 600 }}>{message}</span>,
      description,
      duration,
      key,
      placement: 'topRight',
      ...notificationStyles.success,
    });
  },

  error: ({ message, description, duration = 0, key }: NotifyOptions) => {
    notification.error({
      message: <span style={{ fontWeight: 600 }}>{message}</span>,
      description,
      duration,
      key,
      placement: 'topRight',
      ...notificationStyles.error,
    });
  },

  warning: ({ message, description, duration = 5, key }: NotifyOptions) => {
    notification.warning({
      message: <span style={{ fontWeight: 600 }}>{message}</span>,
      description,
      duration,
      key,
      placement: 'topRight',
      ...notificationStyles.warning,
    });
  },

  info: ({ message, description, duration = 4, key }: NotifyOptions) => {
    notification.info({
      message: <span style={{ fontWeight: 600 }}>{message}</span>,
      description,
      duration,
      key,
      placement: 'topRight',
      ...notificationStyles.info,
    });
  },

  loading: ({ message, description, key }: NotifyOptions) => {
    notification.open({
      message: <span style={{ fontWeight: 600 }}>{message}</span>,
      description,
      duration: 0,
      key,
      placement: 'topRight',
      ...notificationStyles.loading,
    });
  },

  close: (key: string) => {
    notification.destroy(key);
  },

  // Special notification for instance creation
  instanceCreated: (instanceName: string) => {
    notification.success({
      message: <span style={{ fontWeight: 600 }}>🎉 ¡Instancia creada!</span>,
      description: (
        <div>
          <p style={{ margin: '8px 0' }}>
            La instancia <strong>{instanceName}</strong> está lista.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#8696A0' }}>
            Escanea el código QR para conectar tu WhatsApp
          </p>
        </div>
      ),
      duration: 5,
      placement: 'topRight',
      ...notificationStyles.success,
    });
  },

  // Special notification for instance deletion
  instanceDeleted: (instanceName: string) => {
    notification.success({
      message: <span style={{ fontWeight: 600 }}>Instancia eliminada</span>,
      description: `${instanceName} ha sido eliminada correctamente`,
      duration: 4,
      placement: 'topRight',
      ...notificationStyles.success,
    });
  },

  // Special notification for connection success
  connectionSuccess: (instanceName: string) => {
    notification.success({
      message: <span style={{ fontWeight: 600 }}>✅ ¡Conectado!</span>,
      description: (
        <div>
          <p style={{ margin: '8px 0' }}>
            <strong>{instanceName}</strong> está conectado al asistente ACO.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#8696A0' }}>
            El bot comenzará a responder automáticamente
          </p>
        </div>
      ),
      duration: 6,
      placement: 'topRight',
      ...notificationStyles.success,
    });
  },

  // API Error notification with details
  apiError: (operation: string, errorMessage: string) => {
    notification.error({
      message: <span style={{ fontWeight: 600 }}>Error en {operation}</span>,
      description: (
        <div>
          <p style={{ margin: '8px 0', wordBreak: 'break-word' }}>
            {errorMessage.length > 150 ? `${errorMessage.substring(0, 150)}...` : errorMessage}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#8696A0' }}>
            Intenta de nuevo o contacta soporte si persiste
          </p>
        </div>
      ),
      duration: 0,
      placement: 'topRight',
      ...notificationStyles.error,
    });
  },
};

export default notify;
