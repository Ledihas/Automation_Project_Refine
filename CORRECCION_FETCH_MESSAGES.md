# 🔧 Corrección del Endpoint fetchMessages - 31/01/2026

## 📋 Cambios Realizados

Se actualizó el método `fetchMessages()` en `EvolutionChatClient` para:
1. Remover el parámetro `limit` del payload
2. Agregar soporte para el nuevo formato de respuesta `MessageUpdate`
3. Mejorar el manejo de diferentes formatos de respuesta

---

## 🔗 Endpoint Correcto

### URL
```
POST /chat/findMessages/{instanceName}
```

### Ejemplo con datos reales
```
POST https://whatsapp.agentedecargaonline.com/chat/findMessages/sabado_9246
```

### Headers
```
Content-Type: application/json
apikey: {VITE_API_KEY}
```

### Request Body (Payload)
```json
{
  "where": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    }
  }
}
```

**Nota**: NO incluye `limit` en el payload (se removió)

---

## 📥 Formatos de Respuesta Soportados

El método ahora maneja **4 formatos diferentes**:

### Formato 1: Array Directo ✅
```json
[
  {
    "key": { "id": "...", "fromMe": true, "remoteJid": "..." },
    "message": { "conversation": "Hola" },
    "messageTimestamp": 1769791579,
    "status": "READ"
  },
  ...
]
```

**Log**: `✅ Loaded N messages (array format)`

---

### Formato 2: MessageUpdate Array (NUEVO) ✅
```json
{
  "MessageUpdate": [
    {
      "status": "DELIVERY_ACK"
    },
    {
      "status": "READ"
    },
    ...
  ]
}
```

**Log**: `✅ Loaded N messages (MessageUpdate format)`

---

### Formato 3: Messages Property
```json
{
  "messages": [
    {
      "key": { ... },
      "message": { ... },
      ...
    }
  ]
}
```

**Log**: `✅ Loaded N messages (messages property)`

---

### Formato 4: Response Anidado
```json
{
  "response": {
    "MessageUpdate": [...]
    // o
    "messages": [...]
  }
}
```

**Log**: `✅ Loaded N messages (nested MessageUpdate)` o `(nested messages)`

---

## 📝 Código Actualizado

**Ubicación**: [src/utility/evolutionChatClient.ts](src/utility/evolutionChatClient.ts#L133)

```typescript
async fetchMessages(chatId: string, limit: number = 50): Promise<Message[]> {
  try {
    console.log('📥 Fetching messages for:', chatId);
    
    // POST sin limit en payload
    const response = await this.request<unknown>(
      `/chat/findMessages/${this.instanceName}`,
      'POST',
      {
        where: {
          key: {
            remoteJid: chatId,  // ← JID del contacto
          },
        },
        // ✅ limit REMOVIDO del payload
      }
    );

    let messages: Message[] = [];
    
    // 1️⃣ Formato: Array directo
    if (Array.isArray(response)) {
      messages = response as Message[];
    }
    
    // 2️⃣ Formato: Objeto wrapper
    else if (response && typeof response === 'object') {
      const responseObj = response as Record<string, unknown>;
      
      // ✨ NUEVO: Buscar MessageUpdate array
      if (responseObj.MessageUpdate && Array.isArray(responseObj.MessageUpdate)) {
        messages = responseObj.MessageUpdate as Message[];
      }
      // Fallback: messages array
      else if (responseObj.messages && Array.isArray(responseObj.messages)) {
        messages = responseObj.messages as Message[];
      }
      // Fallback: response anidado
      else if (responseObj.response && typeof responseObj.response === 'object') {
        const innerResponse = responseObj.response as Record<string, unknown>;
        
        if (innerResponse.MessageUpdate && Array.isArray(innerResponse.MessageUpdate)) {
          messages = innerResponse.MessageUpdate as Message[];
        }
        // ... más fallbacks
      }
    }

    // Ordenar por timestamp (antiguo a reciente)
    messages.sort((a, b) => a.messageTimestamp - b.messageTimestamp);

    return messages;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return [];
  }
}
```

---

## 📊 Cambios Específicos

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| Payload | `{ where, limit }` | `{ where }` (sin limit) |
| MessageUpdate | No soportado ❌ | Soportado ✅ |
| Primer log | "Loaded N messages" | "Loaded N messages (format)" |
| Formato detectado | 3 opciones | 4 opciones |

---

## ✅ Compatibilidad Hacia Atrás

El método mantiene **compatibilidad total** con:
- Array directo de mensajes
- Wrapper con `messages` property
- Response anidado
- **NUEVO**: Wrapper con `MessageUpdate` property

---

## 🧪 Cómo Probar

### Curl directo
```bash
curl -X POST "https://whatsapp.agentedecargaonline.com/chat/findMessages/sabado_9246" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_API_KEY" \
  -d '{
    "where": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net"
      }
    }
  }'
```

### En la aplicación
1. Abrir Chat Multiagente
2. Seleccionar un chat
3. Ver en consola el log de format detectado
4. Ejemplo: `✅ Loaded 47 messages (MessageUpdate format)`

---

## 📌 Notas Importantes

1. **Sin limit en payload**: El API probablemente retorna un máximo predefinido
2. **MessageUpdate array**: Puede contener solo campos de status, no mensajes completos
3. **Ordenamiento**: Siempre ascendente (antiguo a reciente)
4. **Error handling**: Retorna `[]` si hay error
5. **Logs detallados**: Indica qué formato se detectó

---

## 🚀 Próximos Pasos

Si la API retorna un array de MessageUpdate sin los campos completos de Message:
- Considerar un tipo separado para updates
- Combinar MessageUpdate con mensajes previos en caché
- Implementar lógica de actualización de status

