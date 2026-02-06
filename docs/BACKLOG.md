# HandMark Development Backlog

**Version:** 1.0  
**Last Updated:** February 6, 2026  
**Sprint Duration:** 1 week  
**Target Launch:** Week 8 (MVP)

---

## Priority Legend

- 🔴 **P0 - Critical** - Blocks MVP launch
- 🟠 **P1 - High** - Important for MVP
- 🟡 **P2 - Medium** - Nice-to-have for MVP
- 🟢 **P3 - Low** - Post-MVP

**Story Points:** Fibonacci scale (1, 2, 3, 5, 8, 13)

---

## Week 1: Foundation & Authentication

**Goal:** Backend infrastructure + Google OAuth working  
**Total Points:** 21

### Backend Setup
- [ ] 🔴 **P0** - Setup FastAPI project structure (2 pts)
  - Install dependencies (FastAPI, SQLAlchemy, Pydantic)
  - Create `app/` directory structure
  - Configure `pyproject.toml`
  
- [ ] 🔴 **P0** - Configure Supabase connection (3 pts)
  - Create Supabase project
  - Run database schema (from `database/schema.sql`)
  - Test connection from backend
  
- [ ] 🔴 **P0** - Implement Google OAuth flow (5 pts)
  - Setup Google Cloud project
  - Implement `/auth/google` endpoint
  - JWT token generation/validation
  - Refresh token flow
  
- [ ] 🔴 **P0** - Implement user CRUD endpoints (3 pts)
  - `GET /users/me`
  - `PATCH /users/me`
  - Row-level security (RLS) policies

### Frontend Setup
- [ ] 🔴 **P0** - Setup Next.js project (2 pts)
  - Install dependencies (Next.js 14, Tailwind, shadcn/ui)
  - Configure `tailwind.config.ts`
  - Setup `src/` directory structure
  
- [ ] 🔴 **P0** - Implement authentication UI (5 pts)
  - Login page with "Sign in with Google" button
  - OAuth callback handler
  - Token storage (memory + httpOnly cookie)
  - Protected route middleware
  
- [ ] 🟠 **P1** - Create dashboard layout (3 pts)
  - Sidebar navigation (desktop)
  - Bottom navigation (mobile)
  - User profile dropdown

### Infrastructure
- [ ] 🔴 **P0** - Deploy to staging (3 pts)
  - Vercel (frontend)
  - Railway (backend)
  - Environment variables configured
  - HTTPS working

---

## Week 2: Classes & Students

**Goal:** Teachers can manage classes and rosters  
**Total Points:** 18

### Backend
- [ ] 🔴 **P0** - Class CRUD endpoints (3 pts)
  - `GET /classes` (list)
  - `POST /classes` (create)
  - `GET /classes/:id` (details)
  - `PATCH /classes/:id` (update)
  - `DELETE /classes/:id` (archive)
  
- [ ] 🔴 **P0** - Student CRUD endpoints (3 pts)
  - `GET /classes/:id/students`
  - `POST /classes/:id/students` (add one)
  - `POST /classes/:id/students/import` (CSV)
  - `DELETE /students/:id`
  
- [ ] 🟠 **P1** - Google Classroom roster sync (5 pts)
  - Setup Google Classroom API
  - Implement `POST /classes/:id/students/import` (google_classroom)
  - OAuth scope for Classroom access
  - Sync job (background task)

### Frontend
- [ ] 🔴 **P0** - Classes list page (2 pts)
  - Display classes as cards
  - "Create Class" button
  - Archive/unarchive action
  
- [ ] 🔴 **P0** - Class detail page (3 pts)
  - Student roster table
  - "Add Student" button
  - "Import CSV" button
  - Google Classroom sync button
  
- [ ] 🟠 **P1** - CSV import UI (2 pts)
  - Drag & drop CSV upload
  - Preview roster before import
  - Error handling (duplicate students, etc.)

---

## Week 3: Rubrics & Assignments

**Goal:** Teachers can create assignments with rubrics  
**Total Points:** 21

### Backend
- [ ] 🔴 **P0** - Rubric CRUD endpoints (3 pts)
  - `GET /rubrics` (templates + custom)
  - `GET /rubrics/:id` (details)
  - `POST /rubrics` (create custom)
  - Seed 10+ template rubrics
  
- [ ] 🔴 **P0** - Assignment CRUD endpoints (3 pts)
  - `GET /assignments` (filtered by class)
  - `POST /assignments` (create)
  - `GET /assignments/:id` (details with submissions)
  - `PATCH /assignments/:id` (update)
  - `DELETE /assignments/:id`

### Frontend
- [ ] 🔴 **P0** - Rubric builder UI (8 pts)
  - Template selector dropdown
  - Drag-to-reorder criteria
  - Add/edit/delete criterion
  - Point scale selector (0-3, 0-4, 0-5)
  - Level descriptions (3-5 levels per criterion)
  - Save as personal template option
  
- [ ] 🔴 **P0** - Create assignment flow (5 pts)
  - Step 1: Assignment basics (title, class, due date)
  - Step 2: Choose grading mode (rubric vs answer key)
  - Step 3: Select/create rubric
  - Success screen with next actions
  
- [ ] 🟡 **P2** - Answer key input UI (3 pts)
  - Type answers manually (for fill-in-blank)
  - Upload answer key image (for math)
  - Points per question input

---

## Week 4: File Uploads & AI Grading Engine

**Goal:** End-to-end grading pipeline working  
**Total Points:** 26 (most complex week)

### Backend
- [ ] 🔴 **P0** - File upload endpoint (5 pts)
  - `POST /submissions/upload` (multipart/form-data)
  - File validation (type, size, dimensions)
  - Upload to Supabase Storage
  - Generate thumbnails
  - Store submission records
  
- [ ] 🔴 **P0** - AI grading service (8 pts)
  - Anthropic Claude SDK integration
  - Build prompt from rubric
  - Parse Claude response to structured grade
  - Handle errors (low confidence, unreadable)
  - Store grade with criteria scores
  
- [ ] 🔴 **P0** - Celery task queue (5 pts)
  - Setup Redis (Upstash)
  - Configure Celery
  - `grade_submission_task` (background job)
  - Retry logic (3 attempts, exponential backoff)
  - Update submission status
  
- [ ] 🔴 **P0** - WebSocket server (5 pts)
  - Real-time grading progress events
  - `grading:progress` (queue status)
  - `grading:completed` (individual submission)
  - `grading:error` (failures)
  
- [ ] 🟠 **P1** - Batch grading endpoint (3 pts)
  - `POST /assignments/:id/grade-all`
  - Queue all pending submissions
  - Return estimated time

### Frontend
- [ ] 🔴 **P0** - Upload interface (3 pts)
  - Drag & drop zone
  - Browse files button
  - File preview with progress bars
  - Student name matching (optional)
  
- [ ] 🔴 **P0** - Grading progress UI (3 pts)
  - Real-time WebSocket updates
  - Progress bar (completed/total)
  - Live queue list (completed, in progress, pending)
  - Estimated time remaining
  
- [ ] 🟠 **P1** - Mobile camera upload (2 pts)
  - Camera access (iOS/Android)
  - Capture photo directly
  - Instant upload

---

## Week 5: Grade Review & Editing

**Goal:** Teachers can review/edit AI grades  
**Total Points:** 18

### Backend
- [ ] 🔴 **P0** - Grade endpoints (3 pts)
  - `GET /grades/:id` (details)
  - `PATCH /grades/:id` (edit scores, notes)
  - `POST /grades/:id/approve`
  
- [ ] 🟠 **P1** - Grade statistics (2 pts)
  - Assignment-level stats (average, median, distribution)
  - Student-level trends (future)

### Frontend
- [ ] 🔴 **P0** - Grade review dashboard (5 pts)
  - List all submissions for assignment
  - Filter: All / Needs Review / Approved
  - Sort by confidence, score, student name
  - Flagged items (low confidence) shown first
  - Bulk approve button
  
- [ ] 🔴 **P0** - Grading review screen (8 pts)
  - Side-by-side layout (work | grades)
  - Left: Student work image (zoom, pan, rotate)
  - Right: Rubric with scores + reasoning
  - Edit score inline (click to edit)
  - Add teacher notes
  - "Approve & Next" button
  - Keyboard shortcuts (← → for navigation)
  
- [ ] 🟡 **P2** - Mobile grading (swipe gestures) (3 pts)
  - Swipe left/right for next/prev student
  - Bottom sheet for editing scores
  - Touch-optimized UI

---

## Week 6: Exports & Reports

**Goal:** Teachers can export grades and generate reports  
**Total Points:** 13

### Backend
- [ ] 🔴 **P0** - CSV export (3 pts)
  - `POST /assignments/:id/export` (format=csv)
  - Generate CSV (student, score, percentage)
  - Return download URL (signed, expires 1 hour)
  
- [ ] 🔴 **P0** - PDF feedback slips (5 pts)
  - Generate individual feedback slip per student
  - Print-friendly design (8.5"x11")
  - Stars for visual score
  - AI reasoning + teacher notes
  - Return ZIP of all PDFs
  
- [ ] 🟠 **P1** - Google Classroom grade sync (5 pts)
  - Setup Google Classroom API (write scope)
  - `POST /assignments/:id/sync-google-classroom`
  - Push grades to Classroom assignment
  - Handle errors (student not found, etc.)

### Frontend
- [ ] 🔴 **P0** - Export options modal (2 pts)
  - CSV gradebook
  - PDF feedback slips
  - Google Classroom sync
  - Download button with progress
  
- [ ] 🟡 **P2** - Class analytics dashboard (3 pts)
  - Assignment performance over time
  - Score distribution chart
  - Common mistakes (AI insights)

---

## Week 7: Polish & Edge Cases

**Goal:** Handle edge cases, improve UX  
**Total Points:** 15

### Error Handling
- [ ] 🟠 **P1** - Poor image quality handling (3 pts)
  - Detect low-quality images (too blurry, dark)
  - Prompt user to re-upload
  - Manual grading fallback
  
- [ ] 🟠 **P1** - AI low confidence workflow (3 pts)
  - Flag grades with confidence <80%
  - Highlight for teacher review
  - Show AI uncertainty in UI
  
- [ ] 🟠 **P1** - Network error handling (2 pts)
  - Retry failed uploads (3 attempts)
  - Offline indicator
  - Queue uploads for when online

### UX Improvements
- [ ] 🔴 **P0** - Empty states (2 pts)
  - No classes: "Create your first class"
  - No students: "Import roster"
  - No assignments: "Create assignment"
  - Helpful, actionable messages
  
- [ ] 🟠 **P1** - Loading states (2 pts)
  - Skeleton loaders (not spinners)
  - Optimistic UI updates
  - Progress indicators
  
- [ ] 🟡 **P2** - Keyboard shortcuts (2 pts)
  - `E`: Edit score
  - `A`: Approve grade
  - `→`: Next student
  - `←`: Previous student
  
- [ ] 🟡 **P2** - Onboarding tutorial (3 pts)
  - 5-minute interactive walkthrough
  - Sample assignment with AI grading demo
  - Tooltips for key features

---

## Week 8: Testing & Launch Prep

**Goal:** Production-ready MVP  
**Total Points:** 18

### Testing
- [ ] 🔴 **P0** - Backend integration tests (5 pts)
  - Auth flow (Google OAuth)
  - CRUD operations (classes, assignments, grades)
  - AI grading pipeline (mocked Claude API)
  - WebSocket events
  
- [ ] 🔴 **P0** - Frontend E2E tests (5 pts)
  - Playwright tests for critical flows
  - Onboarding flow
  - Create assignment + grade flow
  - Review & export flow
  
- [ ] 🟠 **P1** - Load testing (3 pts)
  - Simulate 100 concurrent users
  - Test grading queue under load
  - Database query performance

### Security & Compliance
- [ ] 🔴 **P0** - Security audit (3 pts)
  - Dependency vulnerability scan
  - API rate limiting verification
  - RLS policy testing
  - Input validation review
  
- [ ] 🔴 **P0** - Privacy policy & ToS (2 pts)
  - Draft privacy policy (FERPA/COPPA compliant)
  - Terms of service
  - Parent opt-out mechanism

### Launch
- [ ] 🔴 **P0** - Production deployment (3 pts)
  - Deploy to production (Vercel + Railway)
  - Monitoring setup (Sentry + PostHog)
  - Backup verification
  - Smoke tests in production
  
- [ ] 🟠 **P1** - Beta teacher onboarding (2 pts)
  - Recruit 5-10 beta teachers
  - Provide support channel (Discord/Slack)
  - Collect feedback form

---

## Post-MVP Backlog (Future Sprints)

### Phase 2 (Months 2-3)
- [ ] 🟡 **P2** - Multi-language support (i18n)
- [ ] 🟡 **P2** - Advanced analytics (student progress tracking)
- [ ] 🟡 **P2** - Comment library (quick feedback phrases)
- [ ] 🟡 **P2** - Dark mode
- [ ] 🟡 **P2** - Mobile apps (React Native)
- [ ] 🟡 **P2** - Video grading (oral presentations)
- [ ] 🟡 **P2** - Assignment templates library
- [ ] 🟡 **P2** - AI rubric generator (from assignment description)

### Phase 3 (Months 4-6)
- [ ] 🟢 **P3** - Parent portal (view-only feedback access)
- [ ] 🟢 **P3** - District-level admin (multi-school)
- [ ] 🟢 **P3** - LMS integrations (Canvas, Schoology)
- [ ] 🟢 **P3** - Gradebook sync (PowerSchool, Infinite Campus)
- [ ] 🟢 **P3** - AI model fine-tuning (school-specific handwriting)
- [ ] 🟢 **P3** - Offline mode (PWA)
- [ ] 🟢 **P3** - Advanced rubrics (weighted criteria)
- [ ] 🟢 **P3** - Peer grading mode (student review)

---

## Sprint Capacity Planning

**Assumptions:**
- 1 full-time developer
- 40 hours/week
- 1 story point = ~2 hours
- 20 points/week capacity

| Week | Points Planned | Complexity |
|------|---------------|------------|
| **Week 1** | 21 | Medium (infrastructure setup) |
| **Week 2** | 18 | Low (CRUD operations) |
| **Week 3** | 21 | Medium (complex UI) |
| **Week 4** | 26 | **High** (AI + queue system) |
| **Week 5** | 18 | Medium (review UI) |
| **Week 6** | 13 | Low (exports) |
| **Week 7** | 15 | Low (polish) |
| **Week 8** | 18 | Medium (testing) |
| **Total** | **150 pts** | ~300 hours |

**Note:** Week 4 is over capacity (26 pts) - consider splitting AI grading into Week 4 + Week 5.

---

## Risk Mitigation

### High-Risk Items
1. **AI Grading Accuracy** (Week 4)
   - Risk: Claude struggles with handwriting
   - Mitigation: Test with real student work early, implement confidence thresholds
   
2. **WebSocket Reliability** (Week 4)
   - Risk: Connection drops, missed events
   - Mitigation: Fallback to polling, implement reconnection logic
   
3. **Google Classroom API** (Week 2, Week 6)
   - Risk: API changes, quota limits
   - Mitigation: Abstract integration, fallback to CSV
   
4. **Load Testing** (Week 8)
   - Risk: Performance issues at scale
   - Mitigation: Test early (Week 6), optimize queries

### Contingency Plan
- **If behind schedule by Week 4:** Cut Google Classroom sync (move to post-MVP)
- **If behind schedule by Week 6:** Cut advanced analytics, parent portal
- **Critical MVP features:** Auth, classes, assignments, AI grading, review, CSV export

---

## Builder Agent Instructions

**How to use this backlog:**
1. Start with Week 1, complete all P0 tasks first
2. Check off items as completed
3. Update story points if estimates were off
4. Add technical notes/decisions in task descriptions
5. Flag blockers immediately (don't wait until standup)
6. Test incrementally (don't save all testing for Week 8)

**Communication:**
- Daily updates in `docs/PROGRESS.md`
- Blockers → escalate to Mark
- Questions → check design docs first, then ask

**Definition of Done:**
- Code passes linters (ESLint, Black)
- Tests written and passing
- Deployed to staging
- Smoke tested manually
- Documented (if API change)

---

*Development Backlog v1.0 - Last updated February 6, 2026*
