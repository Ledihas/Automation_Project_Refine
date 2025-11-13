import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { ConnectionSuccess } from "../../components/ConnectionSuccess";
import { Databases } from "@refinedev/appwrite";
import { appwriteClient } from "../../utility/appwriteClient";

const API_KEY = import.meta.env.VITE_API_KEY;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_WHATSAPP_COLLECTION_ID;

export const ScanInstance: React.FC = () => {
  const { instanceName } = useParams();
  const navigate = useNavigate();

  const [qrData, setQrData] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Esperando QR...");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!instanceName) return;
    startQrRefresh(instanceName);

    return () => stopQrRefresh();
  }, [instanceName]);

  // Handle connection success
  useEffect(() => {
    if (isConnected && !showSuccessMessage) {
      // Update instance status in Appwrite
      updateInstanceStatus(instanceName!);
      
      // Show success message after 2-second delay
      setTimeout(() => {
        setShowSuccessMessage(true);
      }, 2000);
    }
  }, [isConnected, showSuccessMessage, instanceName]);

  // Update instance status in Appwrite
  const updateInstanceStatus = async (name: string) => {
    try {
      const databases = new Databases(appwriteClient);
      
      // Find the instance document by instance_name
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [`equal("instance_name", "${name}")`]
      );

      if (response.documents.length > 0) {
        const instanceDoc = response.documents[0];
        
        // Update status to "connected"
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          instanceDoc.$id,
          { status: "connected" }
        );
      }
    } catch (err) {
      console.error("Error updating instance status:", err);
    }
  };

  // Fetch QR code from EvolutionAPI
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

  // Check instance connection status
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
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error("Error verificando estado:", err);
    }
  };

  // Start QR refresh interval
  const startQrRefresh = (name: string) => {
    stopQrRefresh();
    fetchQr(name);
    intervalRef.current = setInterval(() => {
      fetchQr(name);
      checkStatus(name);
    }, 5000);
  };

  // Stop QR refresh interval
  const stopQrRefresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Handle continue to dashboard
  const handleContinue = () => {
    navigate("/");
  };

  // Show success message if connected
  if (showSuccessMessage && instanceName) {
    return (
      <ConnectionSuccess 
        instanceName={instanceName} 
        onContinue={handleContinue} 
      />
    );
  }

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
