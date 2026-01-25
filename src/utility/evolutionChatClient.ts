/**
 * Evolution API Chat Client
 * Handles all chat operations with Evolution API v2
 */

import type {
  Chat,
  Message,
  SendMessageResponse,
} from './chatTypes';
import { extractNumberFromJid, fileToBase64 } from './chatUtils';

export default class EvolutionChatClient {
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;

  constructor(instanceName: string, baseUrl?: string, apiKey?: string) {
    this.instanceName = instanceName;
    this.baseUrl = baseUrl || import.meta.env.VITE_SERVER_URL;
    this.apiKey = apiKey || import.meta.env.VITE_API_KEY;
  }

  /**
   * Make API request to Evolution API
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'apikey': this.apiKey,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🌐 ${method} ${url}`);
    
    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, text);
      throw new Error(`API Error: ${response.status} - ${text}`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      console.error('❌ Failed to parse response:', text);
      throw new Error('Invalid JSON response');
    }
  }

  /**
   * Fetch all chats for the instance
   */
  async fetchChats(): Promise<Chat[]> {
    try {
      console.log('📥 Fetching chats for:', this.instanceName);
      
      // Evolution API v2 usa POST para findChats
      const response = await this.request<Record<string, unknown>>(
        `/chat/findChats/${this.instanceName}`,
        'POST',
        {} // Body vacío pero requerido para POST
      );

      // Evolution API puede devolver diferentes estructuras
      let chats: Chat[] = [];
      
      if (Array.isArray(response)) {
        chats = response;
      } else if (response.chats && Array.isArray(response.chats)) {
        chats = response.chats;
      } else if (response.data && Array.isArray(response.data)) {
        chats = response.data;
      }

      console.log(`✅ Loaded ${chats.length} chats`);
      return chats;
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
      return [];
    }
  }

  /**
   * Fetch messages for a specific chat
   */
  async fetchMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    try {
      console.log('📥 Fetching messages for:', chatId);
      
      const response = await this.request<Record<string, unknown>>(
        `/chat/findMessages/${this.instanceName}`,
        'POST',
        {
          where: {
            key: {
              remoteJid: chatId,
            },
          },
          limit,
        }
      );

      let messages: Message[] = [];
      
      if (Array.isArray(response)) {
        messages = response;
      } else if (response.messages && Array.isArray(response.messages)) {
        messages = response.messages;
      } else if (response.data && Array.isArray(response.data)) {
        messages = response.data;
      }

      // Sort by timestamp ascending (oldest first)
      messages.sort((a, b) => a.messageTimestamp - b.messageTimestamp);

      console.log(`✅ Loaded ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Send text message
   */
  async sendText(number: string, text: string): Promise<SendMessageResponse> {
    try {
      console.log('📤 Sending text to:', number);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendText/${this.instanceName}`,
        'POST',
        {
          number,
          text,
        }
      );

      console.log('✅ Text sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending text:', error);
      throw error;
    }
  }

  /**
   * Send media (image, video, document)
   */
  async sendMedia(params: {
    number: string;
    media: string; // base64 or URL
    mediatype: 'image' | 'video' | 'document' | 'audio';
    caption?: string;
    fileName?: string;
  }): Promise<SendMessageResponse> {
    try {
      console.log(`📤 Sending ${params.mediatype} to:`, params.number);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendMedia/${this.instanceName}`,
        'POST',
        params
      );

      console.log('✅ Media sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending media:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(chatId: string, messageId: string): Promise<void> {
    try {
      console.log('✓✓ Marking as read:', messageId);
      
      await this.request(
        `/chat/markMessageAsRead/${this.instanceName}`,
        'POST',
        {
          readMessages: [
            {
              remoteJid: chatId,
              id: messageId,
              fromMe: false,
            },
          ],
        }
      );

      console.log('✅ Marked as read');
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  }

  /**
   * Get profile picture URL
   */
  async getProfilePicture(jid: string): Promise<string | null> {
    try {
      // Evolution API v2 usa POST para fetchProfilePictureUrl
      const response = await this.request<Record<string, unknown>>(
        `/chat/fetchProfilePictureUrl/${this.instanceName}`,
        'POST',
        { number: extractNumberFromJid(jid) }
      );

      return (response?.profilePictureUrl as string) || null;
    } catch (error) {
      console.error('❌ Error fetching profile picture:', error);
      return null;
    }
  }

  /**
   * Convert file to base64 (helper method)
   */
  async fileToBase64(file: File): Promise<string> {
    return fileToBase64(file);
  }

  /**
   * Extract number from JID (helper method)
   */
  extractNumberFromJid(jid: string): string {
    return extractNumberFromJid(jid);
  }
}
