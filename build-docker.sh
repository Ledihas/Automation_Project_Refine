#!/bin/bash

# Script para reconstruir el contenedor Docker con los cambios más recientes

set -e

echo "🔄 Limpiando caché de Docker..."
docker builder prune -f

echo "📦 Construyendo imagen Docker sin caché..."
docker build --no-cache \
  --build-arg VITE_APPWRITE_ENDPOINT="${VITE_APPWRITE_ENDPOINT}" \
  --build-arg VITE_APPWRITE_PROJECT_ID="${VITE_APPWRITE_PROJECT_ID}" \
  --build-arg VITE_APPWRITE_DATABASE_ID="${VITE_APPWRITE_DATABASE_ID}" \
  --build-arg VITE_APPWRITE_WHATSAPP_COLLECTION_ID="${VITE_APPWRITE_WHATSAPP_COLLECTION_ID}" \
  --build-arg VITE_SERVER_URL="${VITE_SERVER_URL}" \
  --build-arg VITE_API_KEY="${VITE_API_KEY}" \
  --build-arg VITE_WEBHOOK_URL="${VITE_WEBHOOK_URL}" \
  --build-arg VITE_BOTACO_WEBHOOK_URL="${VITE_BOTACO_WEBHOOK_URL}" \
  --build-arg VITE_USE_BASE_PATH="${VITE_USE_BASE_PATH:-false}" \
  -t automation_project:latest .

echo "✅ Imagen reconstruida exitosamente!"
echo ""
echo "Para correr el contenedor:"
echo "  docker run -p 3000:3000 automation_project:latest"
echo ""
echo "O si usas docker-compose, ejecuta:"
echo "  docker-compose up --build"
