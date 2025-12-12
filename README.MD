# Automation Project - Panel de Gestión WhatsApp + IA

Panel de administración para gestionar instancias de WhatsApp conectadas al asistente de IA ACO. Permite crear, conectar y administrar múltiples cuentas de WhatsApp que responden automáticamente a los clientes.

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Framework Admin | Refine v5 |
| UI Components | Ant Design 5 + Material UI Icons |
| Backend/BaaS | Appwrite (auth + database) |
| API WhatsApp | EvolutionAPI |
| CRM | Chatwoot (opcional) |
| Despliegue | Docker (multi-stage build) |

## Características

- 🎨 Tema WhatsApp personalizado (verde #25D366)
- 🌙 Modo oscuro/claro
- 📱 Diseño responsive
- 🔔 Sistema de notificaciones mejorado
- 🔐 Autenticación completa con Appwrite
- 💬 Integración con Chatwoot (opcional)

## Funcionalidades

### Autenticación
- Login con email/contraseña
- Registro de nuevos usuarios
- Recuperación de contraseña
- Sesiones persistentes con verificación automática
- Protección de rutas (redirect a login si no autenticado)

### Gestión de Instancias WhatsApp
- **Crear instancia**: Wizard de 3 pasos (Nombre → Chatwoot → Confirmar)
- **Listar instancias**: Cards con estado visual y badges
- **Eliminar instancia**: Elimina de EvolutionAPI y Appwrite sincronizadamente
- **Estados**: `pending` (esperando conexión) / `connected` (activo)
- **Reconectar**: Botón para volver a escanear QR en instancias pendientes

### Integración Chatwoot
Al crear una instancia, puedes configurar opcionalmente la integración con Chatwoot:
- Account ID y Token de API
- Nombre personalizado del Inbox
- Firma de mensajes automática
- Reapertura de conversaciones
- Importación de contactos y mensajes históricos
- Unificación de contactos de Brasil

### Conexión vía QR
- Página dedicada con diseño WhatsApp
- Instrucciones paso a paso
- Actualización automática del QR cada 5 segundos
- Indicadores de estado visuales
- Pantalla de éxito animada al conectar

### Sistema de Notificaciones
- Notificaciones estilizadas con bordes de color
- Tipos: success, error, warning, info, loading
- Notificaciones especiales para crear/eliminar instancias
- Mensajes de error detallados para debugging

## Estructura del Proyecto

```
src/
├── App.tsx                    # Configuración de rutas y Refine
├── authProvider.ts            # Lógica de autenticación con Appwrite
├── index.tsx                  # Punto de entrada
│
├── pages/
│   ├── Dashboard.tsx          # Panel principal con header estilizado
│   └── whatsapp/
│       └── scanIstance.tsx    # Página de escaneo QR mejorada
│
├── components/
│   ├── index.ts               # Exports centralizados
│   ├── InstanceManager.tsx    # CRUD con wizard de 3 pasos
│   ├── ConnectionSuccess.tsx  # Pantalla post-conexión con animaciones
│   └── header/
│       └── index.tsx          # Header con menú de usuario y tema
│
├── contexts/
│   └── color-mode/
│       └── index.tsx          # Tema WhatsApp (claro/oscuro)
│
└── utility/
    ├── index.ts               # Exports centralizados
    ├── appwriteClient.ts      # Cliente Appwrite configurado
    ├── instanceUtils.ts       # Validación y generación de nombres
    ├── notifications.tsx      # Sistema de notificaciones personalizado
    └── normalize.ts           # Utilidades de normalización
```

## Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
# Appwrite
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tu_project_id
VITE_APPWRITE_DATABASE_ID=tu_database_id
VITE_APPWRITE_WHATSAPP_COLLECTION_ID=whatsapp_accounts

# EvolutionAPI
VITE_SERVER_URL=http://tu-servidor:8080
VITE_API_KEY=tu_api_key

# Webhooks
VITE_BOTACO_WEBHOOK_URL=http://n8n:5678/webhook/botaco

# Chatwoot (opcional)
VITE_CHATWOOT_URL=https://tu-chatwoot.com
```


### Requisitos en Appwrite

1. Crear proyecto en Appwrite
2. Crear base de datos
3. Crear colección `whatsapp_accounts` con los campos:

**Campos básicos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | string | ID del usuario propietario |
| `instance_name` | string | Nombre único de la instancia |
| `status` | string | Estado: pending/connected |
| `api_key` | string | API key asociada |
| `created_at` | string | Fecha de creación |

**Campos de Chatwoot (opcionales):**
| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
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

## Instalación y Ejecución

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Producción con Docker

```bash
# Construir imagen
docker build -t automation-project \
  --build-arg VITE_APPWRITE_ENDPOINT=... \
  --build-arg VITE_APPWRITE_PROJECT_ID=... \
  --build-arg VITE_APPWRITE_DATABASE_ID=... \
  --build-arg VITE_APPWRITE_WHATSAPP_COLLECTION_ID=... \
  --build-arg VITE_SERVER_URL=... \
  --build-arg VITE_API_KEY=... \
  --build-arg VITE_CHATWOOT_URL=... \
  .

# Ejecutar contenedor
docker run -p 3000:3000 automation-project
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |

## Flujo de Creación de Instancia

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Paso 1:       │────▶│   Paso 2:       │────▶│   Paso 3:       │
│   Nombre        │     │   Chatwoot      │     │   Confirmar     │
│   instancia     │     │   (opcional)    │     │   y crear       │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Asistente     │◀────│   Conexión      │◀────│   Escanear      │
│   Activo        │     │   Exitosa       │     │   QR            │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Arquitectura de Integración

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    React     │─────▶│  Appwrite    │      │   Chatwoot   │
│    Panel     │      │  (Auth/DB)   │      │   (CRM)      │
└──────┬───────┘      └──────────────┘      └──────▲───────┘
       │                                          │
       │              ┌──────────────┐            │
       └─────────────▶│ EvolutionAPI │────────────┘
                      │  (WhatsApp)  │
                      └──────┬───────┘
                             │
                      ┌──────▼───────┐
                      │     n8n      │
                      │  (Webhooks)  │
                      └──────────────┘
```

## Payload de EvolutionAPI con Chatwoot

Cuando se crea una instancia con Chatwoot configurado, se envía el siguiente payload:

```json
{
  "instanceName": "MiTienda_1234",
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
  "chatwootToken": "tu_token_aqui",
  "chatwootUrl": "https://tu-chatwoot.com",
  "chatwootSignMsg": true,
  "chatwootReopenConversation": true,
  "chatwootConversationPending": false,
  "chatwootNameInbox": "MiTienda_1234",
  "chatwootMergeBrazilContacts": true,
  "chatwootImportContacts": true,
  "chatwootImportMessages": true,
  "chatwootDaysLimitImportMessages": 3,
  "chatwootOrganization": "ACO Assistant",
  "chatwootLogo": "https://evolution-api.com/files/evolution-api-favicon.png"
}
```

## Tema WhatsApp

El proyecto incluye un tema personalizado inspirado en WhatsApp:

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | #25D366 | Botones, badges, acentos |
| Primary Hover | #128C7E | Estados hover |
| Primary Active | #075E54 | Estados activos |
| Secondary | #34B7F1 | Chatwoot badges, info |
| Background Dark | #0B141A | Fondo modo oscuro |
| Sider Dark | #111B21 | Sidebar modo oscuro |

## Despliegue con Nginx

El proyecto soporta despliegue detrás de Nginx con base path `/whatsapp`:

1. Establecer `VITE_USE_BASE_PATH=true` en el build
2. Configurar Nginx para servir desde `/whatsapp/`

## Licencia

MIT
