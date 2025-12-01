import os
import uuid
import logging
from typing import Optional
import aiofiles

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    """Service for file storage (local, S3, or R2)"""
    
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        
        if self.storage_type == "s3":
            import boto3
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION,
            )
            self.bucket = settings.AWS_S3_BUCKET
        elif self.storage_type == "r2":
            import boto3
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            )
            self.bucket = settings.AWS_S3_BUCKET
        else:
            # Local storage
            self.local_path = settings.LOCAL_STORAGE_PATH
            os.makedirs(self.local_path, exist_ok=True)
    
    async def upload_file(
        self,
        content: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Upload file and return URL
        
        Args:
            content: File content as bytes
            filename: Target filename (can include path)
            content_type: MIME type
            
        Returns:
            URL to access the file
        """
        if self.storage_type in ["s3", "r2"]:
            return await self._upload_to_s3(content, filename, content_type)
        else:
            return await self._upload_local(content, filename)
    
    async def _upload_to_s3(
        self,
        content: bytes,
        filename: str,
        content_type: str,
    ) -> str:
        """Upload to S3 or R2"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=filename,
                Body=content,
                ContentType=content_type,
            )
            
            if self.storage_type == "s3":
                return f"https://{self.bucket}.s3.{settings.AWS_S3_REGION}.amazonaws.com/{filename}"
            else:
                # R2 public URL (requires public bucket or custom domain)
                return f"https://{self.bucket}.r2.dev/{filename}"
                
        except Exception as e:
            logger.error(f"S3 upload failed: {e}")
            raise
    
    async def _upload_local(
        self,
        content: bytes,
        filename: str,
    ) -> str:
        """Upload to local filesystem"""
        try:
            # Ensure directory exists
            filepath = os.path.join(self.local_path, filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            async with aiofiles.open(filepath, "wb") as f:
                await f.write(content)
            
            # Return local URL (for development)
            return f"/uploads/{filename}"
            
        except Exception as e:
            logger.error(f"Local upload failed: {e}")
            raise
    
    async def delete_file(self, filename: str) -> bool:
        """Delete a file"""
        try:
            if self.storage_type in ["s3", "r2"]:
                self.s3_client.delete_object(
                    Bucket=self.bucket,
                    Key=filename,
                )
            else:
                filepath = os.path.join(self.local_path, filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
            
            return True
            
        except Exception as e:
            logger.error(f"Delete failed: {e}")
            return False
    
    async def get_file(self, filename: str) -> Optional[bytes]:
        """Get file content"""
        try:
            if self.storage_type in ["s3", "r2"]:
                response = self.s3_client.get_object(
                    Bucket=self.bucket,
                    Key=filename,
                )
                return response["Body"].read()
            else:
                filepath = os.path.join(self.local_path, filename)
                async with aiofiles.open(filepath, "rb") as f:
                    return await f.read()
                    
        except Exception as e:
            logger.error(f"Get file failed: {e}")
            return None
    
    def get_presigned_url(
        self,
        filename: str,
        expires_in: int = 3600,
    ) -> Optional[str]:
        """Generate presigned URL for direct download"""
        if self.storage_type not in ["s3", "r2"]:
            return f"/uploads/{filename}"
        
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket,
                    "Key": filename,
                },
                ExpiresIn=expires_in,
            )
            return url
        except Exception as e:
            logger.error(f"Presigned URL generation failed: {e}")
            return None

