# HandMark - AI-Powered Grading for K-12 Teachers

**Status:** Phase 1B - Design & Architecture Complete  
**Next Step:** Implementation begins Week 3 (see Phase1-Implementation-Plan.md)

---

## Project Structure

```
app/
├── frontend/          # Next.js 14 web app
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── dashboard/ # Dashboard layouts
│   │   │   ├── assignments/ # Assignment creation
│   │   │   └── grading/   # Grading review screens
│   │   ├── lib/           # Utilities
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand state stores
│   │   └── types/         # TypeScript types
│   └── public/        # Static assets
│
├── backend/           # FastAPI Python API
│   └── app/
│       ├── api/           # API route handlers
│       ├── core/          # Config, auth, middleware
│       ├── models/        # SQLAlchemy models
│       ├── services/      # Business logic
│       │   └── grading.py # AI grading service
│       └── tasks/         # Celery background tasks
│
└── database/          # Database schema & migrations
    └── schema.sql     # Initial Supabase schema
```

---

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- Python 3.11+
- PostgreSQL 15+ (or Supabase account)
- Redis (for background tasks)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev  # Starts on http://localhost:3000
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload  # Starts on http://localhost:8000
```

### Database Setup
```bash
# Option 1: Supabase (Recommended)
# 1. Create project at supabase.com
# 2. Copy SQL from database/schema.sql
# 3. Run in Supabase SQL Editor

# Option 2: Local Postgres
psql -U postgres
CREATE DATABASE handmark;
\c handmark
\i database/schema.sql
```

---

## Design Documentation

All design deliverables are in `/design/`:

- **UX-Research-Report.md** - Competitive analysis & best practices
- **User-Flows.md** - Detailed user journey maps
- **Component-Specs.md** - UI component specifications
- **Technical-Architecture.md** - System design & API specs
- **Design-System.md** - Visual design guidelines
- **DESIGN-SUMMARY.md** - Executive summary

---

## Development Workflow

### Frontend Development
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Lint & type-check
npm run type-check # TypeScript validation
```

### Backend Development
```bash
uvicorn app.main:app --reload  # Dev server with hot reload
pytest                         # Run tests
alembic upgrade head           # Run migrations
```

### Key Commands
```bash
# Start all services (Docker Compose - coming soon)
docker-compose up

# Run tests
cd frontend && npm test
cd backend && pytest

# Database migrations
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + React Query
- **Auth:** Supabase Auth
- **Real-time:** Socket.io

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.11
- **Database:** PostgreSQL (Supabase)
- **ORM:** SQLAlchemy 2.0
- **Queue:** Celery + Redis
- **AI:** Anthropic Claude Sonnet 4.5

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway (backend)
- **Database:** Supabase
- **Storage:** Supabase Storage (S3)
- **Monitoring:** Sentry + LogRocket

---

## Key Features (MVP)

✅ **Teacher Onboarding**
- Google OAuth sign-in
- 5-minute interactive tutorial
- Sample assignment demo

✅ **Class Management**
- Create/edit classes
- Import roster (CSV, Google Classroom)
- Manage students

✅ **Assignment Creation**
- Rubric-based or answer key grading
- Pre-built rubric templates
- Drag-drop rubric builder

✅ **AI Grading**
- Upload handwritten student work
- Real-time AI grading (<30 sec per submission)
- Transparent AI reasoning

✅ **Grade Review**
- Side-by-side: student work + grades
- Edit/override AI grades
- Add personal feedback

✅ **Export & Reports**
- CSV gradebook export
- Google Classroom sync
- PDF feedback slips (print-ready)
- Class analytics dashboard

---

## API Documentation

**Docs:** http://localhost:8000/docs (when backend is running)

Key endpoints:
- `POST /v1/auth/google` - Google OAuth
- `GET /v1/classes` - List classes
- `POST /v1/assignments` - Create assignment
- `POST /v1/submissions/upload` - Upload student work
- `POST /v1/assignments/:id/grade-all` - Trigger batch grading
- `GET /v1/grades/:id` - Get grade details

WebSocket: `ws://localhost:8000`
- Real-time grading progress updates

---

## Contributing

### Branch Strategy
- `main` - Production (protected)
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes

### Commit Messages
```
feat: Add rubric builder component
fix: Fix upload progress bar
docs: Update API documentation
test: Add grading service tests
```

---

## Testing

### Frontend Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Backend Tests
```bash
pytest                   # Run all tests
pytest tests/test_grading.py  # Specific file
pytest -v               # Verbose
pytest --cov            # Coverage
```

---

## Deployment

### Staging
- **Frontend:** Auto-deploy from `develop` → Vercel
- **Backend:** Auto-deploy from `develop` → Railway
- **Database:** Supabase (staging instance)

### Production
- **Frontend:** Manual deploy from `main` → Vercel
- **Backend:** Manual deploy from `main` → Railway
- **Database:** Supabase (production instance)

---

## Environment Variables

See `.env.example` files in `frontend/` and `backend/` for required environment variables.

**Critical:**
- `ANTHROPIC_API_KEY` - Claude API key
- `SUPABASE_URL` & `SUPABASE_KEY` - Database credentials
- `SECRET_KEY` - JWT signing key (generate secure random string)

---

## Support & Contact

- **Developer:** Mark Silverstein
- **Email:** mark@antarescatamarans.com
- **Documentation:** `/design/` folder
- **Issues:** Track in project management tool

---

## License

Proprietary - All Rights Reserved
