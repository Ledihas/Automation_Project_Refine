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
| Despliegue | Docker (multi-stage build) |

## Funcionalidades

### Autenticación
- Login con email/contraseña
- Registro de nuevos usuarios
- Recuperación de contraseña
- Sesiones persistentes con verificación automática
- Protección de rutas (redirect a login si no autenticado)

### Gestión de Instancias WhatsApp
- **Crear instancia**: Genera nombre único con sufijo aleatorio de 4 dígitos
- **Listar instancias**: Muestra todas las instancias del usuario con su estado
- **Eliminar instancia**: Elimina de EvolutionAPI y Appwrite sincronizadamente
- **Estados**: `pending` (esperando conexión) / `connected` (activo)

### Conexión vía QR
- Página dedicada para escanear código QR
- Actualización automática del QR cada 5 segundos
- Verificación de estado de conexión en tiempo real
- Pantalla de éxito al completar la conexión

### Integración con Webhooks
- Configuración automática de webhook al crear instancia
- Recibe eventos `MESSAGES_UPSERT` para procesar mensajes entrantes
- Compatible con n8n y otros procesadores de webhooks

## Estructura del Proyecto

```
src/
├── App.tsx                    # Configuración de rutas y Refine
├── authProvider.ts            # Lógica de autenticación con Appwrite
├── index.tsx                  # Punto de entrada
│
├── pages/
│   ├── Dashboard.tsx          # Panel principal con gestor de instancias
│   └── whatsapp/
│       └── scanIstance.tsx    # Página de escaneo QR
│
├── components/
│   ├── index.ts               # Exports centralizados
│   ├── InstanceManager.tsx    # CRUD completo de instancias
│   ├── ConnectionSuccess.tsx  # Pantalla post-conexión exitosa
│   └── header/
│       └── index.tsx          # Header con toggle dark/light mode
│
├── contexts/
│   └── color-mode/
│       └── index.tsx          # Context para tema claro/oscuro
│
└── utility/
    ├── index.ts               # Exports centralizados
    ├── appwriteClient.ts      # Cliente Appwrite configurado
    ├── instanceUtils.ts       # Validación y generación de nombres
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
VITE_CHATWOOT_URL=https://your-chatwoot-instance.com
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

## Flujo de Usuario

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login/    │────▶│  Dashboard  │────▶│   Crear     │
│  Registro   │     │             │     │  Instancia  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Asistente  │◀────│  Conexión   │◀────│  Escanear   │
│    Activo   │     │   Exitosa   │     │     QR      │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. Usuario se registra o inicia sesión
2. Accede al dashboard con sus instancias
3. Crea nueva instancia de WhatsApp
4. Escanea el código QR con su teléfono
5. Al conectar, el asistente ACO comienza a responder automáticamente

## Arquitectura de Integración

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    React     │─────▶│  Appwrite    │      │     n8n      │
│    Panel     │      │  (Auth/DB)   │      │  (Webhooks)  │
└──────┬───────┘      └──────────────┘      └──────▲───────┘
       │                                          │
       │              ┌──────────────┐            │
       └─────────────▶│ EvolutionAPI │────────────┘
                      │  (WhatsApp)  │
                      └──────────────┘
```

## Despliegue con Nginx

El proyecto soporta despliegue detrás de Nginx con base path `/whatsapp`:

1. Establecer `VITE_USE_BASE_PATH=true` en el build
2. Configurar Nginx para servir desde `/whatsapp/`

## Licencia

MIT
