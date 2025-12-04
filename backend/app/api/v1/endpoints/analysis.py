from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import uuid
import base64
import logging

from app.services.vision_service import VisionService
from app.services.segmentation_service import SegmentationService
from app.services.storage_service import StorageService
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
vision_service = VisionService()
segmentation_service = SegmentationService()
storage_service = StorageService()


class RoomDimensions(BaseModel):
    width: float
    length: float
    height: float


class RoomAnalysisResponse(BaseModel):
    id: str
    room_type: str
    dimensions: RoomDimensions
    existing_furniture: List[str]
    current_style: str
    lighting: str
    problems: List[str]
    potential: str
    confidence: float
    image_url: str
    segmentation_url: Optional[str] = None


class AnalysisStatusResponse(BaseModel):
    id: str
    status: str  # "pending", "processing", "completed", "failed"
    progress: int  # 0-100
    result: Optional[RoomAnalysisResponse] = None
    error: Optional[str] = None


# In-memory storage for demo (use Redis in production)
analysis_jobs: dict = {}


@router.post("/upload", response_model=dict)
async def upload_room_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = "zh",
):
    """
    Upload room photo and start analysis
    
    - **file**: Room photo file (JPG, PNG, WebP)
    - **language**: Response language ("zh" or "en")
    
    Returns job ID for polling analysis results
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Supported types: {', '.join(allowed_types)}"
        )
    
    # Validate file size (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size cannot exceed 10MB"
        )
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Store file
    file_url = await storage_service.upload_file(
        content,
        f"rooms/{job_id}/{file.filename}",
        file.content_type
    )
    
    # Initialize job status
    analysis_jobs[job_id] = {
        "status": "pending",
        "progress": 0,
        "image_url": file_url,
        "image_data": base64.b64encode(content).decode("utf-8"),
        "language": language,
        "result": None,
        "error": None,
    }
    
    # Start background analysis
    background_tasks.add_task(process_analysis, job_id, language)
    
    return {
        "id": job_id,
        "status": "pending",
        "message": "Image uploaded successfully, analysis in progress..."
    }


async def process_analysis(job_id: str, language: str = "zh"):
    """Background task to process room analysis"""
    try:
        job = analysis_jobs.get(job_id)
        if not job:
            return
        
        # Update status
        job["status"] = "processing"
        job["progress"] = 10
        
        # Step 1: GPT-4 Vision Analysis
        logger.info(f"Starting GPT-4 Vision analysis for job {job_id} (language: {language})")
        job["progress"] = 20
        
        analysis_result = await vision_service.analyze_room(job["image_data"], language)
        job["progress"] = 50
        
        # Step 2: SAM Segmentation (optional)
        logger.info(f"Starting segmentation for job {job_id}")
        job["progress"] = 60
        
        segmentation_url = None
        try:
            segmentation_result = await segmentation_service.segment_image(
                job["image_data"]
            )
            if segmentation_result:
                segmentation_url = await storage_service.upload_file(
                    base64.b64decode(segmentation_result),
                    f"rooms/{job_id}/segmentation.png",
                    "image/png"
                )
        except Exception as e:
            logger.warning(f"Segmentation failed: {e}")
        
        job["progress"] = 90
        
        # Complete
        job["status"] = "completed"
        job["progress"] = 100
        job["result"] = {
            "id": job_id,
            "image_url": job["image_url"],
            "segmentation_url": segmentation_url,
            **analysis_result
        }
        
        logger.info(f"Analysis completed for job {job_id}")
        
    except Exception as e:
        logger.error(f"Analysis failed for job {job_id}: {e}")
        job["status"] = "failed"
        job["error"] = str(e)


@router.get("/status/{job_id}", response_model=AnalysisStatusResponse)
async def get_analysis_status(job_id: str):
    """
    Get analysis job status
    
    - **job_id**: Job ID
    """
    job = analysis_jobs.get(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail="任务不存在"
        )
    
    return AnalysisStatusResponse(
        id=job_id,
        status=job["status"],
        progress=job["progress"],
        result=job.get("result"),
        error=job.get("error"),
    )


@router.get("/demo", response_model=RoomAnalysisResponse)
async def get_demo_analysis():
    """
    获取示例分析结果（用于前端开发测试）
    """
    return RoomAnalysisResponse(
        id="demo-001",
        room_type="living",
        dimensions=RoomDimensions(width=5.5, length=4.2, height=2.8),
        existing_furniture=["沙发", "茶几", "电视柜", "书架"],
        current_style="现代简约",
        lighting="自然光充足，东向窗户",
        problems=["空间利用不足", "色彩单调", "缺乏装饰元素"],
        potential="可以通过添加绿植、艺术画和调整家具布局来提升空间感",
        confidence=0.92,
        image_url="https://example.com/demo-room.jpg",
        segmentation_url=None,
    )

