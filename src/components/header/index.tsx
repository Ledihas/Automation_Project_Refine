import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Switch,
  theme,
  Typography,
  Dropdown,
  Button,
} from "antd";
import { UserOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import React, { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
};

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const { mutate: logout } = useLogout();

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const menuItems = [
    {
      key: 'email',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Conectado como</Text>
          <div><Text strong>{user?.email}</Text></div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Cerrar sesión',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space size="middle">
        {/* Theme Toggle */}
        <Switch
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          checked={mode === "dark"}
          style={{
            backgroundColor: mode === "dark" ? "#25D366" : undefined,
          }}
        />

        {/* User Menu */}
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            style={{ 
              height: 'auto', 
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Avatar 
              size={36}
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ 
                backgroundColor: '#25D366',
                cursor: 'pointer'
              }}
            />
            {user?.name && (
              <Text strong style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </Text>
            )}
          </Button>
        </Dropdown>
      </Space>
    </AntdLayout.Header>
  );
};
