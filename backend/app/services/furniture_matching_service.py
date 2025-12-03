import logging
from typing import List, Optional
import uuid
import json
import httpx
import urllib.parse

from app.core.config import settings

logger = logging.getLogger(__name__)


# Platform search URLs for different regions
PLATFORMS = {
    "CA": {  # Canada
        "currency": "CAD",
        "currency_symbol": "$",
        "platforms": [
            {"name": "Amazon Canada", "url": "https://www.amazon.ca/s?k={query}", "icon": "🛒"},
            {"name": "Best Buy Canada", "url": "https://www.bestbuy.ca/en-ca/search?search={query}", "icon": "🖥️"},
            {"name": "IKEA Canada", "url": "https://www.ikea.com/ca/en/search/?q={query}", "icon": "🏠"},
            {"name": "Wayfair Canada", "url": "https://www.wayfair.ca/keyword.html?keyword={query}", "icon": "🛋️"},
            {"name": "Structube", "url": "https://www.structube.com/en_ca/search?q={query}", "icon": "🪑"},
        ]
    },
    "US": {  # United States
        "currency": "USD",
        "currency_symbol": "$",
        "platforms": [
            {"name": "Amazon US", "url": "https://www.amazon.com/s?k={query}", "icon": "🛒"},
            {"name": "Best Buy US", "url": "https://www.bestbuy.com/site/searchpage.jsp?st={query}", "icon": "🖥️"},
            {"name": "IKEA US", "url": "https://www.ikea.com/us/en/search/?q={query}", "icon": "🏠"},
            {"name": "Wayfair US", "url": "https://www.wayfair.com/keyword.html?keyword={query}", "icon": "🛋️"},
            {"name": "Target", "url": "https://www.target.com/s?searchTerm={query}", "icon": "🎯"},
        ]
    },
    "CN": {  # China
        "currency": "CNY",
        "currency_symbol": "¥",
        "platforms": [
            {"name": "淘宝", "url": "https://s.taobao.com/search?q={query}", "icon": "🛒"},
            {"name": "天猫", "url": "https://list.tmall.com/search_product.htm?q={query}", "icon": "🐱"},
            {"name": "京东", "url": "https://search.jd.com/Search?keyword={query}", "icon": "🔴"},
            {"name": "宜家中国", "url": "https://www.ikea.cn/cn/zh/search/?q={query}", "icon": "🏠"},
        ]
    },
}


class FurnitureMatchingService:
    """Service for matching furniture using Claude AI as search engine"""
    
    def __init__(self):
        self.platforms = PLATFORMS
        self.anthropic_key = settings.ANTHROPIC_API_KEY
    
    def get_currency_info(self, region: str) -> dict:
        """Get currency info for region"""
        platform_info = self.platforms.get(region, self.platforms["CA"])
        return {
            "currency": platform_info["currency"],
            "symbol": platform_info["currency_symbol"],
        }
    
    def generate_search_links(self, query: str, region: str) -> List[dict]:
        """Generate search links for all platforms in region"""
        platform_info = self.platforms.get(region, self.platforms["CA"])
        links = []
        
        encoded_query = urllib.parse.quote(query)
        
        for platform in platform_info["platforms"]:
            links.append({
                "name": platform["name"],
                "url": platform["url"].format(query=encoded_query),
                "icon": platform["icon"],
            })
        
        return links
    
    async def search_with_claude(
        self,
        style: str,
        room_type: str,
        budget: float,
        user_needs: str,
        region: str = "CA",
    ) -> List[dict]:
        """
        Use Claude AI to recommend products with realistic prices
        """
        currency_info = self.get_currency_info(region)
        currency = currency_info["currency"]
        
        # Build the prompt for Claude
        prompt = f"""You are a professional interior designer and shopping assistant. Based on the following requirements, recommend specific products.

**Room Style**: {style}
**Room Type**: {room_type}
**Budget**: {budget} {currency}
**User's Specific Requests**: {user_needs if user_needs else "No specific requests"}
**Region**: {region} (use local pricing and stores)

⚠️ CRITICAL INSTRUCTIONS - YOU MUST FOLLOW EXACTLY:

1. **ONLY recommend products that the user specifically asked for.** 
   - If user said "只要电脑" or "很多电脑" (only computers / many computers), recommend ONLY computers, monitors, and PC-related equipment
   - If user said "只要农具" (only farm tools), recommend ONLY farm tools, NO furniture, NO electronics
   - If user said "不要家具" (no furniture), do NOT include any furniture
   - If user said "华硕显示器" (ASUS monitor), include ASUS monitors

2. **Parse the user's request carefully:**
   - "电脑" or "计算机" = computer / PC / desktop computer (NOT farm tools!)
   - "很多电脑" = many computers / multiple computers / multiple PC setups
   - "笔记本" = laptop
   - "显示器" = monitor / display screen
   - "农具" = farm tools (hoes, rakes, shovels, wheelbarrows, etc.)
   - "厨具" = kitchen utensils
   - "家具" = furniture (sofas, tables, chairs)
   - These are DIFFERENT things! Do NOT confuse "电脑" (computer) with "农具" (farm tools)!

3. **If user specified NO other items, recommend ONLY what they asked for**
   - Do not add "helpful suggestions"
   - Do not add decorations or accessories unless asked

4. **Prices must be realistic for {region} market in {currency}**

5. **Total cost should be within the budget of {budget} {currency}**

Please recommend products based STRICTLY on user's request. For each product, provide:
1. Product name (specific model if applicable)
2. Brand
3. Category (tools/furniture/electronics/decor/lighting)
4. Estimated price in {currency}
5. Dimensions or specifications
6. Search keywords for finding this product

Respond in JSON format only:
{{
  "products": [
    {{
      "name": "Product Name",
      "name_en": "English Name",
      "brand": "Brand Name",
      "category": "furniture|electronics|decor|lighting",
      "price": 299.99,
      "dimensions": "100x50x75cm",
      "search_keywords": "brand model type"
    }}
  ],
  "total_cost": 1234.56,
  "notes": "Brief note about the selection"
}}"""

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.anthropic_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": settings.CLAUDE_MODEL,
                        "max_tokens": 2000,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ]
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"Claude API error: {response.status_code} - {response.text}")
                    return await self._get_fallback_products(style, budget, user_needs, region)
                
                result = response.json()
                content = result.get("content", [{}])[0].get("text", "{}")
                
                # Parse JSON from response
                # Handle markdown code blocks
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                
                data = json.loads(content.strip())
                products = data.get("products", [])
                
                # Add search links to each product
                result_products = []
                for p in products:
                    search_query = p.get("search_keywords", p.get("name", ""))
                    result_products.append({
                        "id": f"claude-{uuid.uuid4().hex[:8]}",
                        "name": p.get("name", "Unknown"),
                        "name_en": p.get("name_en", p.get("name", "")),
                        "brand": p.get("brand", "Various"),
                        "category": p.get("category", "furniture"),
                        "price": float(p.get("price", 0)),
                        "dimensions": p.get("dimensions", "See product page"),
                        "image": "",  # No image for now
                        "links": self.generate_search_links(search_query, region),
                    })
                
                logger.info(f"Claude recommended {len(result_products)} products, total: {data.get('total_cost', 0)}")
                return result_products
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response: {e}")
            return await self._get_fallback_products(style, budget, user_needs, region)
        except Exception as e:
            logger.error(f"Claude search failed: {e}")
            return await self._get_fallback_products(style, budget, user_needs, region)
    
    async def _get_fallback_products(
        self,
        style: str,
        budget: float,
        user_needs: str,
        region: str,
    ) -> List[dict]:
        """Fallback products when Claude is unavailable"""
        currency_info = self.get_currency_info(region)
        
        # Check for brand mentions
        user_lower = (user_needs or "").lower()
        products = []
        
        # Tech products if mentioned
        if any(b in user_lower for b in ["asus", "华硕", "msi", "gaming", "游戏", "电竞"]):
            products.extend([
                {
                    "id": f"fb-{uuid.uuid4().hex[:8]}",
                    "name": "ASUS ROG 27寸电竞显示器",
                    "name_en": "ASUS ROG 27\" Gaming Monitor",
                    "brand": "ASUS",
                    "category": "electronics",
                    "price": 449.99,
                    "dimensions": "61.4 x 42.8 x 21.1 cm",
                    "image": "",
                    "links": self.generate_search_links("ASUS ROG gaming monitor 27", region),
                },
                {
                    "id": f"fb-{uuid.uuid4().hex[:8]}",
                    "name": "电竞机械键盘 RGB",
                    "name_en": "Mechanical Gaming Keyboard RGB",
                    "brand": "ASUS/Razer",
                    "category": "electronics",
                    "price": 149.99,
                    "dimensions": "44 x 14 x 4 cm",
                    "image": "",
                    "links": self.generate_search_links("mechanical gaming keyboard RGB", region),
                },
            ])
        
        if any(b in user_lower for b in ["apple", "苹果", "mac", "imac"]):
            products.append({
                "id": f"fb-{uuid.uuid4().hex[:8]}",
                "name": "Apple Studio Display 27寸",
                "name_en": "Apple Studio Display 27\"",
                "brand": "Apple",
                "category": "electronics",
                "price": 1999.99,
                "dimensions": "62.3 x 47.8 x 16.8 cm",
                "image": "",
                "links": self.generate_search_links("Apple Studio Display", region),
            })
        
        # Default furniture based on style
        style_furniture = {
            "modern": [
                {"name": "现代简约沙发", "name_en": "Modern Minimalist Sofa", "brand": "Various", "price": 899.99, "dim": "220x90x85cm"},
                {"name": "大理石茶几", "name_en": "Marble Coffee Table", "brand": "Various", "price": 349.99, "dim": "120x60x45cm"},
                {"name": "落地灯", "name_en": "Floor Lamp", "brand": "Various", "price": 129.99, "dim": "Height 160cm"},
            ],
            "nordic": [
                {"name": "北欧布艺沙发", "name_en": "Nordic Fabric Sofa", "brand": "IKEA", "price": 799.99, "dim": "200x85x80cm"},
                {"name": "原木茶几", "name_en": "Solid Wood Coffee Table", "brand": "IKEA", "price": 249.99, "dim": "110x55x40cm"},
                {"name": "羊毛地毯", "name_en": "Wool Area Rug", "brand": "Various", "price": 299.99, "dim": "200x300cm"},
            ],
            "japanese": [
                {"name": "榻榻米沙发", "name_en": "Tatami Style Sofa", "brand": "MUJI", "price": 699.99, "dim": "180x80x35cm"},
                {"name": "日式矮桌", "name_en": "Japanese Low Table", "brand": "MUJI", "price": 199.99, "dim": "100x60x35cm"},
                {"name": "纸灯笼", "name_en": "Paper Lantern Light", "brand": "Various", "price": 79.99, "dim": "Ø45cm"},
            ],
        }
        
        style_key = style.lower()
        if "现代" in style or "modern" in style_key:
            style_key = "modern"
        elif "北欧" in style or "nordic" in style_key:
            style_key = "nordic"
        elif "日式" in style or "japanese" in style_key:
            style_key = "japanese"
        else:
            style_key = "modern"
        
        for item in style_furniture.get(style_key, style_furniture["modern"]):
            products.append({
                "id": f"fb-{uuid.uuid4().hex[:8]}",
                "name": item["name"],
                "name_en": item["name_en"],
                "brand": item["brand"],
                "category": "furniture",
                "price": item["price"],
                "dimensions": item["dim"],
                "image": "",
                "links": self.generate_search_links(item["name_en"], region),
            })
        
        return products
    
    async def match_furniture(
        self,
        style: str,
        room_type: str,
        budget: float,
        user_needs: str = "",
        region: str = "CA",
        exclude: List[str] = None,
    ) -> List[dict]:
        """
        Match furniture using Claude AI for intelligent product search
        """
        exclude = exclude or []
        
        logger.info(f"Searching products with Claude - Style: {style}, Budget: {budget}, Needs: {user_needs}")
        
        # Use Claude to get product recommendations
        products = await self.search_with_claude(
            style=style,
            room_type=room_type,
            budget=budget,
            user_needs=user_needs,
            region=region,
        )
        
        # Filter out excluded items
        if exclude:
            products = [p for p in products if not any(ex.lower() in p["name"].lower() for ex in exclude)]
        
        return products
    
    async def search(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        style: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        brand: Optional[str] = None,
        region: str = "CA",
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        """Search furniture with filters"""
        links = self.generate_search_links(query or "furniture", region)
        
        return {
            "items": [],
            "search_links": links,
            "total": 0,
            "message": "请点击以下链接在各平台搜索商品",
        }
    
    async def get_by_id(self, furniture_id: str) -> Optional[dict]:
        """Get furniture item by ID"""
        return None
    
    async def get_similar(self, furniture_id: str, limit: int = 5) -> List[dict]:
        """Find similar furniture items"""
        return []
