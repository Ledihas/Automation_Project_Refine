/**
 * TypeScript types for Evolution API Chat System
 */

// Message key structure
export interface MessageKey {
  remoteJid: string;
  fromMe: boolean;
  id: string;
  participant?: string;
}

// Message content types
export interface MessageContent {
  conversation?: string;
  extendedTextMessage?: {
    text: string;
  };
  imageMessage?: {
    url: string;
    mimetype: string;
    caption?: string;
    jpegThumbnail?: string;
  };
  videoMessage?: {
    url: string;
    mimetype: string;
    caption?: string;
    jpegThumbnail?: string;
  };
  documentMessage?: {
    url: string;
    mimetype: string;
    title?: string;
    fileName?: string;
    pageCount?: number;
  };
  audioMessage?: {
    url: string;
    mimetype: string;
    ptt?: boolean;
  };
  stickerMessage?: {
    url: string;
    mimetype: string;
  };
  locationMessage?: {
    degreesLatitude: number;
    degreesLongitude: number;
    name?: string;
    address?: string;
  };
  contactMessage?: {
    displayName: string;
    vcard: string;
  };
}

// Main message structure
export interface Message {
  key: MessageKey;
  message: MessageContent;
  messageTimestamp: number;
  pushName?: string;
  status?: 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'PLAYED';
}

// Chat structure (Evolution API v2 - Formato real)
export interface Chat {
  id: string;                    // ID interno de la base de datos
  remoteJid: string;             // JID de WhatsApp (ej: "5511999999999@s.whatsapp.net")
  pushName?: string;             // Nombre del contacto
  profilePicUrl?: string;        // URL de la foto de perfil
  createdAt?: string;            // Fecha de creación
  updatedAt?: string;            // Última actualización
  windowStart?: string;          // Inicio de ventana de mensajes
  windowExpires?: string;        // Expiración de ventana
  windowActive?: boolean;        // Si la ventana está activa
  instanceId?: string;           // ID de la instancia
  isGroup: boolean;              // Si es un grupo
  isSaved?: boolean;             // Si está guardado
  type?: string;                 // Tipo: "contact" o "group"
  unreadCount?: number;          // Mensajes no leídos
  lastMessage?: {
    id: string;
    key?: Record<string, unknown>;
    pushName?: string;
    messageType: string;         // Tipo: "conversation", "imageMessage", etc.
    message: string;             // Texto del mensaje
    messageTimestamp: string;    // Timestamp como string
    status?: string;             // Estado: "DELIVERED", "READ", etc.
  };
  
  // Campos legacy para retrocompatibilidad
  name?: string;
  conversationTimestamp?: number;
  profilePictureUrl?: string;
}

// WhatsApp account/instance
export interface WhatsAppAccount {
  $id: string;
  instance_name: string;
  status: string;
  user_id: string;
  created_at: string;
  chatwoot_account_id?: string;
  chatwoot_name_inbox?: string;
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
