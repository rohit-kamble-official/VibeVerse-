import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

const SONG_COLORS = [
  'linear-gradient(135deg,#f97316,#fbbf24)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'linear-gradient(135deg,#60a5fa,#2563eb)',
  'linear-gradient(135deg,#34d399,#059669)',
  'linear-gradient(135deg,#f472b6,#db2777)',
]
const EMOJIS = ['🎵','🎶','🎸','🎹','🎤']
function hash(s='') { let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))|0; return Math.abs(h) }

export default function MiniPlayer() {
  const { currentSong, playerVisible, isPlaying, progress, togglePlay, nextSong, prevSong, setProgress } = useStore()
  const [currentTime, setCurrentTime] = useState(0)
  const totalTime = 202 // seconds, demo
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(Math.min(((useStore.getState().progress + 0.4) % 100), 100))
        setCurrentTime(t => (t + 1) % totalTime)
      }, 400)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, setProgress])

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setProgress(pct)
    setCurrentTime(Math.floor(pct / 100 * totalTime))
  }

  if (!playerVisible || !currentSong) return null

  const h = hash(currentSong.title + currentSong.artist)
  const color = SONG_COLORS[h % SONG_COLORS.length]
  const emoji = EMOJIS[h % EMOJIS.length]

  return (
    <AnimatePresence>
      <motion.div
        className="mini-player"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Album art */}
        <motion.div
          style={{ width: 40, height: 40, borderRadius: 8, background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}
          animate={isPlaying ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          {emoji}
        </motion.div>

        {/* Info */}
        <div style={{ flex: '0 0 180px', minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentSong.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentSong.artist}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            onClick={prevSong}
            style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 16, opacity: 0.6, padding: 4 }}
            whileHover={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
          >⏮</motion.button>

          <motion.button
            onClick={togglePlay}
            style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--accent, #a78bfa), #f472b6)',
              border: 'none', borderRadius: '50%', cursor: 'pointer',
              color: 'white', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(167,139,250,0.4)',
            }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? '⏸' : '▶'}
          </motion.button>

          <motion.button
            onClick={nextSong}
            style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 16, opacity: 0.6, padding: 4 }}
            whileHover={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
          >⏭</motion.button>
        </div>

        {/* Progress */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 32, flexShrink: 0 }}>{fmt(currentTime)}</span>
          <div
            onClick={handleSeek}
            style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative' }}
          >
            <motion.div
              style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, var(--accent, #a78bfa), #f472b6)',
                width: `${progress}%`,
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 32, flexShrink: 0 }}>{fmt(totalTime)}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
