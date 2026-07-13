"""
Generic repository providing common CRUD so specific repositories
only need to add query methods that are actually specific to them.
No business logic here - that belongs in the service layer.
"""
from typing import Generic, TypeVar
import uuid

from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: type[ModelType]):
        self.db = db
        self.model = model

    def get(self, id: uuid.UUID) -> ModelType | None:
        return self.db.get(self.model, id)

    def list(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        self.db.delete(obj)
        self.db.commit()

    def commit_refresh(self, obj: ModelType) -> ModelType:
        self.db.commit()
        self.db.refresh(obj)
        return obj
