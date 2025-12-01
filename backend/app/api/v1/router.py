from fastapi import APIRouter

from app.api.v1.endpoints import (
    analysis,
    design,
    furniture,
    users,
    projects,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["房间分析"]
)

api_router.include_router(
    design.router,
    prefix="/design",
    tags=["设计生成"]
)

api_router.include_router(
    furniture.router,
    prefix="/furniture",
    tags=["家具匹配"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["用户管理"]
)

api_router.include_router(
    projects.router,
    prefix="/projects",
    tags=["项目管理"]
)

