from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import uuid
import logging

from app.services.design_service import DesignService
from app.services.image_generation_service import ImageGenerationService
from app.services.furniture_matching_service import FurnitureMatchingService
from app.api.v1.endpoints.analysis import analysis_jobs  # Import to get source image

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
design_service = DesignService()
image_gen_service = ImageGenerationService()
furniture_service = FurnitureMatchingService()


class DesignPreferences(BaseModel):
    style: str = "modern"
    budget: float = 10000
    budget_range: Optional[List[float]] = None
    keep_furniture: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    color_preference: Optional[List[str]] = None
    special_needs: Optional[str] = None  # User's specific furniture/decoration requests
    room_description: Optional[str] = None  # User's custom room description
    additional_notes: Optional[str] = None  # Other notes
    
    class Config:
        extra = "ignore"  # Ignore extra fields


class FurnitureLink(BaseModel):
    name: str
    url: str
    icon: str


class FurnitureItem(BaseModel):
    id: str
    name: str
    name_en: Optional[str] = None
    category: str
    price: float
    image: str
    links: List[FurnitureLink]  # Multiple platform links
    dimensions: str
    brand: str


class DesignProposal(BaseModel):
    id: str
    name: str
    description: str
    image_url: str
    style: str
    confidence: float
    furniture: List[FurnitureItem]
    total_cost: float
    highlights: List[str]


class GenerateDesignRequest(BaseModel):
    analysis_id: str
    preferences: DesignPreferences


class GenerateDesignResponse(BaseModel):
    id: str
    status: str
    proposals: Optional[List[DesignProposal]] = None


# In-memory storage for demo
design_jobs: dict = {}


@router.post("/generate", response_model=dict)
async def generate_designs(
    background_tasks: BackgroundTasks,
    request: dict,
):
    """
    Generate design proposals
    
    Generate multiple design proposals based on room analysis results and user preferences
    """
    logger.info(f"Received design request: {request}")
    
    job_id = str(uuid.uuid4())
    
    # Extract from dict
    analysis_id = request.get("analysis_id", "demo")
    preferences = request.get("preferences", {})
    language = request.get("language", "zh")  # Get language parameter
    
    # Handle style - can be string or object with id
    style_raw = preferences.get("style", "modern")
    if isinstance(style_raw, dict):
        style = style_raw.get("id", "modern")
    else:
        style = str(style_raw)
    
    # Normalize preferences
    normalized_prefs = {
        "style": style,
        "budget": preferences.get("budget", 10000),
        "budget_range": preferences.get("budget_range"),
        "keep_furniture": preferences.get("keep_furniture", []),
        "requirements": preferences.get("requirements", []),
        "color_preference": preferences.get("color_preference", []),
        "special_needs": preferences.get("special_needs", ""),
        "room_description": preferences.get("room_description", ""),  # User's room description
        "additional_notes": preferences.get("additional_notes", ""),  # Other notes
    }
    
    # Get source image from analysis job for img2img
    source_image = None
    if analysis_id and analysis_id != "demo":
        analysis_job = analysis_jobs.get(analysis_id)
        if analysis_job and "image_data" in analysis_job:
            source_image = analysis_job["image_data"]
            logger.info(f"Found source image for img2img from analysis {analysis_id}")
    
    # Initialize job
    design_jobs[job_id] = {
        "status": "pending",
        "progress": 0,
        "analysis_id": analysis_id,
        "preferences": normalized_prefs,
        "source_image": source_image,  # Store source image for img2img
        "language": language,  # Store language for generation
        "proposals": None,
        "error": None,
    }
    
    # Start background generation
    background_tasks.add_task(process_design_generation, job_id)
    
    return {
        "id": job_id,
        "status": "pending",
        "message": "Generating design proposals..."
    }


async def process_design_generation(job_id: str):
    """Background task to generate design proposals"""
    try:
        job = design_jobs.get(job_id)
        if not job:
            return
        
        job["status"] = "processing"
        job["progress"] = 10
        
        preferences = job["preferences"]
        language = job.get("language", "zh")
        
        # Step 1: Generate design concepts
        logger.info(f"Generating design concepts for job {job_id} in language: {language}")
        job["progress"] = 20
        
        # Combine all user requirements for strict adherence
        all_user_requirements = preferences.get("special_needs", "")
        if preferences.get("room_description"):
            all_user_requirements = f"Room condition: {preferences['room_description']}. " + all_user_requirements
        if preferences.get("additional_notes"):
            all_user_requirements += f" Additional requirements: {preferences['additional_notes']}"
        
        concepts = await design_service.generate_concepts(
            style=preferences["style"],
            requirements=preferences.get("requirements", []),
            special_needs=all_user_requirements,
            room_description=preferences.get("room_description", ""),
            language=language,
        )
        job["progress"] = 40
        
        # Step 2: Generate images for each concept
        import asyncio
        proposals = []
        for i, concept in enumerate(concepts):
            logger.info(f"Generating image for concept {i+1}")
            job["progress"] = 40 + (i * 15)
            
            # Wait between requests to avoid rate limiting (Replicate burst limit)
            if i > 0:
                logger.info(f"Waiting 12 seconds before next image generation to avoid rate limit...")
                await asyncio.sleep(12)
            
            # Generate image (use img2img if source image available)
            source_image = job.get("source_image")
            image_url = await image_gen_service.generate_room_image(
                concept["prompt"],
                style=preferences["style"],
                source_image=source_image,  # Pass source image for img2img
            )
            
            # Match furniture with user needs
            # Combine requirements and special_needs for brand/item detection
            user_needs = " ".join(preferences.get("requirements", []))
            if preferences.get("special_needs"):
                user_needs += " " + preferences.get("special_needs", "")
            
            furniture = await furniture_service.match_furniture(
                style=preferences["style"],
                room_type="living",  # Should come from analysis
                budget=preferences["budget"],
                user_needs=user_needs,
                region="CA",  # TODO: detect from IP
                exclude=preferences.get("keep_furniture", []),
                language=language,
            )
            
            total_cost = sum(f["price"] for f in furniture)
            
            proposals.append(DesignProposal(
                id=f"{job_id}-{i+1}",
                name=concept["name"],
                description=concept["description"],
                image_url=image_url,
                style=preferences["style"],
                confidence=concept.get("confidence", 0.85),
                furniture=[FurnitureItem(**f) for f in furniture],
                total_cost=total_cost,
                highlights=concept.get("highlights", []),
            ))
        
        job["progress"] = 90
        
        # Complete
        job["status"] = "completed"
        job["progress"] = 100
        job["proposals"] = [p.model_dump() for p in proposals]
        
        logger.info(f"Design generation completed for job {job_id}")
        
    except Exception as e:
        logger.error(f"Design generation failed for job {job_id}: {e}")
        job["status"] = "failed"
        job["error"] = str(e)


@router.get("/status/{job_id}")
async def get_design_status(job_id: str):
    """Get design generation status"""
    job = design_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "id": job_id,
        "status": job["status"],
        "progress": job["progress"],
        "proposals": job.get("proposals"),
        "error": job.get("error"),
    }


@router.get("/demo", response_model=List[DesignProposal])
async def get_demo_designs():
    """Get example design proposals"""
    return [
        DesignProposal(
            id="demo-design-1",
            name="都市雅韵",
            description="融合现代简约与北欧温暖，打造都市人的理想居所",
            image_url="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
            style="现代简约 + 北欧",
            confidence=0.95,
            highlights=["开放式布局", "自然光优化", "多功能储物"],
            total_cost=8500,
            furniture=[
                FurnitureItem(
                    id="f1",
                    name="北欧布艺沙发",
                    name_en="Nordic Fabric Sofa",
                    category="沙发",
                    price=3200,
                    image="",
                    links=[
                        FurnitureLink(name="Amazon", url="https://www.amazon.ca/s?k=nordic+fabric+sofa", icon="🛒"),
                        FurnitureLink(name="IKEA", url="https://www.ikea.com/ca/en/search/?q=sofa", icon="🏠"),
                    ],
                    dimensions="220x85x80cm",
                    brand="IKEA",
                ),
                FurnitureItem(
                    id="f2",
                    name="原木茶几",
                    name_en="Solid Wood Coffee Table",
                    category="茶几",
                    price=1200,
                    image="",
                    links=[
                        FurnitureLink(name="Amazon", url="https://www.amazon.ca/s?k=wood+coffee+table", icon="🛒"),
                        FurnitureLink(name="Wayfair", url="https://www.wayfair.ca/keyword.html?keyword=coffee+table", icon="🛋️"),
                    ],
                    dimensions="120x60x45cm",
                    brand="源氏木语",
                ),
            ],
        ),
        DesignProposal(
            id="demo-design-2",
            name="禅意栖居",
            description="极简日式美学，营造宁静致远的生活空间",
            image_url="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80",
            style="日式禅风",
            confidence=0.92,
            highlights=["极简设计", "自然材质", "禅意氛围"],
            total_cost=7200,
            furniture=[
                FurnitureItem(
                    id="f3",
                    name="榻榻米沙发",
                    name_en="Tatami Sofa",
                    category="沙发",
                    price=2800,
                    image="",
                    links=[
                        FurnitureLink(name="Amazon", url="https://www.amazon.ca/s?k=tatami+sofa", icon="🛒"),
                        FurnitureLink(name="MUJI", url="https://muji.ca/search?q=sofa", icon="🎍"),
                    ],
                    dimensions="200x90x35cm",
                    brand="木智工坊",
                ),
            ],
        ),
    ]


@router.post("/save/{design_id}")
async def save_design(design_id: str):
    """Save design proposal to user account"""
    # TODO: Implement with user authentication
    return {"message": "Design proposal saved", "design_id": design_id}


@router.get("/share/{design_id}")
async def get_share_link(design_id: str):
    """Generate design proposal share link"""
    share_token = str(uuid.uuid4())[:8]
    return {
        "share_url": f"https://roomai.com/share/{share_token}",
        "expires_in": "7 days"
    }

