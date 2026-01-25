import React from 'react';
import { Select, Space, Typography, Avatar } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import type { WhatsAppAccount } from '../../utility/chatTypes';

const { Text } = Typography;

interface InstanceSelectorProps {
  accounts: WhatsAppAccount[];
  selectedAccount: WhatsAppAccount | null;
  onSelectAccount: (account: WhatsAppAccount | null) => void;
}

const InstanceSelector: React.FC<InstanceSelectorProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
}) => {
  const handleChange = (value: string) => {
    const account = accounts.find((acc) => acc.$id === value);
    onSelectAccount(account || null);
  };

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f0f2f5',
        borderBottom: '1px solid #e8e8e8',
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text strong style={{ fontSize: 14, color: '#111' }}>
          Instancia de WhatsApp (Multiagente)
        </Text>
        <Select
          value={selectedAccount?.$id}
          onChange={handleChange}
          placeholder="Selecciona una instancia compartida"
          style={{ width: '100%' }}
          size="large"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
          }
          options={accounts.map((account) => ({
            value: account.$id,
            label: (
              <Space>
                <Avatar
                  size="small"
                  icon={<WhatsAppOutlined />}
                  style={{ backgroundColor: '#25D366' }}
                />
                <span>{account.instance_name}</span>
              </Space>
            ),
          }))}
        />
        {selectedAccount && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(37, 211, 102, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(37, 211, 102, 0.3)',
            }}
          >
            <Text style={{ fontSize: 12, color: '#128C7E' }}>
              ✓ Conectado como <strong>{selectedAccount.instance_name}</strong>
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Instancia compartida - Todos los agentes pueden acceder
            </Text>
          </div>
        )}
      </Space>
    </div>
  );
};

export default InstanceSelector;
