import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button, Spin, Steps } from "antd";
import { WhatsAppOutlined, ArrowLeftOutlined, LoadingOutlined, CheckCircleOutlined, MobileOutlined, ScanOutlined } from "@ant-design/icons";
import QRCode from "qrcode";
import { ConnectionSuccess } from "../../components/ConnectionSuccess";
import { Databases } from "@refinedev/appwrite";
import { appwriteClient } from "../../utility/appwriteClient";
import { notify } from "../../utility/notifications";

const { Title, Text } = Typography;

const API_KEY = import.meta.env.VITE_API_KEY;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_WHATSAPP_COLLECTION_ID;

export const ScanInstance: React.FC = () => {
  const { instanceName } = useParams();
  const navigate = useNavigate();

  const [qrData, setQrData] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!instanceName) return;
    startQrRefresh(instanceName);
    return () => stopQrRefresh();
  }, [instanceName]);

  useEffect(() => {
    if (isConnected && !showSuccessMessage) {
      updateInstanceStatus(instanceName!);
      notify.connectionSuccess(instanceName!);
      setTimeout(() => setShowSuccessMessage(true), 2000);
    }
  }, [isConnected, showSuccessMessage, instanceName]);

  const updateInstanceStatus = async (name: string) => {
    try {
      const databases = new Databases(appwriteClient);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        `equal("instance_name", "${name}")`
      ]);
      if (response.documents.length > 0) {
        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, response.documents[0].$id, { 
          status: "connected" 
        });
      }
    } catch (err) {
      console.error("Error updating instance status:", err);
    }
  };


  const fetchQr = async (name: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/instance/connect/${name}`, {
        method: "GET",
        headers: { apikey: API_KEY },
      });
      const data = await res.json();
      if (data?.code) {
        const qrImage = await QRCode.toDataURL(data.code, {
          width: 280,
          margin: 2,
          color: { dark: '#075E54', light: '#FFFFFF' }
        });
        setQrData(qrImage);
        setStatus("ready");
      } else {
        setStatus("waiting");
      }
    } catch (err) {
      console.error("Error obteniendo QR:", err);
      setStatus("error");
    }
  };

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
        return;
      }
      if (data?.instance?.state) {
        const state = data.instance.state;
        if (["open", "connected", "authenticated"].includes(state)) {
          stopQrRefresh();
          setIsConnected(true);
        }
      }
    } catch (err) {
      console.error("Error verificando estado:", err);
    }
  };

  const startQrRefresh = (name: string) => {
    stopQrRefresh();
    fetchQr(name);
    intervalRef.current = setInterval(() => {
      fetchQr(name);
      checkStatus(name);
    }, 5000);
  };

  const stopQrRefresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (showSuccessMessage && instanceName) {
    return <ConnectionSuccess instanceName={instanceName} onContinue={() => navigate("/")} />;
  }

  const getStatusInfo = () => {
    switch (status) {
      case "loading":
        return { text: "Generando código QR...", color: "#8696A0" };
      case "ready":
        return { text: "Escanea con tu WhatsApp", color: "#25D366" };
      case "waiting":
        return { text: "Esperando nuevo código...", color: "#faad14" };
      case "error":
        return { text: "Error al obtener QR", color: "#ff4d4f" };
      default:
        return { text: status, color: "#8696A0" };
    }
  };

  const statusInfo = getStatusInfo();


  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 150px)',
      padding: '24px'
    }}>
      <Card
        style={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <WhatsAppOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Conectar WhatsApp
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
            {instanceName}
          </Text>
        </div>

        {/* QR Section */}
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          {/* QR Code */}
          <div style={{
            width: 280,
            height: 280,
            margin: '0 auto 24px',
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(37, 211, 102, 0.2)'
          }}>
            {qrData ? (
              <img src={qrData} alt="QR Code" style={{ width: '100%', height: '100%' }} />
            ) : (
              <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#25D366' }} spin />} />
            )}
          </div>

          {/* Status */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: `${statusInfo.color}15`,
            borderRadius: 20,
            marginBottom: 24
          }}>
            {status === 'loading' || status === 'waiting' ? (
              <LoadingOutlined style={{ color: statusInfo.color, marginRight: 8 }} spin />
            ) : status === 'ready' ? (
              <CheckCircleOutlined style={{ color: statusInfo.color, marginRight: 8 }} />
            ) : null}
            <Text style={{ color: statusInfo.color, fontWeight: 500 }}>{statusInfo.text}</Text>
          </div>

          {/* Instructions */}
          <Steps
            direction="vertical"
            size="small"
            current={-1}
            style={{ textAlign: 'left', maxWidth: 320, margin: '0 auto' }}
            items={[
              {
                title: <Text strong>Abre WhatsApp</Text>,
                description: <Text type="secondary" style={{ fontSize: 12 }}>En tu teléfono móvil</Text>,
                icon: <MobileOutlined style={{ color: '#25D366' }} />
              },
              {
                title: <Text strong>Ve a Dispositivos vinculados</Text>,
                description: <Text type="secondary" style={{ fontSize: 12 }}>Menú → Dispositivos vinculados</Text>,
                icon: <WhatsAppOutlined style={{ color: '#25D366' }} />
              },
              {
                title: <Text strong>Escanea el código QR</Text>,
                description: <Text type="secondary" style={{ fontSize: 12 }}>Apunta la cámara al código</Text>,
                icon: <ScanOutlined style={{ color: '#25D366' }} />
              }
            ]}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          textAlign: 'center'
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            style={{ color: '#8696A0' }}
          >
            Volver al panel
          </Button>
        </div>
      </Card>
    </div>
  );
};
