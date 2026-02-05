/**
 * Evolution API Chat Client
 * Handles all chat operations with Evolution API v2
 */

import type {
  Chat,
  Message,
  SendMessageResponse,
} from './chatTypes';
import { extractNumberFromJid, fileToBase64, deduplicateMessagesByKeyId, deduplicateChatsByID, findDuplicateChats } from './chatUtils';

export default class EvolutionChatClient {
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;
  private allChats: Chat[] = []; // Cache de todos los chats

  constructor(instanceName: string, baseUrl?: string, apiKey?: string) {
    this.instanceName = instanceName;
    this.baseUrl = baseUrl || import.meta.env.VITE_SERVER_URL;
    this.apiKey = apiKey || import.meta.env.VITE_API_KEY;
  }

  /**
   * Set all chats for multi-device message loading
   * Called from ChatLayout after fetching chats
   */
  setAllChats(chats: Chat[]): void {
    this.allChats = chats;
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
   * Evolution API: POST /chat/findChats/{instanceName}
   * Response: Array of Chat objects with new structure:
   * - windowStart/windowExpires: ISO date strings
   * - lastMessage: Complex message object with nested key/message structure
   * - unreadCount: number
   * - isSaved: boolean
   * 
   * Important: Chats are deduplicated by their 'id' field to handle Evolution API
   * returning the same chat multiple times with different remoteJid representations
   */
  async fetchChats(): Promise<Chat[]> {
    try {
      console.log('📥 Fetching chats for:', this.instanceName);
      
      // Evolution API v2 usa POST para findChats
      const response = await this.request<unknown>(
        `/chat/findChats/${this.instanceName}`,
        'POST',
        {} // Body vacío pero requerido para POST
      );

      console.log('📦 Raw response type:', Array.isArray(response) ? 'Array' : typeof response);

      let chats: Chat[] = [];
      
      // Formato: Array directo (estructura nueva con windowStart, windowExpires, etc.)
      if (Array.isArray(response)) {
        chats = response as Chat[];
        console.log(`✅ Loaded ${chats.length} chats (array format) - BEFORE deduplication`);
        
        // Log de ejemplo del primer chat para debugging
        if (chats.length > 0) {
          console.log('📋 Sample chat structure:', {
            id: chats[0].id,
            remoteJid: chats[0].remoteJid,
            pushName: chats[0].pushName,
            isGroup: chats[0].isGroup,
            unreadCount: chats[0].unreadCount,
            isSaved: chats[0].isSaved,
            windowActive: chats[0].windowActive,
            windowStart: chats[0].windowStart,
            windowExpires: chats[0].windowExpires,
            hasLastMessage: !!chats[0].lastMessage,
            lastMessageType: chats[0].lastMessage?.messageType
          });
          
          // Mostrar TODOS los chats con su id y remoteJid para detectar duplicados
          console.log('📊 All chats summary (BEFORE dedup):');
          const chatSummary = chats.map((c, idx) => ({
            idx,
            id: c.id,
            remoteJid: c.remoteJid,
            pushName: c.pushName,
          }));
          console.table(chatSummary);
          
          // Detectar y mostrar duplicados
          const duplicates = findDuplicateChats(chats);
          if (duplicates.length > 0) {
            console.warn('⚠️ DUPLICATE CHATS DETECTED:', duplicates.length, 'groups');
            duplicates.forEach((group, idx) => {
              console.warn(`   Group ${idx + 1} (id: ${group[0].id}):`, group.map(c => c.remoteJid));
            });
          }
        }
      }
      // Fallback: Objeto wrapper
      else if (response && typeof response === 'object') {
        const responseObj = response as Record<string, unknown>;
        
        if (responseObj.chats && Array.isArray(responseObj.chats)) {
          chats = responseObj.chats as Chat[];
          console.log(`✅ Loaded ${chats.length} chats (wrapped in 'chats' property) - BEFORE deduplication`);
        } else if (responseObj.response && Array.isArray(responseObj.response)) {
          chats = responseObj.response as Chat[];
          console.log(`✅ Loaded ${chats.length} chats (wrapped in 'response' property) - BEFORE deduplication`);
        } else if (Array.isArray(responseObj)) {
          chats = responseObj as Chat[];
          console.log(`✅ Loaded ${chats.length} chats - BEFORE deduplication`);
        }
      }

      // IMPORTANTE: Deduplicar chats por id field
      const originalCount = chats.length;
      chats = deduplicateChatsByID(chats);
      if (originalCount !== chats.length) {
        console.log(`🔄 Deduplicated chats: ${originalCount} -> ${chats.length} unique chats (removed ${originalCount - chats.length} duplicates)`);
      } else {
        console.log(`✅ No duplicate chats detected`);
      }

      return chats;
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
      return [];
    }
  }

  /**
   * Fetch messages for a specific chat
   * Evolution API: POST /chat/findMessages/{instanceName}
   * Payload: { "where": { "key": { "remoteJid": "..." } } }
   * Response: { "messages": { "total": N, "pages": N, "currentPage": N, "records": [...] } }
   * 
   * Important: If the chat has an 'id' field, loads messages from ALL remoteJid variants
   * that share the same 'id' (handles Evolution API multi-device behavior where the same
   * conversation can appear as @s.whatsapp.net and @lid, etc.)
   */
  async fetchMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    try {
      console.log('📥 Fetching messages for:', chatId);
      
      // Find the chat object to check if it has an 'id' field
      const chat = this.allChats.find(c => c.remoteJid === chatId);
      let remoteJidsToFetch = [chatId]; // Default: fetch only this remoteJid
      
      // Si el chat tiene un 'id', buscar todos los remoteJid con el mismo 'id'
      if (chat?.id) {
        const relatedChats = this.allChats.filter(c => c.id === chat.id);
        remoteJidsToFetch = relatedChats.map(c => c.remoteJid);
        console.log(`🔗 Chat has id: ${chat.id}. Found ${remoteJidsToFetch.length} remoteJid variants:`, remoteJidsToFetch);
      }

      let allMessages: Message[] = [];

      // Fetch messages from each remoteJid variant
      for (const jid of remoteJidsToFetch) {
        try {
          const response = await this.request<unknown>(
            `/chat/findMessages/${this.instanceName}`,
            'POST',
            {
              where: {
                key: {
                  remoteJid: jid,
                },
              },
            }
          );

          let messages: Message[] = [];
          
          // Formato 1: Array directo de mensajes
          if (Array.isArray(response)) {
            messages = response as Message[];
            console.log(`✅ Loaded ${messages.length} messages from ${jid} (array format)`);
          }
          // Formato 2: Objeto wrapper con estructura de Evolution API
          else if (response && typeof response === 'object') {
            const responseObj = response as Record<string, unknown>;
            
            // NUEVO: Buscar messages.records (con paginación)
            if (responseObj.messages && typeof responseObj.messages === 'object') {
              const messagesObj = responseObj.messages as Record<string, unknown>;
              
              if (messagesObj.records && Array.isArray(messagesObj.records)) {
                messages = messagesObj.records as Message[];
                const pagination = `(${messagesObj.currentPage}/${messagesObj.pages})`;
                console.log(`✅ Loaded ${messages.length} messages from ${jid} (paginated format) ${pagination}`);
              }
            }
            
            // Fallback: MessageUpdate array
            if (messages.length === 0 && responseObj.MessageUpdate && Array.isArray(responseObj.MessageUpdate)) {
              messages = responseObj.MessageUpdate as Message[];
              console.log(`✅ Loaded ${messages.length} messages from ${jid} (MessageUpdate format)`);
            }
            
            // Fallback: messages array directo
            if (messages.length === 0 && responseObj.messages && Array.isArray(responseObj.messages)) {
              messages = responseObj.messages as Message[];
              console.log(`✅ Loaded ${messages.length} messages from ${jid} (messages property)`);
            }
            
            // Fallback: response anidado
            if (messages.length === 0 && responseObj.response && typeof responseObj.response === 'object') {
              const innerResponse = responseObj.response as Record<string, unknown>;
              
              if (innerResponse.MessageUpdate && Array.isArray(innerResponse.MessageUpdate)) {
                messages = innerResponse.MessageUpdate as Message[];
                console.log(`✅ Loaded ${messages.length} messages from ${jid} (nested MessageUpdate)`);
              } else if (innerResponse.messages && Array.isArray(innerResponse.messages)) {
                messages = innerResponse.messages as Message[];
                console.log(`✅ Loaded ${messages.length} messages from ${jid} (nested messages)`);
              }
            }
          }

          allMessages = allMessages.concat(messages);
        } catch (error) {
          console.error(`❌ Error fetching messages from ${jid}:`, error);
        }
      }

      // IMPORTANTE: Deduplicar por key.id para manejar mensajes duplicados
      const originalCount = allMessages.length;
      allMessages = deduplicateMessagesByKeyId(allMessages);
      if (originalCount !== allMessages.length) {
        console.log(`🔄 Deduplicated messages: ${originalCount} -> ${allMessages.length} unique messages (removed ${originalCount - allMessages.length} duplicates)`);
      }

      // Ordenar por timestamp ascendente (más antiguo primero)
      allMessages.sort((a, b) => a.messageTimestamp - b.messageTimestamp);

      return allMessages;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Send text message
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   * @param text - Message text
   */
  async sendText(remoteJid: string, text: string): Promise<SendMessageResponse> {
    try {
      const number = remoteJid.split('@')[0];
      console.log('📤 Sending text to:', remoteJid);
      
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
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendMedia(params: {
    remoteJid: string; // Complete JID
    media: string; // base64 or URL
    mediatype: 'image' | 'video' | 'document' | 'audio';
    caption?: string;
    fileName?: string;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log(`📤 Sending ${params.mediatype} to:`, params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendMedia/${this.instanceName}`,
        'POST',
        {
          number,
          media: params.media,
          mediatype: params.mediatype,
          caption: params.caption,
          fileName: params.fileName,
        }
      );

      console.log('✅ Media sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending media:', error);
      throw error;
    }
  }

  /**
   * Send audio/voice message
   * POST /message/sendWhatsAppAudio/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendAudio(remoteJid: string, audioUrl: string): Promise<SendMessageResponse> {
    try {
      const number = remoteJid.split('@')[0];
      console.log('🎵 Sending audio to:', remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendWhatsAppAudio/${this.instanceName}`,
        'POST',
        {
          number,
          fileUrl: audioUrl,
        }
      );

      console.log('✅ Audio sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending audio:', error);
      throw error;
    }
  }

  /**
   * Send location
   * POST /message/sendLocation/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendLocation(params: {
    remoteJid: string; // Complete JID
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log('📍 Sending location to:', params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendLocation/${this.instanceName}`,
        'POST',
        {
          number,
          latitude: params.latitude,
          longitude: params.longitude,
          name: params.name,
          address: params.address,
        }
      );

      console.log('✅ Location sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending location:', error);
      throw error;
    }
  }

  /**
   * Send contact/vCard
   * POST /message/sendContact/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendContact(params: {
    remoteJid: string; // Complete JID
    contact: Array<{
      fullName: string;
      phoneNumber: string;
      organization?: string;
    }>;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log('👤 Sending contact to:', params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendContact/${this.instanceName}`,
        'POST',
        {
          number,
          contact: params.contact,
        }
      );

      console.log('✅ Contact sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending contact:', error);
      throw error;
    }
  }

  /**
   * Send interactive list (menu)
   * POST /message/sendList/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendList(params: {
    remoteJid: string; // Complete JID
    title: string;
    description: string;
    buttonText: string;
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log('📋 Sending list to:', params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendList/${this.instanceName}`,
        'POST',
        {
          number,
          title: params.title,
          description: params.description,
          buttonText: params.buttonText,
          sections: params.sections,
        }
      );

      console.log('✅ List sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending list:', error);
      throw error;
    }
  }

  /**
   * Send buttons (interactive message)
   * POST /message/sendButtons/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendButtons(params: {
    remoteJid: string; // Complete JID
    text: string;
    buttons: Array<{
      id: string;
      text: string;
    }>;
    footerText?: string;
    title?: string;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log('🔲 Sending buttons to:', params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendButtons/${this.instanceName}`,
        'POST',
        {
          number,
          text: params.text,
          buttons: params.buttons,
          footerText: params.footerText,
          title: params.title,
        }
      );

      console.log('✅ Buttons sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending buttons:', error);
      throw error;
    }
  }

  /**
   * Send reaction to a message
   * POST /message/sendReaction/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendReaction(params: {
    remoteJid: string; // Complete JID
    messageId: string;
    emoji: string;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log('👍 Sending reaction to:', params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendReaction/${this.instanceName}`,
        'POST',
        {
          number,
          messageId: params.messageId,
          emoji: params.emoji,
        }
      );

      console.log('✅ Reaction sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending reaction:', error);
      throw error;
    }
  }

  /**
   * Send poll/encuesta
   * POST /message/sendPoll/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendPoll(params: {
    remoteJid: string; // Complete JID
    name: string;
    options: string[];
    selectableCount?: number;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log('📊 Sending poll to:', params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendPoll/${this.instanceName}`,
        'POST',
        {
          number,
          name: params.name,
          options: params.options,
          selectableCount: params.selectableCount,
        }
      );

      console.log('✅ Poll sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending poll:', error);
      throw error;
    }
  }

  /**
   * Send sticker
   * POST /message/sendSticker/{instance}
   * @param remoteJid - Complete JID (e.g., "521999999999@s.whatsapp.net")
   */
  async sendSticker(params: {
    remoteJid: string; // Complete JID
    stickerUrl: string;
  }): Promise<SendMessageResponse> {
    try {
      const number = params.remoteJid.split('@')[0];
      console.log('✨ Sending sticker to:', params.remoteJid);
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendSticker/${this.instanceName}`,
        'POST',
        {
          number,
          stickerUrl: params.stickerUrl,
        }
      );

      console.log('✅ Sticker sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending sticker:', error);
      throw error;
    }
  }

  /**
   * Send WhatsApp Status
   * POST /message/sendStatus/{instance}
   */
  async sendStatus(params: {
    statusJid: string;
    fileUrl: string;
    caption?: string;
  }): Promise<SendMessageResponse> {
    try {
      console.log('📌 Sending status');
      
      const response = await this.request<SendMessageResponse>(
        `/message/sendStatus/${this.instanceName}`,
        'POST',
        params
      );

      console.log('✅ Status sent successfully');
      return response;
    } catch (error) {
      console.error('❌ Error sending status:', error);
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
