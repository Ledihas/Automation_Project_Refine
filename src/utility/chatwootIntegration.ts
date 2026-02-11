import { notification } from 'antd';

export interface ChatwootIntegrationConfig {
  enabled: boolean;
  url: string;
  accountId: string;
  token: string;
  signMsg?: boolean;
  reopenConversation?: boolean;
  conversationPending?: boolean;
  nameInbox?: string;
  mergeBrazilContacts?: boolean;
  importContacts?: boolean;
  importMessages?: boolean;
  daysLimitImport?: number;
  organization?: string;
  logo?: string;
}

/**
 * Configurar Chatwoot para una instancia de WhatsApp
 * Usa el endpoint POST /chatwoot/set/{instanceName} de EvolutionAPI
 * 
 * @param instanceName - Nombre de la instancia en EvolutionAPI
 * @param chatwootConfig - Configuración de Chatwoot
 * @param serverUrl - URL del servidor de EvolutionAPI
 * @param apiKey - API Key de EvolutionAPI
 * @returns Promise<boolean> - true si la configuración fue exitosa
 */
export const configureChatwoot = async (
  instanceName: string,
  chatwootConfig: ChatwootIntegrationConfig,
  serverUrl: string,
  apiKey: string
): Promise<boolean> => {
  try {
    console.log('🔧 Configurando Chatwoot para:', instanceName);
    console.log('📋 Config recibida:', {
      enabled: chatwootConfig.enabled,
      url: chatwootConfig.url,
      accountId: chatwootConfig.accountId,
      token: chatwootConfig.token ? `[OCULTO - ${chatwootConfig.token.length} chars]` : 'MISSING',
      nameInbox: chatwootConfig.nameInbox || instanceName,
    });

    // Validar que esté habilitado
    if (!chatwootConfig.enabled) {
      console.log('⏭️ Chatwoot deshabilitado, omitiendo configuración');
      return true;
    }

    // Validar campos obligatorios
    if (!chatwootConfig.url || !chatwootConfig.accountId || !chatwootConfig.token) {
      console.error('❌ Faltan campos obligatorios de Chatwoot');
      console.error('   URL:', chatwootConfig.url ? '✅' : '❌');
      console.error('   Account ID:', chatwootConfig.accountId ? '✅' : '❌');
      console.error('   Token:', chatwootConfig.token ? '✅' : '❌');
      
      notification.error({
        message: 'Error en Configuración de Chatwoot',
        description: 'Faltan campos obligatorios (URL, Account ID o Token)',
        duration: 8,
      });
      return false;
    }

    // Limpiar URL (sin / al final)
    const cleanUrl = chatwootConfig.url.replace(/\/$/, '');

    // Construir payload para el endpoint /chatwoot/set
    const payload = {
      enabled: true,
      accountId: chatwootConfig.accountId,
      token: chatwootConfig.token,
      url: cleanUrl,
      signMsg: chatwootConfig.signMsg ?? true,
      reopenConversation: chatwootConfig.reopenConversation ?? true,
      conversationPending: chatwootConfig.conversationPending ?? false,
      nameInbox: chatwootConfig.nameInbox || instanceName,
      mergeBrazilContacts: chatwootConfig.mergeBrazilContacts ?? true,
      importContacts: chatwootConfig.importContacts ?? true,
      importMessages: chatwootConfig.importMessages ?? true,
      daysLimitImportMessages: chatwootConfig.daysLimitImport ?? 2,
      signDelimiter: '\n',
      autoCreate: true, // ✨ CRÍTICO: Crea automáticamente el inbox en Chatwoot
      organization: chatwootConfig.organization || 'ACO Assistant',
      logo: chatwootConfig.logo || 'https://evolution-api.com/files/evolution-api-favicon.png',
      ignoreJids: ['@g.us'], // Ignorar mensajes de grupos
    };

    console.log('📤 Enviando configuración a EvolutionAPI:', {
      ...payload,
      token: '[OCULTO]',
    });

    // Llamar al endpoint /chatwoot/set
    const endpoint = `${serverUrl}/chatwoot/set/${instanceName}`;
    console.log(`🌐 Endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('📥 EvolutionAPI Response Status:', response.status);
    console.log('📥 EvolutionAPI Response Body:', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Error parsing response:', e);
      data = { message: responseText };
    }

    if (!response.ok) {
      const errorMsg = data.message || `HTTP ${response.status}`;
      console.error('❌ EvolutionAPI Error:', errorMsg);
      
      notification.error({
        message: '❌ Error al Configurar Chatwoot',
        description: errorMsg,
        duration: 8,
      });
      return false;
    }

    console.log('✅ Chatwoot configurado exitosamente');
    console.log('📥 Respuesta completa:', data);

    notification.success({
      message: '✅ Chatwoot Configurado',
      description: `La integración con Chatwoot fue configurada para ${instanceName}`,
      duration: 5,
    });

    return true;

  } catch (error: any) {
    console.error('❌ Error configurando Chatwoot:', error);
    
    notification.error({
      message: '❌ Error al Configurar Chatwoot',
      description: error.message || 'No se pudo configurar la integración',
      duration: 8,
    });
    return false;
  }
};

/**
 * Verificar si la configuración de Chatwoot está completa
 */
export const isValidChatwootConfig = (config: ChatwootIntegrationConfig): boolean => {
  if (!config.enabled) return true;
  
  return !!(
    config.url &&
    config.accountId &&
    config.token &&
    config.url.trim() !== '' &&
    config.accountId.trim() !== '' &&
    config.token.trim() !== ''
  );
};
