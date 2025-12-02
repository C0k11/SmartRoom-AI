from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.furniture_matching_service import FurnitureMatchingService

router = APIRouter()
logger = logging.getLogger(__name__)

furniture_service = FurnitureMatchingService()


class FurnitureItem(BaseModel):
    id: str
    name: str
    category: str
    price: float
    image: str
    link: str
    dimensions: str
    brand: str
    style: List[str]
    description: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None


class FurnitureSearchResponse(BaseModel):
    items: List[FurnitureItem]
    total: int
    page: int
    page_size: int


class ShoppingListItem(BaseModel):
    furniture: FurnitureItem
    quantity: int
    notes: Optional[str] = None


class ShoppingList(BaseModel):
    id: str
    design_id: str
    items: List[ShoppingListItem]
    total_cost: float
    created_at: str


@router.get("/search", response_model=FurnitureSearchResponse)
async def search_furniture(
    query: Optional[str] = Query(None, description="搜索关键词"),
    category: Optional[str] = Query(None, description="家具类别"),
    style: Optional[str] = Query(None, description="风格"),
    min_price: Optional[float] = Query(None, description="最低价格"),
    max_price: Optional[float] = Query(None, description="最高价格"),
    brand: Optional[str] = Query(None, description="品牌"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
):
    """
    搜索家具
    
    支持关键词搜索和多种筛选条件
    """
    results = await furniture_service.search(
        query=query,
        category=category,
        style=style,
        min_price=min_price,
        max_price=max_price,
        brand=brand,
        page=page,
        page_size=page_size,
    )
    
    return FurnitureSearchResponse(
        items=results["items"],
        total=results["total"],
        page=page,
        page_size=page_size,
    )


@router.get("/categories")
async def get_categories():
    """Get all furniture categories"""
    return {
        "categories": [
            {"id": "sofa", "name": "沙发", "icon": "🛋️"},
            {"id": "table", "name": "桌子", "icon": "🪑"},
            {"id": "chair", "name": "椅子", "icon": "💺"},
            {"id": "bed", "name": "床", "icon": "🛏️"},
            {"id": "storage", "name": "收纳", "icon": "📦"},
            {"id": "lighting", "name": "灯具", "icon": "💡"},
            {"id": "decor", "name": "装饰", "icon": "🖼️"},
            {"id": "rug", "name": "地毯", "icon": "🧶"},
            {"id": "curtain", "name": "窗帘", "icon": "🪟"},
        ]
    }


@router.get("/styles")
async def get_styles():
    """Get all furniture styles"""
    return {
        "styles": [
            {"id": "modern", "name": "现代简约"},
            {"id": "nordic", "name": "北欧风格"},
            {"id": "japanese", "name": "日式禅风"},
            {"id": "industrial", "name": "工业风格"},
            {"id": "bohemian", "name": "波西米亚"},
            {"id": "midcentury", "name": "中古世纪"},
            {"id": "coastal", "name": "海岸风格"},
            {"id": "farmhouse", "name": "田园农舍"},
        ]
    }


@router.get("/brands")
async def get_brands():
    """Get all brands"""
    return {
        "brands": [
            {"id": "ikea", "name": "IKEA", "country": "瑞典"},
            {"id": "muji", "name": "MUJI 无印良品", "country": "日本"},
            {"id": "hay", "name": "HAY", "country": "丹麦"},
            {"id": "zara_home", "name": "ZARA HOME", "country": "西班牙"},
            {"id": "hm_home", "name": "H&M HOME", "country": "瑞典"},
            {"id": "yuanshimuyu", "name": "源氏木语", "country": "中国"},
            {"id": "muzhigongfang", "name": "木智工坊", "country": "中国"},
        ]
    }


@router.get("/{furniture_id}", response_model=FurnitureItem)
async def get_furniture_detail(furniture_id: str):
    """Get furniture detail"""
    item = await furniture_service.get_by_id(furniture_id)
    if not item:
        return {"error": "Furniture not found"}
    return item


@router.post("/match")
async def match_furniture_for_design(
    style: str,
    room_type: str,
    budget: float,
    existing_furniture: Optional[List[str]] = None,
):
    """
    Match furniture for design proposal
    
    Intelligently recommend furniture combinations based on style, room type, and budget
    """
    matches = await furniture_service.match_furniture(
        style=style,
        room_type=room_type,
        budget=budget,
        exclude=existing_furniture or [],
    )
    
    return {
        "matches": matches,
        "total_cost": sum(m["price"] for m in matches),
        "within_budget": sum(m["price"] for m in matches) <= budget,
    }


@router.post("/shopping-list/create")
async def create_shopping_list(design_id: str, items: List[dict]):
    """Create shopping list"""
    # TODO: Implement with database
    return {
        "id": "sl-001",
        "design_id": design_id,
        "items": items,
        "total_cost": sum(item.get("price", 0) * item.get("quantity", 1) for item in items),
        "download_url": f"/api/v1/furniture/shopping-list/sl-001/pdf"
    }


@router.get("/shopping-list/{list_id}/pdf")
async def download_shopping_list_pdf(list_id: str):
    """Download shopping list PDF"""
    # TODO: Generate PDF
    return {"message": "PDF download feature under development", "list_id": list_id}


@router.get("/demo/items", response_model=List[FurnitureItem])
async def get_demo_furniture():
    """Get example furniture data"""
    return [
        FurnitureItem(
            id="demo-f1",
            name="北欧布艺沙发",
            category="sofa",
            price=3200,
            image="https://example.com/sofa.jpg",
            link="https://www.ikea.cn/cn/zh/",
            dimensions="220x85x80cm",
            brand="IKEA",
            style=["nordic", "modern"],
            description="简约北欧风格三人沙发，舒适透气面料",
            rating=4.5,
            reviews_count=1234,
        ),
        FurnitureItem(
            id="demo-f2",
            name="原木茶几",
            category="table",
            price=1200,
            image="https://example.com/table.jpg",
            link="https://example.com",
            dimensions="120x60x45cm",
            brand="源氏木语",
            style=["nordic", "japanese"],
            description="天然橡木打造，简约大方",
            rating=4.7,
            reviews_count=856,
        ),
        FurnitureItem(
            id="demo-f3",
            name="日式纸灯笼吊灯",
            category="lighting",
            price=520,
            image="https://example.com/lamp.jpg",
            link="https://example.com",
            dimensions="D45cm",
            brand="Noguchi",
            style=["japanese"],
            description="经典和纸灯笼设计，柔和光线",
            rating=4.8,
            reviews_count=423,
        ),
    ]

