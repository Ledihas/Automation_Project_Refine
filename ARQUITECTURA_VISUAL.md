# 🏗️ Arquitectura Visual - Chat Multiagente

## 📊 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
│                    (Autenticado en Appwrite)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Gestión    │  │     Chat     │  │  Configurar  │         │
│  │  Instancias  │  │ Multiagente  │  │  Asistente   │         │
│  └──────────────┘  └──────┬───────┘  └──────────────┘         │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CHAT PAGE                                │
│  1. Carga instancias desde Appwrite                            │
│  2. Filtra solo status: "connected"                            │
│  3. Renderiza ChatLayout con instancias                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CHAT LAYOUT                               │
│  ┌──────────────────────┬──────────────────────────────────┐   │
│  │      SIDEBAR         │        CONTENT AREA              │   │
│  │  (400px width)       │        (Flex 1)                  │   │
│  ├──────────────────────┼──────────────────────────────────┤   │
│  │ ┌──────────────────┐ │ ┌──────────────────────────────┐ │   │
│  │ │ InstanceSelector │ │ │                              │ │   │
│  │ │  - Dropdown      │ │ │      MessageThread           │ │   │
│  │ │  - Indicador     │ │ │      (si hay chat)           │ │   │
│  │ └──────────────────┘ │ │                              │ │   │
│  │ ┌──────────────────┐ │ │  O                           │ │   │
│  │ │ ConversationList │ │ │                              │ │   │
│  │ │  - Búsqueda      │ │ │      Mensaje de bienvenida   │ │   │
│  │ │  - Refresh       │ │ │      (si no hay chat)        │ │   │
│  │ │  - Items (xN)    │ │ │                              │ │   │
│  │ └──────────────────┘ │ └──────────────────────────────┘ │   │
│  └──────────────────────┴──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

```
┌──────────────┐
│   Appwrite   │ ◄─── Carga instancias conectadas
│   Database   │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│  ChatPage    │─────▶│ ChatLayout   │
└──────────────┘      └──────┬───────┘
                             │
                             ├─────────────────┐
                             │                 │
                             ▼                 ▼
                    ┌─────────────────┐  ┌─────────────────┐
                    │ InstanceSelector│  │ ConversationList│
                    └────────┬────────┘  └────────┬────────┘
                             │                    │
                             ▼                    │
                    ┌─────────────────┐           │
                    │ Evolution API   │◄──────────┤
                    │  Chat Client    │           │
                    └────────┬────────┘           │
                             │                    │
                             ├────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ MessageThread   │
                    │  - Messages     │
                    │  - Input        │
                    └─────────────────┘
```

## 🎯 Componentes y Responsabilidades

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChatPage.tsx                            │
│  Responsabilidades:                                             │
│  • Cargar instancias desde Appwrite                            │
│  • Filtrar solo conectadas                                     │
│  • Mostrar loading/empty states                                │
│  • Renderizar ChatLayout                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ChatLayout.tsx                            │
│  Responsabilidades:                                             │
│  • Gestionar estado de instancia seleccionada                 │
│  • Inicializar EvolutionChatClient                            │
│  • Cargar chats de la instancia                               │
│  • Coordinar sidebar y content area                           │
│  • Manejar selección de chat                                  │
└────────┬────────────────────────────────────┬───────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐           ┌──────────────────────┐
│ InstanceSelector.tsx │           │ ConversationList.tsx │
│  Responsabilidades:  │           │  Responsabilidades:  │
│  • Dropdown          │           │  • Búsqueda          │
│  • Cambio instancia  │           │  • Ordenamiento      │
│  • Indicador activo  │           │  • Refresh manual    │
└──────────────────────┘           │  • Render items      │
                                   └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │ ConversationItem.tsx │
                                   │  Responsabilidades:  │
                                   │  • Avatar            │
                                   │  • Nombre            │
                                   │  • Preview mensaje   │
                                   │  • Timestamp         │
                                   │  • Badge unread      │
                                   │  • Click handler     │
                                   └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MessageThread.tsx                          │
│  Responsabilidades:                                             │
│  • Cargar mensajes del chat                                    │
│  • Auto-refresh cada 10s                                       │
│  • Scroll automático                                           │
│  • Marcar como leído                                           │
│  • Agrupar por fecha                                           │
│  • Render header/messages/input                                │
└────────┬────────────────────────────────────┬───────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐           ┌──────────────────────┐
│  MessageBubble.tsx   │           │  MessageInput.tsx    │
│  Responsabilidades:  │           │  Responsabilidades:  │
│  • Render por tipo   │           │  • Input texto       │
│  • Texto             │           │  • Auto-resize       │
│  • Imagen            │           │  • Enter/Shift+Enter │
│  • Video             │           │  • Adjuntar imagen   │
│  • Documento         │           │  • Adjuntar doc      │
│  • Audio             │           │  • Validación        │
│  • Sticker           │           │  • Envío a API       │
│  • Ubicación         │           │  • Loading state     │
│  • Contacto          │           │  • Notificaciones    │
│  • Timestamp         │           └──────────────────────┘
│  • Estado entrega    │
└──────────────────────┘
```

## 🔌 Integración con APIs

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              EvolutionChatClient.ts                      │  │
│  │  • fetchChats()                                          │  │
│  │  • fetchMessages()                                       │  │
│  │  • sendText()                                            │  │
│  │  • sendMedia()                                           │  │
│  │  • markAsRead()                                          │  │
│  │  • getProfilePicture()                                   │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          │ (apikey header)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVOLUTION API v2                             │
│                                                                 │
│  GET  /chat/findChats/{instance}                               │
│  POST /chat/findMessages/{instance}                            │
│  POST /message/sendText/{instance}                             │
│  POST /message/sendMedia/{instance}                            │
│  POST /chat/markMessageAsRead/{instance}                       │
│  POST /chat/fetchProfilePictureUrl/{instance}                  │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ WhatsApp Protocol
                             │ (Baileys)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WHATSAPP                                   │
│                   (Instancia conectada)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Estados de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTADOS GLOBALES                             │
└─────────────────────────────────────────────────────────────────┘

ChatLayout:
  ├─ selectedAccount: WhatsAppAccount | null
  ├─ chatClient: EvolutionChatClient | null
  ├─ chats: Chat[]
  ├─ selectedChat: Chat | null
  └─ loadingChats: boolean

ConversationList:
  ├─ searchText: string
  └─ filteredChats: Chat[] (computed)

MessageThread:
  ├─ messages: Message[]
  ├─ loading: boolean
  ├─ profilePic: string | null
  └─ intervalRef: NodeJS.Timeout | null

MessageInput:
  ├─ text: string
  └─ sending: boolean
```

## 🔄 Ciclo de Vida de Mensajes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVÍO DE MENSAJE                             │
└─────────────────────────────────────────────────────────────────┘

1. Usuario escribe mensaje
   ↓
2. Presiona Enter o botón enviar
   ↓
3. MessageInput valida input
   ↓
4. Extrae número del JID
   ↓
5. Llama chatClient.sendText(number, text)
   ↓
6. EvolutionChatClient hace POST a Evolution API
   ↓
7. Evolution API envía a WhatsApp
   ↓
8. Respuesta exitosa
   ↓
9. Notificación de éxito
   ↓
10. Limpia input
   ↓
11. Llama onMessageSent()
   ↓
12. MessageThread recarga mensajes
   ↓
13. Scroll automático al final
   ↓
14. Mensaje aparece en el chat

┌─────────────────────────────────────────────────────────────────┐
│                   RECEPCIÓN DE MENSAJE                          │
└─────────────────────────────────────────────────────────────────┘

1. Auto-refresh cada 10 segundos
   ↓
2. MessageThread llama loadMessages()
   ↓
3. chatClient.fetchMessages(chatId, 100)
   ↓
4. Evolution API consulta WhatsApp
   ↓
5. Retorna mensajes nuevos
   ↓
6. MessageThread actualiza estado
   ↓
7. Agrupa mensajes por fecha
   ↓
8. Renderiza MessageBubble para cada mensaje
   ↓
9. Marca último mensaje como leído
   ↓
10. Scroll automático al final
```

## 🎨 Jerarquía Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER (Refine)                         │
│  Logo | Usuario | Tema | Logout                                │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                        CHAT LAYOUT                              │
│ ┌─────────────────────┬─────────────────────────────────────┐  │
│ │     SIDEBAR         │         CONTENT AREA                │  │
│ │   (Scroll Y)        │         (Scroll Y)                  │  │
│ ├─────────────────────┼─────────────────────────────────────┤  │
│ │ ┌─────────────────┐ │ ┌─────────────────────────────────┐ │  │
│ │ │ Instance Select │ │ │ Header (Sticky Top)             │ │  │
│ │ │ ┌─────────────┐ │ │ │ Avatar | Nombre | Botones       │ │  │
│ │ │ │  Dropdown   │ │ │ └─────────────────────────────────┘ │  │
│ │ │ └─────────────┘ │ │ ┌─────────────────────────────────┐ │  │
│ │ │ ✓ Conectado     │ │ │ Messages Area (Scroll)          │ │  │
│ │ └─────────────────┘ │ │ │                                 │ │  │
│ │ ┌─────────────────┐ │ │ │ ┌─────────────────────────────┐ │ │  │
│ │ │ Search Bar      │ │ │ │ │ Hoy                         │ │ │  │
│ │ │ 🔍 [____] 🔄    │ │ │ │ └─────────────────────────────┘ │ │  │
│ │ └─────────────────┘ │ │ │ ┌─────────────────────────────┐ │ │  │
│ │ ┌─────────────────┐ │ │ │ │ ┌─────────────────────────┐ │ │ │  │
│ │ │ Conversation 1  │ │ │ │ │ │ Hola, ¿cómo estás?      │ │ │ │  │
│ │ │ 👤 Juan Pérez   │ │ │ │ │ │ 10:30                   │ │ │ │  │
│ │ │ Hola...    10:30│ │ │ │ │ └─────────────────────────┘ │ │ │  │
│ │ │ [2]             │ │ │ │ │         ┌─────────────────┐ │ │ │  │
│ │ └─────────────────┘ │ │ │ │         │ Bien, gracias   │ │ │ │  │
│ │ ┌─────────────────┐ │ │ │ │         │ 10:31 ✓✓       │ │ │ │  │
│ │ │ Conversation 2  │ │ │ │ │         └─────────────────┘ │ │ │  │
│ │ │ 👤 María López  │ │ │ │ │ ┌─────────────────────────┐ │ │ │  │
│ │ │ 📷 Imagen  Ayer │ │ │ │ │ │ [Imagen]                │ │ │ │  │
│ │ └─────────────────┘ │ │ │ │ │ 10:32                   │ │ │ │  │
│ │ ┌─────────────────┐ │ │ │ │ └─────────────────────────┘ │ │ │  │
│ │ │ Conversation 3  │ │ │ │ └─────────────────────────────┘ │ │  │
│ │ │ 👥 Grupo Trabajo│ │ │ └─────────────────────────────────┘ │  │
│ │ │ Pedro: Ok  12:00│ │ │ ┌─────────────────────────────────┐ │  │
│ │ └─────────────────┘ │ │ │ Input (Sticky Bottom)           │ │  │
│ │ ...                 │ │ │ 📷 📎 [Escribe un mensaje...] 🚀│ │  │
│ │                     │ │ │ └─────────────────────────────────┘ │  │
│ └─────────────────────┘ └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                       │
└─────────────────────────────────────────────────────────────────┘

Usuario no autenticado
   ↓
Intenta acceder a /chat
   ↓
Refine detecta no hay sesión
   ↓
Redirect a /login
   ↓
Usuario ingresa credenciales
   ↓
authProvider.login() → Appwrite
   ↓
Sesión creada exitosamente
   ↓
Redirect a /chat
   ↓
ChatPage carga instancias del usuario
   ↓
Filtra solo conectadas
   ↓
Renderiza ChatLayout
   ↓
Usuario puede usar el chat
```

## 📊 Diagrama de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODELO DE DATOS                              │
└─────────────────────────────────────────────────────────────────┘

WhatsAppAccount (Appwrite)
├─ $id: string
├─ instance_name: string
├─ status: "pending" | "connected"
├─ user_id: string
├─ created_at: string
└─ chatwoot_*: optional fields

Chat (Evolution API)
├─ id: string (JID)
├─ name?: string
├─ unreadCount?: number
├─ conversationTimestamp?: number
├─ lastMessage?: Message
├─ profilePictureUrl?: string
└─ isGroup?: boolean

Message (Evolution API)
├─ key:
│  ├─ remoteJid: string
│  ├─ fromMe: boolean
│  ├─ id: string
│  └─ participant?: string
├─ message:
│  ├─ conversation?: string
│  ├─ extendedTextMessage?: { text }
│  ├─ imageMessage?: { url, caption, ... }
│  ├─ videoMessage?: { url, caption, ... }
│  ├─ documentMessage?: { url, fileName, ... }
│  ├─ audioMessage?: { url, ptt, ... }
│  ├─ stickerMessage?: { url, ... }
│  ├─ locationMessage?: { lat, lng, ... }
│  └─ contactMessage?: { displayName, vcard }
├─ messageTimestamp: number
├─ pushName?: string
└─ status?: "PENDING" | "SERVER_ACK" | "DELIVERY_ACK" | "READ"
```

## 🎯 Puntos de Extensión

```
┌─────────────────────────────────────────────────────────────────┐
│              PUNTOS PARA FUTURAS EXTENSIONES                    │
└─────────────────────────────────────────────────────────────────┘

1. ContactInfo.tsx
   └─ Implementar acciones: archivar, bloquear, eliminar

2. MessageInput.tsx
   └─ Agregar emoji picker
   └─ Agregar grabación de audio
   └─ Agregar envío de ubicación

3. MessageThread.tsx
   └─ Implementar "escribiendo..."
   └─ Agregar búsqueda dentro del chat
   └─ Implementar responder a mensaje (quote)

4. ConversationList.tsx
   └─ Agregar filtros (no leídas, grupos, etc.)
   └─ Implementar paginación
   └─ Agregar ordenamiento personalizado

5. ChatLayout.tsx
   └─ Agregar notificaciones push
   └─ Implementar múltiples chats abiertos (tabs)
   └─ Agregar panel de estadísticas

6. EvolutionChatClient.ts
   └─ Implementar caché de mensajes
   └─ Agregar retry logic
   └─ Implementar WebSocket para real-time
```

---

**Nota**: Esta arquitectura está diseñada para ser escalable y mantenible. Cada componente tiene responsabilidades claras y está desacoplado de los demás, facilitando futuras extensiones y modificaciones.
