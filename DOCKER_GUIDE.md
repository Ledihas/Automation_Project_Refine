# 🐳 Guía de Desarrollo con Docker Compose

## Reconstruir la imagen frontend después de cambios

### Después de hacer cambios en el código:

```bash
# Opción 1: Reconstruir sin caché (RECOMENDADO para cambios significativos)
docker-compose up --build --no-cache frontend

# Opción 2: Solo reconstruir (más rápido si no hay muchos cambios)
docker-compose up --build frontend

# Opción 3: Reconstruir y reiniciar en background
docker-compose up -d --build frontend
```

## Solucionar problemas de caché

Si los cambios aún no se reflejan después de reconstruir:

```bash
# Limpiar completamente el contenedor y imagen
docker-compose down
docker image rm automation_frontend
docker-compose up --build frontend

# O usar prune para limpiar todo lo no utilizado
docker system prune -a --volumes
docker-compose up --build frontend
```

## Ver logs en tiempo real

```bash
docker-compose logs -f frontend
```

## Reconstruir solo el frontend (sin levantar otros servicios)

```bash
docker-compose build --no-cache frontend
```

## Verificar que los cambios están en la imagen

```bash
# Ver historial de build
docker history automation_frontend

# Inspeccionar la imagen
docker inspect automation_frontend

# Ejecutar shell en el contenedor
docker exec -it automation_frontend sh
```

## Variables de entorno importantes

En el `docker-compose.yml`, asegúrate que tengamos:

- `VITE_APPWRITE_ENDPOINT` - URL del servidor Appwrite
- `VITE_APPWRITE_PROJECT_ID` - ID del proyecto Appwrite  
- `VITE_APPWRITE_DATABASE_ID` - ID de la base de datos
- `VITE_SERVER_URL` - URL del servidor Evolution API
- `VITE_API_KEY` - API key para Evolution API

Estas se compilan en tiempo de build (en el Dockerfile), así que cambiarlas en `.env` no afecta sin reconstruir.

## Verificar que se compiló correctamente

```bash
# Entrar al contenedor
docker exec -it automation_frontend sh

# Verificar que los cambios están en /app/dist
ls -la /app/dist
cat /app/dist/index.html | grep "vite"
```

## 📝 Importante

- Los cambios en código **requieren reconstruir** (no es hot-reload como en dev)
- Las **variables de entorno se compilan en BUILD TIME**, no en runtime
- Si cambias `.env`, debes reconstruir con `--no-cache`
- El healthcheck verifica que el servidor esté activo en http://localhost:3000
