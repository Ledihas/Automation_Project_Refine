import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Usa base path solo en producción con Nginx
  base: mode === 'production-nginx' ? '/whatsapp/' : '/',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/instance': {
        target: process.env.VITE_SERVER_URL || 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  },
}));
