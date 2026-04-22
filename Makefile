.PHONY: help build up down logs backend-shell frontend-shell test lint

help:
	@echo "Comandos disponibles:"
	@echo "  make build        - Construye las imágenes Docker"
	@echo "  make up           - Levanta todos los servicios (docker-compose)"
	@echo "  make down         - Detiene y elimina contenedores"
	@echo "  make logs         - Muestra logs de todos los servicios"
	@echo "  make backend-shell- Abre shell en contenedor backend"
	@echo "  make frontend-shell- Abre shell en contenedor frontend"
	@echo "  make test         - Ejecuta tests del backend"
	@echo "  make lint         - Ejecuta Ruff en backend"

build:
	docker-compose build

up:
	docker-compose up

down:
	docker-compose down

logs:
	docker-compose logs -f

backend-shell:
	docker-compose exec backend bash

frontend-shell:
	docker-compose exec frontend sh

test:
	docker-compose exec backend python manage.py test

lint:
	docker-compose exec backend ruff check .