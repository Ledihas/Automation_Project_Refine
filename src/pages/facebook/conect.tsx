import React, { useState } from "react";
import { Card } from "@mui/material";
import { Button } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FacebookAutomationInfo , FacebookAutomationForm} from "../../components"; // ajusta según tu estructura real

import  {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { Routes, Route } from "react-router";

export const ConectPage: React.FC = () => {
    const [showInfo, setShowInfo] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const handleStart = () => {
        // Suavemente oculta la info y luego muestra el formulario
        setShowInfo(false);
        setTimeout(() => {
            setShowForm(true);
        }, 600); // igual al tiempo de la animación
    };

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
            <Routes>
                <Route
                    index
                    element={<NavigateToResource resource="Home" />}
                />
                <Route
                    path="*"
                    element={<CatchAllNavigate to="/" />}
                />
            </Routes>
            <DocumentTitleHandler />
            <UnsavedChangesNotifier />

            {/* Botón de atrás */}
            <Button
                onClick={() => window.history.back()}
                style={{
                    position: "absolute",
                    top: "1.5rem",
                    left: "1.5rem",
                    background: "#444",
                    color: "white",
                    border: "none",
                }}
            >
                Atrás
            </Button>

            {/* Tarjeta principal */}
            <Card
                style={{
                    padding: "2rem",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    width: "90%",
                    maxWidth: "1100px",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "1.5rem",
                        fontWeight: "bold",
                        color: "#ffd700",
                    }}
                >
                    Promocionarte ahora
                </h2>

                {/* Sección animada de información */}
                <AnimatePresence mode="wait">
                    {showInfo && (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            style={{ textAlign: "center" }}
                        >
                            <FacebookAutomationInfo />

                            <Button
                                type="primary"
                                style={{
                                    marginTop: "2rem",
                                    backgroundColor: "#ffd700",
                                    color: "#000",
                                    fontWeight: "bold",
                                    border: "none",
                                    padding: "0.6rem 1.5rem",
                                    borderRadius: "8px",
                                }}
                                onClick={handleStart}
                            >
                                Comenzar
                            </Button>
                        </motion.div>
                    )}

                    {/* Aquí aparecerá el formulario más adelante */}
                    {showForm && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            style={{
                                color: "#ccc",
                                textAlign: "center",
                                padding: "2rem",
                            }}
                        >
                            <h3>📝 Aquí aparecerá tu formulario de automatización</h3>
                            <p>
                                (Por ahora esta es solo una vista placeholder para mostrar la
                                transición)
                            </p>
                            <FacebookAutomationForm />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
};
