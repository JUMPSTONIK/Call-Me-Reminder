# 📞 Call Me Reminder

A modern web application that sends automated phone call reminders using AI voice assistants powered by Vapi.

```bash
# Get started in 3 commands
cp backend/.env.example backend/.env  # Add your Vapi credentials
make setup                            # Setup everything
make dev                              # Start development
```

## 🌟 Features

- **Automated Phone Calls**: Schedule reminders that trigger real phone calls at specified times
- **AI Voice Assistant**: Natural-sounding voice messages powered by Vapi
- **Smart Scheduling**: Set reminders with timezone support and future date validation
- **Call Activity Tracking**: View detailed logs of all call attempts with status updates
- **Real-time Updates**: Dashboard automatically reflects reminder status changes
- **Responsive Design**: Beautiful UI that works seamlessly on mobile, tablet, and desktop
- **Dark Mode**: Full dark mode support with smooth theme transitions
- **Retry Logic**: Automatic retry mechanism for failed calls (up to 3 attempts)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Theme**: next-themes

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Scheduler**: APScheduler
- **Phone Calls**: Vapi API
- **Validation**: Pydantic
- **Migrations**: Alembic

## 📋 Prerequisites

- **Docker** and Docker Compose
- **Vapi Account** (for phone calls) - [Sign up here](https://dashboard.vapi.ai/)

## 🚀 Quick Start

### 1. Clone and Configure

```bash
git clone <repository-url>
cd Call-Me-Reminder-Front

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit backend/.env with your Vapi credentials
```

### 2. Run with Make

```bash
# Complete setup (first time only)
make setup

# Start development servers
make dev
```

**That's it!** The app will be running at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Other Commands

```bash
make logs    # View server logs
make stop    # Stop all services
make clean   # Clean everything
make help    # Show all commands
```

## 🔧 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/call_me_reminder

# Vapi Configuration
VAPI_API_KEY=your_vapi_private_key
VAPI_API_URL=https://api.vapi.ai
VAPI_ASSISTANT_ID=your_assistant_id  # Optional
VAPI_PHONE_NUMBER_ID=your_phone_number_id
VAPI_VOICE=11labs-rachel  # Voice for calls

# Webhook
WEBHOOK_BASE_URL=http://localhost:8000  # Change for production
WEBHOOK_SECRET=your_webhook_secret  # Optional

# API
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DEBUG=true
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📱 Setting Up Vapi

1. Create an account at [Vapi Dashboard](https://dashboard.vapi.ai/)
2. Get your **API Key** from Settings → API Keys
3. Get a **Phone Number ID** from Phone Numbers section
4. Configure **Webhook URL** (for production): `https://yourdomain.com/api/webhooks/vapi`

## 🐳 Docker Deployment

The project is containerized with Docker. Use the Makefile for easy management:

```bash
make setup    # Build and setup (first time)
make dev      # Start all services
make logs     # View logs
make stop     # Stop services
make clean    # Remove all containers and volumes
```

Services:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

Run tests with a single command:

```bash
make test          # Run all tests (backend + frontend)
make test-backend  # Run backend tests only
make test-frontend # Run frontend tests only
```

### Test Coverage

**Backend (Pytest):**
- ✅ Schema validation tests
- ✅ Input validation (phone numbers, dates, messages)
- ✅ Business logic validation

**Frontend (Vitest):**
- ✅ Form validation (Zod schemas)
- ✅ Phone number format validation
- ✅ Date/time validation
- ✅ Input constraints (min/max lengths)

## 📂 Project Structure

```
Call-Me-Reminder-Front/
├── frontend/                 # Next.js frontend
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Dashboard page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── reminders/      # Business components
│   │   └── layout/         # Layout components
│   ├── lib/
│   │   ├── api/            # React Query hooks
│   │   ├── validations/    # Zod schemas
│   │   └── types.ts        # TypeScript types
│   └── hooks/              # Custom hooks
│
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── db/             # Database config
│   │   └── core/           # Settings
│   ├── alembic/            # Database migrations
│   └── requirements.txt    # Python dependencies
│
└── docker-compose.yml      # Docker orchestration
```

## 🎨 Design System

### Colors
- **Primary**: Indigo 500 (`hsl(239, 84%, 67%)`)
- **Font**: Inter
- **Border Radius**: 0.75rem (12px)

### Status Colors
- **Scheduled**: Blue
- **Completed**: Green
- **Failed**: Red

## 🔄 Architecture Overview

### Data Flow

1. **User creates reminder** → Frontend validates → API creates record
2. **Scheduler picks up reminder** → Triggers at scheduled time
3. **Vapi service initiates call** → Makes phone call via Vapi API
4. **Webhook receives updates** → Updates call attempt status
5. **Frontend polls/updates** → Shows real-time status changes

### Key Components

- **Scheduler Service**: APScheduler manages reminder execution
- **Vapi Service**: Handles phone call API integration
- **Webhook Service**: Processes Vapi callback events
- **React Query**: Manages client-side caching and updates

## 🛡️ Validation Rules

- **Phone Number**: E.164 format required (`+15551234567`)
- **Title**: 3-100 characters
- **Message**: 10-500 characters
- **Lead Time**: Minimum 30 seconds in the future
- **Max Future**: Maximum 1 year ahead
- **Timezone**: Auto-detected from browser


## 🤝 Contributing

This project was created as a demonstration of full-stack development skills, showcasing:
- Modern React patterns with Next.js
- Type-safe API design with FastAPI
- Real-time scheduling with APScheduler
- External API integration (Vapi)
- Professional UI/UX design
- Responsive and accessible interfaces

## 📄 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- [Vapi](https://vapi.ai/) - AI voice call platform
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework

---

**Built with ❤️ using modern web technologies**
