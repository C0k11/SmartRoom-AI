from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS - Allow all origins (development environment)
    CORS_ORIGINS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/roomdesign"
    DATABASE_POOL_SIZE: int = 5
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # OpenAI (backup)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Anthropic Claude (primary)
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    OPENAI_MAX_TOKENS: int = 4096
    
    # Stable Diffusion / Replicate
    REPLICATE_API_TOKEN: str = ""
    # FLUX.1 Pro - Highest quality model (more expensive than schnell but better results)
    FLUX_MODEL: str = "black-forest-labs/flux-1.1-pro"
    # FLUX Dev - Alternative (high quality, cheaper than pro)
    FLUX_DEV_MODEL: str = "black-forest-labs/flux-dev"
    # SDXL - Alternative
    SDXL_MODEL: str = "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316"
    
    # HuggingFace (for SAM model)
    HUGGINGFACE_API_TOKEN: str = ""
    SAM_MODEL_ENDPOINT: str = "https://api-inference.huggingface.co/models/facebook/sam-vit-huge"
    
    # Vector Database (Pinecone or Qdrant)
    VECTOR_DB_TYPE: str = "qdrant"  # or "pinecone"
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""
    PINECONE_INDEX: str = "furniture-embeddings"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "furniture"
    
    # Storage (S3 or Cloudflare R2)
    STORAGE_TYPE: str = "local"  # "s3" or "r2" or "local"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "roomdesign-images"
    AWS_S3_REGION: str = "us-east-1"
    R2_ACCOUNT_ID: str = ""
    LOCAL_STORAGE_PATH: str = "./uploads"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


# Ensure local storage path exists
if settings.STORAGE_TYPE == "local":
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)

