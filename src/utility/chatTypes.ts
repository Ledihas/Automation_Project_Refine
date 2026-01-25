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

// Chat structure
export interface Chat {
  id: string;
  name?: string;
  unreadCount?: number;
  conversationTimestamp?: number;
  lastMessage?: Message;
  profilePictureUrl?: string;
  isGroup?: boolean;
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

// API Response types
export interface FetchChatsResponse {
  chats?: Chat[];
  error?: string;
}

export interface FetchMessagesResponse {
  messages?: Message[];
  error?: string;
}

export interface SendMessageResponse {
  key?: MessageKey;
  message?: MessageContent;
  messageTimestamp?: number;
  status?: string;
  error?: string;
}
