# HandMark Data Models

**Version:** 1.0  
**Database:** PostgreSQL 15 (Supabase)  
**ORM:** SQLAlchemy 2.0  
**Last Updated:** February 6, 2026

---

## Entity Relationship Diagram

```
┌──────────────┐
│    users     │
│ (teachers)   │
└───────┬──────┘
        │
        │ 1:N
        ▼
┌──────────────┐          ┌──────────────┐
│   classes    │◄─────────┤   schools    │
└───────┬──────┘   N:1    └──────────────┘
        │
        │ 1:N
        ├──────────────────────────┐
        │                          │
        ▼                          ▼
┌──────────────┐          ┌──────────────┐
│   students   │          │ assignments  │
└──────────────┘          └───────┬──────┘
                                  │
                                  │ N:1
                          ┌───────┴──────┐
                          │              │
                          ▼              ▼
                  ┌──────────────┐  ┌──────────────┐
                  │   rubrics    │  │ answer_keys  │
                  └──────────────┘  └──────────────┘
                                          │
        ┌─────────────────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────┐
│ submissions  │
└───────┬──────┘
        │
        │ 1:1
        ▼
┌──────────────┐
│    grades    │
└──────────────┘
```

---

## Core Tables

### users
Teachers who use the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | User unique identifier |
| `email` | TEXT | UNIQUE, NOT NULL | Email address |
| `name` | TEXT | | Display name |
| `avatar_url` | TEXT | | Profile picture URL |
| `google_id` | TEXT | UNIQUE | Google OAuth ID |
| `role` | TEXT | NOT NULL, DEFAULT 'teacher' | User role (teacher, admin) |
| `subscription_tier` | TEXT | DEFAULT 'free' | Subscription level |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| `last_login_at` | TIMESTAMPTZ | | Last login timestamp |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_google_id` on `google_id`

**Constraints:**
```sql
CHECK (role IN ('teacher', 'admin'))
CHECK (subscription_tier IN ('free', 'pro', 'enterprise'))
```

---

### schools
Schools or districts (multi-tenancy support).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | School unique identifier |
| `name` | TEXT | NOT NULL | School name |
| `district` | TEXT | | School district |
| `state` | TEXT | | State/province |
| `country` | TEXT | DEFAULT 'US' | Country code |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_schools_name` on `name`

---

### classes
Teacher's classes/courses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Class unique identifier |
| `user_id` | UUID | FK → users(id), NOT NULL | Teacher who owns class |
| `school_id` | UUID | FK → schools(id) | Associated school |
| `name` | TEXT | NOT NULL | Class name (e.g., "3rd Period Math") |
| `grade_level` | TEXT | | Grade level (e.g., "3rd", "6th") |
| `subject` | TEXT | | Subject (Math, ELA, Science, etc.) |
| `academic_year` | TEXT | | Academic year (e.g., "2025-2026") |
| `google_classroom_id` | TEXT | | Google Classroom ID (if synced) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| `archived_at` | TIMESTAMPTZ | | Soft delete timestamp |

**Indexes:**
- `idx_classes_user_id` on `user_id`
- `idx_classes_school_id` on `school_id`
- `idx_classes_archived_at` on `archived_at`

**Foreign Keys:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
```

---

### students
Student roster (per class).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Student unique identifier |
| `class_id` | UUID | FK → classes(id), NOT NULL | Associated class |
| `name` | TEXT | NOT NULL | Student full name |
| `email` | TEXT | | Student email (optional) |
| `student_id` | TEXT | | School-assigned student ID |
| `google_id` | TEXT | | Google Classroom user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_students_class_id` on `class_id`
- `idx_students_email` on `email`
- `idx_students_student_id` on `student_id`

**Foreign Keys:**
```sql
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
```

**Unique Constraint:**
```sql
UNIQUE (class_id, email)  -- Prevent duplicate students in same class
```

---

### rubrics
Grading rubrics (templates + custom).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Rubric unique identifier |
| `user_id` | UUID | FK → users(id) | Creator (NULL for templates) |
| `name` | TEXT | NOT NULL | Rubric name |
| `description` | TEXT | | Rubric description |
| `is_template` | BOOLEAN | DEFAULT FALSE | Public template flag |
| `subject` | TEXT | | Subject category |
| `grade_level` | TEXT | | Target grade level |
| `criteria` | JSONB | NOT NULL | Rubric criteria (see schema below) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_rubrics_user_id` on `user_id`
- `idx_rubrics_is_template` on `is_template`
- `idx_rubrics_subject` on `subject`
- `idx_rubrics_criteria` (GIN index) on `criteria`

**Foreign Keys:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
```

**JSONB Schema (criteria):**
```json
[
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
  }
]
```

---

### assignments
Assignments to grade.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Assignment unique identifier |
| `class_id` | UUID | FK → classes(id), NOT NULL | Associated class |
| `title` | TEXT | NOT NULL | Assignment title |
| `instructions` | TEXT | | Instructions for students |
| `grading_mode` | TEXT | NOT NULL | Grading mode (rubric, answer_key) |
| `rubric_id` | UUID | FK → rubrics(id) | Rubric (if grading_mode=rubric) |
| `answer_key_data` | JSONB | | Answer key (if grading_mode=answer_key) |
| `due_date` | TIMESTAMPTZ | | Due date (optional) |
| `status` | TEXT | NOT NULL, DEFAULT 'draft' | Assignment status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_assignments_class_id` on `class_id`
- `idx_assignments_rubric_id` on `rubric_id`
- `idx_assignments_status` on `status`
- `idx_assignments_due_date` on `due_date`

**Foreign Keys:**
```sql
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
FOREIGN KEY (rubric_id) REFERENCES rubrics(id) ON DELETE SET NULL
```

**Constraints:**
```sql
CHECK (grading_mode IN ('rubric', 'answer_key'))
CHECK (status IN ('draft', 'active', 'closed', 'archived'))
CHECK (
  (grading_mode = 'rubric' AND rubric_id IS NOT NULL) OR
  (grading_mode = 'answer_key' AND answer_key_data IS NOT NULL)
)
```

**JSONB Schema (answer_key_data):**
```json
{
  "type": "text",
  "answers": ["42", "Yes", "Photosynthesis"],
  "points_per_question": 5,
  "total_questions": 10
}
```

---

### submissions
Student work submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Submission unique identifier |
| `assignment_id` | UUID | FK → assignments(id), NOT NULL | Associated assignment |
| `student_id` | UUID | FK → students(id) | Matched student (nullable) |
| `student_name` | TEXT | | Fallback student name |
| `image_url` | TEXT | NOT NULL | S3 URL of original image |
| `image_thumbnail_url` | TEXT | | S3 URL of thumbnail |
| `file_size_bytes` | INTEGER | | File size in bytes |
| `status` | TEXT | NOT NULL, DEFAULT 'pending' | Grading status |
| `submitted_at` | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |
| `graded_at` | TIMESTAMPTZ | | Grading completion timestamp |
| `reviewed_at` | TIMESTAMPTZ | | Teacher review timestamp |
| `error_message` | TEXT | | Error message (if status=error) |

**Indexes:**
- `idx_submissions_assignment_id` on `assignment_id`
- `idx_submissions_student_id` on `student_id`
- `idx_submissions_status` on `status`
- `idx_submissions_submitted_at` on `submitted_at`

**Foreign Keys:**
```sql
FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
```

**Constraints:**
```sql
CHECK (status IN ('pending', 'grading', 'graded', 'reviewed', 'error'))
```

---

### grades
AI-generated grades (and teacher overrides).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Grade unique identifier |
| `submission_id` | UUID | FK → submissions(id), NOT NULL | Associated submission |
| `total_score` | DECIMAL(5,2) | NOT NULL | Total points earned |
| `max_score` | DECIMAL(5,2) | NOT NULL | Maximum possible points |
| `percentage` | DECIMAL(5,2) | GENERATED | Computed: (total_score / max_score) * 100 |
| `criteria_scores` | JSONB | | Detailed criterion scores |
| `feedback_text` | TEXT | | AI-generated feedback |
| `ai_confidence` | DECIMAL(3,2) | | AI confidence (0.00-1.00) |
| `ai_model` | TEXT | DEFAULT 'claude-sonnet-4.5' | AI model used |
| `ai_reasoning` | JSONB | | Full AI response (for debugging) |
| `teacher_approved` | BOOLEAN | DEFAULT FALSE | Teacher approval flag |
| `teacher_modified` | BOOLEAN | DEFAULT FALSE | Teacher edited flag |
| `teacher_notes` | TEXT | | Teacher's personal notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_grades_submission_id` (UNIQUE) on `submission_id`
- `idx_grades_teacher_approved` on `teacher_approved`
- `idx_grades_ai_confidence` on `ai_confidence`

**Foreign Keys:**
```sql
FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
```

**Generated Column:**
```sql
percentage DECIMAL(5,2) GENERATED ALWAYS AS ((total_score / max_score) * 100) STORED
```

**JSONB Schema (criteria_scores):**
```json
[
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
]
```

---

### activity_logs
Audit trail for all actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Log entry unique identifier |
| `user_id` | UUID | FK → users(id) | User who performed action |
| `action` | TEXT | NOT NULL | Action type |
| `resource_type` | TEXT | | Resource type (class, assignment, etc.) |
| `resource_id` | UUID | | Resource UUID |
| `metadata` | JSONB | | Additional context |
| `ip_address` | INET | | IP address of request |
| `user_agent` | TEXT | | Browser user agent |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

**Indexes:**
- `idx_activity_logs_user_id` on `user_id`
- `idx_activity_logs_created_at` on `created_at`
- `idx_activity_logs_action` on `action`
- `idx_activity_logs_resource` on `(resource_type, resource_id)`

**Foreign Keys:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
```

**Example Actions:**
- `user.login`
- `user.logout`
- `class.create`
- `assignment.create`
- `submission.upload`
- `grade.approve`
- `grade.edit`

---

## Row-Level Security (RLS) Policies

### users
```sql
-- Users can only see their own profile
CREATE POLICY user_isolation ON users
  FOR ALL
  USING (id = auth.uid());
```

### classes
```sql
-- Users can only access their own classes
CREATE POLICY user_owns_class ON classes
  FOR ALL
  USING (user_id = auth.uid());
```

### students
```sql
-- Students accessible via teacher's classes
CREATE POLICY student_via_class ON students
  FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE user_id = auth.uid()
    )
  );
```

### assignments
```sql
-- Assignments accessible via teacher's classes
CREATE POLICY assignment_via_class ON assignments
  FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE user_id = auth.uid()
    )
  );
```

### submissions
```sql
-- Submissions accessible via teacher's assignments
CREATE POLICY submission_via_assignment ON submissions
  FOR ALL
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );
```

### grades
```sql
-- Grades accessible via teacher's submissions
CREATE POLICY grade_via_submission ON grades
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

---

## Database Triggers

### Updated At Trigger
Automatically update `updated_at` timestamp on row modification.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ... (repeat for other tables)
```

### Grade Status Update Trigger
Update submission status when grade is created.

```sql
CREATE OR REPLACE FUNCTION update_submission_graded_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE submissions
  SET status = 'graded', graded_at = NOW()
  WHERE id = NEW.submission_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grade_created_trigger
  AFTER INSERT ON grades
  FOR EACH ROW
  EXECUTE FUNCTION update_submission_graded_status();
```

---

## Database Views

### assignment_stats
Aggregated statistics per assignment.

```sql
CREATE VIEW assignment_stats AS
SELECT
  a.id AS assignment_id,
  a.title,
  COUNT(s.id) AS total_submissions,
  COUNT(CASE WHEN s.status = 'graded' THEN 1 END) AS graded_count,
  COUNT(CASE WHEN s.status = 'pending' THEN 1 END) AS pending_count,
  AVG(g.percentage) AS average_percentage,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY g.percentage) AS median_percentage
FROM assignments a
LEFT JOIN submissions s ON a.id = s.assignment_id
LEFT JOIN grades g ON s.id = g.submission_id
GROUP BY a.id, a.title;
```

### teacher_dashboard
Teacher dashboard summary.

```sql
CREATE VIEW teacher_dashboard AS
SELECT
  u.id AS user_id,
  COUNT(DISTINCT c.id) AS total_classes,
  COUNT(DISTINCT s.id) AS total_students,
  COUNT(DISTINCT a.id) AS total_assignments,
  COUNT(DISTINCT sub.id) AS total_submissions,
  COUNT(CASE WHEN sub.status = 'pending' THEN 1 END) AS pending_submissions
FROM users u
LEFT JOIN classes c ON u.id = c.user_id AND c.archived_at IS NULL
LEFT JOIN students s ON c.id = s.class_id
LEFT JOIN assignments a ON c.id = a.class_id
LEFT JOIN submissions sub ON a.id = sub.assignment_id
GROUP BY u.id;
```

---

## Indexes Strategy

### Primary Indexes (Automatic)
All primary keys (`id` columns) are automatically indexed.

### Foreign Key Indexes
```sql
-- Classes
CREATE INDEX idx_classes_user_id ON classes(user_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);

-- Students
CREATE INDEX idx_students_class_id ON students(class_id);

-- Assignments
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_rubric_id ON assignments(rubric_id);

-- Submissions
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);

-- Grades
CREATE INDEX idx_grades_submission_id ON grades(submission_id);
```

### Query Optimization Indexes
```sql
-- Common filters
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_classes_archived_at ON classes(archived_at);

-- Sorting
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Search
CREATE INDEX idx_students_name ON students USING GIN (to_tsvector('english', name));
CREATE INDEX idx_rubrics_name ON rubrics USING GIN (to_tsvector('english', name));

-- JSONB queries
CREATE INDEX idx_rubrics_criteria ON rubrics USING GIN (criteria);
CREATE INDEX idx_grades_criteria_scores ON grades USING GIN (criteria_scores);
```

### Composite Indexes
```sql
-- Dashboard queries
CREATE INDEX idx_classes_user_archived ON classes(user_id, archived_at);

-- Assignment filtering
CREATE INDEX idx_assignments_class_status ON assignments(class_id, status);

-- Activity logs filtering
CREATE INDEX idx_activity_logs_user_created ON activity_logs(user_id, created_at);
```

---

## Data Types & Constraints

### UUID Generation
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Default UUID generation
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

### ENUM Types (Implemented as CHECK constraints)
```sql
-- User roles
CHECK (role IN ('teacher', 'admin'))

-- Subscription tiers
CHECK (subscription_tier IN ('free', 'pro', 'enterprise'))

-- Assignment status
CHECK (status IN ('draft', 'active', 'closed', 'archived'))

-- Submission status
CHECK (status IN ('pending', 'grading', 'graded', 'reviewed', 'error'))

-- Grading mode
CHECK (grading_mode IN ('rubric', 'answer_key'))
```

### JSONB Validation
```sql
-- Rubric criteria must be an array
ALTER TABLE rubrics
  ADD CONSTRAINT criteria_is_array
  CHECK (jsonb_typeof(criteria) = 'array');

-- Answer key data must be an object
ALTER TABLE assignments
  ADD CONSTRAINT answer_key_is_object
  CHECK (jsonb_typeof(answer_key_data) = 'object');
```

---

## Database Seeding

### Template Rubrics
```sql
-- Math Problem Solving (3rd Grade)
INSERT INTO rubrics (id, user_id, name, description, is_template, subject, grade_level, criteria)
VALUES (
  uuid_generate_v4(),
  NULL,
  'Math Problem Solving',
  '3rd grade math rubric for problem-solving assignments',
  TRUE,
  'Math',
  '3rd',
  '[
    {
      "id": "crit_1",
      "name": "Correct Answer",
      "description": "Student provides correct final answer",
      "max_points": 5,
      "levels": [
        {"points": 5, "description": "Completely correct"},
        {"points": 3, "description": "Minor calculation error"},
        {"points": 0, "description": "Incorrect or missing"}
      ]
    },
    {
      "id": "crit_2",
      "name": "Shows Work",
      "description": "Student shows all steps clearly",
      "max_points": 3,
      "levels": [
        {"points": 3, "description": "All steps shown clearly"},
        {"points": 2, "description": "Most steps shown"},
        {"points": 0, "description": "No work shown"}
      ]
    }
  ]'::jsonb
);

-- Reading Comprehension (4th Grade)
INSERT INTO rubrics (id, user_id, name, description, is_template, subject, grade_level, criteria)
VALUES (
  uuid_generate_v4(),
  NULL,
  'Reading Comprehension',
  '4th grade reading comprehension rubric',
  TRUE,
  'ELA',
  '4th',
  '[
    {
      "id": "crit_1",
      "name": "Understanding",
      "description": "Student demonstrates comprehension",
      "max_points": 4,
      "levels": [
        {"points": 4, "description": "Deep understanding"},
        {"points": 3, "description": "Good understanding"},
        {"points": 2, "description": "Partial understanding"},
        {"points": 0, "description": "Misunderstanding"}
      ]
    },
    {
      "id": "crit_2",
      "name": "Evidence",
      "description": "Student supports answer with text evidence",
      "max_points": 3,
      "levels": [
        {"points": 3, "description": "Strong evidence from text"},
        {"points": 2, "description": "Some evidence"},
        {"points": 0, "description": "No evidence provided"}
      ]
    }
  ]'::jsonb
);
```

---

## Database Maintenance

### Vacuum Strategy
```sql
-- Auto-vacuum settings (postgresql.conf)
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

### Backup Strategy
```bash
# Daily backups via Supabase (automated)
# Manual backup command:
pg_dump handmark_production > backup_$(date +%Y%m%d).sql
```

### Retention Policy
```sql
-- Archive activity logs older than 1 year
DELETE FROM activity_logs
WHERE created_at < NOW() - INTERVAL '1 year';

-- Soft-delete old archived classes (after 2 years)
UPDATE classes
SET archived_at = NOW()
WHERE archived_at < NOW() - INTERVAL '2 years';
```

---

## Performance Considerations

### Connection Pooling
- **Max connections:** 100 (Supabase default)
- **Min connections:** 10
- **Pool timeout:** 30 seconds

### Query Optimization Tips
1. **Use SELECT specific columns** (not `SELECT *`)
2. **Add LIMIT to list queries** (pagination)
3. **Use indexes for WHERE clauses**
4. **Avoid N+1 queries** (use JOINs or eager loading)
5. **Use EXPLAIN ANALYZE** to debug slow queries

### Slow Query Monitoring
```sql
-- Enable slow query logging
ALTER DATABASE handmark SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Migration Strategy

### Schema Versioning
- Use Alembic (Python) for schema migrations
- Migration files: `migrations/versions/001_initial_schema.py`
- Always reversible (up/down migrations)

### Example Migration
```python
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.Text(), nullable=False),
        sa.Column('name', sa.Text()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

def downgrade():
    op.drop_table('users')
```

---

*Data Models Documentation v1.0 - Last updated February 6, 2026*
