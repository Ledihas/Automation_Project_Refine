import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import { QRCodeCanvas } from "qrcode.react";
import { notification } from "antd";
import { account } from "../../utility";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY || "BQYHJGJHJ";
const WEBHOOK_URL =
  import.meta.env.VITE_WEBHOOK_URL ||
  "http://localhost:5678/webhook-test/3f86bf11-685e-4a06-a8c8-e7584cdcad64";
const WEBHOOK_GROUPS_URL =
  import.meta.env.VITE_WEBHOOK_GROUPS_URL ||
  "http://localhost:5678/webhook/grupos";

export const CreateInstanceWithQR: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [target, setTarget] = useState<string>("contacts");
  const [messages, setMessages] = useState<string[]>(["", "", "", ""]); // 4 versiones del mensaje
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newCountryCode, setNewCountryCode] = useState<string>("+1");
  const [newPhone, setNewPhone] = useState<string>("");

  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const hourlyCheckTimer = useRef<NodeJS.Timeout | null>(null);

  /** 🔹 Crear instancia */
  const createInstance = async () => {
    setLoading(true);
    setQrData(null);
    setPairingCode(null);
    setStatus("");

    try {
      const createRes = await fetch(`${SERVER_URL}/instance/create`, {
        method: "POST",
        headers: { apikey: API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName: "Instancia" + Date.now(),
          integration: "WHATSAPP-BAILEYS",
          qrcode: false,
          alwaysOnline: true,
          readMessages: false,
          readStatus: false,
        }),
      });

      const createData = await createRes.json();
      const newInstance = createData.instance.instanceName;
      setInstanceName(newInstance);

      await fetchQR(newInstance);
      await checkConnection(newInstance);

      if (refreshTimer.current) clearInterval(refreshTimer.current);
      refreshTimer.current = setInterval(async () => {
        await checkConnection(newInstance);
        if (status !== "open") await fetchQR(newInstance);
      }, 30000);
    } catch (error) {
      console.error("Error creando instancia:", error);
      notification.error({
        message: "Error",
        description: "No se pudo crear la instancia",
      });
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Obtener QR */
  const fetchQR = async (instance: string) => {
    try {
      const connectRes = await fetch(`${SERVER_URL}/instance/connect/${instance}`, {
        method: "GET",
        headers: { apikey: API_KEY },
      });
      const connectData = await connectRes.json();
      setQrData(connectData.code || null);
      setPairingCode(connectData.pairingCode || null);
    } catch (error) {
      console.error("Error obteniendo QR:", error);
    }
  };

  /** 🔹 Revisar estado */
  const checkConnection = async (instance: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/instance/connectionState/${instance}`, {
        method: "GET",
        headers: { apikey: API_KEY },
      });
      const data = await res.json();
      const newStatus = data.instance?.state;
      setStatus(newStatus);
      if (newStatus === "open") {
        if (hourlyCheckTimer.current) clearInterval(hourlyCheckTimer.current);
        hourlyCheckTimer.current = setInterval(
          () => checkConnection(instance),
          3600000
        );
      }
    } catch (error) {
      console.error("Error al obtener estado:", error);
    }
  };

  /** 🔹 Enviar publicación */
  const sendPublication = async () => {
    if (!instanceName)
      return notification.warning({
        message: "No hay instancia activa",
        description: "Cree una instancia antes de enviar.",
      });

    const validMessages = messages.filter((msg) => msg.trim() !== "");
    if (validMessages.length < 2)
      return notification.warning({
        message: "Faltan mensajes",
        description: "Debe ingresar al menos 2 versiones del mensaje.",
      });

    try {
      const user = await account.get().catch(() => ({ email: "unknown" }));
      const body = {
        instanceName,
        apikey: API_KEY,
        sendToGroups: target === "groups",
        recipients: recipients.map((r) => r.replace(/\D/g, "")),
        messagesArray: validMessages,
        emailUser: user.email,
        urlMedia: null,
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok)
        notification.success({ message: "Mensajes enviados correctamente 🚀" });
      else notification.error({ message: "Error al enviar publicación" });
    } catch (error) {
      console.error("Error enviando publicación:", error);
      notification.error({ message: "Error enviando publicación" });
    }
  };

  /** 🔹 Mostrar explicación */
  const showInfo = () => {
    notification.info({
      message: "¿Por qué 4 mensajes?",
      description:
        "Se solicitan 4 versiones del mensaje para que el sistema elija aleatoriamente cuál enviar en cada ocasión. Esto ayuda a evitar que WhatsApp detecte patrones repetitivos y bloquee el envío por posible spam. Los enlaces que incluyas se mantendrán intactos.",
      duration: 8,
    });
  };

  /** 🔹 Conectar a grupos */
  const connectGroups = async () => {
    try {
      await fetch(WEBHOOK_GROUPS_URL, {
        method: "POST",
        body: JSON.stringify({ instance: instanceName }),
        headers: { "Content-Type": "application/json" },
      });
      notification.success({
        message: "Conectando a grupos",
        description:
          "Se ha enviado la solicitud para unirse a los grupos. Revise su WhatsApp.",
      });
    } catch (error) {
      console.error("Error conectando grupos:", error);
      notification.error({
        message: "Error",
        description:
          "Hubo un problema al intentar unirse a los grupos. Intente nuevamente.",
      });
    }
  };

  /** 🔹 Agregar destinatario */
  const addRecipient = () => {
    const cleanPhone = `${newCountryCode}${newPhone}`.replace(/\D/g, "");
    if (cleanPhone.length < 8)
      return notification.warning({
        message: "Número inválido",
        description: "Verifique el número e intente nuevamente.",
      });
    setRecipients((prev) => [...prev, cleanPhone]);
    setNewPhone("");
  };

  useEffect(() => {
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      if (hourlyCheckTimer.current) clearInterval(hourlyCheckTimer.current);
    };
  }, []);

  return (
    <Card style={{ display: "flex", gap: "20px", backgroundColor: "transparent" }}>
      <CardContent style={{ color: "white", flex: 1 }}>
        <Button variant="contained" color="primary" onClick={createInstance}>
          {loading ? "Creando..." : "Crear instancia y obtener QR"}
        </Button>

        {instanceName && <p>Instancia: {instanceName}</p>}

        {qrData && (
          <div>
            <p>Escanea este QR con WhatsApp:</p>
            <QRCodeCanvas
              value={qrData}
              size={400}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin={true}
            />
          </div>
        )}
        {pairingCode && (
          <p style={{ marginTop: 12, fontWeight: "bold" }}>
            Para vincular con el número de teléfono: {pairingCode}
          </p>
        )}

        {status && <p>Estado: {status}</p>}
      </CardContent>

      {status === "open" && (
        <CardContent style={{ flex: 1, color: "white" }}>
          <p>
            Si desea entrar a más de 600 grupos de USA destinados a{" "}
            <strong>marketing</strong> y <strong>ventas</strong>, seleccione{" "}
            <strong>Unirse a grupos</strong>.
          </p>
          <Button
            variant="contained"
            color="primary"
            onClick={connectGroups}
            style={{ marginBottom: 16 }}
          >
            Unirse a grupos
          </Button>

          <h3>¿Quién prefiere que le envíe la publicación?</h3>
          <RadioGroup value={target} onChange={(e) => setTarget(e.target.value)}>
            <FormControlLabel value="contacts" control={<Radio />} label="Contactos específicos" />
            <FormControlLabel value="groups" control={<Radio />} label="Todos los grupos" />
          </RadioGroup>

          {/* Inputs para las 4 versiones del mensaje */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <h4 style={{ marginRight: 8 }}>Versiones del mensaje</h4>
            <Tooltip title="Más información">
              <IconButton size="small" onClick={showInfo}>
                <InfoIcon style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </div>

          {messages.map((msg, i) => (
            <TextField
              key={i}
              label={`Mensaje versión ${i + 1}`}
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={msg}
              onChange={(e) => {
                const newMessages = [...messages];
                newMessages[i] = e.target.value;
                setMessages(newMessages);
              }}
              style={{ marginBottom: 12, backgroundColor: "white", borderRadius: 8 }}
            />
          ))}

          <Button
            variant="contained"
            color="secondary"
            style={{ marginTop: 16 }}
            onClick={sendPublication}
          >
            Enviar aleatoriamente
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
