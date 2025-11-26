# Multi-stage build para producción optimizada
FROM node:18-alpine AS base

WORKDIR /app

# Instalar dependencias
FROM base AS deps

COPY package.json package-lock.json* ./

RUN npm ci --only=production && \
    npm cache clean --force

# Build de la aplicación
FROM base AS builder

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente (esto invalidará el caché si hay cambios)
COPY . .

# Build con variables de entorno
ARG VITE_APPWRITE_WHATSAPP_COLLECTION_ID
ARG VITE_APPWRITE_DATABASE_ID
ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_PROJECT_ID
ARG VITE_SERVER_URL
ARG VITE_API_KEY
ARG VITE_WEBHOOK_URL
ARG VITE_BOTACO_WEBHOOK_URL
ARG VITE_USE_BASE_PATH=false

ENV VITE_APPWRITE_WHATSAPP_COLLECTION_ID=$VITE_APPWRITE_WHATSAPP_COLLECTION_ID
ENV VITE_APPWRITE_DATABASE_ID=$VITE_APPWRITE_DATABASE_ID
ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_WEBHOOK_URL=$VITE_WEBHOOK_URL
ENV VITE_BOTACO_WEBHOOK_URL=$VITE_BOTACO_WEBHOOK_URL
ENV VITE_USE_BASE_PATH=$VITE_USE_BASE_PATH

RUN npm run build

# Servidor de producción
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar serve globalmente
RUN npm install -g serve

# Copiar archivos construidos
COPY --from=builder /app/dist ./dist

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

# Servir la aplicación en el puerto 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
