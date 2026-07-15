"""
Test fixtures: an isolated SQLite database per test session, with the
FastAPI dependency override so tests never touch the real Postgres DB.
"""
import uuid
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.core.security import hash_password
from app.models import Teacher, Course, Class, Student

TEST_DB_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_class(db_session):
    """Creates a teacher, course, class, and 3 students. Returns key IDs + password."""
    teacher = Teacher(
        full_name="Test Teacher",
        email="teacher@test.com",
        password_hash=hash_password("secret123"),
    )
    course = Course(name="Test Course", code="TST-101")
    db_session.add_all([teacher, course])
    db_session.flush()

    cls = Class(name="Test Class", section="A", course_id=course.id, teacher_id=teacher.id)
    db_session.add(cls)
    db_session.flush()

    students = [Student(full_name=f"Student {i}", roll_number=f"S00{i}", class_id=cls.id) for i in range(1, 4)]
    db_session.add_all(students)
    db_session.commit()

    return {
        "teacher_id": str(teacher.id),
        "class_id": str(cls.id),
        "student_ids": [str(s.id) for s in students],
        "email": "teacher@test.com",
        "password": "secret123",
    }


@pytest.fixture
def admin_teacher(db_session):
    """A second teacher, with is_admin=True, for testing admin-gated endpoints."""
    teacher = Teacher(
        full_name="Admin Teacher",
        email="admin@test.com",
        password_hash=hash_password("adminsecret123"),
        is_admin=True,
    )
    db_session.add(teacher)
    db_session.commit()
    return {"email": "admin@test.com", "password": "adminsecret123"}


def auth_headers(client: "TestClient", email: str, password: str) -> dict:
    resp = client.post("/v1/login", json={"email": email, "password": password})
    token = resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
