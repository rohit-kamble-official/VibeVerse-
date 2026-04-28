import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { musicAPI } from '../utils/api'

const MOOD_OPTIONS = [
  { value:'happy',   label:'😊 Happy – Energetic & Uplifting' },
  { value:'sad',     label:'😢 Sad – Melancholic & Slow' },
  { value:'angry',   label:'😤 Angry – Intense & Heavy' },
  { value:'calm',    label:'😌 Calm – Peaceful & Ambient' },
  { value:'neutral', label:'😐 Neutral – General Listening' },
]

const EMPTY = { title:'', artist:'', emotion:'', genre:'', preview_url:'', bpm:'' }

export default function AddSongPage() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [recentlyAdded, setRecentlyAdded] = useState([])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.artist.trim() || !form.emotion) {
      setError('Title, artist, and emotion are required.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        title: form.title.trim(),
        artist: form.artist.trim(),
        emotion: form.emotion,
        genre: form.genre || undefined,
        preview_url: form.preview_url || '',
        bpm: form.bpm ? parseInt(form.bpm) : undefined,
      }
      const result = await musicAPI.addSong(payload)
      setSuccess(`"${form.title}" added successfully!`)
      setRecentlyAdded(prev => [result.song, ...prev].slice(0, 5))
      setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Failed to add song.')
    } finally {
      setLoading(false)
    }
  }

  const MOOD_COLORS = { happy:'#fbbf24', sad:'#60a5fa', angry:'#f87171', calm:'#a78bfa', neutral:'#94a3b8' }
  const SONG_ART = {
    happy:'linear-gradient(135deg,#fbbf24,#f59e0b)',
    sad:'linear-gradient(135deg,#60a5fa,#3b82f6)',
    angry:'linear-gradient(135deg,#f87171,#ef4444)',
    calm:'linear-gradient(135deg,#a78bfa,#7c3aed)',
    neutral:'linear-gradient(135deg,#94a3b8,#475569)',
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add Song</h1>
        <p className="page-sub">Expand the mood-based music database</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
        {/* Form */}
        <motion.div className="glass-card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div className="form-group">
            <label className="form-label">Song Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Blinding Lights" />
          </div>
          <div className="form-group">
            <label className="form-label">Artist *</label>
            <input className="form-input" value={form.artist} onChange={e => set('artist', e.target.value)}
              placeholder="e.g. The Weeknd" />
          </div>
          <div className="form-group">
            <label className="form-label">Mood / Emotion *</label>
            <select className="form-select" value={form.emotion} onChange={e => set('emotion', e.target.value)}>
              <option value="">Select mood...</option>
              {MOOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input className="form-input" value={form.genre} onChange={e => set('genre', e.target.value)}
                placeholder="e.g. Pop, Hip-Hop" />
            </div>
            <div className="form-group">
              <label className="form-label">BPM</label>
              <input className="form-input" type="number" value={form.bpm} onChange={e => set('bpm', e.target.value)}
                placeholder="e.g. 120" min={40} max={250} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Preview URL (optional)</label>
            <input className="form-input" value={form.preview_url} onChange={e => set('preview_url', e.target.value)}
              placeholder="https://..." />
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ padding:'10px 14px', borderRadius:8, marginBottom:14,
                  background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)',
                  fontSize:13, color:'#f87171' }}>
                ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ padding:'10px 14px', borderRadius:8, marginBottom:14,
                  background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)',
                  fontSize:13, color:'#34d399' }}>
                ✓ {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display:'flex', gap:10 }}>
            <motion.button className="btn btn-primary" onClick={handleSubmit} disabled={loading} whileTap={{ scale:0.97 }}>
              {loading ? '⏳ Adding...' : '✦ Add to Database'}
            </motion.button>
            <button className="btn btn-ghost" onClick={() => { setForm(EMPTY); setError(null); setSuccess(null) }}>
              ✕ Clear
            </button>
          </div>
        </motion.div>

        {/* Recently added */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <div className="section-title">Recently Added</div>
          {recentlyAdded.length === 0 ? (
            <div className="glass-card" style={{ textAlign:'center', padding:'32px 0', color:'var(--muted)' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🎵</div>
              <div style={{ fontSize:13 }}>Songs you add will appear here</div>
            </div>
          ) : (
            recentlyAdded.map((song, i) => (
              <motion.div key={i} className="song-card"
                initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}>
                <div className="song-art" style={{ background: SONG_ART[song.emotion] || SONG_ART.neutral }}>🎵</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="song-title">{song.title}</div>
                  <div className="song-artist">
                    {song.artist}
                    {song.emotion && (
                      <span className={`mood-tag tag-${song.emotion}`}
                        style={{ fontSize:10, padding:'2px 7px', marginLeft:8, verticalAlign:'middle' }}>
                        {song.emotion}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Info card */}
          <div className="glass-card" style={{ marginTop:16, borderColor:'rgba(167,139,250,0.2)' }}>
            <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>
              <strong style={{ color:'var(--text)', display:'block', marginBottom:6 }}>📌 How songs are used</strong>
              Songs are stored in MongoDB and matched to user emotions automatically.
              The AI learns your preferences through 👍/👎 feedback to improve future recommendations.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
