# 📋 CONTEXTO COMPLETO DEL PROYECTO - Automation Project

## 🎯 RESUMEN EJECUTIVO

**Nombre del Proyecto:** Automation Project - Panel de Gestión WhatsApp + IA  
**Propósito:** Panel de administración web para gestionar instancias de WhatsApp conectadas al asistente de IA ACO (Agente de Carga Online). Permite crear, conectar y administrar múltiples cuentas de WhatsApp que responden automáticamente a los clientes.

**Stack Principal:**
- Frontend: React 19 + TypeScript + Vite 6
- Framework Admin: Refine v5
- UI: Ant Design 5 + Material UI Icons
- Backend/BaaS: Appwrite (autenticación + base de datos)
- API WhatsApp: EvolutionAPI
- CRM: Chatwoot (integración opcional)
- Despliegue: Docker (multi-stage build)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Automation_Project/
├── src/
│   ├── App.tsx                          # Configuración principal de rutas y Refine
│   ├── index.tsx                        # Punto de entrada de la aplicación
│   ├── authProvider.ts                  # Lógica de autenticación con Appwrite
│   ├── vite-env.d.ts                    # Tipos de Vite
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx                # Panel principal con header estilizado
│   │   ├── AssistantConfigPage.tsx      # Página de configuración del asistente
│   │   └── whatsapp/
│   │       └── scanIstance.tsx          # Página de escaneo QR mejorada
│   │
│   ├── components/
│   │   ├── index.ts                     # Exports centralizados
│   │   ├── InstanceManager.tsx          # CRUD de instancias con wizard de 3 pasos
│   │   ├── AssistantConfig.tsx          # Configuración del asistente ACO
│   │   ├── ConnectionSuccess.tsx        # Pantalla post-conexión con animaciones
│   │   └── header/
│   │       └── index.tsx                # Header con menú de usuario y tema
│   │
│   ├── contexts/
│   │   └── color-mode/
│   │       └── index.tsx                # Tema WhatsApp (claro/oscuro)
│   │
│   └── utility/
│       ├── index.ts                     # Exports centralizados
│       ├── appwriteClient.ts            # Cliente Appwrite configurado
│       ├── instanceUtils.ts             # Validación y generación de nombres
│       ├── notifications.tsx            # Sistema de notificaciones personalizado
│       └── normalize.ts                 # Utilidades de normalización
│
├── public/
│   └── favicon.ico
│
├── .env                                 # Variables de entorno (no versionado)
├── .env.example                         # Plantilla de variables de entorno
├── .gitignore
├── .dockerignore
├── Dockerfile                           # Multi-stage build para producción
├── build-docker.sh                      # Script de construcción Docker
├── Makefile                             # Comandos útiles de Docker
├── package.json                         # Dependencias y scripts
├── tsconfig.json                        # Configuración TypeScript
├── vite.config.ts                       # Configuración Vite
├── eslint.config.js                     # Configuración ESLint
├── README.MD                            # Documentación principal
├── DOCKER_GUIDE.md                      # Guía de Docker
└── DOCKER_NETWORK_DIAGRAM.md            # Diagrama de red Docker
```

---

## 🔧 CONFIGURACIÓN Y VARIABLES DE ENTORNO

### Variables Requeridas (.env)

```env
# Appwrite (Backend as a Service)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tu_project_id
VITE_APPWRITE_DATABASE_ID=tu_database_id
VITE_APPWRITE_WHATSAPP_COLLECTION_ID=whatsapp_accounts

# EvolutionAPI (WhatsApp Gateway)
VITE_SERVER_URL=http://tu-servidor:8080
VITE_API_KEY=tu_api_key

# Webhooks
VITE_BOTACO_WEBHOOK_URL=http://n8n:5678/webhook/botaco
VITE_CONFIG_WEBHOOK_URL=https://n8m.agentedecargaonline.com/webhook/configBot

# Chatwoot (CRM - opcional)
VITE_CHATWOOT_URL=https://tu-chatwoot.com

# Despliegue (opcional)
VITE_USE_BASE_PATH=false  # true para Nginx con /whatsapp/
```

---

## 🗄️ MODELO DE DATOS (APPWRITE)

### Colección: `whatsapp_accounts`

**Campos básicos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | string | ID del usuario propietario (FK) |
| `instance_name` | string | Nombre único de la instancia (ej: Tienda_1234) |
| `status` | string | Estado: "pending" o "connected" |
| `api_key` | string | API key de EvolutionAPI |
| `created_at` | string | Fecha de creación ISO 8601 |

**Campos de Chatwoot (opcionales):**
| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `chatwoot_url` | string | - | URL del servidor Chatwoot |
| `chatwoot_account_id` | string | - | ID de cuenta Chatwoot |
| `chatwoot_token` | string | - | Token de API Chatwoot |
| `chatwoot_sign_msg` | boolean | true | Firmar mensajes con nombre del agente |
| `chatwoot_reopen_conversation` | boolean | true | Reabrir conversación al recibir mensaje |
| `chatwoot_conversation_pending` | boolean | false | Crear conversaciones como pendientes |
| `chatwoot_name_inbox` | string | - | Nombre personalizado del inbox |
| `chatwoot_merge_brazil_contacts` | boolean | true | Unificar contactos de Brasil |
| `chatwoot_import_contacts` | boolean | true | Importar contactos existentes |
| `chatwoot_import_messages` | boolean | true | Importar mensajes históricos |
| `chatwoot_days_limit_import` | number | 3 | Días límite para importar mensajes |
| `chatwoot_organization` | string | "ACO Assistant" | Nombre de la organización |
| `chatwoot_logo` | string | - | URL del logo |

---

## 🔐 AUTENTICACIÓN (authProvider.ts)

**Proveedor:** Appwrite Account API

**Métodos implementados:**
- `login`: Autenticación con email/contraseña
- `logout`: Cierre de sesión
- `register`: Registro de nuevos usuarios
- `check`: Verificación de sesión activa
- `getIdentity`: Obtener datos del usuario actual
- `onError`: Manejo de errores

**Flujo:**
1. Usuario ingresa credenciales en `/login`
2. Se crea sesión en Appwrite con `createEmailPasswordSession`
3. Token de sesión se almacena en cookies (manejado por Appwrite SDK)
4. Rutas protegidas verifican sesión con `check()`
5. Redirect automático a `/login` si no hay sesión

---

## 🎨 COMPONENTES PRINCIPALES

### 1. **InstanceManager.tsx** (1039 líneas)
**Propósito:** Gestión completa de instancias de WhatsApp

**Funcionalidades:**
- **Listar instancias:** Cards con estado visual, badges de Chatwoot
- **Crear instancia:** Wizard de 3 pasos
  - Paso 1: Nombre de instancia (validación + preview)
  - Paso 2: Configuración Chatwoot (opcional, colapsable)
  - Paso 3: Revisión y confirmación
- **Eliminar instancia:** Modal de confirmación + eliminación en EvolutionAPI y Appwrite
- **Reconectar:** Botón para volver a escanear QR en instancias pendientes

**Estados:**
- `pending`: Esperando conexión QR
- `connected`: WhatsApp conectado y activo

**Integración con APIs:**
```typescript
// Crear instancia en EvolutionAPI
POST ${SERVER_URL}/instance/create
Headers: { apikey: API_KEY }
Body: {
  instanceName: "Tienda_1234",
  integration: "WHATSAPP-BAILEYS",
  qrcode: true,
  webhook: { url: BOTACO_WEBHOOK_URL, ... },
  // Campos de Chatwoot si están configurados
  chatwootAccountId: "1",
  chatwootToken: "...",
  chatwootUrl: "https://...",
  // ... más campos
}

// Eliminar instancia
DELETE ${SERVER_URL}/instance/delete/${instanceName}
```

**Validación de nombres:**
- Solo alfanuméricos y guiones bajos
- Se agrega sufijo aleatorio de 4 dígitos (ej: `Tienda_1234`)

---

### 2. **AssistantConfig.tsx**
**Propósito:** Configuración del asistente de IA ACO

**Tabs:**
1. **Prompts del Sistema**
   - Prompt principal del asistente
   - Prompt del sub-agente (opcional)
   - Validación de longitud mínima (50 caracteres)

2. **API y Conexiones**
   - API Key de WhatsApp (Whapi)
   - URL del webhook de configuración

3. **Parámetros Avanzados**
   - `batch_size`: Mensajes por iteración (1-50, recomendado 5-15)
   - `max_iterations`: Iteraciones máximas (1-20, recomendado 3-7)

**Integración:**
```typescript
// Cargar configuración
GET ${CONFIG_WEBHOOK_URL}
Response: [{ system_prompt, api_key_wapi, ... }]

// Guardar configuración
POST ${CONFIG_WEBHOOK_URL}
Body: { system_prompt, api_key_wapi, batch_size, max_iterations, ... }
```

**Estados:**
- Sincronizado (verde)
- Cambios sin guardar (naranja)
- Error al cargar (rojo)

---

### 3. **scanIstance.tsx**
**Propósito:** Escaneo de código QR para conectar WhatsApp

**Flujo:**
1. Cargar datos de instancia desde Appwrite
2. Obtener QR de EvolutionAPI (`/instance/connect/${instanceName}`)
3. Renderizar QR con biblioteca `qrcode`
4. Polling cada 5 segundos:
   - Actualizar QR
   - Verificar estado de conexión (`/instance/connectionState/${instanceName}`)
5. Al conectar: actualizar estado en Appwrite → mostrar `ConnectionSuccess`

**Estados del QR:**
- `loading`: Generando código QR
- `ready`: Listo para escanear
- `waiting`: Esperando nuevo código
- `error`: Error al obtener QR

**Integración:**
```typescript
// Obtener QR
GET ${SERVER_URL}/instance/connect/${instanceName}
Response: { code: "...", base64: "..." }

// Verificar estado
GET ${SERVER_URL}/instance/connectionState/${instanceName}
Response: { instance: { state: "open" | "connected" | ... } }
```

---

### 4. **ConnectionSuccess.tsx**
**Propósito:** Pantalla de éxito post-conexión

**Elementos:**
- Animación de éxito (gradiente verde WhatsApp)
- Nombre de instancia
- Badge "Asistente IA Activo"
- Nota sobre desactivación
- Botón "Ir al Panel de Control"

---

### 5. **Header (header/index.tsx)**
**Propósito:** Barra superior con usuario y tema

**Elementos:**
- Switch de tema claro/oscuro
- Avatar del usuario
- Dropdown con:
  - Email del usuario
  - Botón "Cerrar sesión"

---

## 🎨 TEMA Y ESTILOS

### Colores WhatsApp
```typescript
{
  primary: '#25D366',        // Verde WhatsApp
  primaryHover: '#128C7E',   // Verde oscuro
  primaryActive: '#075E54',  // Verde muy oscuro
  secondary: '#34B7F1',      // Azul Chatwoot
  backgroundDark: '#0B141A', // Fondo modo oscuro
  siderDark: '#111B21',      // Sidebar modo oscuro
}
```

### Sistema de Notificaciones (notifications.tsx)
**Tipos:**
- `success`: Verde con CheckCircleOutlined
- `error`: Rojo con CloseCircleOutlined
- `warning`: Amarillo con WarningOutlined
- `info`: Azul con InfoCircleOutlined
- `loading`: Verde con LoadingOutlined (spin)

**Notificaciones especiales:**
- `instanceCreated(name)`: Notificación de instancia creada
- `instanceDeleted(name)`: Notificación de instancia eliminada
- `connectionSuccess(name)`: Notificación de conexión exitosa
- `apiError(operation, message)`: Error detallado de API

**Estilo:**
- Borde izquierdo de color según tipo
- Bordes redondeados (12px)
- Posición: `topRight`

---

## 🔄 FLUJOS DE USUARIO

### Flujo 1: Crear Instancia
```
1. Dashboard → Botón "Nueva Instancia"
2. Modal Wizard Paso 1: Ingresar nombre (ej: "Tienda_Ropa")
   - Validación en tiempo real
   - Preview: "Tienda_Ropa_XXXX"
3. Modal Wizard Paso 2: Configurar Chatwoot (opcional)
   - URL, Account ID, Token
   - Opciones avanzadas (colapsables)
4. Modal Wizard Paso 3: Revisar y confirmar
   - Resumen de configuración
5. Crear instancia:
   - POST a EvolutionAPI
   - Guardar en Appwrite
6. Redirect a /whatsapp/scan/${instanceName}
```

### Flujo 2: Conectar WhatsApp
```
1. Página de escaneo QR
2. Cargar datos de Appwrite
3. Obtener QR de EvolutionAPI
4. Mostrar QR + instrucciones
5. Usuario escanea con WhatsApp
6. Polling detecta conexión
7. Actualizar estado en Appwrite
8. Mostrar ConnectionSuccess
9. Botón "Ir al Panel" → Dashboard
```

### Flujo 3: Eliminar Instancia
```
1. Dashboard → Card de instancia → Botón "Eliminar"
2. Modal de confirmación
3. DELETE a EvolutionAPI
4. DELETE en Appwrite
5. Actualizar lista de instancias
6. Notificación de éxito
```

### Flujo 4: Configurar Asistente
```
1. Dashboard → Botón "Configurar Asistente"
2. Página AssistantConfig
3. Cargar configuración actual (GET webhook)
4. Editar en tabs:
   - Prompts del Sistema
   - API y Conexiones
   - Parámetros Avanzados
5. Guardar (POST webhook)
6. Notificación de éxito
```

---

## 🌐 INTEGRACIONES EXTERNAS

### 1. **Appwrite** (Backend as a Service)
**Servicios usados:**
- **Account:** Autenticación de usuarios
- **Databases:** Almacenamiento de instancias

**Configuración:**
```typescript
const appwriteClient = new Appwrite();
appwriteClient
  .setEndpoint(VITE_APPWRITE_ENDPOINT)
  .setProject(VITE_APPWRITE_PROJECT_ID);
```

---

### 2. **EvolutionAPI** (WhatsApp Gateway)
**Endpoints usados:**
- `POST /instance/create`: Crear instancia
- `GET /instance/connect/${name}`: Obtener QR
- `GET /instance/connectionState/${name}`: Estado de conexión
- `DELETE /instance/delete/${name}`: Eliminar instancia

**Autenticación:** Header `apikey: ${API_KEY}`

**Payload de creación con Chatwoot:**
```json
{
  "instanceName": "Tienda_1234",
  "integration": "WHATSAPP-BAILEYS",
  "qrcode": true,
  "alwaysOnline": true,
  "groupsIgnore": true,
  "webhook": {
    "url": "http://n8n:5678/webhook/botaco",
    "byEvents": false,
    "base64": true,
    "events": ["MESSAGES_UPSERT"]
  },
  "chatwootAccountId": "1",
  "chatwootToken": "...",
  "chatwootUrl": "https://...",
  "chatwootAutoCreate": true,
  "chatwootSignMsg": true,
  "chatwootReopenConversation": true,
  "chatwootConversationPending": false,
  "chatwootNameInbox": "Tienda_1234",
  "chatwootMergeBrazilContacts": true,
  "chatwootImportContacts": true,
  "chatwootImportMessages": true,
  "chatwootDaysLimitImportMessages": 3,
  "chatwootOrganization": "ACO Assistant",
  "chatwootLogo": "https://evolution-api.com/files/evolution-api-favicon.png"
}
```

---

### 3. **Chatwoot** (CRM - opcional)
**Integración:** A través de EvolutionAPI

**Funcionalidades:**
- Creación automática de inbox
- Importación de contactos y mensajes
- Firma de mensajes
- Reapertura de conversaciones
- Unificación de contactos de Brasil

---

### 4. **n8n** (Webhooks)
**Webhooks configurados:**
- `VITE_BOTACO_WEBHOOK_URL`: Recibe eventos de WhatsApp (MESSAGES_UPSERT)
- `VITE_CONFIG_WEBHOOK_URL`: Configuración del asistente ACO

---

## 🐳 DESPLIEGUE CON DOCKER

### Dockerfile (Multi-stage build)
**Etapas:**
1. **base:** Node 18 Alpine
2. **deps:** Instalar dependencias de producción
3. **builder:** Build de Vite con variables de entorno
4. **runner:** Servidor de producción con `serve`

**Variables de build:**
```dockerfile
ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_PROJECT_ID
ARG VITE_APPWRITE_DATABASE_ID
ARG VITE_APPWRITE_WHATSAPP_COLLECTION_ID
ARG VITE_SERVER_URL
ARG VITE_API_KEY
ARG VITE_WEBHOOK_URL
ARG VITE_BOTACO_WEBHOOK_URL
ARG VITE_USE_BASE_PATH=false
```

**Puerto:** 3000

**Comando:** `serve -s dist -l 3000`

---

### Scripts útiles (Makefile)
```bash
make rebuild   # Reconstruir sin caché
make build     # Reconstruir con caché
make logs      # Ver logs en tiempo real
make down      # Detener servicios
make restart   # Reiniciar frontend
make up        # Levantar servicios
make clean     # Limpiar completamente
```

---

### build-docker.sh
Script para reconstruir con variables de entorno del `.env`:
```bash
#!/bin/bash
docker build --no-cache \
  --build-arg VITE_APPWRITE_ENDPOINT="${VITE_APPWRITE_ENDPOINT}" \
  --build-arg VITE_APPWRITE_PROJECT_ID="${VITE_APPWRITE_PROJECT_ID}" \
  # ... más args
  -t automation_project:latest .
```

---

## 📦 DEPENDENCIAS PRINCIPALES

### Producción
```json
{
  "@refinedev/antd": "^6.0.1",           // Framework admin
  "@refinedev/appwrite": "^8.0.0",       // Integración Appwrite
  "@refinedev/core": "^5.0.0",           // Core de Refine
  "@refinedev/react-router": "^2.0.0",   // Routing
  "antd": "^5.27.4",                     // UI components
  "@mui/material": "^7.0.0-rc.0",        // Material UI
  "react": "^19.1.0",                    // React
  "react-dom": "^19.1.0",                // React DOM
  "react-router-dom": "^7.9.4",          // Routing
  "qrcode": "^1.5.4",                    // Generación de QR
  "qrcode.react": "^4.2.0",              // Componente QR
  "node-appwrite": "^20.0.0",            // SDK Appwrite
  "framer-motion": "^12.23.24",          // Animaciones
  "dayjs": "^1.11.18",                   // Manejo de fechas
  "uuid": "^9.0.0"                       // Generación de UUIDs
}
```

### Desarrollo
```json
{
  "@vitejs/plugin-react": "^4.4.1",      // Plugin Vite
  "typescript": "^5.8.3",                // TypeScript
  "eslint": "^9.25.0",                   // Linter
  "vite": "^6.3.5"                       // Build tool
}
```

---

## 🔒 SEGURIDAD

### Buenas prácticas implementadas:
1. **Autenticación:** Sesiones manejadas por Appwrite (cookies seguras)
2. **Rutas protegidas:** Componente `<Authenticated>` de Refine
3. **API Keys:** Almacenadas en variables de entorno (no en código)
4. **Tokens Chatwoot:** Input tipo `password` (ocultos en UI)
5. **Usuario no-root:** Dockerfile usa usuario `nodejs` (UID 1001)
6. **Validación de entrada:** Sanitización de nombres de instancia
7. **CORS:** Manejado por EvolutionAPI y Appwrite

### Recomendaciones adicionales:
- Usar HTTPS en producción
- Rotar API keys periódicamente
- Implementar rate limiting en webhooks
- Auditar logs de acceso

---

## 🧪 TESTING Y DEBUGGING

### Logs importantes:
```typescript
// InstanceManager.tsx
console.log('🚀 Creating instance with Chatwoot config:', {...});
console.log('📤 PAYLOAD COMPLETO a EvolutionAPI:', {...});
console.log('📥 Evolution API response status:', status);
console.log('✅ Instancia creada en EvolutionAPI:', data);
console.log('✅ Documento guardado en Appwrite:', doc.$id);

// scanIstance.tsx
console.log('🔍 Buscando instancia en Appwrite:', instanceName);
console.log('📄 Documento recuperado:', {...});
console.log('🔄 Obteniendo QR para:', name);
console.log('📥 Respuesta QR:', { hasCode, hasBase64 });
console.log('📡 Estado de conexión:', state);
```

### Herramientas de debugging:
- **Refine DevTools:** Panel de desarrollo integrado
- **React DevTools:** Inspección de componentes
- **Network Tab:** Monitoreo de requests a APIs
- **Appwrite Console:** Verificación de datos en DB
- **Docker logs:** `docker-compose logs -f frontend`

---

## 🚀 COMANDOS ÚTILES

### Desarrollo local
```bash
npm install              # Instalar dependencias
npm run dev              # Servidor de desarrollo (puerto 3000)
npm run build            # Build de producción
npm run start            # Servidor de producción
```

### Docker
```bash
# Construcción
docker build -t automation_project .
./build-docker.sh

# Ejecución
docker run -p 3000:3000 automation_project
docker-compose up -d

# Debugging
docker-compose logs -f frontend
docker exec -it automation_frontend sh
docker inspect automation_frontend

# Limpieza
docker-compose down
docker system prune -a --volumes
```

---

## 📊 ARQUITECTURA DE INTEGRACIÓN

```
┌──────────────────┐
│   React Panel    │ (Puerto 3000)
│   (Este proyecto)│
└────────┬─────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│    Appwrite      │              │   EvolutionAPI   │
│  (Auth + DB)     │              │   (WhatsApp)     │
└──────────────────┘              └────────┬─────────┘
                                           │
                                           ├──────────┐
                                           │          │
                                           ▼          ▼
                                  ┌──────────────┐ ┌──────────────┐
                                  │   Chatwoot   │ │     n8n      │
                                  │    (CRM)     │ │  (Webhooks)  │
                                  └──────────────┘ └──────────────┘
```

**Flujo de datos:**
1. Usuario crea instancia en React Panel
2. Panel guarda en Appwrite + crea en EvolutionAPI
3. EvolutionAPI conecta WhatsApp + configura Chatwoot
4. Mensajes de WhatsApp → EvolutionAPI → n8n webhook → Asistente ACO
5. Respuestas del asistente → EvolutionAPI → WhatsApp
6. (Opcional) Conversaciones sincronizadas en Chatwoot

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### 1. Cambios no se reflejan en Docker
**Causa:** Caché de Docker  
**Solución:**
```bash
docker-compose up --build --no-cache frontend
# o
make rebuild
```

### 2. Variables de entorno no se aplican
**Causa:** Variables se compilan en build time (no runtime)  
**Solución:** Reconstruir imagen después de cambiar `.env`

### 3. QR no se actualiza
**Causa:** Instancia ya conectada o error en EvolutionAPI  
**Solución:** Verificar estado en EvolutionAPI, eliminar y recrear instancia

### 4. Error "Session not found"
**Causa:** Sesión expirada en Appwrite  
**Solución:** Logout y login nuevamente

### 5. Chatwoot no se integra
**Causa:** Campos faltantes o URL incorrecta  
**Solución:** Verificar logs de EvolutionAPI, asegurar que `chatwootAccountId` y `chatwootToken` estén presentes

---

## 📝 NOTAS IMPORTANTES

1. **Nombres de instancia:** Se genera sufijo aleatorio automáticamente (ej: `Tienda_1234`)
2. **Chatwoot es opcional:** Se puede crear instancia sin Chatwoot
3. **Estado "pending":** Instancia creada pero WhatsApp no conectado
4. **Estado "connected":** WhatsApp conectado y bot activo
5. **Eliminar instancia:** Elimina de EvolutionAPI Y Appwrite (sincronizado)
6. **QR expira:** Se actualiza cada 5 segundos automáticamente
7. **Webhook de n8n:** Recibe eventos `MESSAGES_UPSERT` de WhatsApp
8. **Base path:** Soporta despliegue en `/whatsapp/` con Nginx

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

1. **Testing:** Implementar tests unitarios y E2E
2. **Monitoreo:** Integrar Sentry o similar para error tracking
3. **Analytics:** Agregar métricas de uso (ej: Google Analytics)
4. **Backup:** Implementar backup automático de Appwrite
5. **Multi-idioma:** Agregar soporte i18n
6. **Roles:** Implementar roles de usuario (admin, operador)
7. **Logs:** Panel de logs de conversaciones
8. **Estadísticas:** Dashboard con métricas de instancias
9. **Notificaciones push:** Alertas de desconexión
10. **API REST:** Exponer API para integraciones externas

---

## 📚 RECURSOS Y DOCUMENTACIÓN

- **Refine:** https://refine.dev/docs/
- **Appwrite:** https://appwrite.io/docs
- **EvolutionAPI:** https://doc.evolution-api.com/
- **Ant Design:** https://ant.design/components/overview/
- **Chatwoot:** https://www.chatwoot.com/docs/
- **Vite:** https://vitejs.dev/guide/
- **React Router:** https://reactrouter.com/

---

## 👥 CONTACTO Y SOPORTE

**Proyecto:** Automation Project - ACO Assistant  
**Versión:** 0.1.0  
**Refine Project ID:** rXYWZJ-vUSi4m-2cDzxu

---

## 📄 LICENCIA

MIT

---

**Fecha de generación:** 2026-01-21  
**Generado para:** Claude.ai (contexto de asistencia)
