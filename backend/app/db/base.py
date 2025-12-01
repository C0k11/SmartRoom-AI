from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all database models"""
    pass


# Import all models here for Alembic
from app.db.models import user, project, design, furniture  # noqa

