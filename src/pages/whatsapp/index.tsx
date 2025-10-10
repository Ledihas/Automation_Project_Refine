import React from "react";
import { Scanner } from "../../components";
import { Card } from "@mui/material";
import { Button } from "antd";

export const ScannerPage: React.FC = () => {
  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1f1f1f, #2c2c2c)",
      }}
    >
      <Button onClick={() => window.history.back()}>Atrás</Button>
      <Card
        style={{
          padding: "2rem",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.2)",
          width: "90%",
          maxWidth: "1100px",
          color: "white",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Escáner de WhatsApp
        </h2>
        <Scanner />
      </Card>
    </div>
  );
};
