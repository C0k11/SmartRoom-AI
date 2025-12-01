from datetime import datetime
from sqlalchemy import String, Text, Float, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List

from app.db.base import Base


class FurnitureCategory(Base):
    """Furniture category model"""
    __tablename__ = "furniture_categories"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    name_en: Mapped[str] = mapped_column(String(100))
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Parent category for hierarchical structure
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("furniture_categories.id"), nullable=True
    )
    
    # Relationships
    furniture_items: Mapped[List["Furniture"]] = relationship(
        back_populates="category"
    )
    
    def __repr__(self) -> str:
        return f"<FurnitureCategory {self.name}>"


class Furniture(Base):
    """Furniture item model"""
    __tablename__ = "furniture"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("furniture_categories.id"), index=True
    )
    
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Pricing
    price: Mapped[float] = mapped_column(Float)
    original_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="CNY")
    
    # Brand and source
    brand: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    affiliate_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Images
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    gallery_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    # Dimensions
    dimensions: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    width: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    height: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    depth: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # 3D model for preview
    model_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    model_format: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Style tags
    styles: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    colors: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    materials: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    # Vector embedding for similarity search
    embedding_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Ratings
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reviews_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Availability
    in_stock: Mapped[bool] = mapped_column(default=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    
    # Relationships
    category: Mapped["FurnitureCategory"] = relationship(
        back_populates="furniture_items"
    )
    
    def __repr__(self) -> str:
        return f"<Furniture {self.name}>"

