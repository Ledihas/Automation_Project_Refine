import React, { useState, useEffect } from 'react';
import { Badge, Tooltip } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import { whapiClient } from '../utility';

export const WhapiStatus: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Cada 60 segundos
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    const result = await whapiClient.getMe();
    setConnected(result.success && !!result.data);
    setChecking(false);
  };

  return (
    <Tooltip title={connected ? 'WhatsApp conectado' : 'WhatsApp desconectado'}>
      <Badge status={connected ? 'success' : 'default'} dot>
        <WhatsAppOutlined
          style={{
            fontSize: 20,
            color: connected ? '#25D366' : '#999',
            opacity: checking ? 0.5 : 1
          }}
        />
      </Badge>
    </Tooltip>
  );
};
