import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Typography,
  List,
  Tag,
  InputNumber,
  Divider,
  notification,
} from "antd";
import {
  DeleteOutlined,
  SendOutlined,
  PlusOutlined,
  WhatsAppOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { account, appwriteClient } from "../../utility";
import { Databases, Query } from "appwrite";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Variables de entorno
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY || "BQYHJGJHJ";
const WEBHOOK_URL =
  import.meta.env.VITE_WEBHOOK_URL || "http://localhost:5678/webhook/whatsappsms";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const collectionId = import.meta.env.VITE_APPWRITE_WHATSAPP_COLLECTION_ID;

// Códigos de país
const countryCodes = [
  { code: "+1", name: "EE.UU / Canadá" },
  { code: "+52", name: "México" },
  { code: "+57", name: "Colombia" },
  { code: "+51", name: "Perú" },
  { code: "+58", name: "Venezuela" },
  { code: "+54", name: "Argentina" },
  { code: "+55", name: "Brasil" },
  { code: "+56", name: "Chile" },
  { code: "+593", name: "Ecuador" },
  { code: "+507", name: "Panamá" },
  { code: "+53", name: "Cuba" },
];

type Instance = {
  $id: string;
  instance_name: string;
  status: string;
  user_id?: string;
  api_key?: string;
  created_at?: string;
};

export const Scanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([""]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [messageInterval, setMessageInterval] = useState<number>(5);
  const [newCountryCode, setNewCountryCode] = useState<string>("+1");
  const [newPhone, setNewPhone] = useState<string>("");

  const navigate = useNavigate();

  // Cargar instancias guardadas del usuario desde Appwrite
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const user = await account.get();
        const databases = new Databases(appwriteClient);
        const res = await databases.listDocuments(databaseId, collectionId, [
          Query.equal("user_id", user.$id),
        ]);
        // res.documents puede ser any[] — forzamos al tipo Instance[]
        setInstances(Array.isArray(res.documents) ? (res.documents as Instance[]) : []);
      } catch (error) {
        console.error("Error obteniendo instancias:", error);
        notification.error({ message: "Error obteniendo instancias" });
      }
    };
    fetchInstances();
  }, []);

  /** Crear nueva instancia */
  const createInstance = async () => {
    setLoading(true);
    try {
      const name = "Instancia_" + Date.now();

      const createRes = await fetch(`${SERVER_URL}/instance/create`, {
        method: "POST",
        headers: { apikey: API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName: name,
          integration: "WHATSAPP-BAILEYS",
          qrcode: false,
          alwaysOnline: true,
        }),
      });

      if (!createRes.ok) {
        const text = await createRes.text();
        console.error("Error create instance:", text);
        throw new Error("Error creando instancia en EvolutionAPI");
      }

      const createData = await createRes.json();
      const newInstance = createData?.instance?.instanceName || name;

      // Guardar instancia en Appwrite
      const user = await account.get();
      const databases = new Databases(appwriteClient);
      await databases.createDocument(databaseId, collectionId, "unique()", {
        user_id: user.$id,
        instance_name: newInstance,
        api_key: API_KEY,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      notification.success({
        message: "Instancia creada",
        description: `Instancia ${newInstance} registrada.`,
      });

      // Redirigir a la nueva página de escaneo
      navigate(`/whatsapp/scan/${newInstance}`);
    } catch (error) {
      console.error("Error creando instancia:", error);
      notification.error({
        message: "Error",
        description: "No se pudo crear la instancia.",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteInstance = async (name: string, docId: string) => {
    if (!window.confirm(`¿Eliminar la instancia ${name}?`)) return;

    try {
      // 1️⃣ Eliminar en EvolutionAPI
      const res = await fetch(`${SERVER_URL}/instance/delete/${name}`, {
        method: "DELETE",
        headers: { apikey: API_KEY },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error deleting instance:", text);
        notification.error({
          message: "Error eliminando en EvolutionAPI",
          description: `No se pudo eliminar la instancia ${name}`,
        });
        return;
      }

      // 2️⃣ Eliminar en Appwrite
      const databases = new Databases(appwriteClient);
      await databases.deleteDocument(databaseId, collectionId, docId);

      // 3️⃣ Refrescar lista visualmente
      setInstances((prev) => prev.filter((i) => i.$id !== docId));

      notification.success({
        message: "Instancia eliminada",
        description: `La instancia ${name} fue eliminada correctamente.`,
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error inesperado",
        description: "No se pudo eliminar la instancia.",
      });
    }
  };

  // 🔹 Función para enviar mensajes esperando respuesta del webhook
const sendPublication = async () => {
  const instanceToUse = selectedInstance;
    if (!instanceToUse) {
      notification.warning({
        message: "No hay instancia activa",
        description: "Seleccione o cree una instancia antes de enviar.",
      });
      return;
    }

    const validMessages = messages.filter((msg) => msg.trim() !== "");
    if (validMessages.length < 1) {
      notification.warning({
        message: "Faltan mensajes",
        description: "Debe ingresar al menos 1 versión del mensaje.",
      });
      return;
    }

    if (recipients.length === 0) {
      notification.warning({
        message: "Faltan destinatarios",
        description: "Agregue al menos un número de teléfono.",
      });
      return;
    }

    try {
      // 🔸 ACTIVAMOS estado "cargando"
      setLoading(true);

      const user = await account.get().catch(() => ({ email: "unknown" }));
      const body = {
        instanceName: instanceToUse,
        apikey: API_KEY,
        recipients: recipients.map((r) => r.replace(/\D/g, "")),
        messagesArray: validMessages,
        emailUser: (user as any).email || "unknown",
        messageInterval: messageInterval,
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        notification.success({
          message: "✅ Mensajes enviados",
          description: `Se enviaron ${validMessages.length} mensajes a ${recipients.length} destinatarios.`,
        });
      } else {
        const text = await res.text();
        console.error("Webhook error:", text);
        notification.error({ message: "❌ Error enviando los mensajes" });
      }
    } catch (error) {
      console.error("Error enviando mensajes:", error);
      notification.error({ message: "❌ Error inesperado al enviar" });
    } finally {
      // 🔸 DESACTIVAMOS loading SÍ O SÍ (éxito o error)
      setLoading(false);
    }
  };

  const addRecipient = () => {
    const cleanPhone = `${newCountryCode}${newPhone}`.replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      notification.warning({
        message: "Número inválido",
        description: "Verifique el número e intente nuevamente.",
      });
      return;
    }

    setRecipients((prev) => [...prev, `${newCountryCode} ${newPhone}`]);
    setNewPhone("");
  };

  const removeRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: "24px", background: "transparent", minHeight: "100vh", border: "1px solid #f0f0f0", borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 1)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "24px" }}>
        {/* Panel izquierdo - Gestión de Instancias */}
        <div style={{ flex: 1 }}>
          <Card
            title={
              <Space>
                <WhatsAppOutlined style={{ fontSize: 24, color: "#25D366" }} />
                <span style={{ fontSize: 18, fontWeight: "bold" }}>Gestión de Instancias</span>
              </Space>
            }
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={createInstance} loading={loading}>
                Nueva Instancia
              </Button>
            }
          >
            <List
              dataSource={instances}
              renderItem={(inst) => (
                <List.Item
                  key={inst.$id}
                  actions={[
                    <Button key="manage" type="link" onClick={() => navigate(`/whatsapp/groups/${inst.instance_name}`)}>
                      Gestionar Grupos
                    </Button>,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteInstance(inst.instance_name, inst.$id)}
                    />,
                  ]}
                  onClick={() => setSelectedInstance(inst.instance_name)}
                  style={{
                    cursor: "pointer",
                    background: selectedInstance === inst.instance_name ? "#f6f6f6" : "transparent",
                    padding: 12,
                    borderRadius: 8,
                    transition: "all 0.3s",
                  }}
                >
                  <List.Item.Meta
                    avatar={<WhatsAppOutlined style={{ fontSize: 24, color: "#25D366" }} />}
                    title={inst.instance_name}
                    description={
                      <Tag color={inst.status === "connected" ? "success" : "warning"}>
                        {inst.status === "connected" ? <><CheckCircleOutlined /> Conectado</> : <><LoadingOutlined /> Pendiente</>}
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* Panel derecho - Envío de Mensajes */}
        <div style={{ flex: 1 }}>
          <Card
            title={
              <Space>
                <SendOutlined style={{ fontSize: 20 }} />
                <span style={{ fontSize: 18, fontWeight: "bold" }}>Envío de Mensajes</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {/* Sección de Destinatarios */}
              <div>
                <Title level={5}>Agregar Destinatarios</Title>
                <Space style={{ width: "100%" }}>
                  {/* Space.Compact is available in antd; using Space with width for simplicity */}
                  <Select
                    value={newCountryCode}
                    onChange={(value) => setNewCountryCode(value as string)}
                    style={{ width: "50%" }}
                  >
                    {countryCodes.map((c) => (
                      <Select.Option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </Select.Option>
                    ))}
                  </Select>

                  <Input
                    placeholder="Número de teléfono"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{ width: "100%" }}
                  />

                  <Button type="primary" onClick={addRecipient} icon={<PlusOutlined />}>
                    Agregar
                  </Button>
                </Space>

                <List
                  style={{ marginTop: 16 }}
                  size="small"
                  bordered
                  dataSource={recipients}
                  renderItem={(item, index) => (
                    <List.Item
                      key={index}
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeRecipient(index)}
                        />,
                      ]}
                    >
                      <WhatsAppOutlined style={{ marginRight: 8, color: "#25D366" }} />
                      {item}
                    </List.Item>
                  )}
                />
              </div>

              <Divider />

              {/* Configuración del intervalo */}
              <div>
                <Title level={5}>Intervalo entre mensajes</Title>
                <Space align="center">
                  <InputNumber
                    min={1}
                    max={60}
                    value={messageInterval}
                    onChange={(value) => setMessageInterval(Number(value) || 5)}
                    style={{ width: 120 }}
                  />
                  <Text type="secondary">segundos</Text>
                </Space>
              </div>

              <Divider />

              {/* Sección de Mensajes */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Title level={5}>Mensajes</Title>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => setMessages([...messages, ""])}
                  >
                    Agregar mensaje
                  </Button>
                </div>

                <Space direction="vertical" style={{ width: "100%" }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <TextArea
                        value={msg}
                        onChange={(e) => {
                          const newMessages = [...messages];
                          newMessages[i] = e.target.value;
                          setMessages(newMessages);
                        }}
                        placeholder={`Mensaje ${i + 1}`}
                        autoSize={{ minRows: 3 }}
                        style={{ flex: 1 }}
                      />
                      {messages.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            const newMessages = messages.filter((_, index) => index !== i);
                            setMessages(newMessages);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </Space>
              </div>

              <Button
                type="primary"
                icon={loading ? <LoadingOutlined /> : <SendOutlined />}
                onClick={sendPublication}
                size="large"
                block
                loading={loading} // 👈 Esto pone el "spinner"
              >
                {loading ? "Enviando mensajes..." : "Enviar Mensajes"}
              </Button>

            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};
