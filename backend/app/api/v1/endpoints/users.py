from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timedelta
import logging
import httpx
import json
import os
from jose import jwt, JWTError

from app.core.config import settings

logger = logging.getLogger(__name__)

# SQLite persistence for user data
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "users.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def get_db_connection():
    """Get SQLite database connection"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT,
            avatar TEXT,
            created_at TEXT NOT NULL,
            is_premium INTEGER DEFAULT 0,
            oauth_provider TEXT,
            oauth_id TEXT,
            preferences TEXT
        )
    ''')
    
    # Designs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS designs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            original_image TEXT,
            style TEXT,
            total_cost REAL DEFAULT 0,
            furniture_items TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on module load
init_db()

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


# Database helper functions
def get_user_by_id(user_id: str) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_by_email(email: str) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_by_oauth_id(oauth_id: str) -> Optional[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE oauth_id = ?', (oauth_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def create_user(user_data: dict) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (id, email, name, password, avatar, created_at, is_premium, oauth_provider, oauth_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_data['id'],
        user_data['email'],
        user_data['name'],
        user_data.get('password'),
        user_data.get('avatar'),
        user_data['created_at'],
        1 if user_data.get('is_premium') else 0,
        user_data.get('oauth_provider'),
        user_data.get('oauth_id'),
    ))
    conn.commit()
    conn.close()
    return user_data

def update_user(user_id: str, updates: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
    values = list(updates.values()) + [user_id]
    cursor.execute(f'UPDATE users SET {set_clause} WHERE id = ?', values)
    conn.commit()
    conn.close()

def get_user_designs(user_id: str) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM designs WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    designs = []
    for row in rows:
        design = dict(row)
        if design.get('furniture_items'):
            design['furniture_items'] = json.loads(design['furniture_items'])
        else:
            design['furniture_items'] = []
        designs.append(design)
    return designs

def save_design(user_id: str, design_data: dict) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    furniture_items = json.dumps(design_data.get('furniture_items', []))
    cursor.execute('''
        INSERT INTO designs (id, user_id, name, description, image_url, original_image, style, total_cost, furniture_items, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        design_data['id'],
        user_id,
        design_data['name'],
        design_data.get('description'),
        design_data['image_url'],
        design_data.get('original_image'),
        design_data['style'],
        design_data.get('total_cost', 0),
        furniture_items,
        design_data['created_at'],
    ))
    conn.commit()
    conn.close()
    return design_data

def delete_design_by_id(user_id: str, design_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM designs WHERE id = ? AND user_id = ?', (design_id, user_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


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
    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_data = {
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
    create_user(user_data)
    
    access_token = create_access_token(user_id)
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(**{k: v for k, v in user_data.items() if k not in ["password", "oauth_id"]}),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """User login"""
    user = get_user_by_email(credentials.email)
    if user and user.get("password") == credentials.password:
        access_token = create_access_token(user["id"])
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
        existing_user = get_user_by_oauth_id(google_id) or get_user_by_email(email)
        
        if existing_user:
            # Update existing user
            user_id = existing_user["id"]
            updates = {}
            if avatar and avatar != existing_user.get("avatar"):
                updates["avatar"] = avatar
            if name and name != existing_user.get("name"):
                updates["name"] = name
            if not existing_user.get("oauth_id"):
                updates["oauth_id"] = google_id
                updates["oauth_provider"] = "google"
            if updates:
                update_user(user_id, updates)
                existing_user.update(updates)
            user_data = existing_user
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            user_data = {
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
            create_user(user_data)
        
        access_token = create_access_token(user_id)
        
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
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return UserResponse(**{k: v for k, v in user.items() if k not in ["password", "oauth_id"]})


@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile: UserProfile,
    user_id: Optional[str] = Depends(get_current_user_id)
):
    """Update user profile"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    updates = {}
    if profile.name:
        updates["name"] = profile.name
    if profile.avatar:
        updates["avatar"] = profile.avatar
    if profile.preferences:
        updates["preferences"] = json.dumps(profile.preferences)
    
    if updates:
        update_user(user_id, updates)
        user.update(updates)
    
    return UserResponse(**{k: v for k, v in user.items() if k not in ["password", "oauth_id"]})


@router.get("/me/designs")
async def get_user_designs_endpoint(user_id: Optional[str] = Depends(get_current_user_id)):
    """Get user saved designs"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_designs = get_user_designs(user_id)
    return {
        "designs": user_designs,
        "total": len(user_designs),
    }


@router.post("/me/designs", response_model=SavedDesign)
async def save_design_endpoint(
    design: DesignSaveRequest,
    user_id: Optional[str] = Depends(get_current_user_id)
):
    """Save a design to user history"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    design_id = str(uuid.uuid4())
    design_data = {
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
    
    save_design(user_id, design_data)
    
    logger.info(f"Design saved for user {user_id}: {design_id}")
    
    return SavedDesign(**design_data)


@router.delete("/me/designs/{design_id}")
async def delete_design_endpoint(
    design_id: str,
    user_id: Optional[str] = Depends(get_current_user_id)
):
    """Delete a saved design"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    deleted = delete_design_by_id(user_id, design_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Design not found")
    
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

