import React from "react";
import { Scanner } from "../../components";
import { Card } from "@mui/material";
import { Button } from "antd";

export const ScannerPage: React.FC = () => {
  return (
    <div
      style={{
        padding: "2rem",
        display: "grid",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
       
      }}
    >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Escáner de WhatsApp
        </h2>
        <Scanner />
      
    </div>
  );
};
