# 🚀 Guía Rápida - Chat Multiagente

## ⚡ Inicio Rápido

### 1. Verificar Requisitos
```bash
# Verificar que tienes instancias conectadas
# En Appwrite, busca documentos con status: "connected"
```

### 2. Iniciar Aplicación
```bash
npm run dev
```

### 3. Acceder al Chat
```
http://localhost:3000/chat
```

## 📱 Uso Básico

### Paso 1: Seleccionar Instancia
1. Abre el dropdown en la parte superior
2. Selecciona una instancia de WhatsApp conectada
3. Espera a que carguen las conversaciones

### Paso 2: Buscar Conversación
1. Usa la barra de búsqueda para filtrar
2. O scroll por la lista de conversaciones
3. Click en una conversación para abrirla

### Paso 3: Enviar Mensajes

#### Texto
1. Escribe en el input inferior
2. Presiona Enter o click en el botón de enviar
3. Shift+Enter para nueva línea

#### Imagen
1. Click en el botón 📷
2. Selecciona una imagen (máx 10MB)
3. Opcionalmente escribe un caption
4. Se envía automáticamente

#### Documento
1. Click en el botón 📎
2. Selecciona un archivo (máx 20MB)
3. Se envía automáticamente

## 🎯 Atajos de Teclado

- `Enter` - Enviar mensaje
- `Shift + Enter` - Nueva línea
- `Ctrl + F` - Buscar conversación (en input de búsqueda)

## 💡 Tips

### Auto-refresh
- Los mensajes se actualizan cada 10 segundos
- No necesitas recargar la página
- Usa el botón 🔄 para actualizar conversaciones manualmente

### Mensajes No Leídos
- Badge rojo muestra cantidad de mensajes no leídos
- Se marcan como leídos automáticamente al abrir el chat
- El nombre aparece en negrita si hay mensajes sin leer

### Cambiar de Instancia
- Puedes cambiar de instancia en cualquier momento
- Las conversaciones se recargan automáticamente
- El chat actual se cierra al cambiar

## 🐛 Solución de Problemas

### No aparecen conversaciones
**Problema**: La lista está vacía
**Solución**:
1. Verifica que la instancia esté conectada en Evolution API
2. Asegúrate de que haya conversaciones en WhatsApp
3. Click en el botón de actualizar 🔄
4. Revisa la consola del navegador (F12)

### No se envían mensajes
**Problema**: Error al enviar
**Solución**:
1. Verifica tu conexión a internet
2. Asegúrate de que Evolution API esté funcionando
3. Revisa que el API key sea correcto
4. Verifica el tamaño del archivo (límites: 10MB/20MB)

### Mensajes no se actualizan
**Problema**: No veo mensajes nuevos
**Solución**:
1. Espera 10 segundos (auto-refresh)
2. O cierra y vuelve a abrir la conversación
3. Verifica que Evolution API esté respondiendo

### Error "No hay instancias conectadas"
**Problema**: No puedo acceder al chat
**Solución**:
1. Ve al Dashboard
2. Crea una nueva instancia
3. Escanea el código QR
4. Espera a que el status sea "connected"
5. Vuelve al chat

## 📊 Indicadores Visuales

### Estados de Mensaje
- `⏳` - Enviando
- `✓` - Enviado al servidor
- `✓✓` - Entregado al destinatario
- `✓✓` (azul) - Leído por el destinatario

### Estados de Conversación
- **Negrita** - Mensajes sin leer
- Badge rojo - Cantidad de mensajes sin leer
- Fondo gris - Conversación seleccionada
- Hover - Resaltado al pasar el mouse

### Tipos de Mensaje
- 💬 - Texto
- 📷 - Imagen
- 🎥 - Video
- 📄 - Documento
- 🎵 - Audio
- 🎤 - Audio de voz
- 🎨 - Sticker
- 📍 - Ubicación
- 👤 - Contacto

## 🎨 Personalización

### Cambiar Límite de Mensajes
En `MessageThread.tsx`, línea ~50:
```typescript
const msgs = await chatClient.fetchMessages(chat.id, 100); // Cambiar 100
```

### Cambiar Intervalo de Auto-refresh
En `MessageThread.tsx`, línea ~70:
```typescript
setInterval(() => {
  loadMessages();
}, 10000); // Cambiar 10000 (milisegundos)
```

### Cambiar Límite de Tamaño de Archivos
En `MessageInput.tsx`:
```typescript
// Imágenes (línea ~90)
const isLt10M = file.size / 1024 / 1024 < 10; // Cambiar 10

// Documentos (línea ~100)
const isLt20M = file.size / 1024 / 1024 < 20; // Cambiar 20
```

## 📞 Soporte

### Logs de Debugging
Abre la consola del navegador (F12) y busca:
- `📥` - Cargando datos
- `📤` - Enviando datos
- `✅` - Operación exitosa
- `❌` - Error

### Información Útil
- Versión de React: 19.1.0
- Versión de Ant Design: 5.27.4
- Versión de Refine: 5.0.0
- Evolution API: v2

## 🔗 Enlaces Útiles

- [Documentación Completa](./CHAT_MULTIAGENTE_README.md)
- [Resumen de Implementación](./IMPLEMENTACION_CHAT_RESUMEN.md)
- [Evolution API Docs](https://doc.evolution-api.com/)
- [Ant Design Components](https://ant.design/components/overview/)

## ✅ Checklist de Uso

Antes de usar el chat, asegúrate de:
- [ ] Tener al menos 1 instancia conectada
- [ ] Evolution API esté funcionando
- [ ] Variables de entorno configuradas
- [ ] Usuario autenticado en el sistema
- [ ] Navegador actualizado (Chrome, Firefox, Edge)

## 🎉 ¡Listo!

Ahora puedes usar el chat multiagente para gestionar todas tus conversaciones de WhatsApp desde una sola interfaz. ¡Disfruta! 💬

---

**Tip Pro**: Mantén varias pestañas abiertas con diferentes instancias para gestionar múltiples cuentas simultáneamente.
