# 📬 Evolution API Endpoints - Implementación Completa

## 📋 Resumen de Endpoints Implementados

Todos los endpoints de Evolution API han sido implementados en `src/utility/evolutionChatClient.ts` y están disponibles a través de la clase `EvolutionChatClient`.

---

## 1️⃣ **Enviar Texto Simple**

### Endpoint
```
POST /message/sendText/{instance}
```

### Método
```typescript
await chatClient.sendText(number: string, text: string)
```

### Ejemplo
```typescript
await chatClient.sendText('521999999999', 'Hola, este es un mensaje de prueba');
```

### Parámetros
- `number`: Número sin + (ej: 521999999999)
- `text`: Contenido del mensaje

### UI
✅ **Implementado en MessageInput.tsx** - Campo de texto + botón enviar

---

## 2️⃣ **Enviar Medios (Imagen/Video/Documento)**

### Endpoint
```
POST /message/sendMedia/{instance}
```

### Método
```typescript
await chatClient.sendMedia({
  number: string,
  media: string,           // base64 o URL
  mediatype: 'image' | 'video' | 'document' | 'audio',
  caption?: string,
  fileName?: string
})
```

### Ejemplo
```typescript
const base64 = await chatClient.fileToBase64(file);
await chatClient.sendMedia({
  number: '521999999999',
  media: base64,
  mediatype: 'image',
  caption: 'Foto importante'
});
```

### Parámetros
- `number`: Número destino
- `media`: Base64 o URL del archivo
- `mediatype`: Tipo de media
- `caption`: Texto adicional (opcional)
- `fileName`: Nombre del archivo (para documentos)

### UI
✅ **Implementado en MessageInput.tsx** - Botones de imagen y documento

---

## 3️⃣ **Enviar Audio/Nota de Voz**

### Endpoint
```
POST /message/sendWhatsAppAudio/{instance}
```

### Método
```typescript
await chatClient.sendAudio(number: string, audioUrl: string)
```

### Ejemplo
```typescript
await chatClient.sendAudio('521999999999', 'https://example.com/audio.ogg');
```

### Parámetros
- `number`: Número destino
- `audioUrl`: URL del archivo de audio

### Formato
- Soporta: OGG, WAV, MP3
- Máximo recomendado: 16MB

---

## 4️⃣ **Enviar Ubicación**

### Endpoint
```
POST /message/sendLocation/{instance}
```

### Método
```typescript
await chatClient.sendLocation({
  number: string,
  latitude: number,
  longitude: number,
  name?: string,
  address?: string
})
```

### Ejemplo
```typescript
await chatClient.sendLocation({
  number: '521999999999',
  latitude: -34.6037,
  longitude: -58.3816,
  name: 'Buenos Aires',
  address: 'Ciudad Autónoma de Buenos Aires'
});
```

### Parámetros
- `number`: Número destino
- `latitude`: Coordenada de latitud
- `longitude`: Coordenada de longitud
- `name`: Nombre del lugar (opcional)
- `address`: Dirección (opcional)

### UI
✅ **Implementado en MessageInput.tsx** - Modal "Enviar ubicación" en menú más opciones

---

## 5️⃣ **Enviar Contacto/vCard**

### Endpoint
```
POST /message/sendContact/{instance}
```

### Método
```typescript
await chatClient.sendContact({
  number: string,
  contact: Array<{
    fullName: string,
    phoneNumber: string,
    organization?: string
  }>
})
```

### Ejemplo
```typescript
await chatClient.sendContact({
  number: '521999999999',
  contact: [
    {
      fullName: 'Juan García',
      phoneNumber: '521551234567',
      organization: 'Mi Empresa'
    }
  ]
});
```

### Parámetros
- `number`: Número destino
- `contact`: Array de contactos con:
  - `fullName`: Nombre completo
  - `phoneNumber`: Número telefónico
  - `organization`: Empresa (opcional)

### UI
✅ **Implementado en MessageInput.tsx** - Modal "Enviar contacto" en menú más opciones

---

## 6️⃣ **Enviar Lista/Menú Interactivo**

### Endpoint
```
POST /message/sendList/{instance}
```

### Método
```typescript
await chatClient.sendList({
  number: string,
  title: string,
  description: string,
  buttonText: string,
  sections: Array<{
    title: string,
    rows: Array<{
      id: string,
      title: string,
      description?: string
    }>
  }>
})
```

### Ejemplo
```typescript
await chatClient.sendList({
  number: '521999999999',
  title: 'Elige una opción',
  description: 'Opciones disponibles',
  buttonText: 'Ver opciones',
  sections: [
    {
      title: 'Sección 1',
      rows: [
        { id: 'opt1', title: 'Opción 1' },
        { id: 'opt2', title: 'Opción 2' }
      ]
    }
  ]
});
```

### Parámetros
- `number`: Número destino
- `title`: Título de la lista
- `description`: Descripción
- `buttonText`: Texto del botón
- `sections`: Array de secciones con opciones

### UI
⏳ **Pendiente implementación en UI** - Requiere formulario interactivo

---

## 7️⃣ **Enviar Botones**

### Endpoint
```
POST /message/sendButtons/{instance}
```

### Método
```typescript
await chatClient.sendButtons({
  number: string,
  text: string,
  buttons: Array<{
    id: string,
    text: string
  }>,
  footerText?: string,
  title?: string
})
```

### Ejemplo
```typescript
await chatClient.sendButtons({
  number: '521999999999',
  text: 'Selecciona una opción',
  buttons: [
    { id: 'btn1', text: 'Sí' },
    { id: 'btn2', text: 'No' }
  ]
});
```

### Parámetros
- `number`: Número destino
- `text`: Mensaje principal
- `buttons`: Array de botones
- `footerText`: Pie de página (opcional)
- `title`: Título (opcional)

### UI
⏳ **Pendiente implementación en UI** - Requiere constructor de botones

---

## 8️⃣ **Enviar Reacción**

### Endpoint
```
POST /message/sendReaction/{instance}
```

### Método
```typescript
await chatClient.sendReaction({
  number: string,
  messageId: string,
  emoji: string
})
```

### Ejemplo
```typescript
await chatClient.sendReaction({
  number: '521999999999',
  messageId: 'MSG-123',
  emoji: '👍'
});
```

### Parámetros
- `number`: Número destino
- `messageId`: ID del mensaje a reaccionar
- `emoji`: Emoji de reacción

### UI
⏳ **Pendiente implementación en UI** - Requiere botones de emoji en MessageBubble

---

## 9️⃣ **Enviar Encuesta/Poll**

### Endpoint
```
POST /message/sendPoll/{instance}
```

### Método
```typescript
await chatClient.sendPoll({
  number: string,
  name: string,
  options: string[],
  selectableCount?: number
})
```

### Ejemplo
```typescript
await chatClient.sendPoll({
  number: '521999999999',
  name: '¿Cuál es tu opción favorita?',
  options: ['Opción A', 'Opción B', 'Opción C'],
  selectableCount: 1
});
```

### Parámetros
- `number`: Número destino
- `name`: Pregunta de la encuesta
- `options`: Array de opciones
- `selectableCount`: Cantidad de opciones que se pueden seleccionar

### UI
⏳ **Pendiente implementación en UI** - Requiere constructor de encuestas

---

## 🔟 **Enviar Sticker**

### Endpoint
```
POST /message/sendSticker/{instance}
```

### Método
```typescript
await chatClient.sendSticker({
  number: string,
  stickerUrl: string
})
```

### Ejemplo
```typescript
await chatClient.sendSticker({
  number: '521999999999',
  stickerUrl: 'https://example.com/sticker.webp'
});
```

### Parámetros
- `number`: Número destino
- `stickerUrl`: URL del sticker

### Formato
- Soporta: WebP, PNG
- Tamaño recomendado: 512x512px

### UI
⏳ **Pendiente implementación en UI** - Requiere galería de stickers

---

## 1️⃣1️⃣ **Enviar Status**

### Endpoint
```
POST /message/sendStatus/{instance}
```

### Método
```typescript
await chatClient.sendStatus({
  statusJid: string,
  fileUrl: string,
  caption?: string
})
```

### Ejemplo
```typescript
await chatClient.sendStatus({
  statusJid: '121212@c.us',
  fileUrl: 'https://example.com/image.jpg',
  caption: 'Mi estado'
});
```

### Parámetros
- `statusJid`: JID del estatus
- `fileUrl`: URL del archivo media
- `caption`: Texto del estado (opcional)

### UI
⏳ **Pendiente implementación en UI** - Requiere interfaz de estados

---

## 1️⃣2️⃣ **Marcar como Leído**

### Endpoint
```
POST /chat/markMessageAsRead/{instance}
```

### Método
```typescript
await chatClient.markAsRead(chatId: string, messageId: string)
```

### Ejemplo
```typescript
await chatClient.markAsRead('521999999999@s.whatsapp.net', 'MSG-123');
```

### Parámetros
- `chatId`: JID del chat (remoteJid)
- `messageId`: ID del mensaje

### Implementación
✅ **Usado automáticamente en MessageThread.tsx** - Se marca como leído al abrir el chat

---

## 📊 Estado de Implementación

| # | Endpoint | Cliente | UI |
|---|----------|--------|-----|
| 1 | Enviar Texto | ✅ | ✅ |
| 2 | Enviar Media | ✅ | ✅ |
| 3 | Enviar Audio | ✅ | ⏳ |
| 4 | Enviar Ubicación | ✅ | ✅ |
| 5 | Enviar Contacto | ✅ | ✅ |
| 6 | Enviar Lista | ✅ | ⏳ |
| 7 | Enviar Botones | ✅ | ⏳ |
| 8 | Enviar Reacción | ✅ | ⏳ |
| 9 | Enviar Encuesta | ✅ | ⏳ |
| 10 | Enviar Sticker | ✅ | ⏳ |
| 11 | Enviar Status | ✅ | ⏳ |
| 12 | Marcar como Leído | ✅ | ✅ |

---

## 🔧 Cómo Usar en Componentes

### Importar el cliente
```typescript
import EvolutionChatClient from '../../utility/evolutionChatClient';
```

### Usar en componentes
```typescript
const handleSendMessage = async () => {
  try {
    const number = chatClient.extractNumberFromJid(chatId);
    await chatClient.sendText(number, 'Mi mensaje');
    console.log('✅ Mensaje enviado');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

---

## 📝 Requisitos Previos

Antes de enviar cualquier mensaje:

1. ✅ **Instancia conectada**: Debe estar escaneado el QR de WhatsApp
2. ✅ **API Key**: Debe estar configurada en `.env`
3. ✅ **Número válido**: Debe incluir código de país sin `+`
4. ✅ **URL Base**: Debe apuntar al servidor de Evolution API correcto

```env
VITE_SERVER_URL=https://tu-servidor:puerto
VITE_API_KEY=tu-api-key-aqui
```

---

## 🚀 Próximos Pasos

1. **Implementar UI para Lista**: Constructor interactivo de listas
2. **Implementar UI para Botones**: Builder de botones
3. **Implementar UI para Encuestas**: Creator de polls
4. **Implementar Reacciones**: Botones de emoji en mensajes
5. **Implementar Stickers**: Galería de stickers
6. **Implementar Estatus**: Interfaz para compartir estados

---

## ⚡ Tips de Optimización

1. **Deduplicación**: Los mensajes se deduplicana automáticamente por `key.id`
2. **Multi-device**: El cliente carga automáticamente mensajes de todas las variantes de `remoteJid`
3. **Caché**: Implementar cache de contactos para búsquedas rápidas
4. **Paginación**: Implementar carga de más mensajes al hacer scroll hacia arriba

---

## 📞 Soporte

Documentación oficial: https://evolution-api.com
Endpoint referencia: `/docs` en tu servidor Evolution API
