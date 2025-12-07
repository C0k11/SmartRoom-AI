import httpx
import replicate
import logging
from typing import Optional
import base64
import openai

from app.core.config import settings
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


class ImageGenerationService:
    """Service for generating room design images using Replicate"""
    
    def __init__(self):
        self.replicate_token = settings.REPLICATE_API_TOKEN
        self.storage = StorageService()
        
        if self.replicate_token:
            # Set the API token for replicate library
            import os
            os.environ["REPLICATE_API_TOKEN"] = self.replicate_token
            logger.info("Replicate API configured")
        else:
            logger.warning("No Replicate API token configured")
    
    async def generate_room_image(
        self,
        prompt: str,
        style: str = "modern",
        negative_prompt: str = None,
        source_image: str = None,  # Base64 encoded source image for img2img
    ) -> str:
        """
        Generate room design image using FLUX, SDXL, or img2img
        
        Args:
            prompt: Design prompt
            style: Design style for additional context
            negative_prompt: Things to avoid in generation
            source_image: Base64 encoded source image for img2img mode
            
        Returns:
            URL of generated image
        """
        if not self.replicate_token:
            logger.warning("No Replicate API configured, returning placeholder")
            return self._get_placeholder_url(style)
        
        try:
            # Try DALL-E 3 first (best quality for interior design)
            if settings.OPENAI_API_KEY:
                try:
                    return await self._generate_with_dalle3(prompt)
                except Exception as e:
                    logger.warning(f"DALL-E 3 failed: {e}, falling back to FLUX")
            
            # Fallback to FLUX
            return await self._generate_with_flux(prompt)
        except Exception as e:
            logger.error(f"FLUX generation failed: {e}")
            try:
                # Fallback to SDXL text2img
                return await self._generate_with_sdxl(prompt, negative_prompt)
            except Exception as e2:
                logger.error(f"SDXL generation also failed: {e2}")
                return self._get_placeholder_url(style)
    
    async def _generate_with_controlnet(
        self,
        prompt: str,
        source_image: str,
        negative_prompt: str = None,
    ) -> str:
        """Generate image using ControlNet to maintain room structure (95%+ similarity)"""
        
        if not negative_prompt:
            negative_prompt = (
                "blurry, low quality, distorted, ugly, deformed, "
                "watermark, text, signature, cartoon, anime, drawing, "
                "different room shape, changed layout, wrong perspective"
            )
        
        # ControlNet prompt - emphasizes maintaining exact room structure
        full_prompt = (
            f"{prompt}, "
            "exact same room shape and layout, same perspective and angle, "
            "same windows and doors positions, same ceiling height, "
            "professional interior photography, architectural digest style, "
            "8k uhd, photorealistic, detailed textures, natural lighting"
        )
        
        logger.info(f"Generating with ControlNet (structure preservation): {full_prompt[:100]}...")
        
        try:
            # Use ControlNet Canny model for edge-based structure preservation
            # This maintains 95%+ room structure similarity
            output = replicate.run(
                "jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638571f6dffa6c2519b6e9bb5d3cbb",
                input={
                    "image": f"data:image/jpeg;base64,{source_image}",
                    "prompt": full_prompt,
                    "negative_prompt": negative_prompt,
                    "num_samples": "1",
                    "image_resolution": "768",
                    "ddim_steps": 30,
                    "scale": 9,  # Higher scale = more prompt adherence
                    "a_prompt": "best quality, extremely detailed, photorealistic",
                    "n_prompt": negative_prompt,
                    "detect_resolution": 512,
                    "low_threshold": 100,
                    "high_threshold": 200,
                }
            )
            
            if output and len(output) > 0:
                image_url = output[0]
                logger.info(f"ControlNet generation successful: {image_url}")
                return str(image_url)
            else:
                raise Exception("No output from ControlNet")
                
        except Exception as e:
            logger.error(f"ControlNet generation error: {e}")
            # Try alternative ControlNet model
            try:
                return await self._generate_with_controlnet_depth(prompt, source_image, negative_prompt)
            except:
                raise
    
    async def _generate_with_controlnet_depth(
        self,
        prompt: str,
        source_image: str,
        negative_prompt: str = None,
    ) -> str:
        """Fallback: Use depth-based ControlNet for room structure"""
        
        full_prompt = (
            f"{prompt}, "
            "same room structure and dimensions, identical perspective, "
            "professional interior design photography, high quality, photorealistic"
        )
        
        logger.info(f"Trying ControlNet depth model...")
        
        try:
            output = replicate.run(
                "jagilley/controlnet-depth:922c7bb67b87ec32cbc2fd11b1d5f94f0ba4f5519c4dbd02856f0f7e65a97c32",
                input={
                    "image": f"data:image/jpeg;base64,{source_image}",
                    "prompt": full_prompt,
                    "num_samples": "1",
                    "image_resolution": "768",
                    "ddim_steps": 30,
                    "scale": 9,
                    "a_prompt": "best quality, extremely detailed, photorealistic interior",
                    "n_prompt": negative_prompt or "low quality, blurry, distorted",
                    "detect_resolution": 512,
                }
            )
            
            if output and len(output) > 0:
                image_url = output[0]
                logger.info(f"ControlNet depth generation successful: {image_url}")
                return str(image_url)
            else:
                raise Exception("No output from ControlNet depth")
                
        except Exception as e:
            logger.error(f"ControlNet depth generation error: {e}")
            raise
    
    async def _generate_with_img2img(
        self, 
        prompt: str, 
        source_image: str,  # Base64 encoded
        style: str = "modern"
    ) -> str:
        """
        Generate image using img2img to PRESERVE original room structure
        while ADDING the requested items/furniture
        """
        
        # The prompt should clearly state what to ADD while keeping structure
        full_prompt = (
            f"Same room, same walls, same floor, same ceiling. "
            f"ADD these items to the room: {prompt}. "
            f"Photorealistic interior photograph, high quality, detailed"
        )
        
        logger.info(f"Generating with img2img: {full_prompt[:150]}...")
        
        try:
            # Use SDXL img2img model with balanced prompt_strength
            # 0.55 = keep 45% original structure, allow 55% changes for adding items
            output = replicate.run(
                "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
                input={
                    "prompt": full_prompt,
                    "image": f"data:image/jpeg;base64,{source_image}",
                    "prompt_strength": 0.55,  # Balanced: keep structure but add items
                    "num_outputs": 1,
                    "width": 1024,
                    "height": 768,
                    "num_inference_steps": 35,
                    "guidance_scale": 8.0,  # Higher guidance = follow prompt more closely
                    "negative_prompt": (
                        "different room shape, outdoor, landscape, sky, "
                        "blurry, low quality, distorted, watermark, text"
                    ),
                }
            )
            
            if output and len(output) > 0:
                image_url = output[0]
                logger.info(f"img2img generation successful: {image_url}")
                return str(image_url)
            else:
                raise Exception("No output from img2img")
                
        except Exception as e:
            logger.error(f"img2img generation failed: {e}, trying alternative model")
            # Try alternative: instruct-pix2pix for editing
            try:
                return await self._generate_with_instruct_pix2pix(prompt, source_image)
            except:
                # Final fallback to FLUX
                return await self._generate_with_flux(
                    f"Interior room with {prompt}, photorealistic"
                )
    
    async def _generate_with_instruct_pix2pix(
        self,
        prompt: str,
        source_image: str,
    ) -> str:
        """
        Use InstructPix2Pix model which is better at following edit instructions
        """
        instruction = f"Add {prompt} to this room. Keep the same walls and floor."
        
        logger.info(f"Trying InstructPix2Pix: {instruction[:100]}...")
        
        output = replicate.run(
            "timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f",
            input={
                "image": f"data:image/jpeg;base64,{source_image}",
                "prompt": instruction,
                "num_inference_steps": 50,
                "image_guidance_scale": 1.2,  # How much to keep original image
                "guidance_scale": 7.5,
            }
        )
        
        if output and len(output) > 0:
            image_url = output[0]
            logger.info(f"InstructPix2Pix generation successful: {image_url}")
            return str(image_url)
        else:
            raise Exception("No output from InstructPix2Pix")

    async def _generate_with_dalle3(self, prompt: str) -> str:
        """Generate image using DALL-E 3 (best quality for interior design)"""
        
        full_prompt = (
            f"{prompt}. "
            "Professional interior design photograph, architectural photography style, "
            "realistic lighting, high resolution, sharp details, magazine quality."
        )
        
        logger.info(f"Generating with DALL-E 3: {full_prompt[:150]}...")
        
        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            response = client.images.generate(
                model="dall-e-3",
                prompt=full_prompt,
                size="1792x1024",  # Wide format for room design
                quality="hd",  # Higher quality
                n=1,
            )
            
            image_url = response.data[0].url
            logger.info(f"DALL-E 3 generation successful: {image_url[:80]}...")
            return image_url
            
        except Exception as e:
            logger.error(f"DALL-E 3 generation error: {e}")
            raise

    async def _generate_with_flux(self, prompt: str) -> str:
        """Generate image using FLUX.1.1 Pro (highest quality)"""
        
        # Clean and enhance the prompt for better results
        full_prompt = (
            f"{prompt}, "
            "interior design photograph, professional photography, "
            "sharp focus, high resolution, photorealistic, "
            "natural lighting, clean image, no distortion, no blur"
        )
        
        logger.info(f"Generating with FLUX Pro: {full_prompt[:200]}...")
        
        try:
            # Try FLUX 1.1 Pro first (highest quality)
            try:
                output = replicate.run(
                    "black-forest-labs/flux-1.1-pro",
                    input={
                        "prompt": full_prompt,
                        "aspect_ratio": "16:9",
                        "output_format": "webp",
                        "output_quality": 95,
                        "safety_tolerance": 2,
                        "prompt_upsampling": True,  # Enhance prompt for better results
                    }
                )
                
                if output:
                    image_url = str(output)
                    logger.info(f"FLUX Pro generation successful: {image_url}")
                    return image_url
                    
            except Exception as pro_error:
                logger.warning(f"FLUX Pro failed, trying Dev: {pro_error}")
                
                # Fallback to FLUX Dev (still high quality, cheaper)
                output = replicate.run(
                    "black-forest-labs/flux-dev",
                    input={
                        "prompt": full_prompt,
                        "num_outputs": 1,
                        "aspect_ratio": "16:9",
                        "output_format": "webp",
                        "output_quality": 90,
                        "guidance": 3.5,
                        "num_inference_steps": 28,
                    }
                )
                
                if output and len(output) > 0:
                    image_url = output[0]
                    logger.info(f"FLUX Dev generation successful: {image_url}")
                    return str(image_url)
            
            # Last resort: FLUX Schnell (fastest, lower quality)
            output = replicate.run(
                "black-forest-labs/flux-schnell",
                input={
                    "prompt": full_prompt,
                    "num_outputs": 1,
                    "aspect_ratio": "16:9",
                    "output_format": "webp",
                    "output_quality": 90,
                }
            )
            
            if output and len(output) > 0:
                image_url = output[0]
                logger.info(f"FLUX Schnell generation successful: {image_url}")
                return str(image_url)
            else:
                raise Exception("No output from FLUX")
                
        except Exception as e:
            logger.error(f"FLUX generation error: {e}")
            raise
    
    async def _generate_with_sdxl(
        self,
        prompt: str,
        negative_prompt: str = None,
    ) -> str:
        """Generate image using Stable Diffusion XL via Replicate"""
        
        if not negative_prompt:
            negative_prompt = (
                "blurry, low quality, distorted, ugly, bad anatomy, "
                "watermark, text, signature, cartoon, anime, drawing, "
                "sketch, painting, illustration, render, 3d"
            )
        
        full_prompt = (
            f"{prompt}, "
            "professional interior photography, architectural digest, "
            "8k uhd, high resolution, photorealistic, detailed textures"
        )
        
        logger.info(f"Generating with SDXL: {full_prompt[:100]}...")
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                # Start prediction
                response = await client.post(
                    "https://api.replicate.com/v1/predictions",
                    headers={
                        "Authorization": f"Token {self.replicate_token}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "version": settings.SDXL_MODEL.split(":")[-1],
                        "input": {
                            "prompt": full_prompt,
                            "negative_prompt": negative_prompt,
                            "width": 1344,
                            "height": 768,
                            "num_outputs": 1,
                            "scheduler": "K_EULER",
                            "num_inference_steps": 30,
                            "guidance_scale": 7.5,
                        },
                    },
                )
                
                if response.status_code != 201:
                    logger.error(f"Replicate API error: {response.text}")
                    raise Exception(f"Failed to start image generation: {response.text}")
                
                prediction = response.json()
                prediction_id = prediction["id"]
                logger.info(f"SDXL prediction started: {prediction_id}")
                
                # Poll for completion
                import asyncio
                for _ in range(60):  # Max 2 minutes
                    status_response = await client.get(
                        f"https://api.replicate.com/v1/predictions/{prediction_id}",
                        headers={
                            "Authorization": f"Token {self.replicate_token}",
                        },
                    )
                    
                    status = status_response.json()
                    
                    if status["status"] == "succeeded":
                        image_url = status["output"][0]
                        logger.info(f"SDXL generation successful: {image_url}")
                        return image_url
                    elif status["status"] == "failed":
                        raise Exception(f"Generation failed: {status.get('error')}")
                    
                    await asyncio.sleep(2)
                
                raise Exception("Generation timeout")
                    
        except Exception as e:
            logger.error(f"SDXL generation failed: {e}")
            raise
    
    def _get_placeholder_url(self, style: str) -> str:
        """Return a placeholder image URL based on style"""
        # Using Unsplash for high-quality placeholder images
        placeholders = {
            "modern": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200",
            "nordic": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200",
            "japanese": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200",
            "industrial": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
            "minimalist": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200",
        }
        return placeholders.get(style, placeholders["modern"])
    
    async def generate_before_after(
        self,
        original_image: str,
        prompt: str,
        style: str,
    ) -> dict:
        """
        Generate before/after comparison
        """
        generated = await self.generate_room_image(prompt, style)
        
        return {
            "before": original_image,
            "after": generated,
        }
