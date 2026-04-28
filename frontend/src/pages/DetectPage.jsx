import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'
import { useStore } from '../store/useStore'
import { emotionAPI, musicAPI } from '../utils/api'
import SongCard from '../components/SongCard'
import EmotionResult from '../components/EmotionResult'

export default function DetectPage() {
  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const [songs, setSongs] = useState([])

  const webcamRef = useRef(null)
  const { setMood, currentMood, moodConfidence, allEmotions, moodMethod, userId, addHistory, playSong, setPlaylist, getMoodTheme } = useStore()
  const theme = getMoodTheme()

  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current) return
    setError(null)
    setLoading(true)
    setLoadingMsg('Capturing frame...')

    try {
      const screenshot = webcamRef.current.getScreenshot()
      if (!screenshot) throw new Error('Could not capture image. Ensure camera is active.')

      setLoadingMsg('DeepFace analyzing expression...')
      const result = await emotionAPI.detectFace(screenshot, userId)

      setMood(result.emotion, result.confidence, result.all_emotions, result.method)
      addHistory({ emotion: result.emotion, confidence: result.confidence, method: 'camera', created_at: new Date().toISOString() })

      setLoadingMsg('Fetching your playlist...')
      const songsResult = await musicAPI.getSongs(result.emotion, userId)
      setSongs(songsResult.songs || [])
      if (songsResult.songs?.length) {
        setPlaylist(songsResult.songs)
        playSong(songsResult.songs[0])
      }
    } catch (err) {
      setError(err.message || 'Face detection failed. Try better lighting or use text mode.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }, [userId, setMood, addHistory, setPlaylist, playSong])

  const analyzeText = async () => {
    if (!text.trim()) { setError('Please enter some text to analyze'); return }
    setError(null)
    setLoading(true)
    setLoadingMsg('Analyzing your mood...')

    try {
      setLoadingMsg('DistilRoBERTa processing...')
      const result = await emotionAPI.detectText(text, userId)

      setMood(result.emotion, result.confidence, result.all_emotions, result.method)
      addHistory({ emotion: result.emotion, confidence: result.confidence, method: 'text', text_snippet: text.slice(0, 80), created_at: new Date().toISOString() })

      setLoadingMsg('Building your playlist...')
      const songsResult = await musicAPI.getSongs(result.emotion, userId)
      setSongs(songsResult.songs || [])
      if (songsResult.songs?.length) {
        setPlaylist(songsResult.songs)
        playSong(songsResult.songs[0])
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  const MOODS_QUICK = [
    { emoji: '😊', label: 'Happy', text: 'I feel amazing and full of energy today!' },
    { emoji: '😢', label: 'Sad', text: 'Feeling a bit down and missing old times.' },
    { emoji: '😤', label: 'Angry', text: 'Everything is frustrating and overwhelming right now.' },
    { emoji: '😌', label: 'Calm', text: 'Peaceful and relaxed, just taking it easy.' },
  ]

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">Detect Mood</h1>
          <div className="badge badge-live">● AI Powered</div>
        </div>
        <p className="page-sub">Let AI understand your emotional state through face or text</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'text', icon: '✍️', label: 'Text Analysis' }, { id: 'camera', icon: '📷', label: 'Face Detection' }].map(t => (
          <motion.button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setTab(t.id); setError(null) }}
            whileTap={{ scale: 0.97 }}
          >
            {t.icon} {t.label}
          </motion.button>
        ))}
      </div>

      <div className="glass-card" style={{ marginBottom: 20 }}>
        <AnimatePresence mode="wait">
          {tab === 'text' ? (
            <motion.div key="text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <textarea
                className="form-textarea"
                rows={4}
                value={text}
                onChange={e => setText(e.target.value.slice(0, 500))}
                placeholder="Describe how you're feeling right now... e.g. 'I feel so excited and full of energy, today is going to be amazing!'"
                style={{ marginBottom: 14 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{text.length} / 500</div>
              </div>

              {/* Quick mood presets */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Quick presets</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {MOODS_QUICK.map(m => (
                    <button key={m.label} className="btn btn-ghost btn-sm" onClick={() => setText(m.text)}>
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                className="btn btn-primary"
                onClick={analyzeText}
                disabled={loading || !text.trim()}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? '🔮 Analyzing...' : '✦ Analyze Mood'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="camera" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {cameraOn ? (
                <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(167,139,250,0.3)' }}>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    style={{ display: 'block' }}
                    mirrored
                  />
                </div>
              ) : (
                <motion.div
                  onClick={() => setCameraOn(true)}
                  style={{
                    height: 180, borderRadius: 14,
                    border: '2px dashed rgba(167,139,250,0.3)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 10, cursor: 'pointer', background: 'rgba(0,0,0,0.15)', marginBottom: 16,
                  }}
                  whileHover={{ borderColor: 'rgba(167,139,250,0.6)', background: 'rgba(167,139,250,0.05)' }}
                >
                  <div style={{ fontSize: 40, opacity: 0.6 }}>📷</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)' }}>Click to activate webcam</div>
                  <div style={{ fontSize: 11, color: 'var(--muted2)' }}>Powered by DeepFace · Supports multiple faces</div>
                </motion.div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  className="btn btn-primary"
                  onClick={captureAndAnalyze}
                  disabled={loading || !cameraOn}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? '🔮 Scanning...' : '◉ Analyze Face'}
                </motion.button>
                {cameraOn && (
                  <button className="btn btn-ghost" onClick={() => setCameraOn(false)}>✕ Close Camera</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              fontSize: 13, color: '#f87171', display: 'flex', gap: 8, alignItems: 'center'
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '32px 0' }}>
            <motion.div style={{ fontSize: 44, marginBottom: 14 }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}>🔮</motion.div>
            <div style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{loadingMsg}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>This may take a moment on first run</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
              {[180, 140, 120].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 54, width: w }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {!loading && currentMood && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <EmotionResult
              emotion={currentMood}
              confidence={moodConfidence}
              allEmotions={allEmotions}
              method={moodMethod}
            />

            {songs.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: 22 }}>Vibe Match Playlist</div>
                {songs.map((song, i) => (
                  <motion.div key={song.id || i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}>
                    <SongCard song={song} userId={userId} />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
