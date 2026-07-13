"""
Declarative base class that every SQLAlchemy model inherits from.
Kept separate from session.py so Alembic can import models without
needing a live DB connection.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
