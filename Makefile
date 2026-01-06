.PHONY: help setup dev stop logs clean install build migrate test test-backend test-frontend

help:
	@echo "📞 Call Me Reminder"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  make setup    - Complete setup (first time only)"
	@echo "  make dev      - Start development servers"
	@echo "  make stop     - Stop all services"
	@echo ""
	@echo "📦 Commands:"
	@echo "  make install  - Install dependencies (local dev)"
	@echo "  make build    - Build Docker containers"
	@echo "  make migrate  - Run database migrations"
	@echo "  make test     - Run all tests"
	@echo "  make logs     - View logs"
	@echo "  make clean    - Clean everything"

setup:
	@echo "🚀 Setting up Call Me Reminder..."
	docker-compose build
	docker-compose up -d db
	@sleep 3
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Run 'make dev' to start development"

dev:
	@docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo ""
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "Run 'make logs' to view output"
	@echo "Run 'make stop' to stop services"

stop:
	@docker-compose down
	@echo "✅ Services stopped"

logs:
	@docker-compose logs -f

clean:
	@docker-compose down -v
	@echo "✅ All containers and volumes removed"

install:
	@echo "📦 Installing dependencies..."
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ Dependencies installed"

build:
	@docker-compose build
	@echo "✅ Containers built"

migrate:
	@docker-compose exec backend alembic upgrade head
	@echo "✅ Migrations complete"

test:
	@echo "🧪 Running all tests..."
	@$(MAKE) test-backend
	@$(MAKE) test-frontend
	@echo "✅ All tests passed!"

test-backend:
	@echo "🐍 Running backend tests..."
	@docker-compose exec backend python -m pytest tests/ -v

test-frontend:
	@echo "⚛️  Running frontend tests..."
	@docker-compose exec frontend npm test
