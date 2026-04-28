import { motion } from 'framer-motion'

const STACK = [
  { icon:'⚛️', title:'React 18 + Vite', desc:'Lightning-fast frontend with HMR, lazy loading, and component-based architecture.', color:'rgba(96,165,250,0.15)' },
  { icon:'🎞️', title:'Framer Motion', desc:'Production-grade animations — page transitions, staggered reveals, spring physics.', color:'rgba(167,139,250,0.15)' },
  { icon:'🐍', title:'FastAPI (Python)', desc:'Async REST API with modular route architecture, Pydantic validation, and auto OpenAPI docs.', color:'rgba(52,211,153,0.15)' },
  { icon:'🧠', title:'DistilRoBERTa', desc:'HuggingFace NLP model for text-based emotion classification with 7 emotion categories.', color:'rgba(251,191,36,0.15)' },
  { icon:'👁️', title:'DeepFace', desc:'Multi-face detection with automatic dominant-face selection by bounding box area.', color:'rgba(244,114,182,0.15)' },
  { icon:'🍃', title:'MongoDB + Motor', desc:'Async NoSQL database for songs, history, and feedback — indexed for performance.', color:'rgba(52,211,153,0.15)' },
  { icon:'📦', title:'Zustand', desc:'Lightweight global state management for mood, player, and history state.', color:'rgba(148,163,184,0.15)' },
]

const ENDPOINTS = [
  { method:'POST', color:'#34d399', path:'/api/detect-text', desc:'Text → emotion via DistilRoBERTa' },
  { method:'POST', color:'#34d399', path:'/api/detect-face', desc:'Image → emotion via DeepFace' },
  { method:'GET',  color:'#60a5fa', path:'/api/songs/{emotion}', desc:'Fetch playlist by emotion' },
  { method:'POST', color:'#34d399', path:'/api/songs', desc:'Add a new song to database' },
  { method:'POST', color:'#34d399', path:'/api/feedback', desc:'Like/dislike a song (smart learning)' },
  { method:'GET',  color:'#60a5fa', path:'/api/history', desc:'Fetch user mood history' },
  { method:'POST', color:'#34d399', path:'/api/history', desc:'Save a mood detection entry' },
  { method:'GET',  color:'#60a5fa', path:'/api/history/stats', desc:'Mood distribution statistics' },
  { method:'DELETE', color:'#f87171', path:'/api/history', desc:'Clear user history' },
]

const SCHEMA = `// Songs collection
{
  _id: ObjectId,
  title: "Blinding Lights",
  artist: "The Weeknd",
  emotion: "happy",         // happy | sad | angry | calm | neutral
  genre: "Synth-pop",
  preview_url: "https://...",
  bpm: 171,
  energy: 0.73
}

// History collection
{
  _id: ObjectId,
  user_id: "user_abc123",
  emotion: "happy",
  confidence: 0.87,
  method: "text",           // text | camera
  text_snippet: "I feel...",
  all_emotions: { happy: 0.87, calm: 0.08, ... },
  created_at: ISODate(...)
}

// Feedback collection
{
  _id: ObjectId,
  user_id: "user_abc123",
  song_id: "64f3a...",
  feedback: "like"          // like | dislike
}`

export default function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">About VibeVerse 2.0</h1>
        <p className="page-sub">AI-powered mood-based music recommendation system</p>
      </div>

      {/* Hero card */}
      <motion.div className="glass-card" style={{ marginBottom:22 }}
        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:14,
            background:'linear-gradient(135deg,#a78bfa,#f472b6)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🎵</div>
          <div>
            <div style={{ fontFamily:'Syne', fontSize:20, fontWeight:800 }}>VibeVerse 2.0</div>
            <div style={{ fontSize:13, color:'var(--muted)' }}>Mood Intelligence System · v2.0.0</div>
          </div>
        </div>
        <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.8 }}>
          VibeVerse 2.0 uses cutting-edge AI to detect your emotional state and curate the perfect soundtrack.
          Combining computer vision (DeepFace) and NLP (DistilRoBERTa), it delivers hyper-personalized
          music recommendations in real-time, and learns your preferences through feedback.
        </p>
      </motion.div>

      {/* Tech stack */}
      <div className="section-title">Tech Stack</div>
      <div className="glass-card" style={{ marginBottom:22 }}>
        {STACK.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}
            style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'14px 0',
              borderBottom: i < STACK.length-1 ? '1px solid var(--glass-border)' : 'none' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:s.color,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:3 }}>{s.title}</div>
              <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>{s.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* API endpoints */}
      <div className="section-title">API Endpoints</div>
      <motion.div className="glass-card" style={{ marginBottom:22 }}
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
        {ENDPOINTS.map((ep, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0',
            borderBottom: i < ENDPOINTS.length-1 ? '1px solid var(--glass-border)' : 'none' }}>
            <span style={{ fontSize:10, fontWeight:700, color:ep.color, minWidth:48,
              background:`${ep.color}22`, padding:'2px 7px', borderRadius:4, textAlign:'center' }}>
              {ep.method}
            </span>
            <code style={{ fontSize:12, color:'var(--accent)', fontFamily:'monospace', flex:'0 0 220px' }}>
              {ep.path}
            </code>
            <span style={{ fontSize:12, color:'var(--muted)' }}>{ep.desc}</span>
          </div>
        ))}
      </motion.div>

      {/* MongoDB Schema */}
      <div className="section-title">MongoDB Schema</div>
      <motion.div className="glass-card" style={{ marginBottom:22 }}
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
        <pre style={{ fontSize:11, color:'var(--muted)', fontFamily:'monospace',
          lineHeight:1.7, overflow:'auto', whiteSpace:'pre-wrap' }}>
          {SCHEMA}
        </pre>
      </motion.div>

      {/* Deploy */}
      <div className="section-title">Deploy Instructions</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[
          { platform:'Vercel (Frontend)', icon:'▲', steps:[
            'cd frontend && npm run build',
            'Install Vercel CLI: npm i -g vercel',
            'vercel --prod',
            'Set VITE_API_URL env var to backend URL',
          ]},
          { platform:'Render (Backend)', icon:'🔷', steps:[
            'Push backend/ to a GitHub repo',
            'Create a new Web Service on Render',
            'Set build: pip install -r requirements.txt',
            'Set start: uvicorn main:app --host 0.0.0.0',
            'Add MONGO_URI env var (MongoDB Atlas)',
          ]},
        ].map((d, i) => (
          <motion.div key={i} className="glass-card"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}>
            <div style={{ fontFamily:'Syne', fontSize:14, fontWeight:700, marginBottom:12 }}>
              {d.icon} {d.platform}
            </div>
            {d.steps.map((step, j) => (
              <div key={j} style={{ display:'flex', gap:8, marginBottom:7, alignItems:'flex-start' }}>
                <span style={{ fontSize:10, color:'var(--accent)', fontWeight:700,
                  background:'rgba(167,139,250,0.15)', borderRadius:4, padding:'2px 6px',
                  flexShrink:0, marginTop:1 }}>{j+1}</span>
                <code style={{ fontSize:11, color:'var(--muted)', fontFamily:'monospace', lineHeight:1.6 }}>
                  {step}
                </code>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
