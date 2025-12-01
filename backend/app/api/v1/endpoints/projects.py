from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    room_type: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    room_type: str
    thumbnail: Optional[str]
    status: str  # draft, in_progress, completed
    created_at: str
    updated_at: str
    designs_count: int


class ProjectDetail(ProjectResponse):
    original_image: Optional[str]
    analysis: Optional[dict]
    designs: List[dict]
    selected_design_id: Optional[str]
    shopping_list_id: Optional[str]


# Demo storage
demo_projects: dict = {}


@router.get("/", response_model=List[ProjectResponse])
async def list_projects():
    """
    获取用户的所有项目
    """
    return [
        ProjectResponse(
            id=pid,
            name=p["name"],
            description=p.get("description"),
            room_type=p["room_type"],
            thumbnail=p.get("thumbnail"),
            status=p.get("status", "draft"),
            created_at=p["created_at"],
            updated_at=p.get("updated_at", p["created_at"]),
            designs_count=len(p.get("designs", [])),
        )
        for pid, p in demo_projects.items()
    ]


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """
    创建新项目
    """
    project_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    demo_projects[project_id] = {
        "name": project.name,
        "description": project.description,
        "room_type": project.room_type,
        "thumbnail": None,
        "status": "draft",
        "created_at": now,
        "updated_at": now,
        "original_image": None,
        "analysis": None,
        "designs": [],
        "selected_design_id": None,
        "shopping_list_id": None,
    }
    
    return ProjectResponse(
        id=project_id,
        name=project.name,
        description=project.description,
        room_type=project.room_type,
        thumbnail=None,
        status="draft",
        created_at=now,
        updated_at=now,
        designs_count=0,
    )


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str):
    """
    获取项目详情
    """
    if project_id not in demo_projects:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    p = demo_projects[project_id]
    return ProjectDetail(
        id=project_id,
        name=p["name"],
        description=p.get("description"),
        room_type=p["room_type"],
        thumbnail=p.get("thumbnail"),
        status=p.get("status", "draft"),
        created_at=p["created_at"],
        updated_at=p.get("updated_at", p["created_at"]),
        designs_count=len(p.get("designs", [])),
        original_image=p.get("original_image"),
        analysis=p.get("analysis"),
        designs=p.get("designs", []),
        selected_design_id=p.get("selected_design_id"),
        shopping_list_id=p.get("shopping_list_id"),
    )


@router.put("/{project_id}")
async def update_project(project_id: str, updates: dict):
    """
    更新项目
    """
    if project_id not in demo_projects:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    demo_projects[project_id].update(updates)
    demo_projects[project_id]["updated_at"] = datetime.now().isoformat()
    
    return {"message": "项目已更新", "project_id": project_id}


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """
    删除项目
    """
    if project_id not in demo_projects:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    del demo_projects[project_id]
    return {"message": "项目已删除", "project_id": project_id}


@router.post("/{project_id}/designs/{design_id}/select")
async def select_design(project_id: str, design_id: str):
    """
    选择设计方案
    """
    if project_id not in demo_projects:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    demo_projects[project_id]["selected_design_id"] = design_id
    demo_projects[project_id]["updated_at"] = datetime.now().isoformat()
    
    return {"message": "已选择设计方案", "design_id": design_id}


@router.post("/{project_id}/duplicate")
async def duplicate_project(project_id: str):
    """
    复制项目
    """
    if project_id not in demo_projects:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    new_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    demo_projects[new_id] = {
        **demo_projects[project_id],
        "name": f"{demo_projects[project_id]['name']} (副本)",
        "created_at": now,
        "updated_at": now,
    }
    
    return {"message": "项目已复制", "new_project_id": new_id}

