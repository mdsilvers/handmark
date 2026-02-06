# HandMark Coding Standards

**Version:** 1.0  
**Last Updated:** February 6, 2026  
**Team:** HandMark Development

---

## Philosophy

**Code is written once, read many times.**  
Write for clarity, not cleverness. Favor explicit over implicit. Optimize for maintainability.

**Key Principles:**
1. **Type Safety** - TypeScript/Python type hints everywhere
2. **Consistency** - Follow conventions, use linters/formatters
3. **Simplicity** - Avoid premature optimization, YAGNI
4. **Testability** - Write code that's easy to test
5. **Documentation** - Code explains "how", comments explain "why"

---

## TypeScript / React (Frontend)

### File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Route groups
│   │   └── login/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   └── input.tsx
│   ├── dashboard/        # Feature-specific components
│   │   ├── DashboardLayout.tsx
│   │   └── AssignmentCard.tsx
│   └── shared/           # Reusable components
│       ├── EmptyState.tsx
│       └── LoadingSpinner.tsx
├── lib/                  # Utilities
│   ├── utils.ts          # Helper functions
│   ├── api.ts            # API client
│   └── constants.ts      # Constants
├── hooks/                # Custom React hooks
│   ├── useAssignments.ts
│   └── useAuth.ts
├── stores/               # Zustand stores
│   └── authStore.ts
├── types/                # TypeScript types
│   ├── api.ts
│   └── models.ts
└── styles/               # Additional styles (if needed)
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `AssignmentCard.tsx` |
| **Hooks** | camelCase, `use` prefix | `useAssignments.ts` |
| **Utilities** | camelCase | `formatDate.ts` |
| **Types/Interfaces** | PascalCase | `Assignment`, `User` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Variables** | camelCase | `userName`, `isLoading` |
| **CSS Classes** | kebab-case | `assignment-card` |

### Component Patterns

#### Functional Components (Preferred)
```tsx
// ✅ Good: Explicit typing, clear props
interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (id: string) => void;
  className?: string;
}

export function AssignmentCard({ 
  assignment, 
  onEdit,
  className 
}: AssignmentCardProps) {
  return (
    <div className={cn("card", className)}>
      <h3>{assignment.title}</h3>
      <Button onClick={() => onEdit(assignment.id)}>
        Edit
      </Button>
    </div>
  );
}
```

#### Client vs Server Components
```tsx
// ✅ Server Component (default in Next.js 14)
export default async function DashboardPage() {
  const assignments = await fetchAssignments(); // Server-side fetch
  return <AssignmentList assignments={assignments} />;
}

// ✅ Client Component (interactive)
'use client';

export function AssignmentForm() {
  const [title, setTitle] = useState('');
  // ... interactive logic
  return <form>...</form>;
}
```

#### Hook Patterns
```tsx
// ✅ Custom hook with proper typing
export function useAssignments(classId: string) {
  return useQuery({
    queryKey: ['assignments', classId],
    queryFn: () => api.getAssignments({ classId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage
const { data: assignments, isLoading, error } = useAssignments(classId);
```

### TypeScript Best Practices

#### Strict Mode (Always Enabled)
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

#### Type Definitions
```tsx
// ✅ Good: Explicit types for API responses
type Assignment = {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'closed'; // Union type
  dueDate: string | null; // Nullable
  stats: {
    totalSubmissions: number;
    gradedCount: number;
  };
};

// ✅ Use Partial for optional fields
type UpdateAssignmentPayload = Partial<Pick<Assignment, 'title' | 'status'>>;

// ❌ Avoid: 'any' type
const data: any = await fetch(...); // Don't do this

// ✅ Use 'unknown' when type is truly unknown
const data: unknown = await fetch(...);
if (isAssignment(data)) {
  // Type guard
  console.log(data.title);
}
```

#### Avoid Non-null Assertions
```tsx
// ❌ Avoid: Non-null assertion (!)
const user = users.find(u => u.id === id)!; // Dangerous

// ✅ Better: Handle null case
const user = users.find(u => u.id === id);
if (!user) {
  throw new Error('User not found');
}
console.log(user.name);
```

### React Best Practices

#### Prop Destructuring
```tsx
// ✅ Good: Destructure props in function signature
function Card({ title, children, className }: CardProps) {
  return <div className={className}>{title}{children}</div>;
}

// ❌ Avoid: Using props object directly
function Card(props: CardProps) {
  return <div>{props.title}{props.children}</div>;
}
```

#### Conditional Rendering
```tsx
// ✅ Good: Clear conditional logic
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && <AssignmentList assignments={data} />}

// ✅ Good: Early return for complex conditions
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <AssignmentList assignments={data} />;
```

#### Event Handlers
```tsx
// ✅ Good: Inline arrow functions for simple cases
<Button onClick={() => onEdit(assignment.id)}>Edit</Button>

// ✅ Good: Named function for complex logic
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  // ... complex logic
}
<form onSubmit={handleSubmit}>...</form>
```

### State Management

#### React Query (Server State)
```tsx
// ✅ Queries for fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['assignments', classId],
  queryFn: () => api.getAssignments({ classId }),
});

// ✅ Mutations for updates
const mutation = useMutation({
  mutationFn: (data: CreateAssignmentPayload) => api.createAssignment(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
  },
});
```

#### Zustand (UI State)
```tsx
// stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

// Usage
const { user, logout } = useAuthStore();
```

### Styling

#### Tailwind CSS Conventions
```tsx
// ✅ Good: Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "rounded-lg p-4 border",
  isActive && "bg-blue-50 border-blue-500",
  className
)}>
  ...
</div>

// ✅ Group related utilities
<Button className="
  flex items-center gap-2
  px-4 py-2
  rounded-md
  bg-blue-500 hover:bg-blue-600
  text-white font-medium
">
  Save
</Button>
```

#### CSS Modules (When Needed)
```css
/* Card.module.css */
.card {
  @apply rounded-lg border p-4;
}

.card--active {
  @apply bg-blue-50 border-blue-500;
}
```

---

## Python / FastAPI (Backend)

### File Organization

```
backend/
├── app/
│   ├── main.py                # FastAPI app
│   ├── core/
│   │   ├── config.py          # Settings (Pydantic)
│   │   ├── security.py        # Auth utilities
│   │   └── database.py        # Database connection
│   ├── api/
│   │   ├── deps.py            # Dependencies (auth, db)
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── assignments.py
│   │       └── grades.py
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py
│   │   ├── assignment.py
│   │   └── grade.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── user.py
│   │   ├── assignment.py
│   │   └── grade.py
│   ├── services/              # Business logic
│   │   ├── grading_service.py
│   │   └── upload_service.py
│   ├── tasks/                 # Celery tasks
│   │   └── grade_submission.py
│   └── utils/                 # Utilities
│       ├── logging.py
│       └── validators.py
├── tests/
│   ├── conftest.py            # Pytest fixtures
│   ├── test_api/
│   └── test_services/
├── alembic/                   # Database migrations
│   └── versions/
├── requirements.txt
└── pyproject.toml
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Files/Modules** | snake_case | `grading_service.py` |
| **Classes** | PascalCase | `GradingService` |
| **Functions** | snake_case | `create_assignment()` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Private** | `_` prefix | `_validate_rubric()` |

### Type Hints (Required)

```python
# ✅ Good: Full type hints
from typing import Optional, List
from uuid import UUID

def get_assignment(
    db: Session,
    assignment_id: UUID,
    user_id: UUID
) -> Optional[Assignment]:
    """Fetch assignment by ID if user has access."""
    return db.query(Assignment)\
        .filter(Assignment.id == assignment_id)\
        .filter(Assignment.user_id == user_id)\
        .first()

# ❌ Avoid: No type hints
def get_assignment(db, assignment_id, user_id):
    return db.query(Assignment).filter(...).first()
```

### FastAPI Patterns

#### Route Definition
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.assignment import Assignment, AssignmentCreate
from app.models.user import User

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("/", response_model=Assignment, status_code=201)
async def create_assignment(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    payload: AssignmentCreate
) -> Assignment:
    """Create new assignment."""
    # Validate class ownership
    class_obj = db.query(Class).filter(Class.id == payload.class_id).first()
    if not class_obj or class_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Create assignment
    assignment = Assignment(**payload.dict(), user_id=current_user.id)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    return assignment
```

#### Dependency Injection
```python
# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import verify_token
from app.models.user import User

security = HTTPBearer()

def get_db() -> Generator[Session, None, None]:
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(security)
) -> User:
    """Get authenticated user from JWT token."""
    payload = verify_token(token.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
```

### Pydantic Schemas

```python
from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# Base schema (shared fields)
class AssignmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    instructions: Optional[str] = None
    grading_mode: str = Field(..., regex="^(rubric|answer_key)$")
    due_date: Optional[datetime] = None

# Create schema (input)
class AssignmentCreate(AssignmentBase):
    class_id: UUID
    rubric_id: Optional[UUID] = None
    
    @validator("rubric_id")
    def validate_rubric(cls, v, values):
        if values.get("grading_mode") == "rubric" and not v:
            raise ValueError("rubric_id required for rubric grading mode")
        return v

# Read schema (output)
class Assignment(AssignmentBase):
    id: UUID
    class_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True  # Enable ORM model conversion
```

### SQLAlchemy Models

```python
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime

class Assignment(Base):
    __tablename__ = "assignments"
    
    # Columns
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=False)
    title = Column(String(200), nullable=False)
    instructions = Column(Text)
    grading_mode = Column(String(20), nullable=False)
    rubric_id = Column(UUID(as_uuid=True), ForeignKey("rubrics.id"))
    answer_key_data = Column(JSONB)
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    class_ = relationship("Class", back_populates="assignments")
    rubric = relationship("Rubric")
    submissions = relationship("Submission", back_populates="assignment")
    
    # Indexes
    __table_args__ = (
        Index("idx_assignments_class_id", "class_id"),
        Index("idx_assignments_status", "status"),
    )
```

### Service Layer Pattern

```python
# app/services/grading_service.py
from anthropic import Anthropic
from app.models.grade import Grade
from app.schemas.grade import GradeCreate

class GradingService:
    """AI grading service using Claude."""
    
    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
    
    async def grade_submission(
        self,
        image_url: str,
        rubric: dict,
        assignment_type: str
    ) -> GradeCreate:
        """
        Grade student submission using Claude.
        
        Args:
            image_url: URL of student work image
            rubric: Rubric criteria dict
            assignment_type: Type of assignment
            
        Returns:
            GradeCreate schema with scores and feedback
            
        Raises:
            GradingError: If AI grading fails
        """
        try:
            # Build prompt
            prompt = self._build_grading_prompt(rubric, assignment_type)
            
            # Call Claude API
            response = await self.client.messages.create(
                model="claude-sonnet-4.5",
                max_tokens=2000,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "image", "source": {"url": image_url}},
                            {"type": "text", "text": prompt}
                        ]
                    }
                ]
            )
            
            # Parse response
            grade_data = self._parse_response(response.content[0].text)
            
            return GradeCreate(**grade_data)
        
        except Exception as e:
            raise GradingError(f"Grading failed: {str(e)}")
    
    def _build_grading_prompt(self, rubric: dict, assignment_type: str) -> str:
        """Build Claude prompt from rubric."""
        # ... implementation
        pass
    
    def _parse_response(self, response_text: str) -> dict:
        """Parse Claude response into grade dict."""
        # ... implementation
        pass
```

### Celery Tasks

```python
# app/tasks/grade_submission.py
from celery import Task
from app.tasks.celery_app import celery
from app.services.grading_service import GradingService
from app.core.database import SessionLocal
from app.models.submission import Submission

@celery.task(bind=True, max_retries=3)
def grade_submission_task(self: Task, submission_id: str) -> str:
    """
    Background task to grade submission.
    
    Args:
        submission_id: Submission UUID
        
    Returns:
        Grade UUID
    """
    db = SessionLocal()
    
    try:
        # Fetch submission
        submission = db.query(Submission).filter(
            Submission.id == submission_id
        ).first()
        
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")
        
        # Update status
        submission.status = "grading"
        db.commit()
        
        # Grade with AI
        grading_service = GradingService(api_key=settings.ANTHROPIC_API_KEY)
        grade_data = await grading_service.grade_submission(
            image_url=submission.image_url,
            rubric=submission.assignment.rubric.criteria,
            assignment_type=submission.assignment.grading_mode
        )
        
        # Store grade
        grade = Grade(**grade_data.dict(), submission_id=submission_id)
        db.add(grade)
        db.commit()
        
        return str(grade.id)
    
    except Exception as e:
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=2 ** self.request.retries)
    
    finally:
        db.close()
```

### Error Handling

```python
# ✅ Good: Specific exceptions
from fastapi import HTTPException, status

class ResourceNotFoundError(Exception):
    """Resource not found."""
    pass

class PermissionDeniedError(Exception):
    """User lacks permission."""
    pass

# Exception handler
@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "NOT_FOUND", "message": str(exc)}}
    )

# Usage in routes
def get_assignment(db: Session, assignment_id: UUID) -> Assignment:
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise ResourceNotFoundError(f"Assignment {assignment_id} not found")
    return assignment
```

---

## General Best Practices

### Code Comments

```python
# ✅ Good: Explain WHY, not WHAT
# Retry 3 times because Claude API occasionally has transient errors
@retry(max_attempts=3, backoff=exponential_backoff)
def call_claude_api():
    ...

# ❌ Avoid: Obvious comments
# Add 1 to counter
counter += 1
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# ✅ Good: Structured logging with context
logger.info(
    "Grading submission",
    extra={
        "submission_id": submission_id,
        "assignment_id": assignment.id,
        "user_id": current_user.id
    }
)

# ❌ Avoid: Print statements
print(f"Grading {submission_id}")
```

### Error Messages

```python
# ✅ Good: User-friendly, actionable
raise HTTPException(
    status_code=422,
    detail="File size exceeds 10MB limit. Please compress the image and try again."
)

# ❌ Avoid: Technical jargon
raise Exception("EFILESIZE: 10485760 bytes exceeded")
```

---

## Testing Standards

### Frontend Testing

```tsx
// ✅ Good: Test user behavior, not implementation
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignmentCard } from './AssignmentCard';

test('calls onEdit when edit button is clicked', () => {
  const onEdit = jest.fn();
  const assignment = { id: '123', title: 'Math Quiz' };
  
  render(<AssignmentCard assignment={assignment} onEdit={onEdit} />);
  
  fireEvent.click(screen.getByText('Edit'));
  expect(onEdit).toHaveBeenCalledWith('123');
});
```

### Backend Testing

```python
# ✅ Good: Test with real database (use fixtures)
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User

@pytest.fixture
def test_user(db):
    user = User(email="test@example.com", name="Test User")
    db.add(user)
    db.commit()
    return user

def test_create_assignment(client: TestClient, test_user: User):
    response = client.post(
        "/assignments",
        json={"title": "Math Quiz", "class_id": str(test_user.classes[0].id)},
        headers={"Authorization": f"Bearer {test_user.token}"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Math Quiz"
```

---

## Git Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Maintenance (dependencies, config)

**Examples:**
```
feat(grading): Add AI confidence threshold filter

Grades below 80% confidence are now flagged for manual review.
Implements issue #42.

fix(upload): Handle corrupted image files gracefully

Previously crashed on corrupted JPEG. Now catches error and shows
user-friendly message.

Closes #38
```

---

## Code Review Checklist

**Before submitting PR:**
- [ ] Code passes all linters (ESLint, Prettier, Black, mypy)
- [ ] All tests pass (`npm test`, `pytest`)
- [ ] Type hints added (backend)
- [ ] Error handling implemented
- [ ] Logging added for important actions
- [ ] Documentation updated (if API changed)
- [ ] No console.log() or print() statements

**Reviewer checklist:**
- [ ] Code is readable and maintainable
- [ ] Edge cases handled
- [ ] Security implications considered
- [ ] Performance implications considered
- [ ] Tests cover new functionality

---

*Coding Standards v1.0 - Last updated February 6, 2026*
