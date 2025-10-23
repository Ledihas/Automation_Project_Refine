import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";

const API_KEY = "BQYHJGJHJ";
const SERVER_URL = "http://45.61.157.201/evolution";

export const ScanInstance: React.FC = () => {
  const { instanceName } = useParams();
  const navigate = useNavigate();

  const [qrData, setQrData] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Esperando QR...");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!instanceName) return;
    startQrRefresh(instanceName);

    return () => stopQrRefresh();
  }, [instanceName]);

  // 🔹 Obtiene el QR de EvolutionAPI
  const fetchQr = async (name: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/instance/connect/${name}`, {
        method: "GET",
        headers: { apikey: API_KEY },
      });

      const data = await res.json();

      if (data?.code) {
        const qrImage = await QRCode.toDataURL(data.code);
        setQrData(qrImage);
        setStatus("Escanea el QR o ingresa el código de emparejamiento.");
      } else {
        setStatus("Esperando nuevo QR...");
      }
    } catch (err) {
      console.error("Error obteniendo QR:", err);
      setStatus("Error al obtener QR");
    }
  };

  // 🔹 Consulta el estado de conexión de la instancia
  const checkStatus = async (name: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/instance/connectionState/${name}`, {
        headers: { apikey: API_KEY },
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.warn("Respuesta inesperada:", text);
        return;
      }

      if (data?.instance?.state) {
        const state = data.instance.state;
        setStatus(state);

        if (["open", "connected", "authenticated"].includes(state)) {
          stopQrRefresh();
          setTimeout(() => navigate("/whatsapp"), 1500);
        }
      }
    } catch (err) {
      console.error("Error verificando estado:", err);
    }
  };

  // 🔹 Inicia el intervalo de actualización
  const startQrRefresh = (name: string) => {
    stopQrRefresh();
    fetchQr(name);
    intervalRef.current = setInterval(() => {
      fetchQr(name);
      checkStatus(name);
    }, 5000);
  };

  // 🔹 Detiene el intervalo
  const stopQrRefresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#110a0aff",
        color: "white",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>Escanea el QR de {instanceName}</h2>

      {/* Imagen del QR */}
      {qrData ? (
        <img
          src={qrData}
          alt="QR"
          width={280}
          style={{ margin: "20px 0", borderRadius: "8px" }}
        />
      ) : (
        <p>Cargando QR...</p>
      )}

      {/* Estado de la instancia */}
      <p style={{ marginBottom: "20px" }}>Estado: {status}</p>

      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 18px",
          backgroundColor: "rgba(2, 44, 15, 0.67)",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
        }}
      >
        Volver atrás
      </button>
    </div>
  );
};
