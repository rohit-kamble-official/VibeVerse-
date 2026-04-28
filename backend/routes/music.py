from fastapi import APIRouter, HTTPException, Query, status
from bson import ObjectId
from typing import Optional
import logging

from models.schemas import AddSongRequest, FeedbackRequest
from db.mongo import get_database

router = APIRouter()
logger = logging.getLogger(__name__)


def serialize_song(song: dict) -> dict:
    song["id"] = str(song.pop("_id"))
    return song


@router.get("/songs/{emotion}")
async def get_songs_by_emotion(
    emotion: str,
    limit: int = Query(default=6, ge=1, le=20),
    user_id: Optional[str] = Query(default="anonymous"),
):
    """
    Fetch a playlist of songs for a given emotion.
    Songs disliked by the user are excluded (smart learning).
    """
    db = get_database()
    emotion = emotion.lower()

    valid_emotions = {"happy", "sad", "angry", "calm", "neutral"}
    if emotion not in valid_emotions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid emotion. Must be one of: {', '.join(valid_emotions)}"
        )

    # Get disliked song IDs for this user
    disliked_cursor = db.feedback.find(
        {"user_id": user_id, "feedback": "dislike"},
        {"song_id": 1}
    )
    disliked_ids = [
        ObjectId(f["song_id"]) async for f in disliked_cursor
        if ObjectId.is_valid(f.get("song_id", ""))
    ]

    # Query songs, excluding dislikes
    query = {"emotion": emotion}
    if disliked_ids:
        query["_id"] = {"$nin": disliked_ids}

    cursor = db.songs.find(query).limit(limit)
    songs = [serialize_song(s) async for s in cursor]

    if not songs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No songs found for emotion: {emotion}"
        )

    return {
        "emotion": emotion,
        "count": len(songs),
        "songs": songs,
    }


@router.post("/songs", status_code=status.HTTP_201_CREATED)
async def add_song(request: AddSongRequest):
    """Add a new song to the database for a specific emotion."""
    db = get_database()

    # Check duplicate
    existing = await db.songs.find_one({
        "title": {"$regex": f"^{request.title}$", "$options": "i"},
        "artist": {"$regex": f"^{request.artist}$", "$options": "i"},
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Song already exists in the database"
        )

    song = request.model_dump()
    song["emotion"] = song["emotion"].value if hasattr(song["emotion"], "value") else song["emotion"]

    result = await db.songs.insert_one(song)
    return {
        "message": "Song added successfully",
        "song_id": str(result.inserted_id),
        "song": {**song, "id": str(result.inserted_id)},
    }


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Submit like/dislike feedback for a song.
    Used for smart playlist learning.
    """
    db = get_database()

    # Upsert feedback
    await db.feedback.update_one(
        {"user_id": request.user_id, "song_id": request.song_id},
        {"$set": {"feedback": request.feedback}},
        upsert=True,
    )

    return {"message": f"Feedback '{request.feedback}' recorded", "song_id": request.song_id}


@router.get("/songs")
async def list_all_songs(
    emotion: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    """List all songs, optionally filtered by emotion."""
    db = get_database()
    query = {}
    if emotion:
        query["emotion"] = emotion.lower()

    cursor = db.songs.find(query).skip(skip).limit(limit)
    songs = [serialize_song(s) async for s in cursor]
    total = await db.songs.count_documents(query)

    return {"songs": songs, "total": total, "limit": limit, "skip": skip}
