# 🐳 Docker Setup Guide

This project is fully dockerized for easy development and deployment.

## Quick Start

### Option 1: Using Make (Recommended)

```bash
# Start all services
make up

# View logs
make logs

# Stop services
make down
```

### Option 2: Using Docker Compose directly

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Services

The docker-compose setup includes 3 services:

1. **PostgreSQL Database** (`db`)
   - Port: 5432
   - User: callme
   - Password: reminder123
   - Database: call_me_reminder

2. **FastAPI Backend** (`backend`)
   - Port: 8000
   - Docs: http://localhost:8000/docs
   - Auto-reload enabled for development

3. **Next.js Frontend** (`frontend`)
   - Port: 3000
   - Hot-reload enabled for development

## 🚀 Common Commands

### Starting Services

```bash
# Start all services (detached)
make up
# or
docker-compose up -d

# Start with logs visible
make dev
# or
docker-compose up
```

### Viewing Logs

```bash
# All services
make logs

# Specific service
make logs-backend
make logs-frontend
make logs-db

# Or with docker-compose
docker-compose logs -f backend
```

### Stopping Services

```bash
# Stop services (keeps data)
make down
# or
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

### Rebuilding

```bash
# Rebuild all containers
make rebuild

# Or step by step
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Development Workflow

1. **Start services:**
   ```bash
   make up
   ```

2. **Check they're running:**
   ```bash
   make ps
   ```

3. **View logs if needed:**
   ```bash
   make logs
   ```

4. **Make code changes** - they'll auto-reload!

5. **Access services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

6. **Stop when done:**
   ```bash
   make down
   ```

## 🐚 Shell Access

### Backend Shell
```bash
make shell-backend
# or
docker-compose exec backend /bin/sh
```

### Frontend Shell
```bash
make shell-frontend
# or
docker-compose exec frontend /bin/sh
```

### Database Shell
```bash
make shell-db
# or
docker-compose exec db psql -U callme -d call_me_reminder
```

## 🧪 Running Tests

```bash
# Backend tests
make test-backend
# or
docker-compose exec backend pytest

# Frontend tests
make test-frontend
# or
docker-compose exec frontend npm test
```

## 🗄️ Database Management

### Connect to PostgreSQL
```bash
docker-compose exec db psql -U callme -d call_me_reminder
```

### Run SQL commands
```bash
# Inside the database shell
\dt              # List tables
\d reminders     # Describe reminders table
SELECT * FROM reminders;
```

### Reset Database
```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d db
```

## 🔍 Troubleshooting

### Services won't start

1. **Check if ports are available:**
   ```bash
   lsof -i :3000  # Frontend
   lsof -i :8000  # Backend
   lsof -i :5432  # Database
   ```

2. **Check logs:**
   ```bash
   make logs
   ```

3. **Rebuild containers:**
   ```bash
   make rebuild
   ```

### Database connection issues

1. **Wait for database to be healthy:**
   ```bash
   docker-compose ps
   # Look for "healthy" status on db service
   ```

2. **Check database logs:**
   ```bash
   make logs-db
   ```

### Frontend/Backend not updating

1. **Check if volumes are mounted:**
   ```bash
   docker-compose ps
   ```

2. **Restart specific service:**
   ```bash
   docker-compose restart backend
   # or
   docker-compose restart frontend
   ```

## 📝 Environment Variables

Environment variables are managed through:

1. **Backend:** `backend/.env`
2. **Frontend:** Defined in `docker-compose.yml`
3. **Database:** Defined in `docker-compose.yml`

To change environment variables:
1. Edit `backend/.env` or `docker-compose.yml`
2. Restart services: `make restart`

## 🧹 Cleanup

### Remove everything (including data)
```bash
make clean
# or
docker-compose down -v --rmi all
```

### Remove only containers (keep images and data)
```bash
make down
```

## 📊 Health Checks

All services have health checks configured:

- **Database:** Checks PostgreSQL is ready
- **Backend:** Checks `/health` endpoint
- **Frontend:** Checks if Next.js is responding

View health status:
```bash
docker-compose ps
```

## 🎯 Best Practices

1. **Always use `make up` or `docker-compose up -d`** for starting services
2. **Use `make logs`** to monitor what's happening
3. **Use `make down`** when done to free resources
4. **Use `make rebuild`** if something seems broken
5. **Never commit `.env` files** - they're gitignored

## 🆘 Quick Reference

```bash
make help          # Show all available commands
make up            # Start all services
make down          # Stop all services
make logs          # View logs
make restart       # Restart services
make rebuild       # Rebuild everything
make clean         # Remove everything
make shell-backend # Open backend shell
make ps            # Show running containers
```

## 🔗 URLs

Once services are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

---

**For more information, see the main README.md**
