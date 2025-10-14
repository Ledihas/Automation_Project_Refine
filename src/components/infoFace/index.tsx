import React from "react";
import { InfoCircleOutlined, ClockCircleOutlined, UserOutlined, InfoOutlined } from "@ant-design/icons";
import { Typography, Space, Divider } from "antd";

const { Title, Paragraph, Text } = Typography;

export const FacebookAutomationInfo: React.FC = () => {
    return (
        <div
            style={{
                color: "white",
                textAlign: "justify",
                padding: "1rem",
                backgroundColor: "rgba(62, 72, 100, 1)",
                borderRadius: "10px",
                border: "1px solid rgba(8, 6, 6, 0.15)",
                boxShadow: "0 0 10px rgba(107, 76, 76, 0.1)",
            }}
        >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Title level={4} style={{ color: "#ffd700", textAlign: "center" }}>
                    Automatización de Envíos en Facebook
                </Title>

                <Paragraph style={{ color: "#ddd" }}>
                    <InfoCircleOutlined style={{ color: "#ffd700" }} />{" "}
                    Este módulo te permitirá automatizar el envío de anuncios en un canal de Facebook llamado{" "}
                    <Text strong>"Full Promoción"</Text>.
                </Paragraph>

                <Paragraph style={{ color: "#ccc" }}>
                    <UserOutlined style={{ color: "#4dabf7" }} /> Antes de comenzar, deberás especificar tu{" "}
                    <Text strong>nombre de usuario en Facebook</Text> para que puedas ser añadido al canal más adelante.
                </Paragraph>

                <Paragraph style={{ color: "#bbb" }}>
                    <InfoOutlined style={{ color: "#f4c430" }} /> También si desea crear supropio canal de promociones o publicar en él
                    déjemelo saber en el chat de soporte y se le atenderá.
                </Paragraph>

                <Divider style={{ borderColor: "rgba(255,255,255,0.2)" }} />

                <Paragraph style={{ color: "#bbb" }}>
                    Luego, escribe el <Text strong>anuncio o mensaje</Text> que deseas enviar.
                    También podrás definir:
                </Paragraph>

                <ul style={{ color: "#bbb", lineHeight: 1.7 }}>
                    <li>🔁 Cuántas veces se publicará el anuncio.</li>
                    <li>
                        <ClockCircleOutlined style={{ color: "#f4c430" }} /> Hasta{" "}
                        <Text strong>5 horarios o fechas</Text> de envío.
                    </li>
                    <li>🚀 Finalmente, presiona el botón para programar la automatización.</li>
                </ul>

                <Divider style={{ borderColor: "rgba(255,255,255,0.2)" }} />

                <Paragraph style={{ color: "#999", fontStyle: "italic", textAlign: "center" }}>
                    Una vez confirmes, tu publicación será enviada automáticamente al canal "Full Promoción"
                    en los horarios que elegiste.
                </Paragraph>
            </Space>
        </div>
    );
};
