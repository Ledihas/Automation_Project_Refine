import React, { useState, useEffect } from "react";
import { Input, Button, DatePicker, TimePicker, Select, message, Card } from "antd";
import type { Dayjs } from "dayjs";


const { TextArea } = Input;
const { Option } = Select;

type ScheduleItem = {
  date: Dayjs | null;
  time: Dayjs | null;
  message: string;
};

export const FacebookAutomationForm: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [sendCount, setSendCount] = useState<number>(1);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Ajusta la cantidad de formularios según el número de envíos
  useEffect(() => {
    setSchedule((prev) => {
      const newSchedule = [...prev];

      if (newSchedule.length < sendCount) {
        const diff = sendCount - newSchedule.length;
        for (let i = 0; i < diff; i++) {
          newSchedule.push({ date: null, time: null, message: "" });
        }
      } else if (newSchedule.length > sendCount) {
        newSchedule.length = sendCount;
      }

      return newSchedule;
    });
  }, [sendCount]);

  const handleDateChange = (index: number, date: Dayjs | null) => {
    const updated = [...schedule];
    updated[index].date = date;
    setSchedule(updated);
  };

  const handleTimeChange = (index: number, time: Dayjs | null) => {
    const updated = [...schedule];
    updated[index].time = time;
    setSchedule(updated);
  };

  const handleMessageChange = (index: number, value: string) => {
    const updated = [...schedule];
    updated[index].message = value;
    setSchedule(updated);
  };

  // 🚀 Enviar los datos al webhook de n8n
  const handleSubmit = async () => {
    if (!username.trim()) {
      message.error("Por favor ingresa tu nombre de usuario de Facebook.");
      return;
    }

    for (let i = 0; i < schedule.length; i++) {
      const s = schedule[i];
      if (!s.date || !s.time) {
        message.error(`Falta la fecha u hora en el envío #${i + 1}.`);
        return;
      }
      if (!s.message.trim()) {
        message.error(`Falta el contenido en el envío #${i + 1}.`);
        return;
      }
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const payload = {
      username,
      sendCount,

      schedule: schedule.map((s) => ({
        date: s.date?.format("YYYY-MM-DD"),
        time: s.time?.format("HH:mm"),
        message: s.message,
        timezone,
      })),
    };
   
    setLoading(true);
     try {
      const response = await fetch("http://45.61.157.201:5678/webhook/sendsms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        message.success(data.message || "¡Publicaciones enviadas correctamente!");
      } else {
        message.error("Error: n8n no confirmó correctamente el envío.");
      }
    } catch (err) {
      console.error(err);
      message.error("No se pudo conectar con n8n.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", color: "#fff" }}>
      <h3 style={{ textAlign: "center", color: "#ffd700" }}>
        Configurar envío automático en Facebook
      </h3>

      <Card
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
          padding: "1.5rem",
          marginTop: "1rem",
        }}
      >
        {/* Nombre de usuario */}
        <div style={{ marginBottom: 20 }}>
          <label>Tu nombre de usuario en Facebook:</label>
          <Input
            placeholder="Ejemplo: juan.promociones"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>

        {/* Cantidad de envíos */}
        <div style={{ marginBottom: 20 }}>
          <label>Cantidad de envíos/publicaciones (máximo 5):</label>
          <Select
            value={sendCount}
            onChange={(value: number) => setSendCount(value)}
            style={{ width: "100%", marginTop: 8 }}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <Option key={num} value={num}>
                {num}
              </Option>
            ))}
          </Select>
        </div>

        {/* Formularios de cada envío */}
        {schedule.map((s, i) => (
          <Card
            key={i}
            size="small"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#ddd",
              marginBottom: 16,
            }}
          >
            <h4 style={{ color: "#ffd700" }}>📅 Envío #{i + 1}</h4>
            <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <DatePicker
                value={s.date}
                onChange={(d) => handleDateChange(i, d)}
                format="YYYY-MM-DD"
              />
              <TimePicker
                value={s.time}
                onChange={(t) => handleTimeChange(i, t)}
                format="HH:mm"
              />
              <p style={{ color: "#bbb" }}>
                 🌍 Zona horaria detectada: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </div>
            <TextArea
              rows={3}
              placeholder={`Contenido de la publicación #${i + 1}`}
              value={s.message}
              onChange={(e) => handleMessageChange(i, e.target.value)}
            />
          </Card>
        ))}

        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          style={{
            marginTop: 20,
            width: "100%",
            backgroundColor: "#ffd700",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          Confirmar programación
        </Button>
      </Card>
    </div>
  );
};
