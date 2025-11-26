# 🐳 Arquitectura de Red Docker - Resumen

## Diagrama de Comunicación

```
┌─────────────────────────────────────────────────────────────┐
│                        app_network (Docker)                 │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │  frontend    │────▶│ evolution-api│                     │
│  │ :3000        │     │ :8080        │                     │
│  └──────────────┘     └──────────────┘                     │
│                            │                                │
│                       ┌────▼─────┐   ┌──────────┐          │
│                       │ postgres  │   │  redis   │          │
│                       │ :5432     │   │ :6379    │          │
│                       └───────────┘   └──────────┘          │
└─────────────────────────────────────────────────────────────┘
         │                           │
         │ (external)                │ (external)
         ▼                           ▼
    nginx:80/443            (no access needed)
 (para Appwrite, etc)
```

## URLs de Acceso

### Desde el navegador (externo):
- **Frontend**: http://localhost:3000
- **N8N**: http://localhost:5678
- **Nginx** (Appwrite): http://localhost/

### Desde dentro de Docker (red interna):
- **Evolution API**: http://evolution-api:8080
- **N8N**: http://n8n:5678
- **Redis**: redis://redis:6379
- **PostgreSQL**: postgres://postgres:5432

## Flujo de Petición - Crear Instancia

```
1. Usuario abre http://localhost:3000 (frontend)
   
2. Frontend carga con VITE_SERVER_URL compilado
   - En desarrollo: http://localhost:8080
   - En Docker: http://evolution-api:8080
   
3. Usuario hace clic en "Crear Instancia"
   
4. Frontend detecta hostname:
   - Si es localhost → fetch('/instance/create') [usa proxy Vite]
   - Si es otro (Docker) → fetch('http://evolution-api:8080/instance/create')
   
5. Solicitud llega a Evolution API en la red interna
   
6. Evolution API responde con éxito
   
7. Frontend guarda en Appwrite (vía VITE_APPWRITE_ENDPOINT)
```

## Configuración Necesaria

### docker-compose.yml - Servicio Frontend

```yaml
frontend:
  build:
    args:
      VITE_SERVER_URL: http://evolution-api:8080  # ← Red interna Docker
      VITE_API_KEY: ${EVOLUTION_API_KEY}
      VITE_BOTACO_WEBHOOK_URL: http://n8n:5678/webhook/botaco  # ← Red interna Docker
```

### Archivos Actualizados

✅ `src/components/InstanceManager.tsx` - Detecta hostname
✅ `src/pages/whatsapp/scanIstance.tsx` - Detecta hostname
✅ `vite.config.ts` - Proxy para desarrollo

## Beneficios

✅ **Aislamiento de red** - Tráfico interno no sale del contenedor
✅ **Seguridad** - Evolution API no está expuesta al mundo
✅ **Performance** - Latencia mínima entre contenedores
✅ **Confiabilidad** - No depende de DNS externo
✅ **Desarrollo local** - Funciona igual que en Docker

## Testing

```bash
# Ver que los servicios estén en la red
docker network ls
docker network inspect automation_project_refine_app_network

# Probar conexión desde frontend
docker exec automation_frontend curl http://evolution-api:8080/instance/list

# Ver logs
docker logs -f automation_frontend
docker logs -f evolution_api
```
