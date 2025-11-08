import logging
import os
import tempfile
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.constants import SUPPORTED_AUDIO_FORMATS, SUPPORTED_AUDIO_EXTENSIONS
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.voice import VoiceTranscriptResponse
from app.services.voice_service import get_whisper_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/transcribe", response_model=VoiceTranscriptResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Transcribe audio file to text using Whisper"""
    try:
        # Validate file type
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in SUPPORTED_AUDIO_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format. Supported formats: {', '.join(SUPPORTED_AUDIO_EXTENSIONS)}"
            )
        
        # Read file content
        audio_bytes = await file.read()
        
        # Validate file size
        if len(audio_bytes) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE // 1024 // 1024}MB"
            )
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name
        
        try:
            # Get Whisper service
            whisper_service = get_whisper_service()
            
            # Transcribe
            result = await whisper_service.transcribe_audio(temp_path)
            
            logger.info(f"Transcription completed for user {current_user.email}: {len(result['transcript'])} chars")
            
            return VoiceTranscriptResponse(**result)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio: {str(e)}"
        )


@router.get("/history")
async def get_transcription_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's transcription history with pagination"""
    # TODO: Implement transcription history storage
    # For now, return empty list
    return {
        "items": [],
        "total": 0,
        "skip": skip,
        "limit": limit
    }
