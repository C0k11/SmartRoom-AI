from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timedelta
import logging
import httpx
from jose import jwt, JWTError

from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# JWT Settings
ALGORITHM = "HS256"


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
    oauth_provider: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class UserProfile(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    preferences: Optional[dict] = None


class DesignSaveRequest(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: str
    original_image: Optional[str] = None
    style: str
    total_cost: float = 0
    furniture_items: Optional[List[dict]] = None


class SavedDesign(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image_url: str
    original_image: Optional[str] = None
    style: str
    total_cost: float
    furniture_items: Optional[List[dict]] = None
    created_at: str


# In-memory storage (replace with database in production)
users_db: dict = {}
designs_db: dict = {}  # user_id -> list of designs


def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user_id from Authorization header"""
    if not authorization:
        return None
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        return verify_token(token)
    except:
        return None


@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate):
    """User registration"""
    logger.info(f"Register request received: {user.email}, {user.name}")
    
    # Check if email exists
    for u in users_db.values():
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    users_db[user_id] = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "password": user.password,  # Should hash in production
        "avatar": None,
        "created_at": datetime.now().isoformat(),
        "is_premium": False,
        "oauth_provider": None,
        "oauth_id": None,
    }
    
    access_token = create_access_token(user_id)
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(**{k: v for k, v in users_db[user_id].items() if k not in ["password", "oauth_id"]}),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """User login"""
    for user_id, user in users_db.items():
        if user["email"] == credentials.email and user["password"] == credentials.password:
            access_token = create_access_token(user_id)
            return TokenResponse(
                access_token=access_token,
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user=UserResponse(**{k: v for k, v in user.items() if k not in ["password", "oauth_id"]}),
            )
    
    raise HTTPException(status_code=401, detail="Invalid email or password")


@router.post("/auth/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest):
    """
    Authenticate with Google ID token
    """
    try:
        # Verify the Google ID token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={request.credential}"
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            
            google_user = response.json()
            
            # Validate the token is for our app
            if settings.GOOGLE_CLIENT_ID and google_user.get("aud") != settings.GOOGLE_CLIENT_ID:
                logger.warning(f"Token audience mismatch: {google_user.get('aud')}")
                # In development, we might skip this check
                if settings.ENVIRONMENT != "development":
                    raise HTTPException(status_code=401, detail="Invalid token audience")
        
        google_id = google_user.get("sub")
        email = google_user.get("email")
        name = google_user.get("name", email.split("@")[0])
        avatar = google_user.get("picture")
        
        # Find existing user by oauth_id or email
        user_id = None
        existing_user = None
        
        for uid, user in users_db.items():
            if user.get("oauth_id") == google_id or user.get("email") == email:
                user_id = uid
                existing_user = user
                break
        
        if existing_user:
            # Update existing user
            existing_user["avatar"] = avatar or existing_user.get("avatar")
            existing_user["name"] = name or existing_user.get("name")
            if not existing_user.get("oauth_id"):
                existing_user["oauth_id"] = google_id
                existing_user["oauth_provider"] = "google"
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            users_db[user_id] = {
                "id": user_id,
                "email": email,
                "name": name,
                "password": None,
                "avatar": avatar,
                "created_at": datetime.now().isoformat(),
                "is_premium": False,
                "oauth_provider": "google",
                "oauth_id": google_id,
            }
        
        access_token = create_access_token(user_id)
        user_data = users_db[user_id]
        
        logger.info(f"Google auth successful for: {email}")
        
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse(**{k: v for k, v in user_data.items() if k not in ["password", "oauth_id"]}),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: Optional[str] = Depends(get_current_user_id)):
    """Get current user information"""
    if not user_id or user_id not in users_db:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = users_db[user_id]
    return UserResponse(**{k: v for k, v in user.items() if k not in ["password", "oauth_id"]})


@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile: UserProfile,
    user_id: Optional[str] = Depends(get_current_user_id)
):
    """Update user profile"""
    if not user_id or user_id not in users_db:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = users_db[user_id]
    if profile.name:
        user["name"] = profile.name
    if profile.avatar:
        user["avatar"] = profile.avatar
    if profile.preferences:
        user["preferences"] = profile.preferences
    
    return UserResponse(**{k: v for k, v in user.items() if k not in ["password", "oauth_id"]})


@router.get("/me/designs")
async def get_user_designs(user_id: Optional[str] = Depends(get_current_user_id)):
    """Get user saved designs"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_designs = designs_db.get(user_id, [])
    return {
        "designs": user_designs,
        "total": len(user_designs),
    }


@router.post("/me/designs", response_model=SavedDesign)
async def save_design(
    design: DesignSaveRequest,
    user_id: Optional[str] = Depends(get_current_user_id)
):
    """Save a design to user history"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    design_id = str(uuid.uuid4())
    saved_design = {
        "id": design_id,
        "name": design.name,
        "description": design.description,
        "image_url": design.image_url,
        "original_image": design.original_image,
        "style": design.style,
        "total_cost": design.total_cost,
        "furniture_items": design.furniture_items or [],
        "created_at": datetime.now().isoformat(),
    }
    
    if user_id not in designs_db:
        designs_db[user_id] = []
    
    designs_db[user_id].insert(0, saved_design)  # Add to beginning
    
    logger.info(f"Design saved for user {user_id}: {design_id}")
    
    return SavedDesign(**saved_design)


@router.delete("/me/designs/{design_id}")
async def delete_design(
    design_id: str,
    user_id: Optional[str] = Depends(get_current_user_id)
):
    """Delete a saved design"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if user_id not in designs_db:
        raise HTTPException(status_code=404, detail="Design not found")
    
    designs_db[user_id] = [d for d in designs_db[user_id] if d["id"] != design_id]
    
    return {"message": "Design deleted successfully"}


@router.post("/upgrade")
async def upgrade_to_premium():
    """Upgrade to premium"""
    return {
        "message": "Upgrade feature under development",
        "pricing": {
            "monthly": 29,
            "yearly": 199,
        }
    }

