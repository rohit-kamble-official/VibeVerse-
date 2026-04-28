from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "vibeverse")

client: Optional[AsyncIOMotorClient] = None


def get_database():
    return client[DB_NAME]


async def connect_db():
    global client
    client = AsyncIOMotorClient(MONGO_URI)
    db = get_database()

    # Create indexes
    await db.songs.create_indexes([
        IndexModel([("emotion", ASCENDING)]),
        IndexModel([("title", ASCENDING), ("artist", ASCENDING)], unique=True),
    ])
    await db.history.create_indexes([
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)]),
    ])
    await db.feedback.create_indexes([
        IndexModel([("user_id", ASCENDING), ("song_id", ASCENDING)], unique=True),
    ])

    # Seed songs if empty
    count = await db.songs.count_documents({})
    if count == 0:
        await seed_songs(db)

    print(f"✅ Connected to MongoDB: {DB_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("❌ Disconnected from MongoDB")


async def seed_songs(db):
    songs = [
        # Happy
        {"title": "Blinding Lights", "artist": "The Weeknd", "emotion": "happy", "genre": "Synth-pop", "preview_url": "", "bpm": 171, "energy": 0.73},
        {"title": "Happy", "artist": "Pharrell Williams", "emotion": "happy", "genre": "Neo soul", "preview_url": "", "bpm": 160, "energy": 0.85},
        {"title": "Uptown Funk", "artist": "Bruno Mars ft. Mark Ronson", "emotion": "happy", "genre": "Funk pop", "preview_url": "", "bpm": 115, "energy": 0.89},
        {"title": "Can't Stop the Feeling", "artist": "Justin Timberlake", "emotion": "happy", "genre": "Funk pop", "preview_url": "", "bpm": 113, "energy": 0.83},
        {"title": "Good as Hell", "artist": "Lizzo", "emotion": "happy", "genre": "Pop", "preview_url": "", "bpm": 96, "energy": 0.76},
        {"title": "Walking on Sunshine", "artist": "Katrina and the Waves", "emotion": "happy", "genre": "Pop rock", "preview_url": "", "bpm": 109, "energy": 0.90},

        # Sad
        {"title": "The Night We Met", "artist": "Lord Huron", "emotion": "sad", "genre": "Indie pop", "preview_url": "", "bpm": 90, "energy": 0.32},
        {"title": "Skinny Love", "artist": "Bon Iver", "emotion": "sad", "genre": "Indie folk", "preview_url": "", "bpm": 102, "energy": 0.28},
        {"title": "Hurt", "artist": "Johnny Cash", "emotion": "sad", "genre": "Country", "preview_url": "", "bpm": 56, "energy": 0.25},
        {"title": "Someone Like You", "artist": "Adele", "emotion": "sad", "genre": "Soul pop", "preview_url": "", "bpm": 68, "energy": 0.30},
        {"title": "Fix You", "artist": "Coldplay", "emotion": "sad", "genre": "Alternative rock", "preview_url": "", "bpm": 138, "energy": 0.38},

        # Angry
        {"title": "HUMBLE.", "artist": "Kendrick Lamar", "emotion": "angry", "genre": "Hip hop", "preview_url": "", "bpm": 150, "energy": 0.91},
        {"title": "Killing in the Name", "artist": "Rage Against the Machine", "emotion": "angry", "genre": "Funk metal", "preview_url": "", "bpm": 85, "energy": 0.95},
        {"title": "Break Stuff", "artist": "Limp Bizkit", "emotion": "angry", "genre": "Nu-metal", "preview_url": "", "bpm": 134, "energy": 0.94},
        {"title": "Until I Collapse", "artist": "Eminem", "emotion": "angry", "genre": "Hip hop", "preview_url": "", "bpm": 170, "energy": 0.92},
        {"title": "Stronger", "artist": "Kanye West", "emotion": "angry", "genre": "Hip hop", "preview_url": "", "bpm": 104, "energy": 0.88},

        # Calm
        {"title": "Midnight Rain", "artist": "Taylor Swift", "emotion": "calm", "genre": "Pop", "preview_url": "", "bpm": 87, "energy": 0.35},
        {"title": "Weightless", "artist": "Marconi Union", "emotion": "calm", "genre": "Ambient", "preview_url": "", "bpm": 60, "energy": 0.20},
        {"title": "Experience", "artist": "Ludovico Einaudi", "emotion": "calm", "genre": "Neoclassical", "preview_url": "", "bpm": 65, "energy": 0.18},
        {"title": "Strawberry Fields Forever", "artist": "The Beatles", "emotion": "calm", "genre": "Psychedelic pop", "preview_url": "", "bpm": 85, "energy": 0.40},
        {"title": "Claire de Lune", "artist": "Claude Debussy", "emotion": "calm", "genre": "Classical", "preview_url": "", "bpm": 55, "energy": 0.15},

        # Neutral
        {"title": "Shape of You", "artist": "Ed Sheeran", "emotion": "neutral", "genre": "Pop", "preview_url": "", "bpm": 96, "energy": 0.65},
        {"title": "Levitating", "artist": "Dua Lipa", "emotion": "neutral", "genre": "Disco pop", "preview_url": "", "bpm": 103, "energy": 0.72},
        {"title": "Watermelon Sugar", "artist": "Harry Styles", "emotion": "neutral", "genre": "Pop rock", "preview_url": "", "bpm": 95, "energy": 0.70},
    ]
    await db.songs.insert_many(songs)
    print(f"🎵 Seeded {len(songs)} songs")
