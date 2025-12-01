import logging
from app.celery_app import celery_app
from app.services.vision_service import VisionService
from app.services.segmentation_service import SegmentationService
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)

vision_service = VisionService()
segmentation_service = SegmentationService()
storage_service = StorageService()


@celery_app.task(bind=True, max_retries=3)
def analyze_room_image(self, job_id: str, image_base64: str, image_url: str):
    """
    Celery task to analyze room image
    
    Args:
        job_id: Unique job identifier
        image_base64: Base64 encoded image data
        image_url: URL of the uploaded image
    
    Returns:
        Analysis result dictionary
    """
    try:
        logger.info(f"Starting room analysis for job {job_id}")
        
        # Update task state
        self.update_state(
            state="PROGRESS",
            meta={"progress": 10, "status": "Analyzing room..."}
        )
        
        # Step 1: GPT-4 Vision Analysis
        import asyncio
        loop = asyncio.get_event_loop()
        analysis_result = loop.run_until_complete(
            vision_service.analyze_room(image_base64)
        )
        
        self.update_state(
            state="PROGRESS",
            meta={"progress": 50, "status": "Room analysis complete"}
        )
        
        # Step 2: Object Segmentation (optional)
        segmentation_url = None
        try:
            self.update_state(
                state="PROGRESS",
                meta={"progress": 60, "status": "Segmenting objects..."}
            )
            
            segmentation_result = loop.run_until_complete(
                segmentation_service.segment_image(image_base64)
            )
            
            if segmentation_result:
                import base64
                segmentation_url = loop.run_until_complete(
                    storage_service.upload_file(
                        base64.b64decode(segmentation_result),
                        f"rooms/{job_id}/segmentation.png",
                        "image/png"
                    )
                )
        except Exception as e:
            logger.warning(f"Segmentation failed for job {job_id}: {e}")
        
        self.update_state(
            state="PROGRESS",
            meta={"progress": 90, "status": "Finalizing..."}
        )
        
        # Combine results
        result = {
            "id": job_id,
            "image_url": image_url,
            "segmentation_url": segmentation_url,
            **analysis_result
        }
        
        logger.info(f"Room analysis completed for job {job_id}")
        return result
        
    except Exception as e:
        logger.error(f"Room analysis failed for job {job_id}: {e}")
        self.retry(countdown=10, exc=e)


@celery_app.task(bind=True)
def batch_analyze_rooms(self, job_ids: list, images: list):
    """
    Batch analyze multiple room images
    """
    results = []
    total = len(job_ids)
    
    for i, (job_id, image_data) in enumerate(zip(job_ids, images)):
        try:
            self.update_state(
                state="PROGRESS",
                meta={
                    "progress": int((i / total) * 100),
                    "current": i + 1,
                    "total": total
                }
            )
            
            result = analyze_room_image.delay(
                job_id,
                image_data["base64"],
                image_data["url"]
            )
            results.append({"job_id": job_id, "task_id": result.id})
            
        except Exception as e:
            logger.error(f"Failed to queue analysis for {job_id}: {e}")
            results.append({"job_id": job_id, "error": str(e)})
    
    return results

