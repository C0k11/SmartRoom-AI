from datetime import datetime
from sqlalchemy import String, Text, Float, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List

from app.db.base import Base


class Design(Base):
    """Design proposal model"""
    __tablename__ = "designs"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id"), index=True
    )
    
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    style: Mapped[str] = mapped_column(String(50))
    
    # Generated image
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # 3D data (for Three.js rendering)
    scene_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Design details
    highlights: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    color_palette: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    # Cost
    total_cost: Mapped[float] = mapped_column(Float, default=0)
    
    # AI confidence score
    confidence: Mapped[float] = mapped_column(Float, default=0)
    
    # Generation metadata
    prompt_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    
    # Relationships
    project: Mapped["Project"] = relationship(back_populates="designs")  # noqa: F821
    furniture_items: Mapped[List["DesignFurniture"]] = relationship(
        back_populates="design", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Design {self.name}>"


class DesignFurniture(Base):
    """Junction table for design-furniture relationship"""
    __tablename__ = "design_furniture"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    design_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("designs.id"), index=True
    )
    furniture_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("furniture.id"), index=True
    )
    
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Position in 3D space (for 3D preview)
    position_x: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    position_y: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    position_z: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rotation_y: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Relationships
    design: Mapped["Design"] = relationship(back_populates="furniture_items")
    furniture: Mapped["Furniture"] = relationship()  # noqa: F821

