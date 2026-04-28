import asyncio
import logging
from typing import Dict, Any
from functools import lru_cache

logger = logging.getLogger(__name__)

# Map HuggingFace emotion labels → our emotion types
LABEL_MAP = {
    "joy": "happy",
    "happiness": "happy",
    "happy": "happy",
    "sadness": "sad",
    "sad": "sad",
    "grief": "sad",
    "anger": "angry",
    "angry": "angry",
    "annoyance": "angry",
    "fear": "calm",
    "calm": "calm",
    "neutral": "neutral",
    "surprise": "happy",
    "disgust": "angry",
    "love": "happy",
    "optimism": "happy",
    "caring": "calm",
    "excitement": "happy",
    "amusement": "happy",
    "admiration": "happy",
    "relief": "calm",
    "realization": "neutral",
    "confusion": "neutral",
    "disappointment": "sad",
    "disapproval": "angry",
    "embarrassment": "sad",
    "nervousness": "calm",
    "remorse": "sad",
    "pride": "happy",
    "desire": "neutral",
    "curiosity": "neutral",
}

_pipeline = None


def _load_pipeline():
    """Load the DistilRoBERTa emotion pipeline (lazy, cached)."""
    global _pipeline
    if _pipeline is None:
        try:
            from transformers import pipeline

            _pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None,
                device=-1,  # CPU; set to 0 for GPU
            )
            logger.info("✅ DistilRoBERTa pipeline loaded")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise RuntimeError(f"Model load failed: {e}")
    return _pipeline


def _classify_sync(text: str) -> Dict[str, Any]:
    """Run synchronous HuggingFace inference."""
    pipe = _load_pipeline()
    results = pipe(text[:512])  # Truncate to model max

    # results is list of list of dicts: [[{label, score}, ...]]
    scores = results[0] if isinstance(results[0], list) else results

    # Find dominant emotion
    scores_sorted = sorted(scores, key=lambda x: x["score"], reverse=True)
    top = scores_sorted[0]

    raw_label = top["label"].lower()
    emotion = LABEL_MAP.get(raw_label, "neutral")
    confidence = top["score"]

    # Aggregate mapped emotions
    aggregated: Dict[str, float] = {}
    for item in scores:
        mapped = LABEL_MAP.get(item["label"].lower(), "neutral")
        aggregated[mapped] = aggregated.get(mapped, 0.0) + item["score"]

    # Normalize
    total = sum(aggregated.values())
    if total > 0:
        aggregated = {k: round(v / total, 4) for k, v in aggregated.items()}

    # Re-derive dominant after aggregation
    final_emotion = max(aggregated, key=aggregated.get)
    final_confidence = aggregated[final_emotion]

    return {
        "emotion": final_emotion,
        "confidence": round(final_confidence, 4),
        "all_emotions": aggregated,
        "raw_label": raw_label,
    }


async def analyze_text_emotion(text: str) -> Dict[str, Any]:
    """
    Analyze emotion from user-provided text.
    Runs blocking inference in a thread pool.
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _classify_sync, text.strip())
    return result


async def warmup_model():
    """Pre-warm the model on startup to reduce first-request latency."""
    try:
        await analyze_text_emotion("Hello, I feel good today!")
        logger.info("✅ Text emotion model warmed up")
    except Exception as e:
        logger.warning(f"Model warmup skipped: {e}")
