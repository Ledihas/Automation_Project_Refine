const WHAPI_URL = import.meta.env.VITE_WHAPI_API_URL || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = import.meta.env.VITE_WHAPI_TOKEN;

interface WhapiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Cliente para interactuar con Whapi API
 */
export class WhapiClient {
  private baseUrl: string;
  private token: string;

  constructor(token?: string) {
    this.baseUrl = WHAPI_URL;
    this.token = token || WHAPI_TOKEN;
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Verificar estado del canal (health check)
   */
  async checkHealth(): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener información del perfil del usuario
   */
  async getMe(): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener QR en formato base64 para login
   */
  async getQR(): Promise<WhapiResponse<{ qr?: string; base64?: string; status?: string; expire?: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/login?wakeup=true`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Configurar settings del canal (webhook, media, etc.)
   */
  async setWebhook(webhookUrl: string): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          media: {
            auto_download: ['audio', 'voice', 'document', 'image']
          },
          webhooks: [
            {
              mode: 'body',
              events: [
                {
                  type: 'messages',
                  method: 'post'
                }
              ],
              url: webhookUrl
            }
          ],
          offline_mode: false,
          full_history: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener configuración del canal
   */
  async getSettings(): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Desconectar canal
   */
  async logout(): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Enviar mensaje de texto
   */
  async sendText(to: string, body: string): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          typing_time: 0,
          to,
          body,
          no_link_preview: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Subir archivo multimedia
   */
  async uploadMedia(file: File): Promise<WhapiResponse<{ id: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Enviar imagen
   */
  async sendImage(to: string, mediaId: string, caption?: string): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/image`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          to,
          media: mediaId,
          caption: caption || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Convertir archivo a base64 con formato data URI (sin compresión)
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // El resultado ya viene en formato data:mimetype;base64,...
        // Extraemos solo la parte base64 y reconstruimos con el nombre
        const mimeType = file.type || 'application/octet-stream';
        const base64Data = result.split(',')[1];
        const encodedName = encodeURIComponent(file.name);
        const dataUri = `data:${mimeType};name=${encodedName};base64,${base64Data}`;
        resolve(dataUri);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Obtener dimensiones de una imagen
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar la imagen'));
      };
      img.src = url;
    });
  }

  /**
   * Enviar imagen desde archivo usando base64 data URI con dimensiones
   */
  async sendImageFromFile(to: string, file: File, caption?: string): Promise<WhapiResponse<any>> {
    try {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'El archivo debe ser una imagen' };
      }

      // Obtener dimensiones y base64 en paralelo
      const [mediaBase64, dimensions] = await Promise.all([
        this.fileToBase64(file),
        this.getImageDimensions(file)
      ]);

      // Construir body con todos los parámetros necesarios
      const body: Record<string, unknown> = {
        to,
        media: mediaBase64,
        mime_type: file.type,
        width: dimensions.width,
        height: dimensions.height
      };

      if (caption) {
        body.caption = caption;
      }

      const response = await fetch(`${this.baseUrl}/messages/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Enviar documento desde archivo
   */
  async sendDocumentFromFile(to: string, file: File, filename?: string): Promise<WhapiResponse<any>> {
    try {
      // Convertir archivo a base64 con formato data URI
      const mediaBase64 = await this.fileToBase64(file);

      const response = await fetch(`${this.baseUrl}/messages/document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          to,
          media: mediaBase64,
          filename: filename || file.name
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId: string): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status: 'read' })
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener lista de chats
   */
  async getChats(count: number = 100): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/chats?count=${count}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener mensajes de un chat
   */
  async getMessages(chatId: string, count: number = 100): Promise<WhapiResponse<any>> {
    try {
      const encodedChatId = encodeURIComponent(chatId);
      const response = await fetch(`${this.baseUrl}/messages/list/${encodedChatId}?count=${count}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener lista de etiquetas
   */
  async getLabels(): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/labels`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener contactos asociados a una etiqueta
   */
  async getLabelContacts(labelId: string | number): Promise<WhapiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/labels/${labelId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Asociar un contacto a una etiqueta
   */
  async addContactToLabel(labelId: string | number, contactId: string): Promise<WhapiResponse<any>> {
    try {
      const encodedContactId = encodeURIComponent(contactId);
      const response = await fetch(`${this.baseUrl}/labels/${labelId}/${encodedContactId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Eliminar asociación de un contacto con una etiqueta
   */
  async removeContactFromLabel(labelId: string | number, contactId: string): Promise<WhapiResponse<any>> {
    try {
      const encodedContactId = encodeURIComponent(contactId);
      const response = await fetch(`${this.baseUrl}/labels/${labelId}/${encodedContactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Obtener información de un contacto (nombre y foto de perfil)
   */
  async getContact(
    contactId: string
  ): Promise<WhapiResponse<{ id: string; name?: string; profile_pic?: string; profile_pic_full?: string }>> {
    try {
      // Extraer solo el número del ID (quitar @s.whatsapp.net)
      const phoneNumber = contactId.replace('@s.whatsapp.net', '').replace('@c.us', '');
      const response = await fetch(`${this.baseUrl}/contacts/${phoneNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Exportar instancia única
export const whapiClient = new WhapiClient();
