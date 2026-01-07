# 📞 Call Me Reminder

A modern web application that sends automated phone call reminders using AI voice assistants powered by Vapi.

```bash
# Get started in 4 steps
cp backend/.env.local.example backend/.env.local  # 1. Copy config template
# 2. Edit backend/.env.local - Add your Vapi API credentials (see instructions below)
make setup                                        # 3. Build Docker containers and database
make dev                                          # 4. Start all services
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
# Clone the repository
git clone <repository-url>
cd Call-Me-Reminder-Front

# Copy environment template files
cp backend/.env.local.example backend/.env.local
cp frontend/.env.local.example frontend/.env.local
```

**⚠️ IMPORTANT: Add Your Vapi Credentials**

Open `backend/.env.local` and replace the placeholders with your actual credentials:

1. **Get Vapi API Key:**
   - Sign up at [Vapi Dashboard](https://dashboard.vapi.ai/)
   - Go to **Settings → API Keys**
   - Copy your **Private API Key** (starts with `sk_`)
   - Paste it in `VAPI_API_KEY=your_vapi_private_api_key_here`

2. **Get Phone Number ID:**
   - In Vapi Dashboard, go to **Phone Numbers**
   - Copy the **Phone Number ID** (or use Vapi's default if you don't have one)
   - Paste it in `VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here`

Your `backend/.env.local` should look like this (with your real values):
```bash
VAPI_API_KEY=sk_live_abc123xyz...     # Your actual Vapi private key
VAPI_PHONE_NUMBER_ID=pn_abc123...     # Your actual phone number ID
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**⚠️ SECURITY NOTES:**
- ⛔ **NEVER commit `.env.local` files to Git** (already in .gitignore)
- ⛔ **NEVER share your API keys publicly**
- ✅ Only modify your local `.env.local` files, NOT the `.env.local.example` templates

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

### Required Variables

**✅ Vapi API (Required)**
- This project uses **Vapi** for AI-powered phone calls
- Get your credentials at [Vapi Dashboard](https://dashboard.vapi.ai/)

**⛔ Twilio NOT Required**
- Previous versions used Twilio, but it has been **removed**
- Only Vapi credentials are needed

### Backend (.env.local)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/call_me_reminder

# Vapi Configuration (REQUIRED)
VAPI_API_KEY=your_vapi_private_key        # Get from Vapi Dashboard
VAPI_PHONE_NUMBER_ID=your_phone_number_id # Get from Vapi Dashboard
VAPI_API_URL=https://api.vapi.ai
VAPI_ASSISTANT_ID=your_assistant_id       # Optional
VAPI_VOICE=11labs-rachel                  # Voice for calls

# Webhook
WEBHOOK_BASE_URL=http://localhost:8000  # Change for production
WEBHOOK_SECRET=your_webhook_secret      # Optional

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

## 📞 Quick Test: Call Workflow

Want to test the complete call workflow quickly? Follow these steps:

### 1. Prerequisites
- ✅ All services running (`make dev`)
- ✅ Vapi credentials configured in `backend/.env.local`
- ✅ Valid phone number to receive the test call

### 2. Create a Test Reminder

**Option A: Using the UI (Recommended)**
1. Open http://localhost:3000
2. Fill in the form:
   - **Title**: "Test Reminder"
   - **Phone Number**: Your phone number in E.164 format (e.g., `+15551234567`)
   - **Message**: "This is a test call from Call Me Reminder"
   - **Date & Time**: Set to **2-3 minutes from now**
3. Click "Schedule Reminder"

**Option B: Using the API**
```bash
curl -X POST http://localhost:8000/api/reminders/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Reminder",
    "phone_number": "+15551234567",
    "message": "This is a test call",
    "scheduled_for": "2026-01-07T10:30:00",
    "timezone": "UTC"
  }'
```

### 3. Monitor the Reminder

**Watch the logs:**
```bash
make logs
```

You'll see:
1. **Reminder created** - Saved to database
2. **Scheduler picks it up** - Job scheduled in APScheduler
3. **Call initiated** - Vapi API call triggered at scheduled time
4. **Webhook updates** - Status updates from Vapi (ringing, answered, completed)

**Watch the dashboard:**
- The reminder card will show "Scheduled" (blue badge)
- At the scheduled time, status changes to "Completed" (green) or "Failed" (red)
- Click "View Details" to see call attempt logs

### 4. Expected Behavior

**Success Flow:**
1. ⏰ Reminder created with status `SCHEDULED`
2. ⏰ Scheduler triggers call at exact scheduled time
3. 📞 Vapi makes phone call to the number
4. 📱 Your phone rings
5. 🤖 AI assistant speaks the message
6. ✅ Status updates to `COMPLETED`

**If Call Fails:**
- Status changes to `FAILED`

### 5. Common Test Scenarios

**Test 1: Successful Call**
- Schedule reminder 2-3 minutes ahead
- Use a valid phone number
- Answer the call and listen to the message

**Test 2: Retry Logic**
- Schedule reminder 1 minute ahead
- Use an invalid phone number (e.g., `+15550000000`)
- Watch it fail and retry automatically

**Test 3: Multiple Reminders**
- Create 3 reminders with 1 minute intervals
- Verify scheduler handles multiple concurrent jobs

### 6. Troubleshooting Test Calls

**Call not received?**
- Check backend logs: `make logs`
- Verify Vapi credentials in `.env.local`
- Ensure phone number is in E.164 format (`+1` for US)
- Check Vapi dashboard for call logs: https://dashboard.vapi.ai/

**Status stuck on "Scheduled"?**
- Check if backend container is running: `docker-compose ps`
- Verify scheduler is running: check `/health` endpoint
- Look for errors in logs: `make logs`

**Call failed immediately?**
- Vapi free tier has limitations (no international calls)
- Phone number must be valid and reachable
- Check failure_reason in reminder details

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
│   │   ├── constants/      # Constant values
│   │   ├── utils/          # Utility functions
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

## 🔧 Troubleshooting

### CORS Error: "No 'Access-Control-Allow-Origin' header"

If you see this error when running the project:
```
Access to XMLHttpRequest at 'http://localhost:8000/api/reminders/' from origin
'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
1. Verify your `backend/.env.local` file exists and contains:
   ```bash
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

2. If you copied the project to a new machine, make sure you:
   - Ran `cp backend/.env.local.example backend/.env.local`
   - Did NOT modify the `.env.local.example` file
   - The `.env.local` file is in your local machine (not committed to git)

3. Restart the backend service:
   ```bash
   docker-compose restart backend
   ```

4. Check backend logs to verify CORS configuration:
   ```bash
   make logs
   # Look for: "CORS configured for origins: ['http://localhost:3000', 'http://127.0.0.1:3000']"
   ```

### Services Not Starting

If Docker services fail to start:
```bash
# Stop everything
make stop

# Clean and rebuild
make clean
make setup
make dev
```

### Database Connection Issues

If you see database connection errors:
```bash
# Check if PostgreSQL is running
docker-compose ps

# If db is unhealthy, restart it
docker-compose restart db
```

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
