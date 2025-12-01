import anthropic
import openai
import json
import logging
import base64
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


ROOM_ANALYSIS_PROMPT = """
分析这张室内照片,提供以下信息(以JSON格式返回):

{
  "room_type": "房间类型(living/bedroom/kitchen/bathroom/office/dining/other)",
  "dimensions": {
    "width": "估计宽度(米,数字)",
    "length": "估计长度(米,数字)",
    "height": "估计层高(米,数字)"
  },
  "existing_furniture": ["现有家具列表"],
  "current_style": "当前装修风格描述",
  "lighting": "光线情况描述",
  "problems": ["发现的问题列表"],
  "potential": "空间改造潜力分析",
  "confidence": "分析置信度(0-1之间的数字)"
}

请确保返回有效的JSON格式。对于dimensions中的数值,请只返回数字,不要包含单位。
"""


class VisionService:
    """Vision service for room analysis - supports Claude and OpenAI"""
    
    def __init__(self):
        self.anthropic_client = None
        self.openai_client = None
        
        # Prefer Claude
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            logger.info("Using Claude for vision analysis")
        elif settings.OPENAI_API_KEY:
            self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            logger.info("Using OpenAI for vision analysis")
        else:
            logger.warning("No API key configured, using mock data")
    
    async def analyze_room(self, image_base64: str) -> dict:
        """
        Analyze room image using Claude or OpenAI Vision
        
        Args:
            image_base64: Base64 encoded image data
            
        Returns:
            Room analysis result dictionary
        """
        # Try Claude first
        if self.anthropic_client:
            return await self._analyze_with_claude(image_base64)
        
        # Fallback to OpenAI
        if self.openai_client:
            return await self._analyze_with_openai(image_base64)
        
        # Return mock data if no API configured
        logger.warning("No API client available, returning mock data")
        return self._get_mock_analysis()
    
    async def _analyze_with_claude(self, image_base64: str) -> dict:
        """Analyze room using Claude 3.5 Sonnet"""
        try:
            # Determine media type
            media_type = "image/jpeg"
            if image_base64.startswith("/9j/"):
                media_type = "image/jpeg"
            elif image_base64.startswith("iVBOR"):
                media_type = "image/png"
            elif image_base64.startswith("UklGR"):
                media_type = "image/webp"
            
            message = self.anthropic_client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_base64,
                                },
                            },
                            {
                                "type": "text",
                                "text": ROOM_ANALYSIS_PROMPT,
                            }
                        ],
                    }
                ],
            )
            
            # Parse response
            content = message.content[0].text
            result = self._extract_json(content)
            return self._validate_analysis(result)
            
        except Exception as e:
            logger.error(f"Claude vision analysis failed: {e}")
            raise
    
    async def _analyze_with_openai(self, image_base64: str) -> dict:
        """Analyze room using OpenAI GPT-4 Vision"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": ROOM_ANALYSIS_PROMPT,
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}",
                                    "detail": "high",
                                },
                            },
                        ],
                    }
                ],
                max_tokens=2048,
            )
            
            content = response.choices[0].message.content
            result = self._extract_json(content)
            return self._validate_analysis(result)
            
        except Exception as e:
            logger.error(f"OpenAI vision analysis failed: {e}")
            raise
    
    def _extract_json(self, content: str) -> dict:
        """Extract JSON from API response"""
        import re
        
        # Try direct JSON parse
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON in markdown code block
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find JSON object pattern
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
        
        raise ValueError("Could not extract JSON from response")
    
    def _validate_analysis(self, result: dict) -> dict:
        """Validate and normalize analysis result"""
        defaults = {
            "room_type": "living",
            "dimensions": {"width": 4.0, "length": 5.0, "height": 2.8},
            "existing_furniture": [],
            "current_style": "未识别",
            "lighting": "一般",
            "problems": [],
            "potential": "有改造空间",
            "confidence": 0.7,
        }
        
        for key, default in defaults.items():
            if key not in result:
                result[key] = default
        
        # Ensure dimensions are floats
        dims = result.get("dimensions", {})
        result["dimensions"] = {
            "width": float(dims.get("width", 4.0)),
            "length": float(dims.get("length", 5.0)),
            "height": float(dims.get("height", 2.8)),
        }
        
        # Ensure confidence is float
        result["confidence"] = float(result.get("confidence", 0.7))
        
        return result
    
    def _get_mock_analysis(self) -> dict:
        """Return mock analysis data for development"""
        return {
            "room_type": "living",
            "dimensions": {
                "width": 5.5,
                "length": 4.2,
                "height": 2.8,
            },
            "existing_furniture": ["沙发", "茶几", "电视柜", "书架"],
            "current_style": "现代简约",
            "lighting": "自然光充足，东向窗户",
            "problems": ["空间利用不足", "色彩单调", "缺乏装饰元素"],
            "potential": "可以通过添加绿植、艺术画和调整家具布局来提升空间感",
            "confidence": 0.92,
        }


# Design prompt generation
def generate_design_prompt(analysis: dict, preferences: dict) -> str:
    """Generate Stable Diffusion prompt for room redesign"""
    
    style_prompts = {
        "modern": "modern minimalist interior design, clean lines, neutral colors",
        "nordic": "scandinavian interior design, natural wood, cozy textiles, white walls",
        "japanese": "japanese zen interior design, minimal furniture, natural materials, paper screens",
        "industrial": "industrial loft interior design, exposed brick, metal accents, raw materials",
        "bohemian": "bohemian interior design, colorful textiles, plants, eclectic mix",
        "midcentury": "mid-century modern interior design, organic curves, vintage furniture",
        "coastal": "coastal interior design, blue and white palette, natural textures",
        "farmhouse": "modern farmhouse interior design, rustic wood, comfortable textiles",
    }
    
    style = preferences.get("style", "modern")
    style_desc = style_prompts.get(style, style_prompts["modern"])
    
    room_type = analysis.get("room_type", "living room")
    room_type_names = {
        "living": "living room",
        "bedroom": "bedroom",
        "kitchen": "kitchen",
        "bathroom": "bathroom",
        "office": "home office",
        "dining": "dining room",
    }
    room_name = room_type_names.get(room_type, "living room")
    
    prompt = f"""
    Beautiful {style_desc} {room_name}.
    High quality interior photography, professional lighting, 
    architectural digest style, 4K resolution, photorealistic,
    detailed textures, ambient lighting, inviting atmosphere
    """
    
    return prompt.strip()
