# 🎵 VibeVerse 2.0 – Mood-Based Music Recommendation System

> AI-powered emotional intelligence meets personalized music curation.

![VibeVerse](https://img.shields.io/badge/VibeVerse-2.0-a78bfa?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Motor-47A248?style=for-the-badge)

---

## 🧠 What It Does

VibeVerse 2.0 detects your emotional state through:
- **📷 Facial Recognition** – DeepFace analyzes webcam images, selects dominant face
- **✍️ Text Analysis** – DistilRoBERTa classifies emotion from your writing

Then it curates a personalized music playlist, learns your taste via 👍/👎 feedback, and tracks your mood history over time.

---

## 📁 Project Structure

```
vibeverse/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── emotion.py             # POST /detect-text, POST /detect-face
│   │   ├── music.py               # GET /songs/{emotion}, POST /songs, POST /feedback
│   │   └── history.py             # GET/POST/DELETE /history, GET /history/stats
│   ├── services/
│   │   ├── face_detection.py      # DeepFace wrapper (async-safe)
│   │   └── text_analysis.py       # DistilRoBERTa HuggingFace pipeline
│   ├── db/
│   │   └── mongo.py               # Motor async client, indexes, seed data
│   └── models/
│       └── schemas.py             # Pydantic request/response models
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx                # Router, layout, sidebar
        ├── App.css                # Global dark theme + glassmorphism
        ├── store/
        │   └── useStore.js        # Zustand global state
        ├── utils/
        │   └── api.js             # Axios API layer
        ├── components/
        │   ├── SongCard.jsx       # Song row with like/dislike
        │   ├── MiniPlayer.jsx     # Fixed bottom Spotify-style player
        │   └── EmotionResult.jsx  # Emotion + confidence ring display
        └── pages/
            ├── HomePage.jsx       # Dashboard with stats & quick detect
            ├── DetectPage.jsx     # Camera + text mood detection
            ├── MyVibesPage.jsx    # History, stats, mood breakdown
            ├── AddSongPage.jsx    # Add songs to database
            └── AboutPage.jsx     # Tech stack, API docs, deploy guide
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

---

### 1. Backend Setup

```bash
cd vibeverse/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env: set MONGO_URI and DB_NAME

# Run the server
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

**First-run note:** DistilRoBERTa (~300MB) and DeepFace models download automatically on first request. This takes 1–3 minutes. Subsequent runs use the cached models.

---

### 2. Frontend Setup

```bash
cd vibeverse/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api

# Run dev server
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🔌 API Reference

### Emotion Detection

```http
POST /api/detect-text
Content-Type: application/json

{
  "text": "I feel so happy and excited today!",
  "user_id": "user_abc123"
}

Response:
{
  "emotion": "happy",
  "confidence": 0.87,
  "all_emotions": { "happy": 0.87, "calm": 0.08, "neutral": 0.05 },
  "method": "DistilRoBERTa · Text Analysis",
  "user_id": "user_abc123"
}
```

```http
POST /api/detect-face
Content-Type: application/json

{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ...",
  "user_id": "user_abc123"
}

Response:
{
  "emotion": "happy",
  "confidence": 0.91,
  "all_emotions": { "happy": 0.91, "surprise": 0.06 },
  "method": "DeepFace · Camera (1 face(s))",
  "user_id": "user_abc123"
}
```

### Music

```http
GET /api/songs/happy?user_id=user_abc123&limit=6

Response:
{
  "emotion": "happy",
  "count": 6,
  "songs": [
    { "id": "...", "title": "Blinding Lights", "artist": "The Weeknd",
      "emotion": "happy", "genre": "Synth-pop", "bpm": 171, "energy": 0.73 }
  ]
}
```

```http
POST /api/feedback
{ "song_id": "64f3a...", "feedback": "like", "user_id": "user_abc123" }
```

### History

```http
GET /api/history?user_id=user_abc123&limit=10

GET /api/history/stats?user_id=user_abc123
Response:
{
  "stats": [
    { "emotion": "happy", "count": 12, "avg_confidence": 0.84, "percentage": 52.0 }
  ],
  "total_detections": 23
}
```

---

## 🗄️ MongoDB Schemas

```js
// songs
{ title, artist, emotion, genre, preview_url, bpm, energy }

// history
{ user_id, emotion, confidence, method, text_snippet, all_emotions, created_at }

// feedback
{ user_id, song_id, feedback }  // unique index on (user_id, song_id)
```

---

## 🚀 Deployment

### Backend → Render

1. Push `backend/` to GitHub
2. Create **Web Service** on [render.com](https://render.com)
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment variables:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
   DB_NAME=vibeverse
   ```

### Frontend → Vercel

```bash
npm i -g vercel
cd frontend
npm run build
vercel --prod
```
Set `VITE_API_URL` to your Render backend URL.

---

## ✨ Features

| Feature | Status |
|---|---|
| Facial emotion detection (DeepFace) | ✅ |
| Text emotion analysis (DistilRoBERTa) | ✅ |
| Multi-face detection (largest face wins) | ✅ |
| Mood-based playlist generation | ✅ |
| Like/Dislike smart learning | ✅ |
| Mood history tracking (last 10) | ✅ |
| Confidence % with circular ring | ✅ |
| Dynamic UI theme per mood | ✅ |
| Spotify-style mini player | ✅ |
| Skeleton loading states | ✅ |
| Error handling (no face, empty input) | ✅ |
| MongoDB indexes + seeded data | ✅ |
| Async FastAPI + Motor | ✅ |

---

## 🛠️ Environment Variables

### Backend `.env`
```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=vibeverse
PORT=8000
ENVIRONMENT=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📄 License

MIT — built with ❤️ and good vibes.
