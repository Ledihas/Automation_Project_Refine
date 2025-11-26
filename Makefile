.PHONY: help build rebuild logs down restart

help:
	@echo "📦 Automation Project - Docker Commands"
	@echo ""
	@echo "make rebuild     - Reconstruir frontend sin caché"
	@echo "make build       - Reconstruir frontend (con caché)"
	@echo "make logs        - Ver logs en tiempo real"
	@echo "make down        - Detener todos los servicios"
	@echo "make restart     - Reiniciar frontend"
	@echo "make up          - Levantar todos los servicios"
	@echo "make clean       - Limpiar completamente"

rebuild:
	docker-compose up --build --no-cache frontend

build:
	docker-compose build frontend

logs:
	docker-compose logs -f frontend

down:
	docker-compose down

restart:
	docker-compose restart frontend

up:
	docker-compose up -d

clean:
	docker-compose down
	docker image rm automation_frontend 2>/dev/null || true
	docker system prune -f --volumes

.DEFAULT_GOAL := help
