from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
import logging

from models.schemas import (
    TextEmotionRequest, FaceEmotionRequest, EmotionResponse
)
from services.text_analysis import analyze_text_emotion
from services.face_detection import analyze_face_emotion
from db.mongo import get_database

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/detect-text", response_model=EmotionResponse)
async def detect_text_emotion(request: TextEmotionRequest):
    """
    Analyze text input to detect emotion using DistilRoBERTa.
    Returns dominant emotion, confidence score, and all emotion probabilities.
    """
    try:
        result = await analyze_text_emotion(request.text)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        logger.error(f"Text detection error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Analysis failed")

    # Auto-save to history
    db = get_database()
    snippet = request.text[:100] + "..." if len(request.text) > 100 else request.text
    await db.history.insert_one({
        "user_id": request.user_id,
        "emotion": result["emotion"],
        "confidence": result["confidence"],
        "method": "text",
        "text_snippet": snippet,
        "all_emotions": result.get("all_emotions"),
        "created_at": datetime.now(timezone.utc),
    })

    return EmotionResponse(
        emotion=result["emotion"],
        confidence=result["confidence"],
        all_emotions=result.get("all_emotions"),
        method="DistilRoBERTa · Text Analysis",
        user_id=request.user_id,
    )


@router.post("/detect-face", response_model=EmotionResponse)
async def detect_face_emotion(request: FaceEmotionRequest):
    """
    Analyze webcam image to detect facial emotion using DeepFace.
    Automatically selects dominant face by bounding box area.
    Returns emotion, confidence, and number of faces detected.
    """
    if not request.image_base64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image data provided"
        )

    try:
        result = await analyze_face_emotion(request.image_base64)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Face detection error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No face detected or analysis failed. Ensure good lighting and face visibility."
        )

    # Auto-save to history
    db = get_database()
    await db.history.insert_one({
        "user_id": request.user_id,
        "emotion": result["emotion"],
        "confidence": result["confidence"],
        "method": "camera",
        "faces_detected": result.get("faces_detected", 1),
        "all_emotions": result.get("all_emotions"),
        "created_at": datetime.now(timezone.utc),
    })

    return EmotionResponse(
        emotion=result["emotion"],
        confidence=result["confidence"],
        all_emotions=result.get("all_emotions"),
        method=f"DeepFace · Camera ({result.get('faces_detected', 1)} face(s))",
        user_id=request.user_id,
    )
