import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { musicAPI, historyAPI } from '../utils/api'
import SongCard from '../components/SongCard'
import EmotionResult from '../components/EmotionResult'

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const MOOD_COLORS = {
  happy:'#fbbf24', sad:'#60a5fa', angry:'#f87171', calm:'#a78bfa', neutral:'#94a3b8'
}
const MOOD_EMOJIS = { happy:'😊', sad:'😢', angry:'😤', calm:'😌', neutral:'😐' }

export default function HomePage() {
  const navigate = useNavigate()
  const { currentMood, moodConfidence, allEmotions, moodMethod, userId, history, getMoodTheme } = useStore()
  const [songs, setSongs] = useState([])
  const [stats, setStats] = useState(null)
  const [loadingSongs, setLoadingSongs] = useState(false)
  const theme = getMoodTheme()

  useEffect(() => {
    const mood = currentMood || 'happy'
    setLoadingSongs(true)
    musicAPI.getSongs(mood, userId, 4)
      .then(r => setSongs(r.songs || []))
      .catch(() => {})
      .finally(() => setLoadingSongs(false))
  }, [currentMood, userId])

  useEffect(() => {
    historyAPI.getStats(userId)
      .then(r => setStats(r))
      .catch(() => {})
  }, [userId])

  const totalDetections = stats?.total_detections || 0
  const topMood = stats?.stats?.[0]?.emotion || '—'
  const avgConf = stats?.stats?.length
    ? Math.round(stats.stats.reduce((a, s) => a + s.avg_confidence, 0) / stats.stats.length * 100)
    : 0

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 className="page-title">{GREETING()} ✦</h1>
          <div className="badge badge-live">● Live</div>
        </div>
        <p className="page-sub">What's your vibe today? Let the music find you.</p>
      </div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: 22 }}>
        {[
          { num: totalDetections || '—', label: 'Moods Detected' },
          { num: topMood !== '—' ? (MOOD_EMOJIS[topMood] + ' ' + topMood) : '—', label: 'Top Mood' },
          { num: avgConf ? avgConf + '%' : '—', label: 'Avg Confidence' },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="stat-num" style={{ fontSize: 22 }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick detect CTA */}
      <motion.div
        className="glass-card"
        style={{
          background: `linear-gradient(135deg, ${theme.bg}, rgba(244,114,182,0.04))`,
          borderColor: `${theme.primary}33`,
          marginBottom: 22,
        }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
              Quick Mood Scan
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Detect your emotion via camera or text input
            </div>
          </div>
          <motion.span style={{ fontSize: 36 }}
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}>🔮</motion.span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <motion.button className="btn btn-primary" onClick={() => navigate('/detect')} whileTap={{ scale: 0.97 }}>
            ◉ Detect Now
          </motion.button>
          <motion.button className="btn btn-ghost" onClick={() => navigate('/vibes')} whileTap={{ scale: 0.97 }}>
            ♡ My Vibes
          </motion.button>
        </div>
      </motion.div>

      {/* Current emotion result if exists */}
      {currentMood && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title">Current Vibe</div>
          <EmotionResult emotion={currentMood} confidence={moodConfidence} allEmotions={allEmotions} method={moodMethod} />
        </motion.div>
      )}

      {/* Recommended songs */}
      <div className="section-title">
        {currentMood ? `Recommended for ${currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}` : 'Trending Vibes'}
      </div>

      {loadingSongs ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 70 }} />)}
        </div>
      ) : (
        songs.map((song, i) => (
          <motion.div key={song.id || i}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            <SongCard song={song} userId={userId} />
          </motion.div>
        ))
      )}

      {/* Recent moods */}
      {history.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>Recent Moods</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {history.slice(0, 8).map((h, i) => (
              <motion.span
                key={i}
                className={`mood-tag tag-${h.emotion}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {MOOD_EMOJIS[h.emotion]} {h.emotion} · {Math.round(h.confidence * 100)}%
              </motion.span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
