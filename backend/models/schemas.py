from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EmotionType(str, Enum):
    happy = "happy"
    sad = "sad"
    angry = "angry"
    calm = "calm"
    neutral = "neutral"
    surprise = "surprise"
    fear = "fear"
    disgust = "disgust"


class TextEmotionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    user_id: Optional[str] = "anonymous"


class FaceEmotionRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded image data")
    user_id: Optional[str] = "anonymous"


class EmotionResponse(BaseModel):
    emotion: str
    confidence: float
    all_emotions: Optional[dict] = None
    method: str
    user_id: Optional[str] = None


class SongModel(BaseModel):
    id: Optional[str] = None
    title: str
    artist: str
    emotion: EmotionType
    genre: Optional[str] = None
    preview_url: Optional[str] = ""
    bpm: Optional[int] = None
    energy: Optional[float] = None


class AddSongRequest(BaseModel):
    title: str = Field(..., min_length=1)
    artist: str = Field(..., min_length=1)
    emotion: EmotionType
    genre: Optional[str] = None
    preview_url: Optional[str] = ""
    bpm: Optional[int] = None


class FeedbackRequest(BaseModel):
    song_id: str
    feedback: str = Field(..., pattern="^(like|dislike)$")
    user_id: Optional[str] = "anonymous"


class HistoryEntry(BaseModel):
    user_id: str = "anonymous"
    emotion: str
    confidence: float
    method: str
    text_snippet: Optional[str] = None
    created_at: Optional[datetime] = None


class HistoryResponse(BaseModel):
    entries: List[dict]
    total: int
