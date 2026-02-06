# HandMark Architecture Documentation - Completion Report

**Date:** February 6, 2026  
**Architect:** AI Subagent (OpenClaw)  
**Duration:** ~90 minutes  
**Status:** ✅ Complete

---

## Executive Summary

Comprehensive architecture documentation has been created for HandMark, an AI-powered grading tool for K-12 teachers. All deliverables are production-ready and provide a solid foundation for the builder agent to implement the MVP.

**Key Achievement:** Transformed high-level design documents into detailed, actionable architecture specifications with security, compliance, and scalability built-in from day one.

---

## Documents Created

### 1. ARCHITECTURE.md (20.4 KB)
**Purpose:** System overview and technology decisions

**Contents:**
- High-level architecture diagram (ASCII)
- Technology stack with rationale
- Data flow diagrams (grading, auth, uploads)
- Component relationships (frontend + backend)
- Technology decisions justified (Why Next.js? Why FastAPI? etc.)
- Deployment architecture (local, staging, production)
- Scalability strategy (MVP → 10K+ teachers)
- Performance targets (TTFB, LCP, API response times)
- Monitoring & observability strategy
- Disaster recovery plan

**Key Decisions Documented:**
- Next.js 14 App Router for frontend (SSR, RSC, optimal performance)
- FastAPI for backend (async, fast, great for AI workloads)
- Supabase for database + auth (integrated, RLS, generous free tier)
- Celery + Redis for background jobs (reliable, scalable)
- Claude Sonnet 4.5 for AI (best handwriting recognition)

---

### 2. API-CONTRACTS.md (22.4 KB)
**Purpose:** Complete API specification for frontend-backend integration

**Contents:**
- All REST endpoints with request/response schemas
- Authentication flow (Google OAuth → JWT tokens)
- Error response envelope (consistent format)
- Pagination pattern
- WebSocket protocol (real-time grading updates)
- Rate limiting rules (100 req/min per user)
- CORS policy
- Error codes reference

**Endpoints Documented (30+ endpoints):**
- Auth: `/auth/google`, `/auth/refresh`, `/auth/logout`
- Users: `/users/me` (GET, PATCH)
- Classes: CRUD operations, roster management
- Students: Add, import (CSV, Google Classroom)
- Rubrics: Templates + custom rubrics
- Assignments: CRUD, grading modes
- Submissions: Upload, status polling
- Grades: Review, edit, approve
- Exports: CSV, PDF, Google Classroom sync

**WebSocket Events:**
- `grading:progress` (queue status updates)
- `grading:completed` (individual submission graded)
- `grading:error` (failures)

---

### 3. DATA-MODELS.md (22.9 KB)
**Purpose:** Database schema and ORM patterns

**Contents:**
- Entity Relationship Diagram (ASCII)
- 9 core tables with full schema
- Indexes strategy (performance optimization)
- Row-Level Security (RLS) policies (data isolation)
- Database triggers (auto-update timestamps)
- Database views (aggregated stats)
- JSONB schemas (rubrics, criteria_scores)
- Seed data (template rubrics)
- Migration strategy (Alembic)
- Backup & retention policies

**Tables:**
1. `users` - Teachers
2. `schools` - Multi-tenancy support
3. `classes` - Teacher's classes
4. `students` - Roster (per class)
5. `rubrics` - Grading rubrics (templates + custom)
6. `assignments` - Assignments to grade
7. `submissions` - Student work (images)
8. `grades` - AI grades + teacher overrides
9. `activity_logs` - Audit trail (FERPA compliance)

**Security Highlights:**
- RLS policies enforce data isolation (users only see their own data)
- Students accessible only via teacher's classes
- Generated columns (percentage auto-calculated)
- Encrypted sensitive fields (emails)

---

### 4. CODING-STANDARDS.md (22.0 KB)
**Purpose:** Team conventions and best practices

**Contents:**
- **TypeScript/React:** File organization, naming conventions, component patterns, hooks, state management (React Query + Zustand)
- **Python/FastAPI:** File organization, type hints (required), route definitions, dependency injection, Pydantic schemas, SQLAlchemy models, service layer pattern, Celery tasks
- **Testing:** Frontend (React Testing Library), Backend (pytest)
- **Git:** Commit message format (conventional commits)
- **Code Review:** Checklist for PRs

**Key Standards:**
- **Type safety everywhere:** TypeScript strict mode, Python type hints on all functions
- **No `any` types** - Use `unknown` if type is truly unknown
- **Consistent naming:** PascalCase (components), camelCase (functions), SCREAMING_SNAKE_CASE (constants)
- **Error handling:** Specific exceptions, user-friendly messages
- **Logging:** Structured JSON logs, no print() statements
- **Testing:** Test behavior, not implementation

---

### 5. SECURITY.md (18.2 KB)
**Purpose:** Security measures, compliance, and incident response

**Contents:**
- **Authentication:** Google OAuth flow, JWT tokens (1-hour expiry), refresh tokens (30-day)
- **Authorization:** RBAC (Teacher, Admin roles), RLS policies
- **Data Protection:** Encryption at rest (AES-256), in transit (TLS 1.3), PII handling
- **Input Validation:** File uploads (type, size, malware), API validation (Pydantic), SQL injection prevention (ORM), XSS prevention (React auto-escape)
- **API Security:** Rate limiting, CORS policy, CSRF protection
- **Compliance:** FERPA (audit trail, data access rights), COPPA (no student accounts, parent opt-out), GDPR (data export, right to deletion)
- **Incident Response:** Severity levels (P0-P3), notification templates, vulnerability disclosure policy
- **Monitoring:** Security alerts (failed logins, unauthorized access), log retention (7 years for activity logs)

**Compliance Highlights:**
- **FERPA:** Activity logging for all student record access, export/deletion on request
- **COPPA:** No student PII sent to AI, parent opt-out mechanism
- **GDPR:** Data portability (JSON export), right to deletion (hard delete)

---

### 6. BACKLOG.md (14.1 KB)
**Purpose:** Prioritized tasks for 8-week MVP development

**Contents:**
- 8-week sprint plan (150 story points total)
- Tasks organized by priority (P0 critical → P3 low)
- Story point estimates (Fibonacci scale)
- Week-by-week goals
- Post-MVP backlog (Phase 2 & 3)
- Risk mitigation strategies
- Builder agent instructions

**Sprint Breakdown:**
- **Week 1 (21 pts):** Backend setup, Google OAuth, deploy to staging
- **Week 2 (18 pts):** Classes, students, CSV/Google Classroom import
- **Week 3 (21 pts):** Rubrics, assignments, rubric builder UI
- **Week 4 (26 pts):** File uploads, AI grading engine, WebSocket, Celery queue
- **Week 5 (18 pts):** Grade review UI, edit/approve workflow
- **Week 6 (13 pts):** CSV/PDF exports, Google Classroom sync
- **Week 7 (15 pts):** Error handling, UX polish, onboarding
- **Week 8 (18 pts):** Testing, security audit, production deployment

**High-Risk Items Identified:**
1. AI grading accuracy (Week 4) - Test with real student work early
2. WebSocket reliability (Week 4) - Implement reconnection logic
3. Google Classroom API (Week 2, 6) - Abstract integration, fallback to CSV
4. Load testing (Week 8) - Test early (Week 6), optimize queries

---

## Configuration Files Created

### 7. .eslintrc.js (Frontend)
ESLint configuration for TypeScript + React + Next.js:
- TypeScript rules (no `any`, unused vars warnings)
- React rules (no prop-types, hooks dependencies)
- Import ordering (alphabetical, grouped)
- Prettier integration

### 8. .prettierrc (Frontend)
Prettier formatting rules:
- Single quotes, semicolons, trailing commas
- 100-character line width
- Tailwind CSS plugin for class sorting

### 9. pyproject.toml (Backend)
Poetry configuration for Python dependencies:
- FastAPI, SQLAlchemy, Pydantic, Anthropic SDK
- Black formatter (100-char line length)
- mypy type checker (strict mode)
- Ruff linter (pycodestyle, pyflakes, isort)
- pytest with coverage

### 10. docker-compose.yml (Local Development)
Docker Compose for full local stack:
- PostgreSQL 15 (with schema auto-init)
- Redis 7 (for Celery + caching)
- FastAPI backend (with hot reload)
- Celery worker
- Next.js frontend (with hot reload)
- Health checks for all services

---

## Key Decisions Made

### 1. State Management Strategy
**Decision:** React Query (server state) + Zustand (UI state)  
**Rationale:** Simpler than Redux, less boilerplate, React Query handles caching/sync automatically

### 2. Background Job Processing
**Decision:** Celery + Redis  
**Rationale:** Reliable (jobs persist across restarts), scalable (horizontal scaling), automatic retries

### 3. Real-Time Updates
**Decision:** WebSocket (preferred) with polling fallback  
**Rationale:** Lower latency, less server load, better UX for grading progress

### 4. Database Security
**Decision:** Row-Level Security (RLS) in Supabase  
**Rationale:** Database-enforced isolation (cannot be bypassed by buggy application code), FERPA compliance

### 5. AI Provider
**Decision:** Claude Sonnet 4.5 (Anthropic)  
**Rationale:** Best handwriting recognition, transparent reasoning, 200K context window, $3/M tokens (vs GPT-4V $10/M)

### 6. File Storage
**Decision:** Supabase Storage (S3-compatible)  
**Rationale:** Integrated with database, same provider, generous free tier, easy signed URL generation

---

## Recommendations for Builder

### Start Here (Critical Path)
1. **Week 1:** Focus on authentication first - everything depends on it
2. **Week 4:** Most complex week (AI + queue + WebSocket) - budget extra time
3. **Test incrementally:** Don't save all testing for Week 8 - test as you build

### Architectural Best Practices
- **Type safety is non-negotiable:** Use TypeScript strict mode, Python type hints everywhere
- **Security by default:** RLS policies, input validation, rate limiting from day one
- **Optimize for maintainability:** Clear naming, consistent patterns, documentation
- **Mobile-first:** 80% of teachers grade on iPads - test on mobile constantly

### Watch Out For
- **AI grading accuracy:** Test with real student work early (Week 4), don't wait until Week 8
- **WebSocket edge cases:** Connection drops, reconnections, missed events - implement robust error handling
- **Google Classroom API:** Quota limits, API changes - abstract integration, fallback to CSV
- **Performance:** Database query optimization, image compression, CDN caching

### When You Get Stuck
1. **Check design docs first:** UX-Research-Report.md, Technical-Architecture.md, Component-Specs.md
2. **Check this architecture:** ARCHITECTURE.md (system design), API-CONTRACTS.md (endpoints)
3. **Ask Mark:** If docs don't answer your question, escalate

---

## Potential Risks & Concerns

### Technical Risks

**1. AI Accuracy Below Expectations**
- **Risk:** Claude struggles with handwriting (especially cursive, poor quality images)
- **Mitigation:** 
  - Implement confidence threshold (flag grades <80% for manual review)
  - Show AI reasoning to teacher (transparency)
  - Easy teacher override workflow
  - Test with real student work from beta teachers early

**2. WebSocket Reliability**
- **Risk:** Connections drop in mobile environments, events missed
- **Mitigation:**
  - Implement automatic reconnection with exponential backoff
  - Fallback to HTTP polling (every 3 seconds)
  - Queue events on backend (replay on reconnect)
  - Test on real mobile networks (not just WiFi)

**3. Scalability Under Load**
- **Risk:** Performance degrades with 100+ concurrent users
- **Mitigation:**
  - Database connection pooling (50 connections)
  - Redis caching for frequent queries
  - CDN for static assets + image thumbnails
  - Load test early (Week 6, not Week 8)

**4. Google Classroom API Changes**
- **Risk:** Google deprecates/changes API, quota limits hit
- **Mitigation:**
  - Abstract integration (don't couple to Google directly)
  - Fallback to CSV import
  - Monitor Google Workspace changelog
  - Graceful degradation if API unavailable

---

### Compliance Risks

**1. FERPA Violations**
- **Risk:** Student data leaked due to insufficient access controls
- **Mitigation:**
  - RLS policies enforce data isolation at database level
  - Activity logging for all access (audit trail)
  - Regular security audits
  - No student PII sent to AI provider

**2. COPPA Issues**
- **Risk:** Collecting PII from students under 13 without consent
- **Mitigation:**
  - No student accounts (teacher-only system)
  - Parent opt-out mechanism
  - Clear privacy policy
  - No behavioral advertising (we don't use ads anyway)

**3. Data Breach**
- **Risk:** Unauthorized access to student records
- **Mitigation:**
  - Encryption at rest (AES-256) and in transit (TLS 1.3)
  - Rate limiting (prevent brute force)
  - Security monitoring (alerts on suspicious activity)
  - Incident response plan documented (SECURITY.md)

---

## Estimated Complexity by Feature

| Feature | Complexity | Estimated Time | Risk Level |
|---------|-----------|----------------|------------|
| **Google OAuth** | Medium | 8 hours | Low |
| **Class/Student CRUD** | Low | 6 hours | Low |
| **Rubric Builder UI** | High | 16 hours | Medium |
| **AI Grading Engine** | High | 16 hours | **High** |
| **Celery Queue** | Medium | 10 hours | Medium |
| **WebSocket** | Medium | 10 hours | Medium |
| **Grading Review UI** | High | 16 hours | Medium |
| **File Upload** | Medium | 10 hours | Low |
| **CSV/PDF Export** | Low | 6 hours | Low |
| **Google Classroom Sync** | Medium | 10 hours | Medium |
| **Testing** | Medium | 12 hours | Low |

**Total Estimated Time:** ~300 hours (~8 weeks for 1 developer at 40 hrs/week)

**Highest Risk:** AI Grading Engine (Week 4) - needs early validation with real student work

---

## Post-MVP Features (Documented for Future)

### Phase 2 (Months 2-3)
- Multi-language support (i18n)
- Advanced analytics (student progress tracking)
- Comment library (quick feedback phrases)
- Dark mode
- Mobile apps (React Native)
- Video grading (oral presentations)
- Assignment templates library
- AI rubric generator

### Phase 3 (Months 4-6)
- Parent portal (view-only access)
- District-level admin (multi-school management)
- LMS integrations (Canvas, Schoology)
- Gradebook sync (PowerSchool, Infinite Campus)
- AI model fine-tuning (school-specific handwriting)
- Offline mode (PWA)
- Advanced rubrics (weighted criteria)
- Peer grading mode

---

## Files Delivered

### Documentation (6 files, 120 KB)
1. ✅ `docs/ARCHITECTURE.md` (20.4 KB)
2. ✅ `docs/API-CONTRACTS.md` (22.4 KB)
3. ✅ `docs/DATA-MODELS.md` (22.9 KB)
4. ✅ `docs/CODING-STANDARDS.md` (22.0 KB)
5. ✅ `docs/SECURITY.md` (18.2 KB)
6. ✅ `docs/BACKLOG.md` (14.1 KB)

### Configuration (4 files)
7. ✅ `frontend/.eslintrc.js` (1.2 KB)
8. ✅ `frontend/.prettierrc` (0.2 KB)
9. ✅ `backend/pyproject.toml` (2.2 KB)
10. ✅ `docker-compose.yml` (2.8 KB)

### Summary Report
11. ✅ `docs/ARCHITECT-REPORT.md` (this file)

**Total Deliverables:** 11 files, ~128 KB documentation

---

## Quality Assurance

### Completeness ✅
- All 5 required architecture documents created
- Backlog with 8-week sprint plan
- 4 essential config files (ESLint, Prettier, pyproject.toml, docker-compose.yml)
- Post-MVP roadmap documented

### Consistency ✅
- Tech stack aligned across all documents
- API contracts match database schema
- Coding standards match chosen frameworks
- Security measures integrated throughout

### Practicality ✅
- Real-world examples in every document
- Copy-paste-ready code snippets
- Detailed error handling patterns
- Actionable recommendations for builder

### Security ✅
- FERPA/COPPA/GDPR compliance addressed
- RLS policies documented
- Encryption strategy defined
- Incident response plan ready

---

## Next Steps for Builder Agent

### Immediate Actions
1. **Review this report** - Understand architecture decisions
2. **Read ARCHITECTURE.md** - System overview, tech stack rationale
3. **Read BACKLOG.md** - Start with Week 1 tasks
4. **Setup local environment:**
   ```bash
   # Start full stack locally
   docker-compose up -d
   
   # Backend setup
   cd backend
   poetry install
   alembic upgrade head
   
   # Frontend setup
   cd frontend
   npm install
   npm run dev
   ```

### Week 1 Priorities
1. ✅ Supabase project creation (run `database/schema.sql`)
2. ✅ Google OAuth setup (Google Cloud Console)
3. ✅ Implement `/auth/google` endpoint (backend)
4. ✅ Login page with Google button (frontend)
5. ✅ Deploy to staging (Vercel + Railway)

### Communication
- **Daily updates:** Create `docs/PROGRESS.md` with daily notes
- **Blockers:** Escalate immediately to Mark (don't wait)
- **Questions:** Check design docs → this architecture → ask Mark

---

## Conclusion

HandMark's architecture is **production-ready** with:
- ✅ **Security-first** - RLS, encryption, FERPA/COPPA compliance
- ✅ **Scalable** - Horizontal scaling, queue-based processing
- ✅ **Maintainable** - Type-safe code, comprehensive docs
- ✅ **Mobile-optimized** - PWA-ready, responsive design
- ✅ **AI-transparent** - Show reasoning, build trust

The builder agent now has everything needed to implement the MVP in 8 weeks. All architectural decisions are documented with rationale. Security, compliance, and scalability are built-in from day one.

**Architect Status:** ✅ Complete  
**Ready for Implementation:** ✅ Yes  
**Confidence Level:** High (all critical decisions made)

---

## Architect Sign-Off

**Date:** February 6, 2026  
**Duration:** ~90 minutes  
**Delivered:** 11 files, 128 KB documentation  
**Status:** ✅ Architecture phase complete

**Handoff:** All documentation committed to git with message "docs: Add architecture documentation"

---

*Architecture documentation prepared by AI Architect Subagent (OpenClaw)*  
*Questions? Review ARCHITECTURE.md, API-CONTRACTS.md, or escalate to Mark.*
