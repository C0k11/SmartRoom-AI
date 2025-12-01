import httpx
import logging
from typing import Optional
import base64

from app.core.config import settings

logger = logging.getLogger(__name__)


class SegmentationService:
    """SAM (Segment Anything Model) service for object segmentation"""
    
    def __init__(self):
        self.api_token = settings.HUGGINGFACE_API_TOKEN
        self.endpoint = settings.SAM_MODEL_ENDPOINT
    
    async def segment_image(self, image_base64: str) -> Optional[str]:
        """
        Segment objects in image using SAM model
        
        Args:
            image_base64: Base64 encoded image data
            
        Returns:
            Base64 encoded segmentation mask image, or None if failed
        """
        if not self.api_token:
            logger.warning("HuggingFace API token not set, skipping segmentation")
            return None
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                # Decode base64 to bytes
                image_bytes = base64.b64decode(image_base64)
                
                response = await client.post(
                    self.endpoint,
                    headers={
                        "Authorization": f"Bearer {self.api_token}",
                        "Content-Type": "application/octet-stream",
                    },
                    content=image_bytes,
                )
                
                if response.status_code == 200:
                    # Response should be segmentation data
                    result = response.json()
                    return self._process_segmentation(result, image_base64)
                else:
                    logger.error(f"SAM API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Segmentation failed: {e}")
            return None
    
    def _process_segmentation(self, result: dict, original_image: str) -> Optional[str]:
        """
        Process SAM output and create visualization
        
        Args:
            result: SAM model output
            original_image: Original image base64
            
        Returns:
            Base64 encoded visualization image
        """
        try:
            from PIL import Image
            import numpy as np
            import io
            
            # Decode original image
            img_bytes = base64.b64decode(original_image)
            img = Image.open(io.BytesIO(img_bytes))
            img_array = np.array(img)
            
            # Create overlay with masks
            # SAM returns masks for detected objects
            if isinstance(result, list) and len(result) > 0:
                overlay = img_array.copy()
                colors = [
                    (255, 0, 0, 100),    # Red
                    (0, 255, 0, 100),    # Green
                    (0, 0, 255, 100),    # Blue
                    (255, 255, 0, 100),  # Yellow
                    (255, 0, 255, 100),  # Magenta
                    (0, 255, 255, 100),  # Cyan
                ]
                
                for i, segment in enumerate(result[:6]):  # Limit to 6 segments
                    if "mask" in segment:
                        mask = np.array(segment["mask"])
                        color = colors[i % len(colors)]
                        
                        # Apply color overlay
                        overlay[mask > 0] = overlay[mask > 0] * 0.7 + np.array(color[:3]) * 0.3
                
                # Convert back to image
                result_img = Image.fromarray(overlay.astype(np.uint8))
                
                # Save to bytes
                buffer = io.BytesIO()
                result_img.save(buffer, format="PNG")
                
                return base64.b64encode(buffer.getvalue()).decode("utf-8")
            
            return None
            
        except Exception as e:
            logger.error(f"Segmentation processing failed: {e}")
            return None
    
    async def get_object_masks(self, image_base64: str) -> list:
        """
        Get individual object masks for furniture detection
        
        Returns list of detected objects with their masks
        """
        if not self.api_token:
            return []
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                image_bytes = base64.b64decode(image_base64)
                
                # Use automatic mask generation
                response = await client.post(
                    f"{self.endpoint}?parameters[points_per_side]=32",
                    headers={
                        "Authorization": f"Bearer {self.api_token}",
                        "Content-Type": "application/octet-stream",
                    },
                    content=image_bytes,
                )
                
                if response.status_code == 200:
                    masks = response.json()
                    # Filter and sort by area
                    return sorted(masks, key=lambda x: x.get("area", 0), reverse=True)[:10]
                    
        except Exception as e:
            logger.error(f"Object mask detection failed: {e}")
        
        return []

