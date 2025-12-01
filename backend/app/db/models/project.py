from datetime import datetime
from sqlalchemy import String, Text, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
import enum

from app.db.base import Base


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class RoomType(str, enum.Enum):
    LIVING = "living"
    BEDROOM = "bedroom"
    KITCHEN = "kitchen"
    BATHROOM = "bathroom"
    OFFICE = "office"
    DINING = "dining"
    OTHER = "other"


class Project(Base):
    """Project model - represents a room design project"""
    __tablename__ = "projects"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    room_type: Mapped[RoomType] = mapped_column(
        Enum(RoomType), default=RoomType.LIVING
    )
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus), default=ProjectStatus.DRAFT
    )
    
    # Original room data
    original_image_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    thumbnail_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    
    # Analysis results
    analysis_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    segmentation_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    
    # User preferences for this project
    style_preference: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    budget: Mapped[Optional[float]] = mapped_column(nullable=True)
    preferences: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Selected design
    selected_design_id: Mapped[Optional[str]] = mapped_column(
        String(36), nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="projects")  # noqa: F821
    designs: Mapped[List["Design"]] = relationship(  # noqa: F821
        back_populates="project", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Project {self.name}>"

