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
            {"id": "sofa", "name": "沙发", "nameEn": "Sofa"},
            {"id": "table", "name": "桌子", "nameEn": "Table"},
            {"id": "chair", "name": "椅子", "nameEn": "Chair"},
            {"id": "bed", "name": "床", "nameEn": "Bed"},
            {"id": "storage", "name": "收纳", "nameEn": "Storage"},
            {"id": "lighting", "name": "灯具", "nameEn": "Lighting"},
            {"id": "decor", "name": "装饰", "nameEn": "Decor"},
            {"id": "rug", "name": "地毯", "nameEn": "Rug"},
            {"id": "curtain", "name": "窗帘", "nameEn": "Curtain"},
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


def generate_search_links(product_name: str, brand: str) -> dict:
    """Generate search links for multiple e-commerce platforms"""
    import urllib.parse
    
    # Use product name + brand for better search results
    search_query = f"{brand} {product_name}" if brand else product_name
    encoded_query = urllib.parse.quote(search_query)
    
    return {
        "taobao": f"https://s.taobao.com/search?q={encoded_query}",
        "jd": f"https://search.jd.com/Search?keyword={encoded_query}",
        "tmall": f"https://list.tmall.com/search_product.htm?q={encoded_query}",
        "amazon": f"https://www.amazon.cn/s?k={encoded_query}",
        "ikea": f"https://www.ikea.cn/cn/zh/search/?q={urllib.parse.quote(product_name)}",
    }


@router.get("/products")
async def get_all_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    style: Optional[str] = Query(None, description="Filter by style"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    """
    Get furniture products with search links to multiple e-commerce platforms.
    Instead of direct product links (which can expire), we provide search links
    so users can find and purchase similar products on their preferred platform.
    """
    # Product catalog with reference images and search-based purchase links
    all_products = [
        # Sofas
        {
            "id": "ikea-sofa-001",
            "name": "KIVIK 奇维三人沙发",
            "nameEn": "KIVIK 3-seat sofa",
            "category": "sofa",
            "price": 4999,
            "originalPrice": 5999,
            "image": "https://www.ikea.com/cn/zh/images/products/kivik-3-seat-sofa-tibbleby-beige__1058258_pe849252_s5.jpg",
            "brand": "IKEA",
            "style": ["nordic", "modern"],
            "colors": ["beige", "gray", "dark-blue"],
            "rating": 4.5,
            "reviews": 2341,
            "dimensions": "228x95x83cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/kivik-3-seat-sofa-tibbleby-beige-s09429471/",
            "platform": "IKEA"
        },
        {
            "id": "ikea-sofa-002",
            "name": "LANDSKRONA 兰德克纳三人沙发",
            "nameEn": "LANDSKRONA 3-seat sofa",
            "category": "sofa",
            "price": 5999,
            "originalPrice": None,
            "image": "https://www.ikea.com/cn/zh/images/products/landskrona-3-seat-sofa-grann-bomstad-golden-brown-metal__0602113_pe680192_s5.jpg",
            "brand": "IKEA",
            "style": ["modern", "industrial"],
            "colors": ["brown", "black", "beige"],
            "rating": 4.7,
            "reviews": 1856,
            "dimensions": "204x89x78cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/landskrona-3-seat-sofa-grann-bomstad-golden-brown-metal-s69270345/",
            "platform": "IKEA"
        },
        {
            "id": "muji-sofa-001",
            "name": "棉麻软垫沙发",
            "nameEn": "Cotton Linen Cushion Sofa",
            "category": "sofa",
            "price": 6980,
            "originalPrice": 7980,
            "image": "https://www.muji.com/cn/cmdty/section/S107010201",
            "brand": "MUJI",
            "style": ["japanese", "nordic"],
            "colors": ["natural", "gray", "brown"],
            "rating": 4.8,
            "reviews": 967,
            "dimensions": "205x88x76cm",
            "inStock": True,
            "link": "https://www.muji.com/cn/products/cmdty/detail/4550344595114",
            "platform": "MUJI"
        },
        # Tables
        {
            "id": "ikea-table-001",
            "name": "LACK 拉克茶几",
            "nameEn": "LACK Coffee table",
            "category": "table",
            "price": 149,
            "originalPrice": None,
            "image": "https://www.ikea.com/cn/zh/images/products/lack-coffee-table-black-brown__0836233_pe601594_s5.jpg",
            "brand": "IKEA",
            "style": ["modern", "nordic"],
            "colors": ["black", "white", "oak"],
            "rating": 4.3,
            "reviews": 5678,
            "dimensions": "118x78x45cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/lack-coffee-table-black-brown-80104268/",
            "platform": "IKEA"
        },
        {
            "id": "ikea-table-002",
            "name": "LISTERBY 利斯伯茶几",
            "nameEn": "LISTERBY Coffee table",
            "category": "table",
            "price": 1299,
            "originalPrice": 1499,
            "image": "https://www.ikea.com/cn/zh/images/products/listerby-coffee-table-white-stained-oak__0736073_pe740334_s5.jpg",
            "brand": "IKEA",
            "style": ["nordic", "modern"],
            "colors": ["oak", "dark-brown"],
            "rating": 4.6,
            "reviews": 1234,
            "dimensions": "140x60x45cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/listerby-coffee-table-white-stained-oak-40457089/",
            "platform": "IKEA"
        },
        {
            "id": "hay-table-001",
            "name": "CPH 90 Coffee Table",
            "nameEn": "CPH 90 Coffee Table",
            "category": "table",
            "price": 3680,
            "originalPrice": None,
            "image": "https://cdn.connox.com/m/100030/268164/media/HAY/CPH-90/CPH-90-Couchtisch-130-x-65-cm-Eiche-matt-lackiert.jpg",
            "brand": "HAY",
            "style": ["nordic", "modern"],
            "colors": ["oak", "black", "white"],
            "rating": 4.9,
            "reviews": 456,
            "dimensions": "130x65x39cm",
            "inStock": True,
            "link": "https://hay.dk/en/hay/furniture/tables/coffee-tables/cph-90",
            "platform": "HAY"
        },
        # Chairs
        {
            "id": "ikea-chair-001",
            "name": "POANG 波昂休闲椅",
            "nameEn": "POANG Armchair",
            "category": "chair",
            "price": 799,
            "originalPrice": 999,
            "image": "https://www.ikea.com/cn/zh/images/products/poaeng-armchair-birch-veneer-knisa-light-beige__0497130_pe628957_s5.jpg",
            "brand": "IKEA",
            "style": ["nordic", "modern"],
            "colors": ["birch", "black", "oak"],
            "rating": 4.6,
            "reviews": 8934,
            "dimensions": "68x82x100cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/poaeng-armchair-birch-veneer-knisa-light-beige-s29336093/",
            "platform": "IKEA"
        },
        {
            "id": "hay-chair-001",
            "name": "About A Chair AAC22",
            "nameEn": "About A Chair AAC22",
            "category": "chair",
            "price": 2980,
            "originalPrice": None,
            "image": "https://cdn.connox.com/m/100030/219889/media/HAY/About-A-Chair/About-A-Chair-AAC-22-Eiche-mattlackiert-dusty-blue-2-0.jpg",
            "brand": "HAY",
            "style": ["nordic", "modern"],
            "colors": ["dusty-blue", "white", "black", "green"],
            "rating": 4.8,
            "reviews": 678,
            "dimensions": "59x52x79cm",
            "inStock": True,
            "link": "https://hay.dk/en/hay/furniture/seating/chairs/about-a-chair/aac-22",
            "platform": "HAY"
        },
        # Lighting
        {
            "id": "ikea-light-001",
            "name": "HEKTAR 赫克塔落地灯",
            "nameEn": "HEKTAR Floor lamp",
            "category": "lighting",
            "price": 499,
            "originalPrice": 599,
            "image": "https://www.ikea.com/cn/zh/images/products/hektar-floor-lamp-dark-grey__0606284_pe682405_s5.jpg",
            "brand": "IKEA",
            "style": ["industrial", "modern"],
            "colors": ["dark-gray", "white", "beige"],
            "rating": 4.5,
            "reviews": 2345,
            "dimensions": "H181cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/hektar-floor-lamp-dark-grey-80216564/",
            "platform": "IKEA"
        },
        {
            "id": "muji-light-001",
            "name": "LED落地灯",
            "nameEn": "LED Floor Lamp",
            "category": "lighting",
            "price": 1290,
            "originalPrice": None,
            "image": "https://www.muji.com/cn/cmdty/section/S107020502",
            "brand": "MUJI",
            "style": ["japanese", "modern"],
            "colors": ["white", "black"],
            "rating": 4.7,
            "reviews": 567,
            "dimensions": "H150cm",
            "inStock": True,
            "link": "https://www.muji.com/cn/products/cmdty/detail/4550344294710",
            "platform": "MUJI"
        },
        {
            "id": "flos-light-001",
            "name": "Arco Floor Lamp",
            "nameEn": "Arco Floor Lamp",
            "category": "lighting",
            "price": 18900,
            "originalPrice": None,
            "image": "https://cdn.connox.com/m/100030/203741/media/flos/Arco/Arco-Stehleuchte-LED-schwarz.jpg",
            "brand": "Flos",
            "style": ["modern", "midcentury"],
            "colors": ["silver", "black"],
            "rating": 4.9,
            "reviews": 234,
            "dimensions": "H240cm",
            "inStock": True,
            "link": "https://flos.com/products/arco",
            "platform": "Flos"
        },
        # Storage
        {
            "id": "ikea-storage-001",
            "name": "KALLAX 卡莱克搁架单元",
            "nameEn": "KALLAX Shelf unit",
            "category": "storage",
            "price": 499,
            "originalPrice": None,
            "image": "https://www.ikea.com/cn/zh/images/products/kallax-shelf-unit-white__0644757_pe702939_s5.jpg",
            "brand": "IKEA",
            "style": ["modern", "nordic"],
            "colors": ["white", "black-brown", "oak"],
            "rating": 4.7,
            "reviews": 12345,
            "dimensions": "147x147x39cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/kallax-shelf-unit-white-80275887/",
            "platform": "IKEA"
        },
        {
            "id": "ikea-storage-002",
            "name": "BILLY 毕利书架",
            "nameEn": "BILLY Bookcase",
            "category": "storage",
            "price": 399,
            "originalPrice": 499,
            "image": "https://www.ikea.com/cn/zh/images/products/billy-bookcase-white__0644760_pe702942_s5.jpg",
            "brand": "IKEA",
            "style": ["modern", "nordic"],
            "colors": ["white", "black-brown", "birch"],
            "rating": 4.6,
            "reviews": 9876,
            "dimensions": "80x28x202cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/billy-bookcase-white-00263850/",
            "platform": "IKEA"
        },
        # Rugs
        {
            "id": "ikea-rug-001",
            "name": "VINDUM 温杜姆长绒地毯",
            "nameEn": "VINDUM Rug high pile",
            "category": "rug",
            "price": 999,
            "originalPrice": 1299,
            "image": "https://www.ikea.com/cn/zh/images/products/vindum-rug-high-pile-white__0530277_pe646805_s5.jpg",
            "brand": "IKEA",
            "style": ["nordic", "modern"],
            "colors": ["white", "dark-gray", "blue-green"],
            "rating": 4.4,
            "reviews": 3456,
            "dimensions": "200x270cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/vindum-rug-high-pile-white-40344985/",
            "platform": "IKEA"
        },
        {
            "id": "muji-rug-001",
            "name": "印度手工编织棉地毯",
            "nameEn": "Indian Handwoven Cotton Rug",
            "category": "rug",
            "price": 1590,
            "originalPrice": None,
            "image": "https://www.muji.com/cn/cmdty/section/S107040301",
            "brand": "MUJI",
            "style": ["japanese", "nordic"],
            "colors": ["natural", "gray", "blue"],
            "rating": 4.6,
            "reviews": 678,
            "dimensions": "200x140cm",
            "inStock": True,
            "link": "https://www.muji.com/cn/products/cmdty/detail/4550344280522",
            "platform": "MUJI"
        },
        # Beds
        {
            "id": "ikea-bed-001",
            "name": "MALM 马尔姆高床架",
            "nameEn": "MALM High bed frame",
            "category": "bed",
            "price": 1999,
            "originalPrice": 2499,
            "image": "https://www.ikea.com/cn/zh/images/products/malm-high-bed-frame-2-storage-boxes-white-stained-oak-veneer-luroey__0749130_pe745499_s5.jpg",
            "brand": "IKEA",
            "style": ["modern", "nordic"],
            "colors": ["white-oak", "black-brown", "white"],
            "rating": 4.5,
            "reviews": 4567,
            "dimensions": "150x200cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/malm-high-bed-frame-2-storage-boxes-white-stained-oak-veneer-luroey-s69175605/",
            "platform": "IKEA"
        },
        {
            "id": "muji-bed-001",
            "name": "橡木双人床架",
            "nameEn": "Oak Double Bed Frame",
            "category": "bed",
            "price": 4990,
            "originalPrice": None,
            "image": "https://www.muji.com/cn/cmdty/section/S107010101",
            "brand": "MUJI",
            "style": ["japanese", "nordic"],
            "colors": ["natural-oak"],
            "rating": 4.8,
            "reviews": 876,
            "dimensions": "150x200cm",
            "inStock": True,
            "link": "https://www.muji.com/cn/products/cmdty/detail/4550344595008",
            "platform": "MUJI"
        },
        # Decor
        {
            "id": "ikea-decor-001",
            "name": "FEJKA 菲卡人造盆栽",
            "nameEn": "FEJKA Artificial potted plant",
            "category": "decor",
            "price": 99,
            "originalPrice": None,
            "image": "https://www.ikea.com/cn/zh/images/products/fejka-artificial-potted-plant-in-outdoor-monstera__0614211_pe686822_s5.jpg",
            "brand": "IKEA",
            "style": ["modern", "nordic", "japanese"],
            "colors": ["green"],
            "rating": 4.3,
            "reviews": 6789,
            "dimensions": "H90cm",
            "inStock": True,
            "link": "https://www.ikea.com/cn/zh/p/fejka-artificial-potted-plant-in-outdoor-monstera-40395288/",
            "platform": "IKEA"
        },
        {
            "id": "hay-decor-001",
            "name": "Kaleido Tray",
            "nameEn": "Kaleido Tray",
            "category": "decor",
            "price": 380,
            "originalPrice": None,
            "image": "https://cdn.connox.com/m/100030/104855/media/HAY/Kaleido/HAY-Kaleido-Tablett-XL-mint.jpg",
            "brand": "HAY",
            "style": ["nordic", "modern"],
            "colors": ["mint", "red", "yellow", "gray"],
            "rating": 4.7,
            "reviews": 345,
            "dimensions": "45x39cm",
            "inStock": True,
            "link": "https://hay.dk/en/hay/accessories/home-accessories/kaleido",
            "platform": "HAY"
        },
    ]
    
    # Apply filters
    filtered = all_products
    
    if category:
        filtered = [p for p in filtered if p["category"] == category]
    
    if style:
        filtered = [p for p in filtered if style in p["style"]]
    
    if brand:
        filtered = [p for p in filtered if brand.lower() in p["brand"].lower()]
    
    if min_price is not None:
        filtered = [p for p in filtered if p["price"] >= min_price]
    
    if max_price is not None:
        filtered = [p for p in filtered if p["price"] <= max_price]
    
    # Pagination
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]
    
    # Add search links to each product
    for product in paginated:
        product["searchLinks"] = generate_search_links(
            product.get("nameEn", product["name"]), 
            product["brand"]
        )
    
    return {
        "items": paginated,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": (total + page_size - 1) // page_size
    }


@router.get("/demo/items", response_model=List[FurnitureItem])
async def get_demo_furniture():
    """Get example furniture data"""
    return [
        FurnitureItem(
            id="demo-f1",
            name="KIVIK 奇维三人沙发",
            category="sofa",
            price=4999,
            image="https://www.ikea.com/cn/zh/images/products/kivik-3-seat-sofa-tibbleby-beige__1058258_pe849252_s5.jpg",
            link="https://www.ikea.com/cn/zh/p/kivik-3-seat-sofa-tibbleby-beige-s09429471/",
            dimensions="228x95x83cm",
            brand="IKEA",
            style=["nordic", "modern"],
            description="IKEA经典三人沙发,舒适坐感,多色可选",
            rating=4.5,
            reviews_count=2341,
        ),
        FurnitureItem(
            id="demo-f2",
            name="LISTERBY 利斯伯茶几",
            category="table",
            price=1299,
            image="https://www.ikea.com/cn/zh/images/products/listerby-coffee-table-white-stained-oak__0736073_pe740334_s5.jpg",
            link="https://www.ikea.com/cn/zh/p/listerby-coffee-table-white-stained-oak-40457089/",
            dimensions="140x60x45cm",
            brand="IKEA",
            style=["nordic", "modern"],
            description="橡木贴面茶几,现代北欧设计",
            rating=4.6,
            reviews_count=1234,
        ),
        FurnitureItem(
            id="demo-f3",
            name="HEKTAR 赫克塔落地灯",
            category="lighting",
            price=499,
            image="https://www.ikea.com/cn/zh/images/products/hektar-floor-lamp-dark-grey__0606284_pe682405_s5.jpg",
            link="https://www.ikea.com/cn/zh/p/hektar-floor-lamp-dark-grey-80216564/",
            dimensions="H181cm",
            brand="IKEA",
            style=["industrial", "modern"],
            description="工业风落地灯,可调节方向",
            rating=4.5,
            reviews_count=2345,
        ),
    ]


# NOTE: This route must be at the end because it's a catch-all pattern
@router.get("/{furniture_id}", response_model=FurnitureItem)
async def get_furniture_detail(furniture_id: str):
    """Get furniture detail by ID"""
    item = await furniture_service.get_by_id(furniture_id)
    if not item:
        return {"error": "Furniture not found"}
    return item
