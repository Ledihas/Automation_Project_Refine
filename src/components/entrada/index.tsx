import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  
  
  theme,
  Typography,
} from "antd";
import React from "react";

const { Text } = Typography;
const { useToken } = theme;

export const Entrada: React.FC<RefineThemedLayoutHeaderProps> = () => {
    const { token } = useToken();
    const { data: user } = useGetIdentity();
    

    return (
        <section style={{
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: "center", // 👈 centra horizontal
            alignItems: "center",     // 👈 centra vertical
            padding: "0px 24px",
            height: "64px",
            width: "100vw",
            
        }}>           
            <Text strong style={{ marginRight: "8px", fontSize: 80 }} >
                Más fácil {user?.name}
            </Text>
        </section>
    );
}
