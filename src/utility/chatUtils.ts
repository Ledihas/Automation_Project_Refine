/**
 * Utility functions for chat operations
 */

import type { Message, Chat } from './chatTypes';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

/**
 * Extract phone number from WhatsApp JID
 * @param jid - WhatsApp JID (e.g., "5511999999999@s.whatsapp.net")
 * @returns Phone number without suffix
 */
export function extractNumberFromJid(jid: string): string {
  return jid.split('@')[0];
}

/**
 * Format phone number for display
 * @param jid - WhatsApp JID
 * @returns Formatted phone number
 */
export function formatPhoneNumber(jid: string): string {
  const number = extractNumberFromJid(jid);
  // Simple formatting: +55 11 99999-9999
  if (number.length >= 10) {
    const countryCode = number.slice(0, -10);
    const areaCode = number.slice(-10, -8);
    const firstPart = number.slice(-8, -4);
    const secondPart = number.slice(-4);
    return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}`;
  }
  return `+${number}`;
}

/**
 * Get message text content
 * @param message - Message object
 * @returns Text content or type description
 */
export function getMessageText(message: Message): string {
  if (message.message.conversation) {
    return message.message.conversation;
  }
  if (message.message.extendedTextMessage?.text) {
    return message.message.extendedTextMessage.text;
  }
  if (message.message.imageMessage) {
    return message.message.imageMessage.caption || '📷 Imagen';
  }
  if (message.message.videoMessage) {
    return message.message.videoMessage.caption || '🎥 Video';
  }
  if (message.message.documentMessage) {
    return `📄 ${message.message.documentMessage.fileName || 'Documento'}`;
  }
  if (message.message.audioMessage) {
    return message.message.audioMessage.ptt ? '🎤 Audio de voz' : '🎵 Audio';
  }
  if (message.message.stickerMessage) {
    return '🎨 Sticker';
  }
  if (message.message.locationMessage) {
    return '📍 Ubicación';
  }
  if (message.message.contactMessage) {
    return `👤 ${message.message.contactMessage.displayName}`;
  }
  return 'Mensaje';
}

/**
 * Get message type
 * @param message - Message object
 * @returns Message type
 */
export function getMessageType(message: Message): string {
  if (message.message.conversation || message.message.extendedTextMessage) {
    return 'text';
  }
  if (message.message.imageMessage) return 'image';
  if (message.message.videoMessage) return 'video';
  if (message.message.documentMessage) return 'document';
  if (message.message.audioMessage) return 'audio';
  if (message.message.stickerMessage) return 'sticker';
  if (message.message.locationMessage) return 'location';
  if (message.message.contactMessage) return 'contact';
  return 'unknown';
}

/**
 * Format timestamp to readable format
 * @param timestamp - Unix timestamp
 * @returns Formatted time string
 */
export function formatMessageTime(timestamp: number): string {
  return dayjs.unix(timestamp).format('HH:mm');
}

/**
 * Format timestamp to date
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export function formatMessageDate(timestamp: number): string {
  const date = dayjs.unix(timestamp);
  const today = dayjs();
  const yesterday = dayjs().subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return 'Hoy';
  } else if (date.isSame(yesterday, 'day')) {
    return 'Ayer';
  } else if (date.isAfter(today.subtract(7, 'day'))) {
    return date.format('dddd');
  } else {
    return date.format('DD/MM/YYYY');
  }
}

/**
 * Format last message time for chat list
 * @param timestamp - Unix timestamp
 * @returns Formatted time string
 */
export function formatLastMessageTime(timestamp: number): string {
  const date = dayjs.unix(timestamp);
  const today = dayjs();

  if (date.isSame(today, 'day')) {
    return date.format('HH:mm');
  } else if (date.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Ayer';
  } else if (date.isAfter(today.subtract(7, 'day'))) {
    return date.format('ddd');
  } else {
    return date.format('DD/MM/YY');
  }
}

/**
 * Get chat display name
 * @param chat - Chat object
 * @returns Display name
 */
export function getChatDisplayName(chat: Chat): string {
  // Prioridad: pushName > name > remoteJid formateado
  if (chat.pushName) {
    return chat.pushName;
  }
  if (chat.name) {
    return chat.name;
  }
  // Usar remoteJid si está disponible, sino usar id
  const jid = chat.remoteJid || chat.id;
  return formatPhoneNumber(jid);
}

/**
 * Sort chats by last message timestamp
 * @param chats - Array of chats
 * @returns Sorted chats
 */
export function sortChatsByTimestamp(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const timeA = a.conversationTimestamp || 0;
    const timeB = b.conversationTimestamp || 0;
    return timeB - timeA;
  });
}

/**
 * Group messages by date
 * @param messages - Array of messages
 * @returns Grouped messages
 */
export function groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
  const grouped = new Map<string, Message[]>();

  messages.forEach(message => {
    const date = formatMessageDate(message.messageTimestamp);
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(message);
  });

  return grouped;
}

/**
 * Convert file to base64
 * @param file - File object
 * @returns Promise with base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Get file extension from mimetype
 * @param mimetype - MIME type
 * @returns File extension
 */
export function getFileExtension(mimetype: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };
  return mimeMap[mimetype] || 'file';
}

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
