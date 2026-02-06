"""
Pytest configuration and fixtures for HandMark backend tests
"""
import pytest
from typing import Generator, AsyncGenerator
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Import your app and database models
# from app.main import app
# from app.database import Base, get_db
# from app.config import settings

# Test database configuration
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def engine():
    """Create a test database engine"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Base.metadata.create_all(bind=engine)
    yield engine
    # Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(engine) -> Generator[Session, None, None]:
    """Create a fresh database session for each test"""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function")
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with database dependency override"""
    # def override_get_db():
    #     try:
    #         yield db_session
    #     finally:
    #         pass
    
    # app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(base_url="http://test") as ac:
        yield ac
    
    # app.dependency_overrides.clear()


@pytest.fixture
def mock_teacher_user():
    """Mock teacher user for testing"""
    return {
        "id": "test-teacher-id",
        "email": "teacher@test.com",
        "role": "teacher",
        "name": "Test Teacher",
    }


@pytest.fixture
def mock_student_user():
    """Mock student user for testing"""
    return {
        "id": "test-student-id",
        "email": "student@test.com",
        "role": "student",
        "name": "Test Student",
    }


@pytest.fixture
def mock_class():
    """Mock class for testing"""
    return {
        "id": "test-class-id",
        "name": "Math 101",
        "grade": "10",
        "subject": "Mathematics",
        "teacher_id": "test-teacher-id",
    }


@pytest.fixture
def mock_assignment():
    """Mock assignment for testing"""
    return {
        "id": "test-assignment-id",
        "title": "Algebra Quiz",
        "description": "Test on quadratic equations",
        "class_id": "test-class-id",
        "due_date": "2026-03-01",
        "total_points": 100,
    }


@pytest.fixture
def mock_submission():
    """Mock student submission for testing"""
    return {
        "id": "test-submission-id",
        "assignment_id": "test-assignment-id",
        "student_id": "test-student-id",
        "submitted_at": "2026-02-28T10:00:00",
        "content": "Student's answer here",
        "status": "submitted",
    }


@pytest.fixture
def auth_headers(mock_teacher_user):
    """Generate authentication headers for testing"""
    # In real implementation, generate a valid JWT token
    return {
        "Authorization": "Bearer test-token",
    }
