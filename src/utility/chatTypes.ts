/**
 * TypeScript types for Evolution API Chat System
 */

// Message key structure
export interface MessageKey {
  id: string;                         // ID único del mensaje
  fromMe: boolean;                    // ¿Es un mensaje nuestro?
  remoteJid: string;                  // JID del contacto
  participant?: string;               // Participante (en grupos)
  remoteJidAlt?: string;              // JID alternativo
  addressingMode?: string;            // Modo de direccionamiento (ej: "lid")
}

// Message content types
export interface MessageContent {
  conversation?: string;              // Texto simple
  messageContextInfo?: Record<string, unknown>; // Contexto adicional
  extendedTextMessage?: {             // Texto con formato
    text: string;
  };
  imageMessage?: {                    // Imagen
    url: string;
    mimetype: string;
    caption?: string;
    jpegThumbnail?: string;
  };
  videoMessage?: {                    // Video
    url: string;
    mimetype: string;
    caption?: string;
    jpegThumbnail?: string;
  };
  documentMessage?: {                 // Documento
    url: string;
    mimetype: string;
    title?: string;
    fileName?: string;
    pageCount?: number;
  };
  audioMessage?: {                    // Audio
    url: string;
    mimetype: string;
    ptt?: boolean;
  };
  stickerMessage?: {                  // Sticker
    url: string;
    mimetype: string;
  };
  locationMessage?: {                 // Ubicación
    degreesLatitude: number;
    degreesLongitude: number;
    name?: string;
    address?: string;
  };
  contactMessage?: {                  // Contacto
    displayName: string;
    vcard: string;
  };
}

// Main message structure
export interface Message {
  id?: string;                        // ID del documento en BD
  key: MessageKey;                    // Identificador del mensaje
  message: MessageContent;            // Contenido del mensaje
  messageTimestamp: number;           // Timestamp UNIX en segundos
  pushName?: string;                  // Nombre del remitente
  status?: 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'PLAYED';
  instanceId?: string;                // ID de la instancia
  source?: string;                    // Origen (android, ios, web, etc.)
  contextInfo?: Record<string, unknown>; // Contexto adicional
  MessageUpdate?: Array<Record<string, unknown>>; // Updates del mensaje
}

// Chat structure (Evolution API v2 - Formato real)
export interface Chat {
  // Campos principales
  remoteJid: string;             // JID de WhatsApp (ej: "5511999999999@s.whatsapp.net")
  isGroup: boolean;              // Si es un grupo
  pushName?: string;             // Nombre del contacto
  
  // Campos de estado de ventana
  windowStart?: string;          // ISO fecha inicio de ventana (ej: "2026-01-17T14:41:05.682Z")
  windowExpires?: string;        // ISO fecha expiración de ventana
  windowActive?: boolean;        // Si la ventana está activa
  
  // Información del último mensaje
  lastMessage?: {
    id: string;                  // ID del mensaje
    key?: {
      id?: string;               // ID único del mensaje
      fromMe?: boolean;          // Si es de nosotros
      remoteJid?: string;        // JID remoto
      participant?: string;      // Participante en grupo
    };
    pushName?: string | null;    // Nombre del remitente
    participant?: string | null; // Participante en grupo
    messageType?: string;        // Tipo: "conversation", "unknown", etc.
    message?: {
      conversation?: string;     // Texto del mensaje
      call?: Record<string, unknown>; // Datos de llamada
      [key: string]: unknown;    // Otros tipos de mensaje
    };
    contextInfo?: Record<string, unknown>; // Contexto del mensaje
    source?: string;             // Origen: "android", "ios", "web", etc.
    messageTimestamp?: number;   // Timestamp UNIX en segundos
    instanceId?: string;         // ID de la instancia
    sessionId?: string | null;   // ID de sesión
    status?: string;             // Estado: "DELIVERY_ACK", "READ", etc.
  } | null;
  
  // Información del chat
  unreadCount?: number;          // Cantidad de mensajes no leídos
  isSaved?: boolean;             // Si está en contactos guardados
  instanceId?: string;           // ID de la instancia
  
  // Campos legacy para retrocompatibilidad
  id?: string;                   // ID interno (opcional)
  profilePicUrl?: string;        // URL de la foto de perfil
  profilePictureUrl?: string;    // URL de la foto (alternativa)
  createdAt?: string;            // Fecha de creación
  updatedAt?: string;            // Última actualización
  name?: string;                 // Nombre del chat
  conversationTimestamp?: number; // Timestamp de la conversación
  type?: string;                 // Tipo: "contact" o "group"
}

// WhatsApp account/instance
export interface WhatsAppAccount {
  $id: string;
  instance_name: string;
  status: string;
  user_id: string;
  created_at: string;
  // ⚠️ Chatwoot NO se guarda en Appwrite - es 100% EvolutionAPI
}

// API Response types (Evolution API v2 - Nueva estructura)
export interface EvolutionAPIResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  error: boolean;
  response: T;
}

export interface FetchChatsResponse {
  chats: Chat[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface FetchMessagesResponse {
  messages: Message[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SendMessageResponse {
  key?: MessageKey;
  message?: MessageContent;
  messageTimestamp?: number;
  status?: string;
  error?: string;
}
