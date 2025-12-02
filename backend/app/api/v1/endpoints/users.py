from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    created_at: str
    is_premium: bool = False


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class UserProfile(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    preferences: Optional[dict] = None


# Demo user storage (use database in production)
demo_users: dict = {}


@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate):
    """
    User registration
    """
    logger.info(f"Register request received: {user.email}, {user.name}")
    # Check if email exists
    for u in demo_users.values():
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    demo_users[user_id] = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "password": user.password,  # Should hash in production
        "avatar": None,
        "created_at": datetime.now().isoformat(),
        "is_premium": False,
        "preferences": {},
    }
    
    return TokenResponse(
        access_token=f"demo-token-{user_id}",
        expires_in=604800,  # 7 days
        user=UserResponse(**{k: v for k, v in demo_users[user_id].items() if k != "password"}),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    User login
    """
    for user_id, user in demo_users.items():
        if user["email"] == credentials.email and user["password"] == credentials.password:
            return TokenResponse(
                access_token=f"demo-token-{user_id}",
                expires_in=604800,
                user=UserResponse(**{k: v for k, v in user.items() if k != "password"}),
            )
    
    raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/me", response_model=UserResponse)
async def get_current_user():
    """
    Get current user information
    """
    # TODO: Implement with JWT authentication
    return UserResponse(
        id="demo-user",
        email="demo@roomai.com",
        name="Demo User",
        avatar=None,
        created_at=datetime.now().isoformat(),
        is_premium=False,
    )


@router.put("/me", response_model=UserResponse)
async def update_profile(profile: UserProfile):
    """
    Update user profile
    """
    # TODO: Implement with authentication
    return UserResponse(
        id="demo-user",
        email="demo@roomai.com",
        name=profile.name or "Demo User",
        avatar=profile.avatar,
        created_at=datetime.now().isoformat(),
        is_premium=False,
    )


@router.get("/me/designs")
async def get_user_designs():
    """
    Get user saved designs
    """
    return {
        "designs": [],
        "total": 0,
    }


@router.post("/upgrade")
async def upgrade_to_premium():
    """
    Upgrade to premium
    """
    return {
        "message": "Upgrade feature under development",
        "pricing": {
            "monthly": 29,
            "yearly": 199,
        }
    }

