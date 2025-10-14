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
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
  "http://localhost:5678/webhook/whatsappsms";
const WEBHOOK_GROUPS_URL =
  import.meta.env.VITE_WEBHOOK_GROUPS_URL ||
  "http://localhost:5678/webhook/groups";

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
  { code: "+502", name: "Guatemala" },
  { code: "+503", name: "El Salvador" },
  { code: "+504", name: "Honduras" },
  { code: "+505", name: "Nicaragua" },
  { code: "+506", name: "Costa Rica" },
  { code: "+53", name: "Cuba" },
  { code: "+1-809", name: "República Dominicana" },
];

export const Scanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [target, setTarget] = useState<string>("contacts");
  const [messages, setMessages] = useState<string[]>(["", "", "", ""]);
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
        "Se solicitan 4 versiones del mensaje para que el sistema elija aleatoriamente cuál enviar en cada ocasión. Esto ayuda a evitar bloqueos de WhatsApp por spam.",
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

    setRecipients((prev) => [...prev, `${newCountryCode} ${newPhone}`]);
    setNewPhone("");
  };

  /** 🔹 Eliminar destinatario */
  const removeRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      if (hourlyCheckTimer.current) clearInterval(hourlyCheckTimer.current);
    };
  }, []);

  return (
    <Card
      style={{
        display: "flex",
        gap: "20px",
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "white",
        padding: "2rem",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {/* 🔹 Panel izquierdo - QR */}
      <CardContent style={{ flex: 1 }}>
        <Button variant="contained" color="primary" onClick={createInstance}>
          {loading ? "Creando..." : "Crear instancia y obtener QR"}
        </Button>

        {instanceName && <p>Instancia: {instanceName}</p>}

        {qrData && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p>Escanea este QR con WhatsApp:</p>
            <QRCodeCanvas
              value={qrData}
              size={300}
              level="H"
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

      {/* 🔹 Panel derecho */}
      {status === "open" && (
        <CardContent style={{ flex: 1 }}>
          <p>
            Si desea entrar a más de 600 grupos de USA de{" "}
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

          <h3>¿A quién desea enviar las publicaciones?</h3>
          <RadioGroup value={target} onChange={(e) => setTarget(e.target.value)}>
            <FormControlLabel
              value="contacts"
              control={<Radio />}
              label="Contactos específicos"
            />
            <FormControlLabel value="groups" control={<Radio />} label="Todos los grupos" />
          </RadioGroup>

          {/* 🔹 Inputs para contactos */}
          {target === "contacts" && (
            <div
              style={{
                marginTop: 12,
                backgroundColor: "rgba(255,255,255,0.08)",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <FormControl size="small" style={{ minWidth: 140 }}>
                  <InputLabel style={{ color: "white" }}>País</InputLabel>
                  <Select
                    value={newCountryCode}
                    onChange={(e) => setNewCountryCode(e.target.value)}
                    label="País"
                    sx={{
                      color: "white",
                      ".MuiSvgIcon-root": { color: "white" },
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    {countryCodes.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Número"
                  variant="outlined"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Ej: 8095551234"
                  size="small"
                  sx={{
                    flex: 1,
                    backgroundColor: "white",
                    borderRadius: 1,
                  }}
                />

                <Button
                  variant="outlined"
                  onClick={addRecipient}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Añadir
                </Button>
              </div>

              {recipients.length > 0 && (
                <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                  {recipients.map((r, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {r}
                      <IconButton
                        size="small"
                        onClick={() => removeRecipient(i)}
                        sx={{ color: "red" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 🔹 Versiones de mensaje */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
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
              style={{
                marginBottom: 12,
                backgroundColor: "white",
                borderRadius: 8,
              }}
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
