from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


class VoiceTranscriptRequest(BaseModel):
    """Schema for voice transcription request"""
    # File will be uploaded via multipart/form-data
    pass


class VoiceTranscriptResponse(BaseModel):
    """Schema for voice transcription response"""
    transcript: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    duration: float  # in seconds
    language: str = "en"


class TranscriptionHistory(BaseModel):
    """Schema for transcription history item"""
    id: UUID
    transcript: str
    confidence: float
    duration: float
    created_at: datetime
    
    class Config:
        from_attributes = True
