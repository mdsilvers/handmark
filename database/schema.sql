-- HandMark Database Schema
-- PostgreSQL 15+ (Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users (Teachers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    google_id TEXT UNIQUE,
    role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Schools (Multi-tenancy support)
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    district TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes (Teacher's classes)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id),
    name TEXT NOT NULL,
    grade_level TEXT,
    subject TEXT,
    academic_year TEXT,
    google_classroom_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- Students (Roster)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    student_id TEXT,
    google_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rubrics
CREATE TABLE rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    grade_level TEXT,
    subject TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    criteria JSONB NOT NULL,
    /* 
    criteria structure:
    [
      {
        "id": "crit_1",
        "name": "Correct Answer",
        "description": "Student provides correct final answer",
        "max_points": 5,
        "levels": [
          { "points": 5, "description": "Completely correct" },
          { "points": 3, "description": "Minor error" },
          { "points": 0, "description": "Incorrect or missing" }
        ]
      }
    ]
    */
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructions TEXT,
    grading_mode TEXT NOT NULL CHECK (grading_mode IN ('rubric', 'answer_key')),
    rubric_id UUID REFERENCES rubrics(id),
    answer_key_data JSONB,
    /* 
    answer_key_data structure:
    {
      "type": "text" | "image",
      "answers": ["42", "Yes", "Photosynthesis"],
      "image_url": "https://...",
      "points_per_question": 5,
      "total_questions": 10
    }
    */
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id),
    student_name TEXT, -- Fallback if no student_id matched
    image_url TEXT NOT NULL,
    image_thumbnail_url TEXT,
    file_size_bytes INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'grading', 'graded', 'reviewed', 'error')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    error_message TEXT
);

-- Grades
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    total_score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((total_score / NULLIF(max_score, 0)) * 100) STORED,
    criteria_scores JSONB,
    /* 
    criteria_scores structure:
    [
      {
        "criterion_id": "crit_1",
        "criterion_name": "Correct Answer",
        "score": 3,
        "max_score": 5,
        "reasoning": "Student used correct method but made error in step 3"
      }
    ]
    */
    feedback_text TEXT,
    ai_confidence DECIMAL(3,2), -- 0.00-1.00
    ai_model TEXT DEFAULT 'claude-sonnet-4.5',
    ai_reasoning JSONB, -- Full AI response for debugging
    teacher_approved BOOLEAN DEFAULT FALSE,
    teacher_modified BOOLEAN DEFAULT FALSE,
    teacher_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log (Audit trail)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Classes
CREATE INDEX idx_classes_user_id ON classes(user_id);
CREATE INDEX idx_classes_archived ON classes(archived_at) WHERE archived_at IS NULL;

-- Students
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_name ON students USING gin(name gin_trgm_ops);

-- Assignments
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Submissions
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- Grades
CREATE INDEX idx_grades_submission_id ON grades(submission_id);
CREATE INDEX idx_grades_teacher_approved ON grades(teacher_approved);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users: Can only see own profile
CREATE POLICY users_own_data ON users
    FOR ALL
    USING (auth.uid() = id);

-- Classes: Teachers can only see their own classes
CREATE POLICY classes_own_data ON classes
    FOR ALL
    USING (auth.uid() = user_id);

-- Students: Teachers can see students in their classes
CREATE POLICY students_own_classes ON students
    FOR ALL
    USING (
        class_id IN (
            SELECT id FROM classes WHERE user_id = auth.uid()
        )
    );

-- Assignments: Teachers can see assignments for their classes
CREATE POLICY assignments_own_classes ON assignments
    FOR ALL
    USING (
        class_id IN (
            SELECT id FROM classes WHERE user_id = auth.uid()
        )
    );

-- Submissions: Teachers can see submissions for their assignments
CREATE POLICY submissions_own_assignments ON submissions
    FOR ALL
    USING (
        assignment_id IN (
            SELECT a.id FROM assignments a
            JOIN classes c ON c.id = a.class_id
            WHERE c.user_id = auth.uid()
        )
    );

-- Grades: Teachers can see grades for their submissions
CREATE POLICY grades_own_submissions ON grades
    FOR ALL
    USING (
        submission_id IN (
            SELECT s.id FROM submissions s
            JOIN assignments a ON a.id = s.assignment_id
            JOIN classes c ON c.id = a.class_id
            WHERE c.user_id = auth.uid()
        )
    );

-- Rubrics: Teachers can see their own rubrics + public templates
CREATE POLICY rubrics_own_or_template ON rubrics
    FOR ALL
    USING (user_id = auth.uid() OR is_template = true);

-- Activity logs: Users can only see their own logs
CREATE POLICY activity_logs_own_data ON activity_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rubrics_updated_at BEFORE UPDATE ON rubrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Template Rubrics)
-- ============================================================================

-- Insert template rubrics for common K-12 assignments
INSERT INTO rubrics (name, description, grade_level, subject, is_template, criteria) VALUES
(
    '3rd Grade Math - Problem Solving',
    'Rubric for elementary math problem solving',
    '3rd',
    'Math',
    true,
    '[
        {
            "id": "correct_answer",
            "name": "Correct Answer",
            "description": "Student provides the correct final answer",
            "max_points": 5,
            "levels": [
                {"points": 5, "description": "Completely correct"},
                {"points": 3, "description": "Minor calculation error"},
                {"points": 0, "description": "Incorrect or missing"}
            ]
        },
        {
            "id": "shows_work",
            "name": "Shows Work",
            "description": "Student shows all steps in their work",
            "max_points": 3,
            "levels": [
                {"points": 3, "description": "All steps shown clearly"},
                {"points": 2, "description": "Most steps shown"},
                {"points": 1, "description": "Some work shown"},
                {"points": 0, "description": "No work shown"}
            ]
        }
    ]'::jsonb
),
(
    '4th Grade Writing - Short Response',
    'Rubric for short written responses',
    '4th',
    'ELA',
    true,
    '[
        {
            "id": "content",
            "name": "Content & Understanding",
            "description": "Student demonstrates understanding of the text",
            "max_points": 4,
            "levels": [
                {"points": 4, "description": "Complete understanding with evidence"},
                {"points": 3, "description": "Good understanding"},
                {"points": 2, "description": "Partial understanding"},
                {"points": 1, "description": "Limited understanding"},
                {"points": 0, "description": "No understanding shown"}
            ]
        },
        {
            "id": "writing_quality",
            "name": "Writing Quality",
            "description": "Grammar, spelling, and sentence structure",
            "max_points": 3,
            "levels": [
                {"points": 3, "description": "Clear writing with few errors"},
                {"points": 2, "description": "Understandable with some errors"},
                {"points": 1, "description": "Many errors, hard to understand"},
                {"points": 0, "description": "Incomprehensible"}
            ]
        }
    ]'::jsonb
);

-- ============================================================================
-- FUNCTIONS & VIEWS
-- ============================================================================

-- View: Assignment statistics
CREATE OR REPLACE VIEW assignment_stats AS
SELECT 
    a.id AS assignment_id,
    a.title,
    a.class_id,
    COUNT(s.id) AS total_submissions,
    COUNT(CASE WHEN s.status = 'graded' THEN 1 END) AS graded_count,
    COUNT(CASE WHEN s.status = 'pending' THEN 1 END) AS pending_count,
    AVG(g.percentage) AS avg_percentage,
    MIN(g.percentage) AS min_percentage,
    MAX(g.percentage) AS max_percentage
FROM assignments a
LEFT JOIN submissions s ON s.assignment_id = a.id
LEFT JOIN grades g ON g.submission_id = s.id
GROUP BY a.id, a.title, a.class_id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Teachers using the platform';
COMMENT ON TABLE classes IS 'Classes/courses taught by teachers';
COMMENT ON TABLE students IS 'Students enrolled in classes';
COMMENT ON TABLE rubrics IS 'Grading rubrics with criteria and point scales';
COMMENT ON TABLE assignments IS 'Assignments created by teachers';
COMMENT ON TABLE submissions IS 'Student work submitted for grading';
COMMENT ON TABLE grades IS 'AI-generated grades with teacher reviews';
COMMENT ON TABLE activity_logs IS 'Audit trail of user actions';
