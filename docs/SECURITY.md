# HandMark Security Documentation

**Version:** 1.0  
**Last Updated:** February 6, 2026  
**Classification:** Internal

---

## Security Overview

HandMark handles sensitive student data and must comply with educational privacy laws (FERPA, COPPA). This document outlines security measures, policies, and best practices.

**Security Priorities:**
1. **Data Protection** - Student records are confidential
2. **Access Control** - Teachers only see their own data
3. **Compliance** - FERPA, COPPA, GDPR-ready
4. **Transparency** - Clear privacy policies, parent opt-out
5. **Incident Response** - Plan for security breaches

---

## Authentication & Authorization

### Authentication Flow

```
┌────────────┐
│   User     │
│  Clicks    │
│ "Sign In"  │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│   Google     │
│   OAuth 2.0  │
│   (Consent)  │
└─────┬────────┘
      │ Authorization code
      ▼
┌──────────────┐
│   Backend    │
│  Exchanges   │
│    code      │
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Supabase    │
│    Auth      │
│  (JWT token) │
└─────┬────────┘
      │
      ▼
┌──────────────┐
│   Frontend   │
│ Stores token │
│  (httpOnly)  │
└──────────────┘
```

### Token Management

**Access Tokens:**
- **Expiry:** 1 hour
- **Storage:** Memory (not localStorage)
- **Format:** JWT with signature verification

**Refresh Tokens:**
- **Expiry:** 30 days
- **Storage:** Secure HTTP-only cookie
- **Rotation:** New refresh token on every use

**Implementation:**
```typescript
// ✅ Secure: Memory storage, not localStorage
class AuthService {
  private accessToken: string | null = null;
  
  setToken(token: string) {
    this.accessToken = token;
    // Never store in localStorage (XSS risk)
  }
  
  getToken(): string | null {
    return this.accessToken;
  }
}
```

### Role-Based Access Control (RBAC)

**Roles:**
| Role | Permissions |
|------|------------|
| **Teacher** | CRUD own classes, assignments, grades |
| **Admin** | All teacher permissions + user management |
| **Future: School Admin** | Manage teachers within school |

**Backend Enforcement:**
```python
from fastapi import Depends, HTTPException
from app.api.deps import get_current_user

@router.delete("/assignments/{assignment_id}")
async def delete_assignment(
    assignment_id: UUID,
    current_user: User = Depends(get_current_user)
):
    assignment = get_assignment(assignment_id)
    
    # Authorization check
    if assignment.class_.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    delete_assignment(assignment)
    return {"message": "Assignment deleted"}
```

### Session Management

**Security Rules:**
- Sessions expire after 1 hour of inactivity
- Logout invalidates all tokens
- Password changes invalidate all sessions
- Max 5 concurrent sessions per user

**Implementation:**
```python
# Store session metadata
class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    token_hash = Column(String)
    ip_address = Column(String)
    user_agent = Column(String)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Data Protection

### Encryption

**At Rest:**
- **Database:** AES-256 encryption (Supabase default)
- **File Storage:** Server-side encryption (S3/Supabase Storage)
- **Backups:** Encrypted backups (AES-256)

**In Transit:**
- **HTTPS:** TLS 1.3 for all connections
- **WebSocket:** WSS (WebSocket Secure)
- **API:** HTTPS only, HSTS enabled

**Sensitive Fields:**
```python
from cryptography.fernet import Fernet

class User(Base):
    __tablename__ = "users"
    
    # PII fields (encrypted at application level)
    email = Column(String, nullable=False)  # Encrypted
    
    def set_email(self, email: str, key: bytes):
        """Encrypt email before storing."""
        cipher = Fernet(key)
        self.email = cipher.encrypt(email.encode()).decode()
    
    def get_email(self, key: bytes) -> str:
        """Decrypt email when reading."""
        cipher = Fernet(key)
        return cipher.decrypt(self.email.encode()).decode()
```

### Row-Level Security (RLS)

**Database-enforced isolation:**
```sql
-- Users can only access their own classes
CREATE POLICY user_isolation ON classes
  FOR ALL
  USING (user_id = auth.uid());

-- Students accessible only via teacher's classes
CREATE POLICY student_access ON students
  FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE user_id = auth.uid()
    )
  );

-- Grades accessible only via teacher's submissions
CREATE POLICY grade_access ON grades
  FOR ALL
  USING (
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN classes c ON a.class_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );
```

### Data Minimization

**Only collect what's necessary:**
- ✅ Student name (required for grading)
- ✅ Student work images (required for AI grading)
- ❌ Student birthdate (not collected)
- ❌ Student social security number (not collected)
- ❌ Student address (not collected)

**AI Service Privacy:**
- **No PII sent to Claude API** (only work images)
- Student names removed from images before AI processing
- AI provider (Anthropic) has DPA (Data Processing Agreement)

---

## Input Validation & Sanitization

### File Upload Security

**Validation Rules:**
```python
from PIL import Image
import magic

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_upload(file: UploadFile):
    """
    Validate uploaded file for security.
    
    Checks:
    - File type (magic bytes, not extension)
    - File size
    - Image dimensions
    - Malware scan (future)
    """
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)     # Reset
    
    if size > MAX_FILE_SIZE:
        raise ValueError("File too large (max 10MB)")
    
    # Check MIME type (using magic bytes, not extension)
    mime_type = magic.from_buffer(file.file.read(1024), mime=True)
    file.file.seek(0)
    
    if mime_type not in ALLOWED_MIME_TYPES:
        raise ValueError(f"Invalid file type: {mime_type}")
    
    # For images, check dimensions
    if mime_type.startswith("image/"):
        image = Image.open(file.file)
        if image.width > 10000 or image.height > 10000:
            raise ValueError("Image dimensions too large")
        if image.width < 500 or image.height < 500:
            raise ValueError("Image dimensions too small (min 500x500)")
    
    return True
```

**Storage Security:**
```python
import uuid
import hashlib

def generate_secure_filename(original_filename: str, user_id: str) -> str:
    """
    Generate secure filename to prevent directory traversal.
    
    Format: {uuid}_{hash}.{ext}
    """
    # Extract extension (sanitized)
    ext = original_filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "pdf"]:
        ext = "jpg"
    
    # Generate UUID
    file_uuid = uuid.uuid4()
    
    # Hash original name (for debugging, not security)
    name_hash = hashlib.sha256(original_filename.encode()).hexdigest()[:8]
    
    return f"{file_uuid}_{name_hash}.{ext}"
```

### API Input Validation

**Pydantic Validation:**
```python
from pydantic import BaseModel, Field, validator, EmailStr

class UserCreate(BaseModel):
    email: EmailStr  # Validates email format
    name: str = Field(..., min_length=1, max_length=100)
    
    @validator("name")
    def validate_name(cls, v):
        # Prevent XSS in names
        if any(char in v for char in ["<", ">", "&", "\"", "'"]):
            raise ValueError("Name contains invalid characters")
        return v.strip()

class AssignmentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    class_id: UUID  # Type-safe UUID
    
    @validator("title")
    def sanitize_title(cls, v):
        # Sanitize HTML
        return html.escape(v.strip())
```

### SQL Injection Prevention

**✅ Use ORM (SQLAlchemy) - Automatic parameterization:**
```python
# ✅ Safe: ORM handles parameterization
assignment = db.query(Assignment).filter(
    Assignment.id == assignment_id
).first()

# ❌ NEVER use raw SQL with string formatting
query = f"SELECT * FROM assignments WHERE id = '{assignment_id}'"  # DON'T
db.execute(query)
```

### XSS Prevention

**Frontend:**
```tsx
// ✅ Safe: React auto-escapes by default
<div>{assignment.title}</div>

// ❌ Dangerous: dangerouslySetInnerHTML bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // DON'T

// ✅ Safe: Use DOMPurify if HTML is needed
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## API Security

### Rate Limiting

**Limits:**
- **Global:** 100 requests/minute per IP
- **Per user:** 100 requests/minute per user
- **Upload:** 50 files/minute per user
- **AI grading:** 100 submissions/hour (free), 1000/hour (pro)

**Implementation:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/submissions/upload")
@limiter.limit("50/minute")
async def upload_submissions(...):
    ...
```

### CORS Policy

**Allowed Origins:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.handmark.app",      # Production
        "https://staging.handmark.app",  # Staging
        "http://localhost:3000"          # Local dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=86400  # 24 hours
)
```

### CSRF Protection

**Strategy:**
- API uses Bearer tokens (not cookies for auth) → CSRF not applicable
- State-changing operations require POST/PATCH/DELETE (not GET)

### API Versioning

**URL-based versioning:**
```
/v1/assignments  (current)
/v2/assignments  (future, breaking changes)
```

**Deprecation Policy:**
- 6-month notice for deprecated endpoints
- Old versions supported for 12 months minimum
- Clear migration guides

---

## Compliance

### FERPA (Family Educational Rights and Privacy Act)

**Key Requirements:**
- ✅ Parental consent for students under 18
- ✅ Right to access records (export feature)
- ✅ Right to request corrections (teacher can edit grades)
- ✅ No disclosure without consent (RLS enforces this)
- ✅ Audit trail (activity_logs table)

**Implementation:**
```python
# Activity logging (FERPA audit requirement)
def log_activity(
    user_id: UUID,
    action: str,
    resource_type: str,
    resource_id: UUID,
    metadata: dict
):
    """Log all access to student records."""
    log = ActivityLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata,
        ip_address=request.client.host,
        user_agent=request.headers.get("User-Agent")
    )
    db.add(log)
    db.commit()
```

### COPPA (Children's Online Privacy Protection Act)

**Key Requirements:**
- ✅ No student accounts (teacher-only system)
- ✅ No collection of PII from students <13
- ✅ Parental consent mechanism (teacher as intermediary)
- ✅ No behavioral advertising (we don't use ads)

**Parent Opt-Out:**
```python
class Student(Base):
    __tablename__ = "students"
    
    parent_opt_out = Column(Boolean, default=False)
    parent_email = Column(String)  # For opt-out notifications
    
    @property
    def can_use_ai_grading(self) -> bool:
        """Check if AI grading is allowed (respects opt-out)."""
        return not self.parent_opt_out
```

### GDPR (General Data Protection Regulation)

**Key Requirements:**
- ✅ Right to access (export user data)
- ✅ Right to deletion (hard delete on request)
- ✅ Right to portability (CSV/JSON export)
- ✅ Privacy policy & terms of service
- ✅ Data retention policy

**Implementation:**
```python
@router.post("/users/me/export")
async def export_user_data(current_user: User = Depends(get_current_user)):
    """
    Export all user data (GDPR compliance).
    
    Returns JSON with:
    - Profile
    - Classes
    - Assignments
    - Grades (anonymized students)
    """
    data = {
        "user": current_user.to_dict(),
        "classes": [c.to_dict() for c in current_user.classes],
        "assignments": [...],
        "activity_logs": [...]
    }
    
    return JSONResponse(content=data)

@router.delete("/users/me")
async def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete user account (GDPR right to deletion).
    
    Cascades:
    - Classes (deleted)
    - Students (deleted)
    - Assignments (deleted)
    - Submissions (deleted)
    - Grades (deleted)
    """
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted permanently"}
```

---

## Incident Response

### Security Incident Plan

**Severity Levels:**
| Level | Description | Response Time |
|-------|-------------|---------------|
| **P0 (Critical)** | Data breach, active attack | Immediate |
| **P1 (High)** | Vulnerability exploited | <1 hour |
| **P2 (Medium)** | Security flaw discovered | <24 hours |
| **P3 (Low)** | Minor security concern | <1 week |

**Incident Response Steps:**
1. **Detect** - Monitoring alerts, user reports
2. **Contain** - Disable compromised accounts, block IPs
3. **Investigate** - Review logs, identify scope
4. **Remediate** - Fix vulnerability, restore services
5. **Notify** - Inform affected users (legal requirement)
6. **Review** - Post-mortem, update procedures

**Notification Template:**
```
Subject: Security Notice - HandMark Data Incident

Dear [Teacher Name],

We are writing to inform you of a security incident that may have 
affected your HandMark account.

WHAT HAPPENED:
[Brief description]

WHAT DATA WAS AFFECTED:
[List affected data types]

WHAT WE'VE DONE:
[Remediation steps]

WHAT YOU SHOULD DO:
- Change your password immediately
- Review your account activity
- Contact us if you notice anything unusual

We sincerely apologize for this incident and are taking steps to 
prevent future occurrences.

Questions? Contact security@handmark.app

HandMark Security Team
```

### Vulnerability Disclosure

**Report Security Issues:**
- **Email:** security@handmark.app
- **PGP Key:** [Public key for encrypted reports]
- **Response Time:** <24 hours acknowledgment

**Bug Bounty (Future):**
- Rewards for responsible disclosure
- Scope: Application logic, authentication, data leaks
- Out of scope: DDoS, social engineering

---

## Monitoring & Logging

### Security Monitoring

**Alerts:**
```python
# Suspicious activity patterns
- Failed login attempts (>5 in 5 minutes)
- Access to unauthorized resources (403 errors spike)
- Unusual API usage (rate limit violations)
- Large data exports (>1000 student records)
- Admin privilege escalation attempts
```

**Log Retention:**
- **Application logs:** 90 days
- **Activity logs:** 7 years (FERPA requirement)
- **Error logs:** 1 year
- **Access logs:** 1 year

### Secure Logging

**✅ Do:**
```python
logger.info(
    "User accessed assignment",
    extra={
        "user_id": user.id,
        "assignment_id": assignment.id,
        "action": "view"
    }
)
```

**❌ Don't:**
```python
# DON'T log sensitive data
logger.info(f"User {user.email} accessed grade {grade.score}")  # No!

# DON'T log tokens
logger.info(f"JWT token: {token}")  # No!
```

---

## Security Checklist

### Pre-Deployment
- [ ] All dependencies up-to-date (no known CVEs)
- [ ] Environment variables secured (not in Git)
- [ ] Database backups automated
- [ ] HTTPS/TLS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] RLS policies tested
- [ ] Security headers configured (HSTS, CSP, etc.)
- [ ] Monitoring/alerting configured
- [ ] Incident response plan documented

### Ongoing
- [ ] Weekly dependency updates
- [ ] Monthly security reviews
- [ ] Quarterly penetration testing
- [ ] Annual FERPA compliance audit
- [ ] Review access logs weekly
- [ ] Test backup restoration monthly

---

## Security Headers

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Force HTTPS
app.add_middleware(HTTPSRedirectMiddleware)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["app.handmark.app", "api.handmark.app"]
)

# Security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' https://*; script-src 'self'"
    return response
```

---

## Third-Party Security

### Vendor Security Assessment

| Vendor | Purpose | Security Review |
|--------|---------|----------------|
| **Supabase** | Database + Auth | ✅ SOC 2 Type II, ISO 27001 |
| **Anthropic** | AI (Claude) | ✅ DPA signed, no data retention |
| **Vercel** | Frontend Hosting | ✅ SOC 2 Type II |
| **Railway** | Backend Hosting | ✅ ISO 27001 |
| **Sentry** | Error Monitoring | ✅ DPA signed, PII scrubbing |

**Data Processing Agreements (DPAs):**
- Signed with all vendors handling student data
- Reviewed annually
- Require notification of breaches within 24 hours

---

## Conclusion

Security is everyone's responsibility. When in doubt:
1. **Ask** - Discuss security concerns openly
2. **Document** - Record security decisions
3. **Test** - Verify security controls work
4. **Report** - Escalate vulnerabilities immediately

**Questions?** Contact security@handmark.app

---

*Security Documentation v1.0 - Last updated February 6, 2026*
