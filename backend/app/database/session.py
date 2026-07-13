"""
Database engine + session factory, and the FastAPI dependency
that yields a request-scoped SQLAlchemy session.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: one DB session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
