# HandMark API Contracts

**Version:** 1.0  
**Base URL:** `https://api.handmark.app/v1`  
**Protocol:** REST + WebSocket  
**Auth:** Bearer JWT tokens

---

## Overview

All API endpoints follow REST principles with consistent patterns:
- **Successful responses:** HTTP 200-299 with JSON body
- **Errors:** HTTP 400-599 with error envelope
- **Authentication:** Required for all endpoints except health checks
- **Rate limiting:** 100 requests/minute per user

---

## Authentication

### Bearer Token Format
```http
Authorization: Bearer <jwt_token>
```

All authenticated endpoints require a valid JWT token obtained from the authentication flow.

---

## Common Patterns

### Success Response Envelope
```json
{
  "data": { /* resource data */ },
  "meta": {
    "timestamp": "2026-02-06T14:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response Envelope
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "request_id": "req_abc123"
  }
}
```

### Pagination Pattern
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 250,
    "total_pages": 5
  }
}
```

---

## Authentication Endpoints

### POST /auth/google
Exchange Google OAuth code for session tokens.

**Request:**
```http
POST /v1/auth/google
Content-Type: application/json

{
  "code": "google_oauth_authorization_code",
  "redirect_uri": "https://app.handmark.app/auth/callback"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "teacher@school.edu",
    "name": "Sarah Johnson",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "role": "teacher",
    "created_at": "2026-02-01T12:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_at": 1675268400,
    "token_type": "Bearer"
  }
}
```

**Errors:**
- `400 INVALID_CODE` - Google OAuth code is invalid or expired
- `500 AUTH_SERVICE_ERROR` - Google OAuth service unavailable

---

### POST /auth/refresh
Refresh expired access token.

**Request:**
```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "expires_at": 1675268400
}
```

**Errors:**
- `401 INVALID_REFRESH_TOKEN` - Refresh token is invalid or expired

---

### POST /auth/logout
Invalidate current session.

**Request:**
```http
POST /v1/auth/logout
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## User Endpoints

### GET /users/me
Get current user profile.

**Request:**
```http
GET /v1/users/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "teacher@school.edu",
  "name": "Sarah Johnson",
  "avatar_url": "https://...",
  "role": "teacher",
  "subscription_tier": "free",
  "created_at": "2026-02-01T12:00:00Z",
  "last_login_at": "2026-02-06T14:30:00Z"
}
```

---

### PATCH /users/me
Update user profile.

**Request:**
```http
PATCH /v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sarah Rodriguez",
  "avatar_url": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "teacher@school.edu",
  "name": "Sarah Rodriguez",
  "avatar_url": "https://...",
  "updated_at": "2026-02-06T14:35:00Z"
}
```

---

## Class Endpoints

### GET /classes
List user's classes.

**Request:**
```http
GET /v1/classes?page=1&per_page=50&archived=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `per_page` (optional): Items per page, default 50, max 100
- `archived` (optional): Include archived classes, default false

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "class-uuid-1",
      "name": "3rd Period Math",
      "grade_level": "3rd",
      "subject": "Math",
      "academic_year": "2025-2026",
      "student_count": 25,
      "assignment_count": 12,
      "created_at": "2026-02-01T12:00:00Z",
      "updated_at": "2026-02-06T14:00:00Z",
      "archived_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 5,
    "total_pages": 1
  }
}
```

---

### POST /classes
Create new class.

**Request:**
```http
POST /v1/classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "3rd Period Math",
  "grade_level": "3rd",
  "subject": "Math",
  "academic_year": "2025-2026"
}
```

**Response:** `201 Created`
```json
{
  "id": "class-uuid-1",
  "name": "3rd Period Math",
  "grade_level": "3rd",
  "subject": "Math",
  "academic_year": "2025-2026",
  "student_count": 0,
  "assignment_count": 0,
  "created_at": "2026-02-06T14:40:00Z"
}
```

**Errors:**
- `422 VALIDATION_ERROR` - Invalid input (missing name, etc.)

---

### GET /classes/:id
Get class details.

**Response:** `200 OK`
```json
{
  "id": "class-uuid-1",
  "name": "3rd Period Math",
  "grade_level": "3rd",
  "subject": "Math",
  "academic_year": "2025-2026",
  "student_count": 25,
  "assignment_count": 12,
  "created_at": "2026-02-01T12:00:00Z"
}
```

---

### PATCH /classes/:id
Update class.

**Request:**
```http
PATCH /v1/classes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "4th Period Math"
}
```

**Response:** `200 OK`

---

### DELETE /classes/:id
Archive class (soft delete).

**Request:**
```http
DELETE /v1/classes/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Student Endpoints

### GET /classes/:id/students
Get class roster.

**Request:**
```http
GET /v1/classes/:id/students?page=1&per_page=50
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "student-uuid-1",
      "class_id": "class-uuid-1",
      "name": "Emma Johnson",
      "email": "emma@school.edu",
      "student_id": "12345",
      "created_at": "2026-02-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 25,
    "total_pages": 1
  }
}
```

---

### POST /classes/:id/students
Add student to class.

**Request:**
```http
POST /v1/classes/:id/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Emma Johnson",
  "email": "emma@school.edu",
  "student_id": "12345"
}
```

**Response:** `201 Created`
```json
{
  "id": "student-uuid-1",
  "class_id": "class-uuid-1",
  "name": "Emma Johnson",
  "email": "emma@school.edu",
  "student_id": "12345",
  "created_at": "2026-02-06T15:00:00Z"
}
```

---

### POST /classes/:id/students/import
Bulk import students.

**Request (CSV):**
```http
POST /v1/classes/:id/students/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "source": "csv",
  "csv_data": "name,email,student_id\nEmma Johnson,emma@school.edu,12345\n..."
}
```

**Request (Google Classroom):**
```json
{
  "source": "google_classroom",
  "classroom_id": "google_classroom_course_id"
}
```

**Response:** `200 OK`
```json
{
  "imported": 25,
  "skipped": 2,
  "errors": [
    {
      "row": 3,
      "reason": "Duplicate student_id"
    }
  ]
}
```

---

## Rubric Endpoints

### GET /rubrics
List rubrics (personal + templates).

**Request:**
```http
GET /v1/rubrics?template=true&subject=math&page=1
Authorization: Bearer <token>
```

**Query Parameters:**
- `template` (optional): Filter templates only, default false
- `subject` (optional): Filter by subject
- `page` (optional): Page number

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "rubric-uuid-1",
      "name": "Math Problem Solving",
      "description": "3rd grade math rubric",
      "is_template": true,
      "subject": "Math",
      "grade_level": "3rd",
      "criteria_count": 3,
      "max_points": 15,
      "created_at": "2026-02-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 42,
    "total_pages": 1
  }
}
```

---

### GET /rubrics/:id
Get rubric details (with full criteria).

**Response:** `200 OK`
```json
{
  "id": "rubric-uuid-1",
  "name": "Math Problem Solving",
  "description": "3rd grade math rubric",
  "is_template": true,
  "criteria": [
    {
      "id": "crit_1",
      "name": "Correct Answer",
      "description": "Student provides correct final answer",
      "max_points": 5,
      "levels": [
        {
          "points": 5,
          "description": "Completely correct"
        },
        {
          "points": 3,
          "description": "Minor calculation error"
        },
        {
          "points": 0,
          "description": "Incorrect or missing"
        }
      ]
    },
    {
      "id": "crit_2",
      "name": "Shows Work",
      "description": "Student shows all steps",
      "max_points": 3,
      "levels": [
        {
          "points": 3,
          "description": "All steps shown clearly"
        },
        {
          "points": 2,
          "description": "Most steps shown"
        },
        {
          "points": 0,
          "description": "No work shown"
        }
      ]
    }
  ],
  "created_at": "2026-02-01T12:00:00Z"
}
```

---

### POST /rubrics
Create custom rubric.

**Request:**
```http
POST /v1/rubrics
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Math Problem Solving",
  "description": "3rd grade math rubric",
  "criteria": [
    {
      "name": "Correct Answer",
      "description": "Student provides correct final answer",
      "max_points": 5,
      "levels": [
        { "points": 5, "description": "Completely correct" },
        { "points": 3, "description": "Minor error" },
        { "points": 0, "description": "Incorrect" }
      ]
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "rubric-uuid-1",
  "name": "Math Problem Solving",
  "created_at": "2026-02-06T15:30:00Z"
}
```

**Errors:**
- `422 VALIDATION_ERROR` - Invalid rubric structure (missing fields, invalid points, etc.)

---

## Assignment Endpoints

### GET /assignments
List assignments.

**Request:**
```http
GET /v1/assignments?class_id=class-uuid-1&status=active&page=1
Authorization: Bearer <token>
```

**Query Parameters:**
- `class_id` (optional): Filter by class
- `status` (optional): Filter by status (draft, active, closed, archived)
- `page` (optional): Page number

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "assignment-uuid-1",
      "title": "Math Chapter 3 Quiz",
      "class_id": "class-uuid-1",
      "class_name": "3rd Period Math",
      "status": "active",
      "grading_mode": "rubric",
      "submission_count": 23,
      "graded_count": 15,
      "pending_count": 8,
      "average_score": 82.5,
      "due_date": "2026-02-10T23:59:59Z",
      "created_at": "2026-02-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 12,
    "total_pages": 1
  }
}
```

---

### GET /assignments/:id
Get assignment details with submissions.

**Response:** `200 OK`
```json
{
  "id": "assignment-uuid-1",
  "title": "Math Chapter 3 Quiz",
  "instructions": "Show all work. No calculators.",
  "class_id": "class-uuid-1",
  "class_name": "3rd Period Math",
  "status": "active",
  "grading_mode": "rubric",
  "rubric": {
    "id": "rubric-uuid-1",
    "name": "Math Problem Solving",
    "criteria": [ /* full criteria */ ]
  },
  "due_date": "2026-02-10T23:59:59Z",
  "submissions": [
    {
      "id": "submission-uuid-1",
      "student_id": "student-uuid-1",
      "student_name": "Emma Johnson",
      "status": "graded",
      "score": 42,
      "max_score": 50,
      "percentage": 84.0,
      "submitted_at": "2026-02-10T14:30:00Z",
      "graded_at": "2026-02-10T14:31:00Z"
    }
  ],
  "stats": {
    "total_submissions": 25,
    "graded": 23,
    "pending": 2,
    "average_score": 82.5,
    "median_score": 84.0,
    "score_distribution": {
      "90-100": 8,
      "80-89": 10,
      "70-79": 4,
      "60-69": 1,
      "0-59": 0
    }
  },
  "created_at": "2026-02-06T10:00:00Z"
}
```

---

### POST /assignments
Create new assignment.

**Request:**
```http
POST /v1/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "class_id": "class-uuid-1",
  "title": "Math Chapter 3 Quiz",
  "instructions": "Show all work. No calculators.",
  "grading_mode": "rubric",
  "rubric_id": "rubric-uuid-1",
  "due_date": "2026-02-10T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "id": "assignment-uuid-1",
  "title": "Math Chapter 3 Quiz",
  "class_id": "class-uuid-1",
  "status": "draft",
  "created_at": "2026-02-06T16:00:00Z"
}
```

**Errors:**
- `422 VALIDATION_ERROR` - Missing required fields
- `404 RUBRIC_NOT_FOUND` - Invalid rubric_id
- `404 CLASS_NOT_FOUND` - Invalid class_id

---

### PATCH /assignments/:id
Update assignment.

**Request:**
```http
PATCH /v1/assignments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Math Chapter 3 Quiz (Revised)",
  "status": "active"
}
```

**Response:** `200 OK`

---

## Submission Endpoints

### POST /submissions/upload
Upload student work.

**Request:**
```http
POST /v1/submissions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

assignment_id=assignment-uuid-1
files=@image1.jpg,@image2.jpg
student_mapping={"image1.jpg": "student-uuid-1"}
```

**Form Fields:**
- `assignment_id` (required): Assignment UUID
- `files` (required): One or more image files (JPEG, PNG, PDF)
- `student_mapping` (optional): JSON mapping filenames to student UUIDs

**Response:** `200 OK`
```json
{
  "uploaded": 2,
  "submissions": [
    {
      "id": "submission-uuid-1",
      "assignment_id": "assignment-uuid-1",
      "student_id": "student-uuid-1",
      "student_name": "Emma Johnson",
      "image_url": "https://storage.supabase.co/...",
      "image_thumbnail_url": "https://storage.supabase.co/..._thumb.jpg",
      "status": "pending",
      "created_at": "2026-02-06T16:15:00Z"
    }
  ],
  "errors": []
}
```

**Errors:**
- `422 INVALID_FILE_TYPE` - File type not supported
- `413 FILE_TOO_LARGE` - File exceeds 10MB limit
- `404 ASSIGNMENT_NOT_FOUND` - Invalid assignment_id

---

### POST /submissions/:id/grade
Trigger AI grading for single submission.

**Request:**
```http
POST /v1/submissions/:id/grade
Authorization: Bearer <token>
Content-Type: application/json

{
  "priority": "high"
}
```

**Response:** `202 Accepted`
```json
{
  "submission_id": "submission-uuid-1",
  "status": "queued",
  "queue_position": 3,
  "estimated_time_seconds": 45
}
```

---

### POST /assignments/:id/grade-all
Grade all pending submissions in assignment.

**Request:**
```http
POST /v1/assignments/:id/grade-all
Authorization: Bearer <token>
```

**Response:** `202 Accepted`
```json
{
  "assignment_id": "assignment-uuid-1",
  "queued": 25,
  "estimated_time_seconds": 750
}
```

---

### GET /submissions/:id/status
Poll grading status.

**Request:**
```http
GET /v1/submissions/:id/status
Authorization: Bearer <token>
```

**Response (Pending):** `200 OK`
```json
{
  "submission_id": "submission-uuid-1",
  "status": "pending",
  "queue_position": 5,
  "estimated_time_seconds": 75
}
```

**Response (Grading):** `200 OK`
```json
{
  "submission_id": "submission-uuid-1",
  "status": "grading",
  "progress": 60
}
```

**Response (Completed):** `200 OK`
```json
{
  "submission_id": "submission-uuid-1",
  "status": "graded",
  "grade": {
    "id": "grade-uuid-1",
    "total_score": 42,
    "max_score": 50,
    "percentage": 84.0,
    "ai_confidence": 0.92,
    "graded_at": "2026-02-06T16:16:30Z"
  }
}
```

---

## Grade Endpoints

### GET /grades/:id
Get grade details.

**Response:** `200 OK`
```json
{
  "id": "grade-uuid-1",
  "submission_id": "submission-uuid-1",
  "total_score": 42,
  "max_score": 50,
  "percentage": 84.0,
  "criteria_scores": [
    {
      "criterion_id": "crit_1",
      "criterion_name": "Correct Answer",
      "score": 3,
      "max_score": 5,
      "reasoning": "Student used correct method but made calculation error in step 3"
    },
    {
      "criterion_id": "crit_2",
      "criterion_name": "Shows Work",
      "score": 3,
      "max_score": 3,
      "reasoning": "All steps shown clearly"
    }
  ],
  "feedback_text": "Great effort! Check your subtraction in problem 3.",
  "ai_confidence": 0.92,
  "ai_model": "claude-sonnet-4.5",
  "teacher_approved": false,
  "teacher_modified": false,
  "teacher_notes": null,
  "created_at": "2026-02-06T16:16:30Z"
}
```

---

### PATCH /grades/:id
Edit grade (teacher override).

**Request:**
```http
PATCH /v1/grades/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "criteria_scores": [
    {
      "criterion_id": "crit_1",
      "score": 5
    }
  ],
  "teacher_notes": "Gave full credit for excellent reasoning"
}
```

**Response:** `200 OK`
```json
{
  "id": "grade-uuid-1",
  "total_score": 44,
  "percentage": 88.0,
  "teacher_modified": true,
  "updated_at": "2026-02-06T16:20:00Z"
}
```

---

### POST /grades/:id/approve
Approve AI grade.

**Request:**
```http
POST /v1/grades/:id/approve
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "grade-uuid-1",
  "teacher_approved": true,
  "reviewed_at": "2026-02-06T16:25:00Z"
}
```

---

## Export Endpoints

### POST /assignments/:id/export
Generate export file.

**Request:**
```http
POST /v1/assignments/:id/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "csv",
  "include_feedback": true
}
```

**Formats:**
- `csv` - Gradebook CSV
- `pdf` - Individual feedback slips (ZIP)
- `google_sheets` - Export to Google Sheets

**Response:** `202 Accepted`
```json
{
  "export_id": "export-uuid-1",
  "status": "processing",
  "estimated_time_seconds": 15
}
```

---

### GET /exports/:id
Get export status & download URL.

**Response (Processing):** `200 OK`
```json
{
  "export_id": "export-uuid-1",
  "status": "processing",
  "progress": 60
}
```

**Response (Completed):** `200 OK`
```json
{
  "export_id": "export-uuid-1",
  "status": "completed",
  "format": "csv",
  "download_url": "https://cdn.handmark.app/exports/...",
  "expires_at": "2026-02-06T17:00:00Z",
  "file_size_bytes": 12345
}
```

---

### POST /assignments/:id/sync-google-classroom
Push grades to Google Classroom.

**Request:**
```http
POST /v1/assignments/:id/sync-google-classroom
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "synced": 23,
  "failed": 2,
  "errors": [
    {
      "student_id": "student-uuid-1",
      "student_name": "Emma Johnson",
      "reason": "Student not found in Google Classroom roster"
    }
  ]
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.handmark.app', {
  auth: { token: 'jwt_token' }
});
```

### Client → Server: Subscribe to Assignment
```json
{
  "event": "subscribe:assignment",
  "data": {
    "assignment_id": "assignment-uuid-1"
  }
}
```

### Server → Client: Grading Progress
```json
{
  "event": "grading:progress",
  "data": {
    "assignment_id": "assignment-uuid-1",
    "total": 25,
    "completed": 15,
    "in_progress": 2,
    "pending": 8,
    "current": {
      "submission_id": "submission-uuid-10",
      "student_name": "Noah Brown"
    }
  }
}
```

### Server → Client: Submission Graded
```json
{
  "event": "grading:completed",
  "data": {
    "submission_id": "submission-uuid-1",
    "student_name": "Emma Johnson",
    "grade": {
      "id": "grade-uuid-1",
      "total_score": 42,
      "max_score": 50,
      "percentage": 84.0,
      "ai_confidence": 0.92
    }
  }
}
```

### Server → Client: Grading Error
```json
{
  "event": "grading:error",
  "data": {
    "submission_id": "submission-uuid-5",
    "student_name": "Noah Brown",
    "error": "Image quality too low for accurate grading",
    "recoverable": true
  }
}
```

---

## Error Codes

### Authentication & Authorization
- `401 AUTH_REQUIRED` - Missing or invalid authentication token
- `401 TOKEN_EXPIRED` - Access token has expired
- `401 INVALID_REFRESH_TOKEN` - Refresh token is invalid
- `403 PERMISSION_DENIED` - User lacks permission for resource

### Resource Errors
- `404 NOT_FOUND` - Resource does not exist
- `404 CLASS_NOT_FOUND` - Class ID not found
- `404 STUDENT_NOT_FOUND` - Student ID not found
- `404 ASSIGNMENT_NOT_FOUND` - Assignment ID not found
- `404 RUBRIC_NOT_FOUND` - Rubric ID not found

### Validation Errors
- `422 VALIDATION_ERROR` - Request body validation failed
- `422 INVALID_FILE_TYPE` - Unsupported file type
- `422 INVALID_RUBRIC` - Rubric structure is invalid
- `413 FILE_TOO_LARGE` - File exceeds size limit

### Rate Limiting
- `429 RATE_LIMIT_EXCEEDED` - Too many requests

### Service Errors
- `500 INTERNAL_SERVER_ERROR` - Unexpected server error
- `503 AI_SERVICE_UNAVAILABLE` - Claude API is unavailable
- `503 STORAGE_UNAVAILABLE` - File storage service unavailable

---

## Rate Limiting

### Default Limits
- **API requests:** 100 requests/minute per user
- **File uploads:** 50 files/minute per user
- **AI grading:** 100 submissions/hour (free tier), 1000/hour (pro tier)

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1675268400
```

### Rate Limit Exceeded Response
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retry_after": 60
  }
}
```

---

## Versioning

API versions are specified in the URL path:
- Current: `/v1/*`
- Future: `/v2/*` (when breaking changes introduced)

**Deprecation Policy:**
- 6-month notice for deprecated endpoints
- Old versions supported for 12 months minimum

---

## CORS Policy

```http
Access-Control-Allow-Origin: https://app.handmark.app
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

---

## Health Check

### GET /health
Public endpoint (no auth required).

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-06T16:30:00Z",
  "services": {
    "database": "healthy",
    "storage": "healthy",
    "queue": "healthy",
    "ai": "healthy"
  }
}
```

---

*API Contracts v1.0 - Last updated February 6, 2026*
