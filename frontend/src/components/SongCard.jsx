import { useState } from 'react'
import { motion } from 'framer-motion'
import { musicAPI } from '../utils/api'
import { useStore } from '../store/useStore'

const SONG_COLORS = [
  'linear-gradient(135deg,#f97316,#fbbf24)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'linear-gradient(135deg,#60a5fa,#2563eb)',
  'linear-gradient(135deg,#34d399,#059669)',
  'linear-gradient(135deg,#f472b6,#db2777)',
  'linear-gradient(135deg,#f87171,#dc2626)',
]

const SONG_EMOJIS = ['🎵','🎶','🎸','🎹','🎤','🎷','🥁','🎺']

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function SongCard({ song, userId, compact = false }) {
  const [feedback, setFeedback] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { playSong, setPlaylist } = useStore()

  const h = hashStr(song.title + song.artist)
  const color = SONG_COLORS[h % SONG_COLORS.length]
  const emoji = SONG_EMOJIS[h % SONG_EMOJIS.length]

  const handleFeedback = async (type, e) => {
    e.stopPropagation()
    if (submitting || feedback === type) return
    setSubmitting(true)
    try {
      await musicAPI.submitFeedback(song.id, type, userId)
      setFeedback(type)
    } catch { /* silent fail */ }
    finally { setSubmitting(false) }
  }

  return (
    <motion.div
      className="song-card"
      onClick={() => playSong(song)}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
      style={{ opacity: feedback === 'dislike' ? 0.45 : 1, transition: 'opacity 0.3s' }}
    >
      <div className="song-art" style={{ background: color }}>{emoji}</div>
      <div className="song-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="song-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {song.title}
        </div>
        <div className="song-artist">{song.artist}</div>
      </div>
      {song.bpm && !compact && (
        <div style={{ fontSize: 10, color: 'var(--muted2)', flexShrink: 0 }}>{song.bpm} BPM</div>
      )}
      <div className="song-actions">
        <motion.button
          className={`like-btn ${feedback === 'like' ? 'active' : ''}`}
          onClick={e => handleFeedback('like', e)}
          whileTap={{ scale: 1.3 }}
          title="Like"
          style={{ color: feedback === 'like' ? '#34d399' : undefined }}
        >👍</motion.button>
        <motion.button
          className={`like-btn ${feedback === 'dislike' ? 'active' : ''}`}
          onClick={e => handleFeedback('dislike', e)}
          whileTap={{ scale: 1.3 }}
          title="Dislike"
          style={{ color: feedback === 'dislike' ? '#f87171' : undefined }}
        >👎</motion.button>
      </div>
    </motion.div>
  )
}
