import os
import tempfile
import logging
from typing import Dict, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy import to avoid startup failures
whisper = None
torch = None

def _import_whisper():
    """Lazy import whisper and torch to avoid startup failures"""
    global whisper, torch
    if whisper is None:
        try:
            import whisper as w
            import torch as t
            whisper = w
            torch = t
        except Exception as e:
            logger.error(f"Failed to import whisper/torch: {str(e)}")
            raise ImportError(f"Whisper dependencies not available: {str(e)}")


class LocalWhisperService:
    """Service for local voice transcription using OpenAI Whisper"""
    
    def __init__(self):
        """Initialize Whisper model"""
        self.model = None
        self.model_size = settings.WHISPER_MODEL_SIZE
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model on initialization"""
        try:
            # Import whisper/torch only when needed
            _import_whisper()
            
            logger.info(f"Loading Whisper model: {self.model_size}")
            
            # Use CPU if CUDA is not available
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {device}")
            
            self.model = whisper.load_model(self.model_size, device=device)
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {str(e)}")
            # Don't raise - allow server to start without voice features
            self.model = None
    
    async def transcribe_audio(self, audio_file_path: str) -> Dict[str, any]:
        """
        Transcribe audio file to text
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Dict with transcript, confidence, duration, and language
        """
        if self.model is None:
            raise RuntimeError("Whisper model not available. Voice transcription is disabled.")
            
        try:
            logger.info(f"Transcribing audio file: {audio_file_path}")
            
            # Transcribe using Whisper
            result = self.model.transcribe(
                audio_file_path,
                fp16=False,  # Use FP32 for better compatibility
                language="en",  # Can be auto-detected by removing this
                task="transcribe"
            )
            
            transcript = result["text"].strip()
            language = result.get("language", "en")
            
            # Calculate average confidence from segments
            segments = result.get("segments", [])
            if segments:
                avg_confidence = sum(seg.get("no_speech_prob", 0) for seg in segments) / len(segments)
                confidence = 1.0 - avg_confidence  # Invert no_speech_prob
            else:
                confidence = 0.8  # Default confidence
            
            # Get duration from segments or estimate
            duration = segments[-1]["end"] if segments else 0.0
            
            logger.info(f"Transcription completed: {len(transcript)} characters, confidence: {confidence:.2f}")
            
            return {
                "transcript": transcript,
                "confidence": round(confidence, 3),
                "duration": round(duration, 2),
                "language": language
            }
            
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise RuntimeError(f"Failed to transcribe audio: {str(e)}")
    
    async def transcribe_from_bytes(self, audio_bytes: bytes, filename: str) -> Dict[str, any]:
        """
        Transcribe audio from bytes
        
        Args:
            audio_bytes: Audio file bytes
            filename: Original filename (for extension)
            
        Returns:
            Dict with transcript, confidence, duration, and language
        """
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name
        
        try:
            # Transcribe
            result = await self.transcribe_audio(temp_path)
            return result
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)


# Singleton instance
_whisper_service = None


def get_whisper_service() -> LocalWhisperService:
    """Get or create Whisper service singleton"""
    global _whisper_service
    if _whisper_service is None:
        _whisper_service = LocalWhisperService()
    return _whisper_service
