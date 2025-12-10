from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
import sqlite3
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter()

# Database setup
DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "users.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_db_connection():
    """Get SQLite database connection"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_projects_table():
    """Initialize projects table if not exists"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            room_type TEXT NOT NULL,
            thumbnail TEXT,
            status TEXT DEFAULT 'draft',
            original_image TEXT,
            analysis TEXT,
            selected_design_id TEXT,
            preferences TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Add project_id column to designs table if not exists
    try:
        cursor.execute('ALTER TABLE designs ADD COLUMN project_id TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    conn.commit()
    conn.close()


# Initialize table on module load
init_projects_table()


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    room_type: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    room_type: Optional[str] = None
    status: Optional[str] = None
    thumbnail: Optional[str] = None
    original_image: Optional[str] = None
    analysis: Optional[dict] = None
    preferences: Optional[dict] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    room_type: str
    thumbnail: Optional[str]
    status: str
    created_at: str
    updated_at: str
    designs_count: int


class ProjectDetail(ProjectResponse):
    original_image: Optional[str]
    analysis: Optional[dict]
    designs: List[dict]
    selected_design_id: Optional[str]
    preferences: Optional[dict]


# Auth helper - reuse from users.py
from jose import jwt, JWTError
from app.core.config import settings

ALGORITHM = "HS256"


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


async def require_auth(authorization: Optional[str] = Header(None)) -> str:
    """Require authentication"""
    user_id = await get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_id


# Database helpers
def get_project_by_id(project_id: str, user_id: str) -> Optional[dict]:
    """Get a project by ID for a specific user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM projects WHERE id = ? AND user_id = ?',
        (project_id, user_id)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def get_user_projects(user_id: str) -> List[dict]:
    """Get all projects for a user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_project_designs(project_id: str) -> List[dict]:
    """Get all designs for a project"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM designs WHERE project_id = ? ORDER BY created_at DESC',
        (project_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    designs = []
    for row in rows:
        design = dict(row)
        if design.get('furniture_items'):
            try:
                design['furniture_items'] = json.loads(design['furniture_items'])
            except:
                design['furniture_items'] = []
        else:
            design['furniture_items'] = []
        designs.append(design)
    return designs


def count_project_designs(project_id: str) -> int:
    """Count designs for a project"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT COUNT(*) FROM designs WHERE project_id = ?',
        (project_id,)
    )
    count = cursor.fetchone()[0]
    conn.close()
    return count


def create_project_db(user_id: str, project_data: dict) -> dict:
    """Create a project in database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO projects (id, user_id, name, description, room_type, thumbnail, 
                              status, original_image, analysis, selected_design_id, preferences, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        project_data['id'],
        user_id,
        project_data['name'],
        project_data.get('description'),
        project_data['room_type'],
        project_data.get('thumbnail'),
        project_data.get('status', 'draft'),
        project_data.get('original_image'),
        json.dumps(project_data.get('analysis')) if project_data.get('analysis') else None,
        project_data.get('selected_design_id'),
        json.dumps(project_data.get('preferences')) if project_data.get('preferences') else None,
        project_data['created_at'],
        project_data['updated_at'],
    ))
    conn.commit()
    conn.close()
    return project_data


def update_project_db(project_id: str, updates: dict):
    """Update a project in database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Handle JSON fields
    if 'analysis' in updates:
        updates['analysis'] = json.dumps(updates['analysis']) if updates['analysis'] else None
    if 'preferences' in updates:
        updates['preferences'] = json.dumps(updates['preferences']) if updates['preferences'] else None
    
    updates['updated_at'] = datetime.now().isoformat()
    
    set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
    values = list(updates.values()) + [project_id]
    cursor.execute(f'UPDATE projects SET {set_clause} WHERE id = ?', values)
    conn.commit()
    conn.close()


def delete_project_db(project_id: str, user_id: str) -> bool:
    """Delete a project and its designs"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Delete associated designs first
    cursor.execute('DELETE FROM designs WHERE project_id = ?', (project_id,))
    
    # Delete the project
    cursor.execute(
        'DELETE FROM projects WHERE id = ? AND user_id = ?',
        (project_id, user_id)
    )
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


# API Routes
@router.get("/", response_model=List[ProjectResponse])
async def list_projects(user_id: str = Depends(require_auth)):
    """
    获取用户的所有项目
    """
    projects = get_user_projects(user_id)
    return [
        ProjectResponse(
            id=p['id'],
            name=p['name'],
            description=p.get('description'),
            room_type=p['room_type'],
            thumbnail=p.get('thumbnail'),
            status=p.get('status', 'draft'),
            created_at=p['created_at'],
            updated_at=p['updated_at'],
            designs_count=count_project_designs(p['id']),
        )
        for p in projects
    ]


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, user_id: str = Depends(require_auth)):
    """
    创建新项目
    """
    project_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    project_data = {
        'id': project_id,
        'name': project.name,
        'description': project.description,
        'room_type': project.room_type,
        'thumbnail': None,
        'status': 'draft',
        'original_image': None,
        'analysis': None,
        'selected_design_id': None,
        'preferences': None,
        'created_at': now,
        'updated_at': now,
    }
    
    create_project_db(user_id, project_data)
    logger.info(f"Project created: {project_id} for user {user_id}")
    
    return ProjectResponse(
        id=project_id,
        name=project.name,
        description=project.description,
        room_type=project.room_type,
        thumbnail=None,
        status='draft',
        created_at=now,
        updated_at=now,
        designs_count=0,
    )


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str, user_id: str = Depends(require_auth)):
    """
    获取项目详情
    """
    p = get_project_by_id(project_id, user_id)
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    designs = get_project_designs(project_id)
    analysis = None
    preferences = None
    
    if p.get('analysis'):
        try:
            analysis = json.loads(p['analysis'])
        except:
            pass
    
    if p.get('preferences'):
        try:
            preferences = json.loads(p['preferences'])
        except:
            pass
    
    return ProjectDetail(
        id=project_id,
        name=p['name'],
        description=p.get('description'),
        room_type=p['room_type'],
        thumbnail=p.get('thumbnail'),
        status=p.get('status', 'draft'),
        created_at=p['created_at'],
        updated_at=p['updated_at'],
        designs_count=len(designs),
        original_image=p.get('original_image'),
        analysis=analysis,
        designs=designs,
        selected_design_id=p.get('selected_design_id'),
        preferences=preferences,
    )


@router.put("/{project_id}")
async def update_project(
    project_id: str,
    updates: ProjectUpdate,
    user_id: str = Depends(require_auth)
):
    """
    更新项目
    """
    p = get_project_by_id(project_id, user_id)
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # Convert to dict and remove None values
    update_dict = {k: v for k, v in updates.dict().items() if v is not None}
    
    if update_dict:
        update_project_db(project_id, update_dict)
    
    return {"message": "项目已更新", "project_id": project_id}


@router.delete("/{project_id}")
async def delete_project(project_id: str, user_id: str = Depends(require_auth)):
    """
    删除项目
    """
    deleted = delete_project_db(project_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    logger.info(f"Project deleted: {project_id}")
    return {"message": "项目已删除", "project_id": project_id}


@router.post("/{project_id}/designs/{design_id}/select")
async def select_design(
    project_id: str,
    design_id: str,
    user_id: str = Depends(require_auth)
):
    """
    选择设计方案
    """
    p = get_project_by_id(project_id, user_id)
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    update_project_db(project_id, {'selected_design_id': design_id, 'status': 'completed'})
    
    return {"message": "已选择设计方案", "design_id": design_id}


@router.post("/{project_id}/duplicate")
async def duplicate_project(project_id: str, user_id: str = Depends(require_auth)):
    """
    复制项目
    """
    p = get_project_by_id(project_id, user_id)
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    new_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    new_project = {
        'id': new_id,
        'name': f"{p['name']} (副本)",
        'description': p.get('description'),
        'room_type': p['room_type'],
        'thumbnail': p.get('thumbnail'),
        'status': 'draft',
        'original_image': p.get('original_image'),
        'analysis': json.loads(p['analysis']) if p.get('analysis') else None,
        'selected_design_id': None,
        'preferences': json.loads(p['preferences']) if p.get('preferences') else None,
        'created_at': now,
        'updated_at': now,
    }
    
    create_project_db(user_id, new_project)
    
    return {"message": "项目已复制", "new_project_id": new_id}


class DesignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: str
    original_image: Optional[str] = None
    style: str
    total_cost: float = 0
    furniture_items: Optional[List[dict]] = None


@router.post("/{project_id}/designs")
async def add_design_to_project(
    project_id: str,
    design: DesignCreate,
    user_id: str = Depends(require_auth)
):
    """
    添加设计到项目
    """
    p = get_project_by_id(project_id, user_id)
    if not p:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    design_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    furniture_items = json.dumps(design.furniture_items or [])
    
    cursor.execute('''
        INSERT INTO designs (id, user_id, project_id, name, description, image_url, 
                            original_image, style, total_cost, furniture_items, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        design_id,
        user_id,
        project_id,
        design.name,
        design.description,
        design.image_url,
        design.original_image,
        design.style,
        design.total_cost,
        furniture_items,
        now,
    ))
    
    # Update project status to in_progress if it was draft
    if p.get('status') == 'draft':
        cursor.execute(
            'UPDATE projects SET status = ?, updated_at = ? WHERE id = ?',
            ('in_progress', now, project_id)
        )
    
    # Set as thumbnail if project has none
    if not p.get('thumbnail'):
        cursor.execute(
            'UPDATE projects SET thumbnail = ?, updated_at = ? WHERE id = ?',
            (design.image_url, now, project_id)
        )
    
    conn.commit()
    conn.close()
    
    logger.info(f"Design {design_id} added to project {project_id}")
    
    return {
        "id": design_id,
        "project_id": project_id,
        "name": design.name,
        "created_at": now,
        "message": "设计已添加到项目"
    }

