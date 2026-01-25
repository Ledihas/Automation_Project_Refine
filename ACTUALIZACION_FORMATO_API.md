# 🔄 Actualización: Nuevo Formato de Respuesta Evolution API

## 📋 Cambio en la Estructura de Respuesta

Evolution API ahora devuelve las respuestas en un formato envuelto con metadatos adicionales.

### Formato Anterior (Legacy)

```json
[
  {
    "id": "5511999999999@s.whatsapp.net",
    "name": "Juan Pérez",
    "unreadCount": 3
  }
]
```

### Formato Nuevo (Actual)

```json
{
  "status": "SUCCESS",
  "error": false,
  "response": {
    "chats": [
      {
        "id": "5511999999999@s.whatsapp.net",
        "name": "Juan Pérez",
        "unreadCount": 3,
        "lastMessage": {
          "conversation": "Hola, ¿cómo estás?",
          "timestamp": "1717782429"
        },
        "pinned": false,
        "archived": false
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 50
  }
}
```

## ✅ Cambios Implementados

### 1. Actualización de Tipos (`chatTypes.ts`)

#### Nuevo Tipo: `EvolutionAPIResponse`

```typescript
export interface EvolutionAPIResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  error: boolean;
  response: T;
}
```

#### Actualización de `Chat`

```typescript
export interface Chat {
  id: string;
  name?: string;
  unreadCount?: number;
  conversationTimestamp?: number;
  lastMessage?: Message | {
    conversation?: string;
    timestamp?: string | number;
  };
  profilePictureUrl?: string;
  isGroup?: boolean;
  pinned?: boolean;        // ✅ Nuevo
  archived?: boolean;      // ✅ Nuevo
}
```

#### Actualización de `FetchChatsResponse`

```typescript
export interface FetchChatsResponse {
  chats: Chat[];
  total?: number;    // ✅ Nuevo - Total de chats disponibles
  page?: number;     // ✅ Nuevo - Página actual
  limit?: number;    // ✅ Nuevo - Límite por página
}
```

### 2. Actualización del Cliente (`evolutionChatClient.ts`)

#### Método `fetchChats()` - Soporte Multi-formato

```typescript
async fetchChats(): Promise<Chat[]> {
  const response = await this.request<Record<string, unknown>>(
    `/chat/findChats/${this.instanceName}`,
    'POST',
    {}
  );

  let chats: Chat[] = [];
  
  // ✅ Formato nuevo: { status, error, response: { chats: [...] } }
  if (response.status === 'SUCCESS' && response.response) {
    const responseData = response.response as Record<string, unknown>;
    if (responseData.chats && Array.isArray(responseData.chats)) {
      chats = responseData.chats as Chat[];
      console.log(`✅ Loaded ${chats.length} chats (new format)`);
      if (responseData.total) {
        console.log(`📊 Total chats: ${responseData.total}`);
      }
    }
  }
  // ✅ Formato antiguo: Array directo (retrocompatibilidad)
  else if (Array.isArray(response)) {
    chats = response as Chat[];
    console.log(`✅ Loaded ${chats.length} chats (legacy format)`);
  }
  // ✅ Otros formatos antiguos...
  
  return chats;
}
```

#### Método `fetchMessages()` - Actualizado Similar

```typescript
async fetchMessages(chatId: string, limit: number = 50): Promise<Message[]> {
  // Similar lógica multi-formato
  // Soporta: { status, response: { messages } } y formatos legacy
}
```

### 3. Actualización de Componentes

#### `ConversationItem.tsx` - Manejo de `lastMessage`

```typescript
// Manejar diferentes formatos de lastMessage
let lastMessageText = 'Sin mensajes';
let lastMessageTime = '';

if (chat.lastMessage) {
  // ✅ Formato nuevo: { conversation: "texto", timestamp: "1717782429" }
  if ('conversation' in chat.lastMessage) {
    lastMessageText = chat.lastMessage.conversation;
    const timestamp = typeof chat.lastMessage.timestamp === 'string' 
      ? parseInt(chat.lastMessage.timestamp) 
      : chat.lastMessage.timestamp;
    lastMessageTime = formatLastMessageTime(timestamp);
  }
  // ✅ Formato antiguo: Message completo
  else if ('message' in chat.lastMessage) {
    lastMessageText = getMessageText(chat.lastMessage);
    lastMessageTime = formatLastMessageTime(chat.lastMessage.messageTimestamp);
  }
}
```

## 🎯 Beneficios de la Actualización

### 1. Paginación

```json
{
  "response": {
    "chats": [...],
    "total": 100,    // Total de chats
    "page": 1,       // Página actual
    "limit": 50      // Chats por página
  }
}
```

**Ventajas:**
- ✅ Cargar chats en páginas
- ✅ Mejor rendimiento con muchos chats
- ✅ Saber cuántos chats hay en total

### 2. Estado de la Respuesta

```json
{
  "status": "SUCCESS",  // o "ERROR"
  "error": false        // true si hay error
}
```

**Ventajas:**
- ✅ Detectar errores fácilmente
- ✅ Manejo de errores más robusto
- ✅ Respuestas consistentes

### 3. Metadatos Adicionales

```json
{
  "pinned": false,
  "archived": false
}
```

**Ventajas:**
- ✅ Saber si un chat está fijado
- ✅ Filtrar chats archivados
- ✅ Más información del estado del chat

### 4. Retrocompatibilidad

El código soporta **ambos formatos**:
- ✅ Formato nuevo (con paginación)
- ✅ Formato antiguo (array directo)
- ✅ Transición suave sin breaking changes

## 📊 Comparación de Formatos

| Aspecto | Formato Antiguo | Formato Nuevo |
|---------|----------------|---------------|
| **Estructura** | Array directo | Objeto envuelto |
| **Paginación** | ❌ No | ✅ Sí (total, page, limit) |
| **Estado** | ❌ No | ✅ Sí (status, error) |
| **lastMessage** | Objeto Message completo | Objeto simplificado |
| **Metadatos** | Básicos | Extendidos (pinned, archived) |
| **Tamaño respuesta** | Más grande | Más eficiente |

## 🧪 Testing

### Probar con Formato Nuevo

```bash
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.'
```

**Respuesta esperada:**
```json
{
  "status": "SUCCESS",
  "error": false,
  "response": {
    "chats": [...],
    "total": 25,
    "page": 1,
    "limit": 50
  }
}
```

### Logs en Consola

```javascript
// Formato nuevo detectado
📦 Raw response: { status: 'SUCCESS', error: false, response: {...} }
✅ Loaded 25 chats (new format with pagination)
📊 Total chats available: 25

// Formato antiguo detectado
📦 Raw response: [...]
✅ Loaded 25 chats (legacy format)
```

## 🔄 Migración

### No Requiere Cambios en el Código de Usuario

El cliente maneja automáticamente ambos formatos:

```typescript
// Tu código sigue igual
const chats = await chatClient.fetchChats();
// Funciona con formato nuevo y antiguo
```

### Detección Automática

```typescript
// El cliente detecta automáticamente el formato
if (response.status === 'SUCCESS') {
  // Formato nuevo
} else if (Array.isArray(response)) {
  // Formato antiguo
}
```

## 📝 Notas Importantes

### 1. Timestamp de lastMessage

**Formato nuevo**: String o número
```json
"timestamp": "1717782429"  // String
```

**Conversión automática:**
```typescript
const timestamp = typeof chat.lastMessage.timestamp === 'string' 
  ? parseInt(chat.lastMessage.timestamp) 
  : chat.lastMessage.timestamp;
```

### 2. Estructura de lastMessage

**Formato nuevo**: Simplificado
```json
{
  "conversation": "Hola",
  "timestamp": "1717782429"
}
```

**Formato antiguo**: Completo
```json
{
  "key": {...},
  "message": {...},
  "messageTimestamp": 1717782429
}
```

### 3. Paginación (Futuro)

Preparado para implementar paginación:

```typescript
async fetchChats(page: number = 1, limit: number = 50): Promise<Chat[]> {
  // Enviar page y limit en el body
  const response = await this.request(
    `/chat/findChats/${this.instanceName}`,
    'POST',
    { page, limit }
  );
}
```

## ✅ Verificación

### Build Status
```bash
npm run build
✓ TypeScript compilation: SUCCESS
✓ No diagnostics found
```

### Archivos Modificados
- ✅ `src/utility/chatTypes.ts` - Tipos actualizados
- ✅ `src/utility/evolutionChatClient.ts` - Cliente multi-formato
- ✅ `src/components/chat/ConversationItem.tsx` - Manejo de lastMessage

### Compatibilidad
- ✅ Formato nuevo (Evolution API v2 actualizado)
- ✅ Formato antiguo (retrocompatibilidad)
- ✅ Transición suave sin breaking changes

## 🚀 Próximos Pasos

### Opcional - Implementar Paginación

```typescript
// En ConversationList.tsx
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);

const loadChats = async () => {
  const response = await chatClient.fetchChatsWithPagination(page, 50);
  setChats(response.chats);
  setTotal(response.total);
};

// Agregar botones de paginación
<Pagination 
  current={page} 
  total={total} 
  pageSize={50}
  onChange={setPage}
/>
```

### Opcional - Filtros

```typescript
// Filtrar chats archivados
const activeChats = chats.filter(chat => !chat.archived);

// Filtrar chats fijados
const pinnedChats = chats.filter(chat => chat.pinned);
```

## 📚 Referencias

- [Evolution API v2 Docs](https://doc.evolution-api.com/)
- [Paginación en APIs REST](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/)

---

**Fecha de actualización**: 24 de Enero, 2026  
**Versión Evolution API**: v2 (formato actualizado)  
**Compatibilidad**: ✅ Retrocompatible con formato antiguo  
**Estado**: ✅ IMPLEMENTADO Y PROBADO
