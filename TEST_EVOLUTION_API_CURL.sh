#!/bin/bash

# ============================================================================
# Script de Testing para Evolution API v2
# Prueba todos los endpoints del chat multiagente
# ============================================================================

# ============================================================================
# CONFIGURACIÓN - EDITA ESTOS VALORES
# ============================================================================

# URL del servidor Evolution API
SERVER_URL="http://localhost:8080"

# Tu API Key de Evolution API
API_KEY="tu_api_key_aqui"

# Nombre de la instancia a probar
INSTANCE_NAME="tu_instancia_aqui"

# Número de WhatsApp para pruebas (formato: 5511999999999)
TEST_NUMBER="5511999999999"

# ============================================================================
# COLORES PARA OUTPUT
# ============================================================================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ============================================================================
# TESTS DE ENDPOINTS
# ============================================================================

# ----------------------------------------------------------------------------
# 1. OBTENER TODAS LAS CONVERSACIONES
# ----------------------------------------------------------------------------
test_find_chats() {
    print_header "1. OBTENER CONVERSACIONES (findChats)"
    
    print_info "Endpoint: POST ${SERVER_URL}/chat/findChats/${INSTANCE_NAME}"
    
    curl -X POST "${SERVER_URL}/chat/findChats/${INSTANCE_NAME}" \
        -H "apikey: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{}' \
        | jq '.' 2>/dev/null || echo "Respuesta recibida (instala jq para formato JSON)"
    
    echo -e "\n"
}

# ----------------------------------------------------------------------------
# 2. OBTENER MENSAJES DE UN CHAT
# ----------------------------------------------------------------------------
test_find_messages() {
    print_header "2. OBTENER MENSAJES (findMessages)"
    
    print_info "Endpoint: POST ${SERVER_URL}/chat/findMessages/${INSTANCE_NAME}"
    print_info "Nota: Necesitas un remoteJid válido (ej: 5511999999999@s.whatsapp.net)"
    
    # Solicitar remoteJid al usuario
    read -p "Ingresa el remoteJid del chat (o Enter para usar ejemplo): " REMOTE_JID
    REMOTE_JID=${REMOTE_JID:-"${TEST_NUMBER}@s.whatsapp.net"}
    
    curl -X POST "${SERVER_URL}/chat/findMessages/${INSTANCE_NAME}" \
        -H "apikey: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"where\": {
                \"key\": {
                    \"remoteJid\": \"${REMOTE_JID}\"
                }
            },
            \"limit\": 50
        }" \
        | jq '.' 2>/dev/null || echo "Respuesta recibida"
    
    echo -e "\n"
}

# ----------------------------------------------------------------------------
# 3. ENVIAR MENSAJE DE TEXTO
# ----------------------------------------------------------------------------
test_send_text() {
    print_header "3. ENVIAR MENSAJE DE TEXTO (sendText)"
    
    print_info "Endpoint: POST ${SERVER_URL}/message/sendText/${INSTANCE_NAME}"
    
    read -p "Ingresa el número destino (o Enter para usar ${TEST_NUMBER}): " DEST_NUMBER
    DEST_NUMBER=${DEST_NUMBER:-$TEST_NUMBER}
    
    read -p "Ingresa el mensaje a enviar: " MESSAGE
    MESSAGE=${MESSAGE:-"Hola, este es un mensaje de prueba desde curl"}
    
    curl -X POST "${SERVER_URL}/message/sendText/${INSTANCE_NAME}" \
        -H "apikey: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"${DEST_NUMBER}\",
            \"text\": \"${MESSAGE}\"
        }" \
        | jq '.' 2>/dev/null || echo "Respuesta recibida"
    
    echo -e "\n"
}

# ----------------------------------------------------------------------------
# 4. OBTENER FOTO DE PERFIL
# ----------------------------------------------------------------------------
test_profile_picture() {
    print_header "4. OBTENER FOTO DE PERFIL (fetchProfilePictureUrl)"
    
    print_info "Endpoint: POST ${SERVER_URL}/chat/fetchProfilePictureUrl/${INSTANCE_NAME}"
    
    read -p "Ingresa el número (o Enter para usar ${TEST_NUMBER}): " PROFILE_NUMBER
    PROFILE_NUMBER=${PROFILE_NUMBER:-$TEST_NUMBER}
    
    curl -X POST "${SERVER_URL}/chat/fetchProfilePictureUrl/${INSTANCE_NAME}" \
        -H "apikey: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"${PROFILE_NUMBER}\"
        }" \
        | jq '.' 2>/dev/null || echo "Respuesta recibida"
    
    echo -e "\n"
}

# ----------------------------------------------------------------------------
# 5. MARCAR MENSAJE COMO LEÍDO
# ----------------------------------------------------------------------------
test_mark_as_read() {
    print_header "5. MARCAR MENSAJE COMO LEÍDO (markMessageAsRead)"
    
    print_info "Endpoint: POST ${SERVER_URL}/chat/markMessageAsRead/${INSTANCE_NAME}"
    print_info "Nota: Necesitas un remoteJid y messageId válidos"
    
    read -p "Ingresa el remoteJid: " REMOTE_JID
    REMOTE_JID=${REMOTE_JID:-"${TEST_NUMBER}@s.whatsapp.net"}
    
    read -p "Ingresa el messageId: " MESSAGE_ID
    MESSAGE_ID=${MESSAGE_ID:-"3EB0XXXXXXXXXXXXX"}
    
    curl -X POST "${SERVER_URL}/chat/markMessageAsRead/${INSTANCE_NAME}" \
        -H "apikey: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"readMessages\": [
                {
                    \"remoteJid\": \"${REMOTE_JID}\",
                    \"id\": \"${MESSAGE_ID}\",
                    \"fromMe\": false
                }
            ]
        }" \
        | jq '.' 2>/dev/null || echo "Respuesta recibida"
    
    echo -e "\n"
}

# ----------------------------------------------------------------------------
# 6. OBTENER ESTADO DE CONEXIÓN DE LA INSTANCIA
# ----------------------------------------------------------------------------
test_connection_state() {
    print_header "6. ESTADO DE CONEXIÓN (connectionState)"
    
    print_info "Endpoint: GET ${SERVER_URL}/instance/connectionState/${INSTANCE_NAME}"
    
    curl -X GET "${SERVER_URL}/instance/connectionState/${INSTANCE_NAME}" \
        -H "apikey: ${API_KEY}" \
        | jq '.' 2>/dev/null || echo "Respuesta recibida"
    
    echo -e "\n"
}

# ----------------------------------------------------------------------------
# 7. ENVIAR IMAGEN (Base64)
# ----------------------------------------------------------------------------
test_send_image() {
    print_header "7. ENVIAR IMAGEN (sendMedia - image)"
    
    print_info "Endpoint: POST ${SERVER_URL}/message/sendMedia/${INSTANCE_NAME}"
    print_info "Nota: Necesitas una imagen en base64 o URL"
    
    read -p "Ingresa el número destino (o Enter para usar ${TEST_NUMBER}): " DEST_NUMBER
    DEST_NUMBER=${DEST_NUMBER:-$TEST_NUMBER}
    
    # Imagen de prueba pequeña (1x1 pixel PNG en base64)
    IMAGE_BASE64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    curl -X POST "${SERVER_URL}/message/sendMedia/${INSTANCE_NAME}" \
        -H "apikey: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"${DEST_NUMBER}\",
            \"media\": \"${IMAGE_BASE64}\",
            \"mediatype\": \"image\",
            \"caption\": \"Imagen de prueba desde curl\"
        }" \
        | jq '.' 2>/dev/null || echo "Respuesta recibida"
    
    echo -e "\n"
}

# ============================================================================
# MENÚ PRINCIPAL
# ============================================================================

show_menu() {
    clear
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         EVOLUTION API v2 - TESTING CON CURL               ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${YELLOW}Configuración actual:${NC}"
    echo "  Server: ${SERVER_URL}"
    echo "  Instance: ${INSTANCE_NAME}"
    echo "  API Key: ${API_KEY:0:10}..."
    echo ""
    echo "Selecciona una opción:"
    echo ""
    echo "  1) Obtener todas las conversaciones (findChats)"
    echo "  2) Obtener mensajes de un chat (findMessages)"
    echo "  3) Enviar mensaje de texto (sendText)"
    echo "  4) Obtener foto de perfil (fetchProfilePictureUrl)"
    echo "  5) Marcar mensaje como leído (markMessageAsRead)"
    echo "  6) Estado de conexión de instancia (connectionState)"
    echo "  7) Enviar imagen de prueba (sendMedia)"
    echo ""
    echo "  8) Ejecutar todos los tests"
    echo "  9) Cambiar configuración"
    echo "  0) Salir"
    echo ""
    read -p "Opción: " option
}

# ----------------------------------------------------------------------------
# Cambiar configuración
# ----------------------------------------------------------------------------
change_config() {
    print_header "CAMBIAR CONFIGURACIÓN"
    
    read -p "Server URL [${SERVER_URL}]: " new_server
    SERVER_URL=${new_server:-$SERVER_URL}
    
    read -p "API Key [${API_KEY}]: " new_key
    API_KEY=${new_key:-$API_KEY}
    
    read -p "Instance Name [${INSTANCE_NAME}]: " new_instance
    INSTANCE_NAME=${new_instance:-$INSTANCE_NAME}
    
    read -p "Test Number [${TEST_NUMBER}]: " new_number
    TEST_NUMBER=${new_number:-$TEST_NUMBER}
    
    print_success "Configuración actualizada"
    sleep 2
}

# ----------------------------------------------------------------------------
# Ejecutar todos los tests
# ----------------------------------------------------------------------------
run_all_tests() {
    print_header "EJECUTANDO TODOS LOS TESTS"
    
    test_connection_state
    read -p "Presiona Enter para continuar..."
    
    test_find_chats
    read -p "Presiona Enter para continuar..."
    
    test_profile_picture
    read -p "Presiona Enter para continuar..."
    
    print_info "Tests de escritura omitidos en modo automático"
    print_info "Ejecuta individualmente para enviar mensajes"
    
    read -p "Presiona Enter para volver al menú..."
}

# ============================================================================
# LOOP PRINCIPAL
# ============================================================================

main() {
    # Verificar si jq está instalado
    if ! command -v jq &> /dev/null; then
        print_info "Tip: Instala 'jq' para formatear JSON automáticamente"
        print_info "Ubuntu/Debian: sudo apt-get install jq"
        print_info "macOS: brew install jq"
        echo ""
    fi
    
    while true; do
        show_menu
        
        case $option in
            1) test_find_chats; read -p "Presiona Enter para continuar..." ;;
            2) test_find_messages; read -p "Presiona Enter para continuar..." ;;
            3) test_send_text; read -p "Presiona Enter para continuar..." ;;
            4) test_profile_picture; read -p "Presiona Enter para continuar..." ;;
            5) test_mark_as_read; read -p "Presiona Enter para continuar..." ;;
            6) test_connection_state; read -p "Presiona Enter para continuar..." ;;
            7) test_send_image; read -p "Presiona Enter para continuar..." ;;
            8) run_all_tests ;;
            9) change_config ;;
            0) print_success "¡Hasta luego!"; exit 0 ;;
            *) print_error "Opción inválida"; sleep 1 ;;
        esac
    done
}

# Ejecutar script
main
