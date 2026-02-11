# Configuración Automática de Chatwoot

## Descripción

Cuando una instancia de WhatsApp se conecta exitosamente, el sistema automáticamente configura la integración con Chatwoot usando las credenciales proporcionadas en las variables de entorno.

## Variables de Entorno Requeridas

Para habilitar la configuración automática de Chatwoot, agregue las siguientes variables a su archivo `.env`:

```bash
# Habilitar integración automática de Chatwoot
VITE_CHATWOOT_ENABLED=true

# URL base de su instancia de Chatwoot
VITE_CHATWOOT_URL=https://app.chatwoot.com

# ID de cuenta en Chatwoot (número)
VITE_CHATWOOT_ACCOUNT_ID=1

# Token/API Key de Chatwoot (generar en configuración de cuenta)
VITE_CHATWOOT_TOKEN=your_api_token_here
```

## Cómo obtener las credenciales de Chatwoot

### 1. Account ID
- Inicie sesión en su instancia de Chatwoot
- Vaya a **Configuración > Cuenta**
- El ID de cuenta aparece en la URL: `https://app.chatwoot.com/accounts/{ACCOUNT_ID}`

### 2. API Token
- En Chatwoot, vaya a **Configuración > Cuenta > API**
- Haga clic en **Crear nuevo token**
- Nombre el token (ej: "Evolution API")
- Seleccione los permisos necesarios
- Copie el token (aparece solo una vez)

## Flujo de Configuración

```
1. Usuario crea instancia de WhatsApp
2. Usuario escanea código QR
3. WhatsApp se conecta (estado = "open")
4. Sistema automáticamente:
   - Valida credenciales de Chatwoot
   - Llama a endpoint /chatwoot/set/{instanceName} en EvolutionAPI
   - Configura inbox, importación de contactos/mensajes
   - Notifica al usuario del resultado
```

## Configuración de Chatwoot en EvolutionAPI

El payload enviado a EvolutionAPI incluye:

```json
{
  "enabled": true,
  "url": "https://app.chatwoot.com",
  "accountId": "1",
  "token": "your_api_token",
  "signMsg": true,
  "reopenConversation": true,
  "conversationPending": false,
  "nameInbox": "instance_name",
  "mergeBrazilContacts": true,
  "importContacts": true,
  "importMessages": true,
  "daysLimitImportMessages": 3,
  "organization": "ACO Assistant",
  "logo": "https://evolution-api.com/files/evolution-api-favicon.png"
}
```

## Logs de Configuración

Cuando se intenta configurar Chatwoot, verá logs en la consola:

```
🔧 Configurando Chatwoot para: instance_name
📋 Config recibida: { url: '...', accountId: '...', ... }
🌐 Endpoint: http://server:3333/chatwoot/set/instance_name
📥 EvolutionAPI Response Status: 200
✅ Chatwoot configurado exitosamente
```

## Solución de Problemas

### "Faltan credenciales de Chatwoot"
- Verifique que todas las 4 variables estén en el archivo `.env`
- Asegúrese de que `VITE_CHATWOOT_ENABLED=true`

### "HTTP 401 Unauthorized"
- El token de Chatwoot es inválido o expiró
- Genere un nuevo token en Chatwoot

### "HTTP 400 Bad Request"
- El formato del Account ID es incorrecto (debe ser número)
- La URL de Chatwoot está mal formada

### Chatwoot se omite pero no hay error
- Si no tiene credenciales configuradas, el sistema sigue sin error
- La instancia de WhatsApp funciona perfectamente sin Chatwoot
- Puede configurar Chatwoot manualmente después en EvolutionAPI

## Configuración Manual

Si prefiere configurar Chatwoot manualmente después de conectar la instancia:

```bash
curl -X POST "http://localhost:3333/chatwoot/set/instance_name" \
  -H "apikey: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://app.chatwoot.com",
    "accountId": "1",
    "token": "your_token",
    "nameInbox": "instance_name"
  }'
```

## Notas Importantes

- La configuración de Chatwoot se realiza **después** de confirmar la conexión exitosa
- Si Chatwoot no está disponible, la instancia de WhatsApp **sigue funcionando**
- Los mensajes de WhatsApp se sincronizarán con Chatwoot una vez configurado
- Puede habilitar/deshabilitar Chatwoot cambiando `VITE_CHATWOOT_ENABLED`
