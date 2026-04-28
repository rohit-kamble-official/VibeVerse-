from fastapi import APIRouter, Query, status
from typing import Optional
from datetime import datetime, timezone
import logging

from models.schemas import HistoryEntry, HistoryResponse
from db.mongo import get_database

router = APIRouter()
logger = logging.getLogger(__name__)


def serialize_entry(entry: dict) -> dict:
    entry["id"] = str(entry.pop("_id"))
    if isinstance(entry.get("created_at"), datetime):
        entry["created_at"] = entry["created_at"].isoformat()
    return entry


@router.post("/history", status_code=status.HTTP_201_CREATED)
async def save_history(entry: HistoryEntry):
    """Manually save a mood detection event to history."""
    db = get_database()
    doc = entry.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)

    result = await db.history.insert_one(doc)
    return {"message": "History saved", "id": str(result.inserted_id)}


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    user_id: Optional[str] = Query(default="anonymous"),
    limit: int = Query(default=10, ge=1, le=50),
):
    """Fetch the last N mood detection events for a user."""
    db = get_database()

    cursor = db.history.find(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    ).limit(limit)

    entries = [serialize_entry(e) async for e in cursor]
    total = await db.history.count_documents({"user_id": user_id})

    return HistoryResponse(entries=entries, total=total)


@router.delete("/history")
async def clear_history(user_id: Optional[str] = Query(default="anonymous")):
    """Clear all mood history for a user."""
    db = get_database()
    result = await db.history.delete_many({"user_id": user_id})
    return {"message": f"Deleted {result.deleted_count} history entries"}


@router.get("/history/stats")
async def get_mood_stats(user_id: Optional[str] = Query(default="anonymous")):
    """Get mood distribution statistics for a user."""
    db = get_database()

    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$emotion", "count": {"$sum": 1}, "avg_confidence": {"$avg": "$confidence"}}},
        {"$sort": {"count": -1}},
    ]

    cursor = db.history.aggregate(pipeline)
    stats = [{"emotion": s["_id"], "count": s["count"], "avg_confidence": round(s["avg_confidence"], 3)}
             async for s in cursor]

    total = sum(s["count"] for s in stats)
    for s in stats:
        s["percentage"] = round(s["count"] / total * 100, 1) if total > 0 else 0

    return {"stats": stats, "total_detections": total, "user_id": user_id}
