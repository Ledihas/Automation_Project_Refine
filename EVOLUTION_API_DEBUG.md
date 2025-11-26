# 🔧 Diagnóstico: "You need to enable JavaScript" Error

## ¿Por qué ves este error?

Evolution API está devolviendo una página HTML en lugar de JSON. Esto sucede cuando:

1. **CORS bloqueado** - El navegador no puede acceder a Evolution API
2. **API devuelve error HTML** - Evolution API no reconoce la solicitud
3. **Credenciales incorrectas** - apikey no es válido
4. **URL incorrecta** - VITE_SERVER_URL apunta al lugar equivocado

## 🔍 Cómo diagnosticar

### En el navegador (DevTools - Console):

```javascript
// Verificar variables de entorno
console.log({
  VITE_APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
  VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
  VITE_API_KEY: import.meta.env.VITE_API_KEY ? '***' : 'MISSING',
  hostname: location.hostname,
  isDev: location.hostname === 'localhost'
});

// Ver la URL real que se está usando
fetch('/instance/create', {
  method: 'POST',
  headers: {
    'apikey': 'tu-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ instanceName: 'test' })
}).then(r => r.text()).then(console.log)
```

### En la terminal (ver logs del contenedor):

```bash
# Ver logs de Evolution API
docker logs evolution-api

# Ver logs de Nginx
docker logs nginx

# Ver logs del frontend
docker logs automation_frontend
```

## ✅ Soluciones

### 1. **Verificar que VITE_SERVER_URL es correcto**

En tu `docker-compose.yml`:
```yaml
VITE_SERVER_URL: http://whatsapp.agentedecargaonline.com
```

Pero si estás en desarrollo local, debería ser:
```yaml
VITE_SERVER_URL: http://evolution-api:3000  # Si está en contenedor
# o
VITE_SERVER_URL: http://localhost:8080      # Si está en host
```

### 2. **Verificar que VITE_API_KEY es correcto**

Asegúrate que coincide con el configurado en Evolution API:
```bash
docker exec evolution-api env | grep -i api
```

### 3. **Probar Evolution API directamente**

```bash
# Desde tu máquina local
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"test_XXXX"}'

# Desde dentro del contenedor
docker exec automation_frontend curl -X POST http://evolution-api:3000/instance/create \
  -H "apikey: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"test_XXXX"}'
```

### 4. **Si Evolution API está detrás de Nginx**

Asegúrate que Nginx tenga configurado CORS:

```nginx
location /instance {
    proxy_pass http://evolution-api:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'apikey, Content-Type' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

## 🧪 Test rápido

En DevTools Console, reemplaza los valores:

```javascript
const API_URL = 'http://whatsapp.agentedecargaonline.com/instance/create';
const API_KEY = 'tu-api-key';

fetch(API_URL, {
  method: 'POST',
  headers: {
    'apikey': API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    instanceName: 'test_1234',
    integration: 'WHATSAPP-BAILEYS',
    qrcode: false
  })
})
.then(r => r.text())
.then(text => {
  console.log('Response:', text);
  try { console.log(JSON.parse(text)); } catch(e) {}
})
.catch(err => console.error('Error:', err));
```

Si ves HTML en la respuesta, hay un problema con la configuración de Evolution API o Nginx.
