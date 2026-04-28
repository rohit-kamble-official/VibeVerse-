import base64
import io
import asyncio
from typing import Dict, Any
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

# Emotion normalization map: DeepFace uses some different labels
EMOTION_MAP = {
    "happy": "happy",
    "sad": "sad",
    "angry": "angry",
    "fear": "calm",       # remap fear → calm for playlist purposes
    "surprise": "happy",  # surprise → happy
    "neutral": "neutral",
    "disgust": "angry",   # disgust → angry
    "calm": "calm",
}


def _analyze_sync(img_array) -> Dict[str, Any]:
    """Synchronous DeepFace analysis (CPU bound)."""
    try:
        from deepface import DeepFace
        import numpy as np

        results = DeepFace.analyze(
            img_path=img_array,
            actions=["emotion"],
            enforce_detection=False,
            detector_backend="opencv",
        )

        # Handle multiple faces — pick largest by region area
        if isinstance(results, list) and len(results) > 1:
            results.sort(
                key=lambda r: r.get("region", {}).get("w", 0)
                * r.get("region", {}).get("h", 0),
                reverse=True,
            )

        face = results[0] if isinstance(results, list) else results
        raw_emotion = face["dominant_emotion"]
        all_emotions = face.get("emotion", {})

        dominant = EMOTION_MAP.get(raw_emotion, "neutral")
        confidence = all_emotions.get(raw_emotion, 0.0) / 100.0

        # Normalize all emotions for response
        normalized = {}
        for k, v in all_emotions.items():
            mapped = EMOTION_MAP.get(k, k)
            normalized[mapped] = normalized.get(mapped, 0) + v / 100.0

        return {
            "emotion": dominant,
            "confidence": round(confidence, 4),
            "all_emotions": normalized,
            "faces_detected": len(results) if isinstance(results, list) else 1,
        }

    except Exception as e:
        logger.error(f"DeepFace analysis error: {e}")
        raise ValueError(f"Face analysis failed: {str(e)}")


async def analyze_face_emotion(image_base64: str) -> Dict[str, Any]:
    """
    Analyze emotion from a base64-encoded image.
    Runs blocking DeepFace in a thread pool to keep FastAPI async.
    """
    import numpy as np
    from PIL import Image

    # Decode base64 → numpy array
    try:
        # Strip data URL prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        img_bytes = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_array = np.array(img)
    except Exception as e:
        raise ValueError(f"Invalid image data: {str(e)}")

    # Run in thread pool (CPU-bound)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _analyze_sync, img_array)
    return result
