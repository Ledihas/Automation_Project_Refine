# 🔗 Chatwoot Obligatorio - Guía de Uso

## 📋 Resumen de Cambios

A partir de ahora, **Chatwoot es OBLIGATORIO** para crear cualquier instancia de WhatsApp. Esto significa:

✅ **Todo está integrado automáticamente**
- No hay opción de "saltar" o "configurar después"
- Los campos de Chatwoot son requeridos (`*`)
- Validación a cada paso

---

## 🚀 Flujo de Creación de Instancia

### Paso 1: Nombre de Instancia
```
✓ Ingresa un nombre descriptivo (Ej: Tienda_Central)
✓ Se agregará un código único automáticamente
✓ Validar que no tenga errores
```

### Paso 2: Configuración de Chatwoot (OBLIGATORIO)
```
✓ URL de Chatwoot*             (requerido)
✓ Account ID*                  (requerido)  
✓ Token de API*                (requerido)
✓ Nombre del Inbox             (opcional)
✓ Organización                 (opcional)
✓ URL del Logo                 (opcional)
✓ Opciones avanzadas           (expandible)

NOTA: El botón "Siguiente" estará DESHABILITADO hasta completar 
      URL, Account ID y Token
```

### Paso 3: Revisión Final
```
✓ Aceptar que Chatwoot está configurado
✓ Revisar información de la instancia
✓ Click en "Crear Instancia"
```

---

## 🔑 Obtener Credenciales de Chatwoot

### 1. **URL de Chatwoot**
```
URL completa de tu instalación Chatwoot
Ej: https://whapii.agentedecargaonline.com
    ⚠️ SIN trailing slash (/)
```

### 2. **Account ID**
En Chatwoot:
```
Ir a: Settings → Accounts
Copiar el ID (generalmente "1")
```

### 3. **API Token**
En Chatwoot:
```
1. Ir a: Profile → API Tokens
2. Click en "Create New Token"
3. Copiar el token (se muestra una sola vez)
4. Guardar en variable de entorno: CHATWOOT_API_TOKEN
```

---

## ⚙️ Variables de Entorno

Configurar en `.env`:

```env
# URL base de Chatwoot (opcional si está en la URL por defecto)
VITE_CHATWOOT_URL=https://whapii.agentedecargaonline.com

# Token de API de Chatwoot (si está pre-configurado)
CHATWOOT_API_TOKEN=tu_token_aqui

# Account ID de Chatwoot
CHATWOOT_ACCOUNT_ID=1
```

---

## 📊 Qué Pasa al Crear la Instancia

### Con Chatwoot Obligatorio:

```
1. Usuario completa datos de Chatwoot ✅
   ↓
2. EvolutionAPI recibe request con parámetros Chatwoot
   ↓
3. EvolutionAPI comunica con Chatwoot
   ↓
4. Chatwoot crea automáticamente:
   - 📥 Inbox (bandeja)
   - 👥 Importa contactos
   - 💬 Importa mensajes históricos (hasta 60 días)
   - 🔄 Conexión bidireccional
   ↓
5. Usuario ve QR para conectar WhatsApp
   ↓
6. Al escanear QR:
   - Instancia se conecta a WhatsApp ✅
   - Chatwoot recibe mensajes en tiempo real ✅
   - Contactos se sincronizan ✅
```

---

## ✅ Validaciones Implementadas

### En el Paso 2 (Chatwoot):

```typescript
// Antes de avanzar al Paso 3:
✓ URL es requerida
✓ Account ID no puede estar vacío
✓ Token de API no puede estar vacío

// En el Paso 3 (Crear):
✓ Si falta algún parámetro → Error bloqueante
✓ No se puede crear sin Chatwoot
```

### Visual en UI:

```
⚠️ Campos requeridos mostrarán:
   - Asterisco rojo (*) en la etiqueta
   - Validación en tiempo real
   - Botón "Siguiente" deshabilitado si no están completos

✅ Cuando está configurado:
   - Tarjeta verde indicando "Chatwoot Configurado"
   - Resumen de datos en la revisión
   - Botón "Siguiente" habilitado
```

---

## 🔄 Opciones Avanzadas de Chatwoot

Se pueden expandir en el Paso 2:

### Mensajes y Conversaciones:
```
□ Firmar mensajes              → Agregar firma del agente
□ Reabrir conversaciones       → Reabrir al recibir mensaje  
□ Conversación pendiente       → Crear como pendiente
```

### Importación de Datos:
```
□ Importar contactos           → Traer contactos de WhatsApp
□ Importar mensajes            → Traer histórico
□ Días límite importación      → Hasta 60 días
□ Unificar contactos Brasil    → Formato especial BR
```

---

## 🚨 Errores Comunes

### Error: "Chatwoot incompleto"
```
Causa: Falta URL, Account ID o Token

Solución:
1. Verificar que está registrado en .env o formulario
2. Obtener token correcto de Chatwoot
3. Asegurar Account ID es correcto (ej: "1")
4. URL sin trailing slash
```

### Error: "Chatwoot account not found"
```
Causa: Account ID incorrecto

Solución:
1. En Chatwoot: Settings → Accounts
2. Copiar ID correcto
3. Reintentar con ID verificado
```

### Error: "Invalid API token"
```
Causa: Token expirado o incorrecto

Solución:
1. En Chatwoot: Profile → API Tokens
2. Crear nuevo token
3. Copiar y guardar en .env
4. Reintentar creación
```

---

## 💾 Datos Almacenados en Appwrite

Después de crear la instancia, se guarda:

```json
{
  "instance_name": "tienda-central-01a2b",
  "status": "pending",
  "user_id": "usuario123",
  "created_at": "2024-01-24T10:30:00Z",
  
  // Chatwoot (SIEMPRE presente)
  "chatwoot_url": "https://whapii.agentedecargaonline.com",
  "chatwoot_account_id": "1",
  "chatwoot_token": "[PROTEGIDO]",
  "chatwoot_sign_msg": true,
  "chatwoot_reopen_conversation": true,
  "chatwoot_import_contacts": true,
  "chatwoot_import_messages": true,
  "chatwoot_days_limit_import": 60,
  "chatwoot_organization": "Bot ACO",
  "chatwoot_name_inbox": "WhatsApp tienda-central"
}
```

---

## 🎯 Flujo Completo (Ejemplo Real)

### Usuario: María quiere crear "Soporte Técnico"

```
PASO 1:
┌──────────────────────────────────────────┐
│ Nombre de Instancia                       │
│ ┌─────────────────────────────────────┐  │
│ │ Soporte_Tecnico                     │  │
│ └─────────────────────────────────────┘  │
│ Vista previa: Soporte_Tecnico_a1b2c      │
│                                          │
│ [Anterior] [Siguiente →]                 │
└──────────────────────────────────────────┘

PASO 2:
┌──────────────────────────────────────────┐
│ ⚠️ Chatwoot es obligatorio               │
│                                          │
│ URL de Chatwoot*                         │
│ ┌─────────────────────────────────────┐  │
│ │ whapii.agentedecargaonline.com      │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ Account ID*          │ Token de API*     │
│ ┌──────────────────┐ │ ┌──────────────┐ │
│ │ 1                │ │ │ cwt_xyz123   │ │
│ └──────────────────┘ │ └──────────────┘ │
│                                          │
│ Nombre del Inbox                         │
│ ┌─────────────────────────────────────┐  │
│ │ WhatsApp Soporte                    │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ ✅ Chatwoot Configurado                 │
│    URL: whapii.agentedecargaonline.com │
│    Account ID: 1                        │
│    Inbox: WhatsApp Soporte              │
│                                          │
│ [Anterior] [Siguiente →]                 │
└──────────────────────────────────────────┘

PASO 3:
┌──────────────────────────────────────────┐
│ Todo listo para crear                    │
│                                          │
│ Instancia: Soporte_Tecnico_a1b2c         │
│                                          │
│ ✅ Chatwoot Configurado                 │
│    URL: whapii.agentedecargaonline.com │
│    Account ID: 1                        │
│    Inbox: WhatsApp Soporte              │
│    Organización: Bot ACO                │
│                                          │
│ 🎉 Al crear, serás redirigido para     │
│    escanear el código QR                │
│                                          │
│ [Anterior] [Cancelar] [Crear Instancia] │
└──────────────────────────────────────────┘

RESULTADO:
✅ Instancia creada: Soporte_Tecnico_a1b2c
✅ Chatwoot conectado automáticamente
✅ Usuario ve QR para escanear
✅ Al escanear: contactos + mensajes importados
```

---

## 📚 Documentación Relacionada

- [Chatwoot Integration Guide](./INTEGRACION_CHATWOOT.md)
- [Evolution API Endpoints](./ENDPOINTS_IMPLEMENTATION.md)
- [Troubleshooting](./CORRECCION_ERRORES_CHAT.md)

---

## 📝 Notas Importantes

```
⚠️ Chatwoot es OBLIGATORIO desde ahora

✅ Beneficios:
   - Integración automática completa
   - No hay configuración manual después
   - Datos sincronizados en tiempo real
   - Equipo centralizado en una plataforma

⏱️ Tiempo de setup: ~1 minuto por instancia

🔄 Sincronización automática:
   - Mensajes: Real-time
   - Contactos: Al crear instancia + continuo
   - Histórico: Hasta 60 días
```

---

**Versión**: 1.0  
**Fecha**: 24 de Enero, 2026  
**Estado**: ✅ Completamente implementado
