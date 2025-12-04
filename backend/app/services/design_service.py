import logging
from typing import List
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def translate_to_english(chinese_text: str) -> str:
    """
    Use Claude to translate Chinese text to English for image generation
    Returns a clear, descriptive prompt suitable for AI image generation
    """
    if not chinese_text or not chinese_text.strip():
        return ""
    
    # Check if text is already mostly English
    chinese_chars = sum(1 for c in chinese_text if '\u4e00' <= c <= '\u9fff')
    if chinese_chars < len(chinese_text) * 0.3:
        return chinese_text  # Already mostly English
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 500,
                    "messages": [
                        {
                            "role": "user", 
                            "content": f"""Convert this Chinese room design request into an English image generation prompt.

Chinese: {chinese_text}

Requirements:
1. Describe the ROOM TYPE clearly (e.g., "modern office", "gaming room", "living room", "bedroom")
2. Describe what ITEMS to put inside (e.g., "multiple computers and monitors", "gaming PC setup", "desktop computers")
3. Be SPECIFIC and VISUAL - describe what the image should look like
4. If user says "只要X" (only X), emphasize "ONLY [X], nothing else"
5. If user says "不要Y" (no Y), say "without any [Y]"
6. If user asks for "很多电脑" (many computers), translate to "multiple computers", "many desktop computers", "multiple PC setups"

Key translations:
- 电脑 = computer / PC / desktop computer (NOT farm tools!)
- 很多电脑 = many computers / multiple computers / multiple PC setups
- 计算机 = computer / computing device
- 笔记本 = laptop
- 台式机 = desktop computer
- 显示器 = monitor / display
- 游戏电脑 = gaming PC / gaming computer
- 办公电脑 = office computer / workstation
- 仓库 = warehouse/storage room with concrete walls and floor
- 水泥 = concrete/cement
- 封闭 = enclosed, no windows

Output a clear English prompt describing the room and its contents. NO explanations, just the prompt."""
                        }
                    ]
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                english_text = result.get("content", [{}])[0].get("text", "").strip()
                logger.info(f"Translated to: {english_text}")
                return english_text
            else:
                logger.warning(f"Translation API error: {response.status_code}")
                return chinese_text
                
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return chinese_text


class DesignService:
    """Service for generating design concepts"""
    
    async def generate_concepts(
        self,
        style: str,
        requirements: List[str] = None,
        special_needs: str = "",
        room_description: str = "",
        num_concepts: int = 3,
        language: str = "zh",
    ) -> List[dict]:
        """
        Generate design concepts based on style and requirements
        
        Args:
            style: Design style (modern, nordic, japanese, etc.)
            requirements: List of special requirements
            special_needs: Additional notes from user
            num_concepts: Number of concepts to generate
            language: Output language (zh or en)
            
        Returns:
            List of design concept dictionaries
        """
        requirements = requirements or []
        
        # Style-specific design concepts - Chinese
        concept_templates_zh = {
            "modern": [
                {
                    "name": "都市极简",
                    "description": "极简线条与中性色调，打造都市精英的高效生活空间",
                    "highlights": ["简约大气", "功能至上", "质感选材"],
                    "prompt": "ultra modern minimalist interior, clean geometric lines, monochromatic palette, high-end finishes",
                    "confidence": 0.95,
                },
                {
                    "name": "现代温馨",
                    "description": "现代设计融入温暖元素，平衡美学与舒适度",
                    "highlights": ["温暖氛围", "舒适面料", "人性化设计"],
                    "prompt": "modern warm interior design, soft textures, warm lighting, comfortable furniture",
                    "confidence": 0.92,
                },
                {
                    "name": "艺术现代",
                    "description": "将现代空间打造成艺术画廊，展现独特品味",
                    "highlights": ["艺术元素", "个性展示", "视觉焦点"],
                    "prompt": "modern artistic interior, gallery-like space, statement art pieces, designer furniture",
                    "confidence": 0.88,
                },
            ],
            "nordic": [
                {
                    "name": "北欧阳光",
                    "description": "明亮通透的北欧风格，让自然光成为主角",
                    "highlights": ["自然采光", "白色基调", "原木质感"],
                    "prompt": "bright scandinavian interior, white walls, large windows, natural wood floors, hygge atmosphere",
                    "confidence": 0.94,
                },
                {
                    "name": "北欧森林",
                    "description": "将森林的宁静带入室内，打造自然栖息地",
                    "highlights": ["自然元素", "绿植装饰", "有机材质"],
                    "prompt": "nordic forest interior, indoor plants, natural materials, wooden furniture, green accents",
                    "confidence": 0.91,
                },
                {
                    "name": "北欧舒适",
                    "description": "Hygge风格的终极体现，温暖舒适的小窝",
                    "highlights": ["温暖织物", "蜡烛氛围", "舒适角落"],
                    "prompt": "hygge scandinavian interior, cozy textiles, candles, reading nook, warm blankets",
                    "confidence": 0.93,
                },
            ],
            "japanese": [
                {
                    "name": "禅意空间",
                    "description": "日式禅宗美学，营造冥想般的宁静氛围",
                    "highlights": ["极简主义", "禅意布置", "自然素材"],
                    "prompt": "japanese zen interior, minimal furniture, tatami elements, shoji screens, rock garden view",
                    "confidence": 0.92,
                },
                {
                    "name": "和风现代",
                    "description": "传统日式与现代设计的完美融合",
                    "highlights": ["传统元素", "现代功能", "和谐统一"],
                    "prompt": "modern japanese interior, contemporary furniture with traditional elements, paper lanterns, bonsai",
                    "confidence": 0.90,
                },
                {
                    "name": "木之温度",
                    "description": "以木材为主角，感受自然的温度",
                    "highlights": ["原木家具", "自然质感", "温润氛围"],
                    "prompt": "japanese wood interior, natural wood throughout, warm tones, minimalist design, natural light",
                    "confidence": 0.89,
                },
            ],
            "industrial": [
                {
                    "name": "工业经典",
                    "description": "裸露砖墙与金属管道，重现工业时代的粗犷美",
                    "highlights": ["裸露材质", "金属元素", "复古工业"],
                    "prompt": "classic industrial interior, exposed brick walls, metal pipes, concrete floors, vintage lighting",
                    "confidence": 0.93,
                },
                {
                    "name": "工业温暖",
                    "description": "工业风格中注入温暖元素，刚柔并济",
                    "highlights": ["皮质家具", "暖色点缀", "混搭风格"],
                    "prompt": "warm industrial interior, leather furniture, warm wood accents, soft lighting, cozy textiles",
                    "confidence": 0.90,
                },
                {
                    "name": "都市LOFT",
                    "description": "开放式LOFT空间，自由不羁的都市生活",
                    "highlights": ["开放空间", "高挑天花", "功能分区"],
                    "prompt": "urban loft interior, open floor plan, high ceilings, industrial elements, modern furniture",
                    "confidence": 0.91,
                },
            ],
        }
        
        # Style-specific design concepts - English
        concept_templates_en = {
            "modern": [
                {
                    "name": "Urban Minimalist",
                    "description": "Clean lines and neutral tones create an efficient living space for urban professionals",
                    "highlights": ["Minimalist Design", "Functional Focus", "Premium Materials"],
                    "prompt": "ultra modern minimalist interior, clean geometric lines, monochromatic palette, high-end finishes",
                    "confidence": 0.95,
                },
                {
                    "name": "Modern Warmth",
                    "description": "Modern design infused with warm elements, balancing aesthetics and comfort",
                    "highlights": ["Warm Atmosphere", "Comfortable Textiles", "Human-centered Design"],
                    "prompt": "modern warm interior design, soft textures, warm lighting, comfortable furniture",
                    "confidence": 0.92,
                },
                {
                    "name": "Artistic Modern",
                    "description": "Transform your space into an art gallery showcasing unique taste",
                    "highlights": ["Artistic Elements", "Personal Expression", "Visual Focal Points"],
                    "prompt": "modern artistic interior, gallery-like space, statement art pieces, designer furniture",
                    "confidence": 0.88,
                },
            ],
            "nordic": [
                {
                    "name": "Nordic Sunlight",
                    "description": "Bright and airy Scandinavian style, letting natural light take center stage",
                    "highlights": ["Natural Light", "White Base", "Wood Textures"],
                    "prompt": "bright scandinavian interior, white walls, large windows, natural wood floors, hygge atmosphere",
                    "confidence": 0.94,
                },
                {
                    "name": "Nordic Forest",
                    "description": "Bring the tranquility of the forest indoors, creating a natural habitat",
                    "highlights": ["Natural Elements", "Plant Decor", "Organic Materials"],
                    "prompt": "nordic forest interior, indoor plants, natural materials, wooden furniture, green accents",
                    "confidence": 0.91,
                },
                {
                    "name": "Nordic Cozy",
                    "description": "The ultimate expression of Hygge style, a warm and cozy retreat",
                    "highlights": ["Warm Textiles", "Candle Ambiance", "Cozy Corners"],
                    "prompt": "hygge scandinavian interior, cozy textiles, candles, reading nook, warm blankets",
                    "confidence": 0.93,
                },
            ],
            "japanese": [
                {
                    "name": "Zen Space",
                    "description": "Japanese Zen aesthetics creating a meditation-like peaceful atmosphere",
                    "highlights": ["Minimalism", "Zen Arrangement", "Natural Materials"],
                    "prompt": "japanese zen interior, minimal furniture, tatami elements, shoji screens, rock garden view",
                    "confidence": 0.92,
                },
                {
                    "name": "Modern Japanese",
                    "description": "Perfect fusion of traditional Japanese and modern design",
                    "highlights": ["Traditional Elements", "Modern Function", "Harmonious Unity"],
                    "prompt": "modern japanese interior, contemporary furniture with traditional elements, paper lanterns, bonsai",
                    "confidence": 0.90,
                },
                {
                    "name": "Wood Warmth",
                    "description": "Wood takes center stage, feeling the warmth of nature",
                    "highlights": ["Natural Wood", "Organic Texture", "Warm Ambiance"],
                    "prompt": "japanese wood interior, natural wood throughout, warm tones, minimalist design, natural light",
                    "confidence": 0.89,
                },
            ],
            "industrial": [
                {
                    "name": "Industrial Classic",
                    "description": "Exposed brick and metal pipes recreate the raw beauty of the industrial era",
                    "highlights": ["Exposed Materials", "Metal Elements", "Vintage Industrial"],
                    "prompt": "classic industrial interior, exposed brick walls, metal pipes, concrete floors, vintage lighting",
                    "confidence": 0.93,
                },
                {
                    "name": "Industrial Warmth",
                    "description": "Industrial style infused with warm elements, balancing strength and softness",
                    "highlights": ["Leather Furniture", "Warm Accents", "Mixed Styles"],
                    "prompt": "warm industrial interior, leather furniture, warm wood accents, soft lighting, cozy textiles",
                    "confidence": 0.90,
                },
                {
                    "name": "Urban Loft",
                    "description": "Open loft space for free-spirited urban living",
                    "highlights": ["Open Space", "High Ceilings", "Functional Zones"],
                    "prompt": "urban loft interior, open floor plan, high ceilings, industrial elements, modern furniture",
                    "confidence": 0.91,
                },
            ],
        }
        
        # Get base concepts for style
        style_key = style.lower().replace(" ", "").replace("简约", "modern").replace("北欧", "nordic").replace("日式", "japanese").replace("工业", "industrial")
        
        # Map Chinese style names
        style_mapping = {
            "现代简约": "modern",
            "北欧风格": "nordic",
            "日式禅风": "japanese",
            "工业风格": "industrial",
            "波西米亚": "bohemian",
            "中古世纪": "midcentury",
            "海岸风格": "coastal",
            "田园农舍": "farmhouse",
        }
        
        if style in style_mapping:
            style_key = style_mapping[style]
        
        # Select template based on language
        concept_templates = concept_templates_en if language == "en" else concept_templates_zh
        concepts = concept_templates.get(style_key, concept_templates["modern"])
        
        # Check if user has strong custom requirements - if so, OVERRIDE default prompts
        has_custom_requirements = bool(
            (special_needs and special_needs.strip()) or 
            (room_description and room_description.strip())
        )
        
        if has_custom_requirements:
            logger.info(f"User has custom requirements - translating and overriding prompts")
            logger.info(f"Room description: {room_description}")
            logger.info(f"Special needs: {special_needs}")
            
            # Translate user's Chinese requirements to English using Claude
            user_prompt_parts = []
            
            if room_description and room_description.strip():
                translated_room = await translate_to_english(room_description)
                user_prompt_parts.append(translated_room)
                logger.info(f"Room description translated: {translated_room}")
            
            if special_needs and special_needs.strip():
                translated_needs = await translate_to_english(special_needs)
                user_prompt_parts.append(translated_needs)
                logger.info(f"Special needs translated: {translated_needs}")
            
            # Build the user-centric prompt in ENGLISH
            user_prompt = ", ".join(user_prompt_parts)
            
            # Check if user wants to change the room base (walls, floor material)
            wants_base_change = any(keyword in (special_needs + room_description).lower() for keyword in [
                "换墙", "换地板", "改墙", "改地", "木地板", "瓷砖", "大理石", 
                "change wall", "change floor", "new floor", "new wall"
            ])
            
            # OVERRIDE each concept's prompt with user's requirements as PRIMARY
            for concept in concepts:
                if wants_base_change:
                    # User wants to change base - allow full transformation
                    concept["prompt"] = (
                        f"{user_prompt}, "
                        f"interior design photograph, professional photography, "
                        f"realistic, detailed, high quality, 8k"
                    )
                else:
                    # PRESERVE original room base - only change furniture/decoration
                    concept["prompt"] = (
                        f"IMPORTANT: Keep the EXACT same room structure - same walls, same floor material, "
                        f"same ceiling, same windows position, same room shape. "
                        f"DO NOT change concrete to wood, DO NOT change wall material, "
                        f"DO NOT add windows or doors that don't exist. "
                        f"Only add or change furniture and items inside the room. "
                        f"{user_prompt}, "
                        f"interior photograph, realistic lighting, photorealistic, 8k"
                    )
                custom_highlights = ["Custom Space", "Original Structure"] if language == "en" else ["用户定制空间", "保留原始基底"]
                concept["highlights"] = custom_highlights + concept.get("highlights", [])[:2]
                logger.info(f"Override concept prompt (preserve_base={not wants_base_change}): {concept['prompt'][:150]}...")
        
        # Adjust concepts based on ALL user requirements - AI MUST follow user's furniture preferences
        for concept in concepts:
            # Add user's specific furniture/style requirements
            if requirements:
                for req in requirements:
                    req_lower = req.lower() if isinstance(req, str) else str(req).lower()
                    
                    if "workspace" in req_lower or "work" in req_lower or "办公" in req_lower or "工作" in req_lower:
                        concept["highlights"].append("Workspace" if language == "en" else "办公区域")
                        concept["prompt"] += ", dedicated workspace area with desk and ergonomic chair"
                    
                    if "plants" in req_lower or "绿植" in req_lower or "植物" in req_lower:
                        concept["highlights"].append("Plant Decor" if language == "en" else "绿植装饰")
                        concept["prompt"] += ", abundant indoor plants, large potted plants, hanging greenery"
                    
                    if "storage" in req_lower or "收纳" in req_lower or "储物" in req_lower:
                        concept["highlights"].append("Smart Storage" if language == "en" else "智能收纳")
                        concept["prompt"] += ", smart storage solutions, built-in shelving"
                    
                    if "reading" in req_lower or "阅读" in req_lower or "书" in req_lower:
                        concept["highlights"].append("Reading Nook" if language == "en" else "阅读角落")
                        concept["prompt"] += ", cozy reading nook with bookshelf and comfortable armchair"
                    
                    if "sofa" in req_lower or "沙发" in req_lower:
                        concept["prompt"] += ", prominent comfortable sofa as centerpiece"
                    
                    if "tv" in req_lower or "电视" in req_lower:
                        concept["prompt"] += ", modern TV console and entertainment area"
                    
                    if "coffee" in req_lower or "茶几" in req_lower:
                        concept["prompt"] += ", stylish coffee table"
                    
                    if "lamp" in req_lower or "灯" in req_lower:
                        concept["prompt"] += ", elegant floor lamps and ambient lighting"
                    
                    if "rug" in req_lower or "地毯" in req_lower:
                        concept["prompt"] += ", large area rug adding warmth"
                    
                    if "art" in req_lower or "画" in req_lower or "艺术" in req_lower:
                        concept["prompt"] += ", beautiful wall art and decorative pieces"
                    
                    # Computer/PC related requirements
                    if "computer" in req_lower or "pc" in req_lower or "电脑" in req_lower or "计算机" in req_lower:
                        concept["highlights"].append("Computer Setup" if language == "en" else "电脑设备")
                        concept["prompt"] += ", desktop computers, computer monitors, modern PC setup"
                    
                    if "很多" in req_lower and ("电脑" in req_lower or "计算机" in req_lower):
                        concept["prompt"] += ", multiple desktop computers, many PC workstations, multiple monitors setup"
            
            # IMPORTANT: Add brand-specific prompts if not already handled by custom requirements
            if special_needs and special_needs.strip() and not has_custom_requirements:
                concept["highlights"].append("Custom" if language == "en" else "用户定制")
                special_needs_clean = special_needs.strip()
                
                # Detect and enhance brand mentions in special needs
                brand_prompts = []
                special_lower = special_needs_clean.lower()
                
                # Tech brands - add specific product imagery
                if "asus" in special_lower or "华硕" in special_needs_clean:
                    brand_prompts.append("ASUS ROG gaming monitor, ASUS computer setup")
                if "msi" in special_lower:
                    brand_prompts.append("MSI gaming monitor with dragon logo, MSI computer tower")
                if "apple" in special_lower or "苹果" in special_needs_clean:
                    brand_prompts.append("Apple iMac, Apple MacBook, Apple Studio Display")
                if "gaming" in special_lower or "游戏" in special_needs_clean or "电竞" in special_needs_clean:
                    brand_prompts.append("RGB gaming setup, gaming PC, gaming monitors")
                
                # General computer/PC requirements (must be checked AFTER brand-specific)
                if ("电脑" in special_needs_clean or "计算机" in special_needs_clean or "pc" in special_lower or "computer" in special_lower):
                    if "很多" in special_needs_clean or "multiple" in special_lower or "many" in special_lower:
                        brand_prompts.append("multiple desktop computers, many PC workstations, multiple computer monitors, PC setup")
                    else:
                        brand_prompts.append("desktop computers, computer monitors, PC setup, workstation")
                
                # Combine brand prompts
                if brand_prompts:
                    concept["prompt"] += ", " + ", ".join(brand_prompts)
                    logger.info(f"Added brand-specific prompts: {brand_prompts}")
        
        return concepts[:num_concepts]
    
    async def generate_design_description(
        self,
        concept: dict,
        analysis: dict,
        preferences: dict,
    ) -> str:
        """
        Generate detailed design description using GPT
        
        This would use GPT to generate a more detailed, personalized
        description of the design concept.
        """
        # For now, return the basic description
        # In production, this would call GPT API
        return concept["description"]

