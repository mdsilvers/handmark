# HandMark System Architecture

**Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** Design Phase Complete

---

## Executive Summary

HandMark is an AI-powered grading assistant for K-12 teachers, built with a modern, scalable architecture. The system uses Claude Sonnet 4.5 for handwriting recognition and grading, with real-time updates via WebSocket and background job processing for reliability.

**Key Architectural Decisions:**
- **Mobile-first design** - 80% of teachers grade on iPads
- **AI transparency** - Show reasoning, build trust
- **Real-time feedback** - WebSocket updates during grading
- **Queue-based processing** - Reliable, scalable background jobs
- **Row-level security** - Database-enforced data isolation

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Next.js Web    │  │ Mobile PWA     │  │ Browser Ext    │    │
│  │ (Desktop/Tab)  │  │ (iOS/Android)  │  │ (Future)       │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│           │                   │                   │             │
│           └───────────────────┴───────────────────┘             │
│                           │ HTTPS/WSS                           │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                        API GATEWAY                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Cloudflare / Vercel Edge (Rate Limiting, DDoS)        │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                     APPLICATION TIER                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │             FastAPI (Python 3.11)                      │     │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐     │     │
│  │  │   Auth   │  │   CRUD   │  │  AI Grading     │     │     │
│  │  │  Service │  │ Endpoints│  │    Engine       │     │     │
│  │  └──────────┘  └──────────┘  └─────────────────┘     │     │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐     │     │
│  │  │  Upload  │  │WebSocket │  │   Exports &     │     │     │
│  │  │  Handler │  │  Server  │  │   Reports       │     │     │
│  │  └──────────┘  └──────────┘  └─────────────────┘     │     │
│  └────────────────────────────────────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────┴────────┐ ┌───────┴────────┐ ┌──────┴──────────┐
│   DATA TIER     │ │   AI TIER      │ │  STORAGE TIER   │
│                 │ │                │ │                 │
│  ┌──────────┐   │ │  ┌──────────┐  │ │  ┌──────────┐  │
│  │Supabase  │   │ │  │ Claude   │  │ │  │Supabase  │  │
│  │PostgreSQL│   │ │  │ Sonnet   │  │ │  │ Storage  │  │
│  │          │   │ │  │  4.5     │  │ │  │ (S3)     │  │
│  └──────────┘   │ │  └──────────┘  │ │  └──────────┘  │
│                 │ │                │ │                 │
│  ┌──────────┐   │ │  ┌──────────┐  │ │  ┌──────────┐  │
│  │  Redis   │   │ │  │  Queue   │  │ │  │  CDN     │  │
│  │  Cache   │   │ │  │ (Celery) │  │ │  │(Vercel)  │  │
│  └──────────┘   │ │  └──────────┘  │ │  └──────────┘  │
└─────────────────┘ └────────────────┘ └─────────────────┘
```

---

## Technology Stack

### Frontend
| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Next.js | 14 (App Router) | SSR, RSC, optimal performance |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Styling** | Tailwind CSS | 3.4 | Rapid development, consistent |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable |
| **State Management** | Zustand | 4.x | Simple, lightweight |
| **Server State** | React Query | 5.x | Caching, sync, optimistic updates |
| **Forms** | React Hook Form | 7.x | Performance, validation |
| **Validation** | Zod | 3.x | Type-safe schemas |
| **Real-time** | Socket.io Client | 4.x | WebSocket with fallbacks |

### Backend
| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | FastAPI | 0.109+ | Fast, async, auto-docs |
| **Language** | Python | 3.11 | AI/ML ecosystem |
| **ORM** | SQLAlchemy | 2.0 | Type-safe, async |
| **Validation** | Pydantic | v2 | Request/response validation |
| **WebSocket** | FastAPI WS | Built-in | Native support |
| **Task Queue** | Celery | 5.x | Background jobs |
| **Queue Backend** | Redis | 7.x | Fast, reliable |
| **Testing** | pytest | Latest | Async support |

### Infrastructure
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend Host** | Vercel | Zero-config Next.js, global CDN |
| **Backend Host** | Railway / Fly.io | Easy Python deploy, auto-scale |
| **Database** | Supabase (PostgreSQL 15) | Managed, generous free tier, RLS |
| **File Storage** | Supabase Storage | Integrated, S3-compatible |
| **Cache** | Redis (Upstash) | Serverless Redis |
| **AI Provider** | Anthropic Claude | Best handwriting recognition |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | PostHog | Privacy-friendly |

---

## Data Flow Diagrams

### 1. Grading Flow (Critical Path)

```
┌────────────┐
│  Teacher   │
│  Uploads   │
│  Student   │
│   Work     │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│  Frontend    │
│  (Next.js)   │
│  • Compress  │
│  • Preview   │
└─────┬────────┘
      │ POST /submissions/upload
      ▼
┌──────────────┐
│  Backend     │
│  (FastAPI)   │
│  • Validate  │
│  • Upload S3 │
│  • Create DB │
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Queue Task  │
│  (Celery)    │
│  submission  │
│  _id → queue │
└─────┬────────┘
      │
      ▼
┌──────────────────────────┐
│  Celery Worker           │
│  1. Download image       │
│  2. Call Claude API      │
│  3. Parse response       │
│  4. Store grade in DB    │
│  5. Emit WebSocket event │
└─────┬────────────────────┘
      │
      ├─→ WebSocket → Frontend (real-time update)
      │
      ▼
┌──────────────┐
│  Database    │
│  (Postgres)  │
│  grades      │
│  table       │
└──────────────┘
```

### 2. Authentication Flow

```
┌────────────┐
│  Teacher   │
│  Clicks    │
│ "Sign In"  │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│  Google      │
│  OAuth 2.0   │
│  Consent     │
└─────┬────────┘
      │ Authorization code
      ▼
┌──────────────┐
│  Backend     │
│  /auth/google│
│  Exchange    │
│  code        │
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Supabase    │
│  Auth        │
│  Create/get  │
│  user        │
└─────┬────────┘
      │ JWT token
      ▼
┌──────────────┐
│  Frontend    │
│  Store token │
│  Redirect /  │
└──────────────┘
```

### 3. File Upload Flow

```
┌────────────┐
│  User      │
│  Selects   │
│  Files     │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│  Frontend    │
│  Validation  │
│  • Type      │
│  • Size      │
│  • Compress  │
└─────┬────────┘
      │ multipart/form-data
      ▼
┌──────────────┐
│  Backend     │
│  Process     │
│  • Generate  │
│    UUID      │
│  • Create    │
│    thumbnail │
└─────┬────────┘
      │
      ├─→ Supabase Storage (original)
      ├─→ Supabase Storage (thumbnail)
      │
      ▼
┌──────────────┐
│  Database    │
│  submissions │
│  (URLs)      │
└──────────────┘
```

---

## Component Relationships

### Frontend Components

```
App Layout (layout.tsx)
│
├── DashboardLayout
│   ├── Sidebar Navigation
│   ├── Header (profile, notifications)
│   └── Main Content Area
│
├── Pages
│   ├── Dashboard (/)
│   │   ├── AssignmentCard (multiple)
│   │   └── QuickStats
│   │
│   ├── Classes (/classes)
│   │   ├── ClassList
│   │   └── StudentRoster
│   │
│   ├── Assignments (/assignments)
│   │   ├── AssignmentList
│   │   ├── RubricBuilder
│   │   └── UploadZone
│   │
│   ├── Grading (/grading/:id)
│   │   ├── GradingReviewScreen
│   │   │   ├── StudentWorkPanel
│   │   │   └── RubricGradingPanel
│   │   └── GradingProgress
│   │
│   └── Reports (/reports)
│       └── ExportOptions
│
└── Shared Components
    ├── Button, Input, Select (shadcn/ui)
    ├── Modal, Sheet, Toast
    ├── ProgressBar
    ├── Badge, StatusIndicator
    └── EmptyState
```

### Backend Services

```
FastAPI App (main.py)
│
├── API Routes (/api)
│   ├── auth.py (OAuth, sessions)
│   ├── users.py (profile management)
│   ├── classes.py (CRUD)
│   ├── students.py (roster management)
│   ├── assignments.py (CRUD)
│   ├── rubrics.py (templates, custom)
│   ├── submissions.py (upload, status)
│   ├── grades.py (review, edit, approve)
│   └── exports.py (CSV, PDF, Google Classroom)
│
├── Services
│   ├── grading_service.py (Claude API integration)
│   ├── upload_service.py (file handling)
│   ├── export_service.py (report generation)
│   └── google_classroom_service.py (sync)
│
├── Models (SQLAlchemy)
│   ├── user.py
│   ├── class.py
│   ├── student.py
│   ├── assignment.py
│   ├── rubric.py
│   ├── submission.py
│   └── grade.py
│
├── Tasks (Celery)
│   ├── grade_submission.py
│   └── generate_report.py
│
└── WebSocket
    └── grading_events.py (real-time updates)
```

---

## Technology Decisions & Rationale

### Why Next.js 14 (App Router)?
✅ **Server Components** - Better performance, reduced client JS  
✅ **Built-in routing** - File-based, intuitive  
✅ **SSR/SSG** - SEO-friendly, faster initial load  
✅ **Vercel deployment** - Zero-config, global CDN  
❌ Trade-off: Newer API, less community content (acceptable)

### Why FastAPI over Django/Flask?
✅ **Async by default** - Better for AI API calls, WebSocket  
✅ **Type hints** - Pydantic validation, auto-docs  
✅ **Performance** - Faster than Django, more structured than Flask  
✅ **Modern** - Built for async Python 3.11+  
❌ Trade-off: Smaller ecosystem than Django (acceptable)

### Why Supabase over AWS RDS + S3?
✅ **Auth built-in** - Google OAuth out of the box  
✅ **Row-level security** - Database-enforced data isolation  
✅ **Storage integrated** - Same provider for DB + files  
✅ **Generous free tier** - 500MB DB, 1GB storage  
✅ **PostgreSQL** - No vendor lock-in (can export)  
❌ Trade-off: Vendor dependency (mitigated by Postgres compatibility)

### Why Celery + Redis over background threads?
✅ **Reliability** - Jobs persist across server restarts  
✅ **Scalability** - Horizontal scaling (add workers)  
✅ **Retries** - Automatic retry with exponential backoff  
✅ **Monitoring** - Flower dashboard for queue visibility  
❌ Trade-off: Extra infrastructure (Redis required)

### Why React Query + Zustand over Redux?
✅ **Simpler** - Less boilerplate, easier to learn  
✅ **React Query** - Server state caching, auto-sync  
✅ **Zustand** - Lightweight UI state (~1KB)  
❌ Trade-off: Less opinionated than Redux (acceptable)

### Why Claude Sonnet 4.5 over GPT-4 Vision?
✅ **Handwriting recognition** - Superior OCR accuracy  
✅ **Reasoning** - Shows thought process (transparency)  
✅ **Context window** - 200K tokens (full rubrics + work)  
✅ **Cost** - $3/million input tokens vs GPT-4V $10/million  
❌ Trade-off: Single vendor (can add GPT-4V as fallback)

---

## Deployment Architecture

### Environments

```
┌─────────────────────────────────────────┐
│  LOCAL (Development)                    │
│  • Docker Compose                       │
│  • Postgres (local)                     │
│  • Redis (local)                        │
│  • Next.js dev server                   │
│  • FastAPI uvicorn                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  STAGING (Testing)                      │
│  • Vercel (frontend)                    │
│  • Railway (backend)                    │
│  • Supabase (staging project)           │
│  • Redis (Upstash)                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PRODUCTION                             │
│  • Vercel (frontend, multi-region)      │
│  • Railway (backend, auto-scale)        │
│  • Supabase (production project)        │
│  • Redis (Upstash, high availability)   │
│  • Sentry (error monitoring)            │
│  • PostHog (analytics)                  │
└─────────────────────────────────────────┘
```

### CI/CD Pipeline

```
Git Push (main branch)
    ↓
GitHub Actions
    ↓
┌─────────────────┐
│  Run Tests      │  • pytest (backend)
│                 │  • TypeScript checks
│                 │  • ESLint
└────────┬────────┘
         │ ✅ Pass
         ▼
┌─────────────────┐
│  Build          │  • Next.js build
│                 │  • Docker image (backend)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy Staging │  • Auto-deploy on merge
│                 │  • Run E2E tests
└────────┬────────┘
         │ ✅ Manual approval
         ▼
┌─────────────────┐
│  Deploy Prod    │  • Blue-green deployment
│                 │  • Health checks
│                 │  • Rollback on error
└─────────────────┘
```

---

## Scalability Strategy

### Phase 1: MVP (0-100 teachers)
- **Infrastructure:** Single backend instance, shared Redis
- **Cost:** ~$50/month (Supabase + Vercel + Railway free tiers)
- **Capacity:** 1,000 submissions/day

### Phase 2: Growth (100-1,000 teachers)
- **Infrastructure:** 2-3 backend instances (auto-scale), dedicated Redis
- **Cost:** ~$300/month
- **Capacity:** 10,000 submissions/day
- **Optimizations:**
  - Image CDN caching
  - Database read replicas
  - Separate Celery workers

### Phase 3: Scale (1,000-10,000 teachers)
- **Infrastructure:** Kubernetes cluster, multi-region
- **Cost:** ~$2,000/month
- **Capacity:** 100,000+ submissions/day
- **Optimizations:**
  - Edge caching (Cloudflare)
  - Database sharding (by school/district)
  - AI API response caching
  - Background job priorities

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Time to First Byte (TTFB)** | <200ms | TBD |
| **First Contentful Paint (FCP)** | <1.5s | TBD |
| **Largest Contentful Paint (LCP)** | <2.5s | TBD |
| **API Response Time (p95)** | <500ms | TBD |
| **AI Grading Time** | <30s/submission | ~15-20s |
| **WebSocket Latency** | <100ms | TBD |
| **Database Query Time (p95)** | <50ms | TBD |

---

## Monitoring & Observability

### Metrics to Track
- **Application:**
  - API response times (p50, p95, p99)
  - Error rates by endpoint
  - Grading queue length
  - AI API success rate & latency
  - WebSocket connection count

- **Infrastructure:**
  - CPU/memory usage
  - Database query performance
  - Storage usage
  - Network latency

### Logging Strategy
```python
# Structured JSON logs
{
  "timestamp": "2026-02-06T14:30:00Z",
  "level": "INFO",
  "service": "grading-service",
  "correlation_id": "req_abc123",
  "message": "AI grading completed",
  "data": {
    "submission_id": "uuid",
    "duration_ms": 18500,
    "confidence": 0.92
  }
}
```

### Alerting Rules
- Error rate >1% → Slack alert
- Queue backlog >100 → Auto-scale workers
- AI API failures >5% → Fallback mode
- Disk usage >80% → Scale storage
- Response time p95 >1s → Performance investigation

---

## Security Architecture

### Authentication & Authorization
- **User Auth:** Supabase Auth (Google OAuth)
- **Session Management:** JWT tokens (1-hour expiry)
- **Refresh Tokens:** 30-day expiry, secure HTTP-only cookies
- **API Auth:** Bearer token in Authorization header
- **RBAC:** Teacher, Admin roles (future: School Admin)

### Data Protection
- **At Rest:** 
  - Database encryption (Supabase default)
  - File storage encryption (S3 server-side)
- **In Transit:** 
  - HTTPS everywhere (TLS 1.3)
  - WebSocket over WSS
- **PII Handling:**
  - Student emails encrypted
  - Student names obfuscated in logs
  - No student data sent to AI (only work images)

### Database Security (Row-Level Security)
```sql
-- Users can only see their own data
CREATE POLICY user_isolation ON classes
  FOR ALL
  USING (user_id = auth.uid());

-- Students only accessible via teacher's classes
CREATE POLICY student_access ON students
  FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE user_id = auth.uid()
    )
  );
```

### Input Validation
- **File uploads:**
  - Type whitelist (JPEG, PNG, PDF)
  - Size limit (10MB per file)
  - Image dimension validation
  - Malware scanning (future)
- **API requests:**
  - Pydantic validation on all inputs
  - SQL injection prevention (ORM parameterization)
  - XSS prevention (React auto-escaping)

### Rate Limiting
- **API:** 100 requests/minute per user
- **Uploads:** 50 files/minute per user
- **AI grading:** 100 submissions/hour (free tier)

---

## Compliance Considerations

### FERPA (Family Educational Rights and Privacy Act)
- Student records are "education records" under FERPA
- Teachers have "legitimate educational interest"
- No disclosure to third parties without consent
- **Implementation:**
  - Data isolation (RLS)
  - Audit logging (all access tracked)
  - Data retention policy (7 years)
  - Export/deletion on request

### COPPA (Children's Online Privacy Protection Act)
- Applies to students under 13
- Requires parental consent for data collection
- **Implementation:**
  - No student accounts (teacher-only system)
  - No student PII sent to AI
  - Parent opt-out mechanism

### GDPR (General Data Protection Regulation)
- Applies if serving EU teachers
- **Implementation:**
  - Right to access (export user data)
  - Right to deletion (hard delete on request)
  - Data portability (CSV export)
  - Privacy policy & terms of service

---

## Disaster Recovery & Business Continuity

### Backup Strategy
- **Database:** Daily automated backups (Supabase)
- **Files:** S3 versioning enabled
- **Configuration:** Infrastructure as code (Terraform/Pulumi)
- **Retention:** 30-day backup retention

### Failure Scenarios

| Scenario | Impact | Recovery |
|----------|--------|----------|
| **Backend crash** | Grading paused | Auto-restart (Railway), queue preserved |
| **Database failure** | Full outage | Supabase auto-failover (<5 min) |
| **AI API outage** | Grading paused | Queue retry, manual grading fallback |
| **Storage failure** | Upload/view blocked | S3 multi-region (auto-recover) |
| **Redis failure** | Queue/cache loss | Restart, replay queue from DB |

### RTO/RPO Targets
- **Recovery Time Objective (RTO):** <1 hour
- **Recovery Point Objective (RPO):** <5 minutes (database)

---

## Future Architecture Considerations

### Phase 2 Features (Months 2-6)
- **Mobile apps** (React Native)
- **Google Classroom deep integration** (bi-directional sync)
- **Multi-language support** (i18n)
- **Advanced analytics** (student progress tracking)
- **Parent portal** (view-only feedback access)

### Phase 3 Features (Months 6-12)
- **District-level admin** (multi-school management)
- **LMS integrations** (Canvas, Schoology)
- **Gradebook sync** (PowerSchool, Infinite Campus)
- **AI model fine-tuning** (school-specific handwriting)
- **Video grading** (oral presentations)

### Technical Debt to Address
- [ ] Add Redis sentinel for high availability
- [ ] Implement GraphQL for flexible queries
- [ ] Add E2E testing (Playwright)
- [ ] Database connection pooling tuning
- [ ] Image optimization (WebP conversion)

---

## Conclusion

HandMark's architecture is designed for:
- **Speed** - Real-time grading, optimistic UI updates
- **Reliability** - Queue-based processing, automatic retries
- **Security** - RLS, encryption, FERPA compliance
- **Scalability** - Horizontal scaling, auto-scaling workers
- **Maintainability** - Type-safe code, comprehensive logging

The stack is modern, proven, and optimized for the K-12 education domain.

---

**Next Steps:**
1. Review this architecture with Mark
2. Finalize technology choices
3. Begin Week 3 implementation (auth + backend foundation)
4. Create infrastructure provisioning scripts

---

*Architecture designed by AI Architect Agent, February 6, 2026*
