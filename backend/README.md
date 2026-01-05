# Call Me Reminder - Backend API

FastAPI backend for automated phone call reminders.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL 15+ (via Docker)
- Virtual environment

### Setup

1. **Create and activate virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Start PostgreSQL database:**
```bash
# From project root
docker-compose up -d db
```

5. **Run the server:**
```bash
uvicorn app.main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── core/
│   │   └── config.py        # Settings and configuration
│   ├── db/
│   │   └── database.py      # Database connection
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API endpoints
│   └── services/            # Business logic
├── tests/                   # Test files
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## 🔧 Environment Variables

See `.env.example` for required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `VAPI_API_KEY`: Vapi API key for phone calls
- `TWILIO_*`: Twilio credentials (if needed)

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## 📝 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🐳 Docker

The PostgreSQL database runs in Docker. To manage it:

```bash
# Start database
docker-compose up -d db

# Stop database
docker-compose stop db

# View logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d db
```

## 📋 Next Steps

1. ✅ Backend setup complete
2. Create database models (Phase 2)
3. Implement API endpoints (Phase 3)
4. Setup scheduler service (Phase 4)
5. Integrate Vapi (Phase 5)
