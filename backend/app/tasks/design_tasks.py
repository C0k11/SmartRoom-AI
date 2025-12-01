import logging
from app.celery_app import celery_app
from app.services.design_service import DesignService
from app.services.image_generation_service import ImageGenerationService
from app.services.furniture_matching_service import FurnitureMatchingService
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)

design_service = DesignService()
image_gen_service = ImageGenerationService()
furniture_service = FurnitureMatchingService()
storage_service = StorageService()


@celery_app.task(bind=True, max_retries=3)
def generate_design_proposals(
    self,
    job_id: str,
    analysis_data: dict,
    preferences: dict,
    num_proposals: int = 3
):
    """
    Generate design proposals based on room analysis and user preferences
    
    Args:
        job_id: Unique job identifier
        analysis_data: Room analysis results
        preferences: User design preferences
        num_proposals: Number of proposals to generate
    
    Returns:
        List of design proposals
    """
    try:
        logger.info(f"Starting design generation for job {job_id}")
        
        import asyncio
        loop = asyncio.get_event_loop()
        
        # Step 1: Generate design concepts
        self.update_state(
            state="PROGRESS",
            meta={"progress": 10, "status": "Generating design concepts..."}
        )
        
        concepts = loop.run_until_complete(
            design_service.generate_concepts(
                style=preferences.get("style", "modern"),
                requirements=preferences.get("requirements", []),
                special_needs=preferences.get("special_needs", ""),
                num_concepts=num_proposals
            )
        )
        
        # Step 2: Generate images for each concept
        proposals = []
        for i, concept in enumerate(concepts):
            progress = 20 + (i * 25)
            self.update_state(
                state="PROGRESS",
                meta={
                    "progress": progress,
                    "status": f"Generating design {i + 1} of {len(concepts)}..."
                }
            )
            
            # Generate image
            image_url = loop.run_until_complete(
                image_gen_service.generate_room_image(
                    concept["prompt"],
                    style=preferences.get("style", "modern")
                )
            )
            
            # Match furniture
            furniture = loop.run_until_complete(
                furniture_service.match_furniture(
                    style=preferences.get("style", "modern"),
                    room_type=analysis_data.get("room_type", "living"),
                    budget=preferences.get("budget", 10000),
                    exclude=preferences.get("keep_furniture", [])
                )
            )
            
            total_cost = sum(f["price"] for f in furniture)
            
            proposals.append({
                "id": f"{job_id}-{i + 1}",
                "name": concept["name"],
                "description": concept["description"],
                "image_url": image_url,
                "style": preferences.get("style", "modern"),
                "confidence": concept.get("confidence", 0.85),
                "furniture": furniture,
                "total_cost": total_cost,
                "highlights": concept.get("highlights", []),
            })
        
        self.update_state(
            state="PROGRESS",
            meta={"progress": 95, "status": "Finalizing proposals..."}
        )
        
        logger.info(f"Design generation completed for job {job_id}")
        return proposals
        
    except Exception as e:
        logger.error(f"Design generation failed for job {job_id}: {e}")
        self.retry(countdown=30, exc=e)


@celery_app.task(bind=True, max_retries=2)
def generate_design_image(
    self,
    prompt: str,
    style: str,
    negative_prompt: str = None
):
    """
    Generate a single design image
    
    Args:
        prompt: Image generation prompt
        style: Design style
        negative_prompt: Things to avoid
    
    Returns:
        URL of generated image
    """
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        
        image_url = loop.run_until_complete(
            image_gen_service.generate_room_image(
                prompt=prompt,
                style=style,
                negative_prompt=negative_prompt
            )
        )
        
        return image_url
        
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        self.retry(countdown=60, exc=e)


@celery_app.task(bind=True)
def regenerate_design(
    self,
    design_id: str,
    feedback: str,
    original_preferences: dict
):
    """
    Regenerate a design based on user feedback
    
    Args:
        design_id: Original design ID
        feedback: User feedback for improvement
        original_preferences: Original design preferences
    
    Returns:
        New design proposal
    """
    try:
        logger.info(f"Regenerating design {design_id} with feedback")
        
        # Update preferences based on feedback
        updated_preferences = {
            **original_preferences,
            "special_needs": f"{original_preferences.get('special_needs', '')} {feedback}"
        }
        
        import asyncio
        loop = asyncio.get_event_loop()
        
        # Generate single new concept
        concepts = loop.run_until_complete(
            design_service.generate_concepts(
                style=updated_preferences.get("style", "modern"),
                requirements=updated_preferences.get("requirements", []),
                special_needs=updated_preferences.get("special_needs", ""),
                num_concepts=1
            )
        )
        
        if not concepts:
            raise Exception("Failed to generate new concept")
        
        concept = concepts[0]
        
        # Generate image
        image_url = loop.run_until_complete(
            image_gen_service.generate_room_image(
                concept["prompt"],
                style=updated_preferences.get("style", "modern")
            )
        )
        
        # Match furniture
        furniture = loop.run_until_complete(
            furniture_service.match_furniture(
                style=updated_preferences.get("style", "modern"),
                room_type="living",
                budget=updated_preferences.get("budget", 10000)
            )
        )
        
        return {
            "id": f"{design_id}-regenerated",
            "name": concept["name"],
            "description": concept["description"],
            "image_url": image_url,
            "style": updated_preferences.get("style", "modern"),
            "confidence": concept.get("confidence", 0.85),
            "furniture": furniture,
            "total_cost": sum(f["price"] for f in furniture),
            "highlights": concept.get("highlights", []),
        }
        
    except Exception as e:
        logger.error(f"Design regeneration failed: {e}")
        raise

