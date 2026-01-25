# 🔧 Comandos CURL para Evolution API v2

## 📋 Configuración Previa

Antes de ejecutar los comandos, define estas variables:

```bash
# Configuración
export SERVER_URL="http://localhost:8080"
export API_KEY="tu_api_key_aqui"
export INSTANCE_NAME="tu_instancia_aqui"
export TEST_NUMBER="5511999999999"
```

---

## 1️⃣ Obtener Todas las Conversaciones

```bash
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.'
```

**Respuesta esperada:**
```json
[
  {
    "id": "5511999999999@s.whatsapp.net",
    "name": "Juan Pérez",
    "unreadCount": 2,
    "conversationTimestamp": 1706140800,
    "lastMessage": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "3EB0XXXXX"
      },
      "message": {
        "conversation": "Hola, ¿cómo estás?"
      },
      "messageTimestamp": 1706140800
    }
  }
]
```

---

## 2️⃣ Obtener Mensajes de un Chat Específico

```bash
curl -X POST "${SERVER_URL}/chat/findMessages/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "where": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net"
      }
    },
    "limit": 50
  }' \
  | jq '.'
```

**Respuesta esperada:**
```json
[
  {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0XXXXX"
    },
    "message": {
      "conversation": "Hola, ¿cómo estás?"
    },
    "messageTimestamp": 1706140800,
    "pushName": "Juan Pérez",
    "status": "READ"
  }
]
```

---

## 3️⃣ Enviar Mensaje de Texto

```bash
curl -X POST "${SERVER_URL}/message/sendText/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Hola, este es un mensaje de prueba"
  }' \
  | jq '.'
```

**Respuesta esperada:**
```json
{
  "key": {
    "remoteJid": "5511999999999@s.whatsapp.net",
    "fromMe": true,
    "id": "3EB0XXXXX"
  },
  "message": {
    "conversation": "Hola, este es un mensaje de prueba"
  },
  "messageTimestamp": 1706140800,
  "status": "PENDING"
}
```

---

## 4️⃣ Enviar Imagen (Base64)

```bash
# Imagen de prueba (1x1 pixel PNG)
IMAGE_BASE64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

curl -X POST "${SERVER_URL}/message/sendMedia/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"number\": \"5511999999999\",
    \"media\": \"${IMAGE_BASE64}\",
    \"mediatype\": \"image\",
    \"caption\": \"Imagen de prueba\"
  }" \
  | jq '.'
```

---

## 5️⃣ Enviar Imagen desde URL

```bash
curl -X POST "${SERVER_URL}/message/sendMedia/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "media": "https://picsum.photos/200/300",
    "mediatype": "image",
    "caption": "Imagen desde URL"
  }' \
  | jq '.'
```

---

## 6️⃣ Enviar Documento

```bash
curl -X POST "${SERVER_URL}/message/sendMedia/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "media": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "mediatype": "document",
    "fileName": "documento_prueba.pdf"
  }' \
  | jq '.'
```

---

## 7️⃣ Marcar Mensaje como Leído

```bash
curl -X POST "${SERVER_URL}/chat/markMessageAsRead/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "readMessages": [
      {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "id": "3EB0XXXXXXXXXXXXX",
        "fromMe": false
      }
    ]
  }' \
  | jq '.'
```

---

## 8️⃣ Obtener Foto de Perfil

```bash
curl -X POST "${SERVER_URL}/chat/fetchProfilePictureUrl/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999"
  }' \
  | jq '.'
```

**Respuesta esperada:**
```json
{
  "profilePictureUrl": "https://pps.whatsapp.net/v/t61.XXXXX"
}
```

---

## 9️⃣ Obtener Estado de Conexión de la Instancia

```bash
curl -X GET "${SERVER_URL}/instance/connectionState/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  | jq '.'
```

**Respuesta esperada:**
```json
{
  "instance": {
    "instanceName": "tu_instancia",
    "state": "open"
  }
}
```

---

## 🔟 Obtener Información de la Instancia

```bash
curl -X GET "${SERVER_URL}/instance/fetchInstances" \
  -H "apikey: ${API_KEY}" \
  | jq '.'
```

---

## 1️⃣1️⃣ Obtener QR Code de la Instancia

```bash
curl -X GET "${SERVER_URL}/instance/connect/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  | jq '.'
```

**Respuesta esperada:**
```json
{
  "code": "1@XXXXX...",
  "base64": "data:image/png;base64,iVBORw0KGgo..."
}
```

---

## 📊 Comandos de Debugging

### Ver Headers de la Respuesta

```bash
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

### Ver Solo el Status Code

```bash
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -o /dev/null \
  -w '%{http_code}\n' \
  -s
```

### Guardar Respuesta en Archivo

```bash
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -o response.json
```

---

## 🧪 Script de Prueba Rápida

Crea un archivo `test.sh`:

```bash
#!/bin/bash

# Configuración
SERVER_URL="http://localhost:8080"
API_KEY="tu_api_key"
INSTANCE_NAME="tu_instancia"

echo "🔍 Probando conexión..."
curl -X GET "${SERVER_URL}/instance/connectionState/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  | jq '.'

echo -e "\n📱 Obteniendo conversaciones..."
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '. | length'

echo -e "\n✅ Tests completados"
```

Ejecutar:
```bash
chmod +x test.sh
./test.sh
```

---

## 🐛 Solución de Problemas

### Error: "Cannot GET /chat/findChats/"

**Problema**: Usando GET en lugar de POST

**Solución**: Asegúrate de usar `-X POST` en todos los endpoints de chat

```bash
# ❌ Incorrecto
curl "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}"

# ✅ Correcto
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Error: "Unauthorized"

**Problema**: API Key incorrecta o faltante

**Solución**: Verifica que el header `apikey` esté presente y sea correcto

```bash
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: TU_API_KEY_CORRECTA" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Error: "Instance not found"

**Problema**: Nombre de instancia incorrecto o instancia no existe

**Solución**: Verifica el nombre de la instancia

```bash
# Listar todas las instancias
curl -X GET "${SERVER_URL}/instance/fetchInstances" \
  -H "apikey: ${API_KEY}" \
  | jq '.[] | .instance.instanceName'
```

### Error: "Invalid JSON"

**Problema**: Body mal formado

**Solución**: Asegúrate de que el JSON esté bien formado

```bash
# Usa comillas simples para el -d y escapa las comillas internas
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📝 Notas Importantes

### Formato de Números

- **Para enviar**: `5511999999999` (sin @s.whatsapp.net)
- **En respuestas**: `5511999999999@s.whatsapp.net` (con sufijo)

### Body Requerido

Todos los endpoints POST requieren un body, aunque sea vacío:

```bash
# ✅ Correcto
-d '{}'

# ❌ Incorrecto (puede fallar)
# Sin -d
```

### Headers Requeridos

```bash
-H "apikey: ${API_KEY}"           # Siempre requerido
-H "Content-Type: application/json"  # Para POST/PUT
```

### Timeout

Para peticiones que pueden tardar:

```bash
curl --max-time 30 -X POST ...
```

---

## 🔗 Recursos

- [Evolution API Docs](https://doc.evolution-api.com/)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [curl Manual](https://curl.se/docs/manual.html)

---

## 💡 Tips

### Usar jq para filtrar

```bash
# Solo nombres de chats
curl ... | jq '.[].name'

# Solo IDs
curl ... | jq '.[].id'

# Contar conversaciones
curl ... | jq '. | length'
```

### Usar variables de entorno

```bash
# Crear archivo .env
cat > .env << EOF
SERVER_URL=http://localhost:8080
API_KEY=tu_api_key
INSTANCE_NAME=tu_instancia
EOF

# Cargar variables
source .env

# Usar en curl
curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" ...
```

### Crear alias

```bash
# Agregar a ~/.bashrc o ~/.zshrc
alias evo-chats='curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" -H "apikey: ${API_KEY}" -H "Content-Type: application/json" -d "{}" | jq "."'

# Usar
evo-chats
```

---

**Fecha**: 24 de Enero, 2026  
**Evolution API**: v2  
**Método principal**: POST para gestión de chats
