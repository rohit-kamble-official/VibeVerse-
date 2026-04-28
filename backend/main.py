from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import uvicorn

from db.mongo import connect_db, disconnect_db
from routes import emotion, music, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="VibeVerse 2.0 API",
    description="Mood-Based Music Recommendation System",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emotion.router, prefix="/api", tags=["Emotion Detection"])
app.include_router(music.router, prefix="/api", tags=["Music"])
app.include_router(history.router, prefix="/api", tags=["History"])


@app.get("/")
async def root():
    return {"message": "VibeVerse 2.0 API is live 🎵", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
