import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { historyAPI } from '../utils/api'

const MOOD_META = {
  happy:   { emoji:'😊', color:'#fbbf24', cls:'tag-happy' },
  sad:     { emoji:'😢', color:'#60a5fa', cls:'tag-sad' },
  angry:   { emoji:'😤', color:'#f87171', cls:'tag-angry' },
  calm:    { emoji:'😌', color:'#a78bfa', cls:'tag-calm' },
  neutral: { emoji:'😐', color:'#94a3b8', cls:'tag-neutral' },
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function MyVibesPage() {
  const { userId, history, setHistory } = useStore()
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    Promise.all([
      historyAPI.getHistory(userId, 10),
      historyAPI.getStats(userId),
    ]).then(([hist, statsRes]) => {
      setHistory(hist.entries || [])
      setStats(statsRes.stats || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [userId, setHistory])

  const clearAll = async () => {
    setClearing(true)
    try {
      await historyAPI.clearHistory(userId)
      setHistory([])
      setStats([])
    } catch {} finally { setClearing(false) }
  }

  const total = stats.reduce((a, s) => a + s.count, 0)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">My Vibes</h1>
          <p className="page-sub">Your emotional journey & music patterns</p>
        </div>
        {history.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearAll} disabled={clearing}>
            {clearing ? '...' : '🗑 Clear History'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : (
        <>
          {/* Mood breakdown + recent tags */}
          <div className="grid-2" style={{ marginBottom: 22 }}>
            {/* Breakdown bars */}
            <motion.div className="glass-card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Mood Breakdown</div>
              {stats.length > 0 ? (
                stats.map((s, i) => {
                  const m = MOOD_META[s.emotion] || MOOD_META.neutral
                  return (
                    <div key={s.emotion} style={{ marginBottom: 12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                        <span>{m.emoji} {s.emotion}</span>
                        <span style={{ color: m.color, fontWeight:600 }}>{s.percentage}%</span>
                      </div>
                      <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                        <motion.div
                          style={{ height:'100%', borderRadius:3, background:m.color }}
                          initial={{ width:0 }}
                          animate={{ width:`${s.percentage}%` }}
                          transition={{ duration:0.9, delay: i*0.1 }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ color:'var(--muted)', fontSize:13 }}>No data yet. Start detecting moods!</div>
              )}
            </motion.div>

            {/* Tags cloud */}
            <motion.div className="glass-card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Recent Tags</div>
              {history.length > 0 ? (
                <div>
                  {history.slice(0,10).map((h, i) => {
                    const m = MOOD_META[h.emotion] || MOOD_META.neutral
                    return (
                      <motion.span
                        key={i}
                        className={`mood-tag ${m.cls}`}
                        initial={{ opacity:0, scale:0.8 }}
                        animate={{ opacity:1, scale:1 }}
                        transition={{ delay: i*0.04 }}
                      >
                        {m.emoji} {h.emotion} · {timeAgo(h.created_at)}
                      </motion.span>
                    )
                  })}
                </div>
              ) : (
                <div style={{ color:'var(--muted)', fontSize:13 }}>No history yet.</div>
              )}
            </motion.div>
          </div>

          {/* Summary stats */}
          {total > 0 && (
            <div className="grid-3" style={{ marginBottom: 22 }}>
              <div className="stat-card">
                <div className="stat-num">{total}</div>
                <div className="stat-label">Total Detections</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.length}</div>
                <div className="stat-label">Unique Moods</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">
                  {stats[0] ? (MOOD_META[stats[0].emotion]?.emoji + ' ' + stats[0].emotion) : '—'}
                </div>
                <div className="stat-label">Dominant Mood</div>
              </div>
            </div>
          )}

          {/* Detection history */}
          <div className="section-title">Detection History (Last 10)</div>
          <div className="glass-card">
            {history.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--muted)' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🔮</div>
                <div>No mood detections yet.</div>
                <div style={{ fontSize:12, marginTop:6 }}>Go to Detect Mood to get started!</div>
              </div>
            ) : (
              history.map((entry, i) => {
                const m = MOOD_META[entry.emotion] || MOOD_META.neutral
                return (
                  <motion.div
                    key={entry.id || i}
                    initial={{ opacity:0, x:-10 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: i*0.05 }}
                    style={{
                      display:'flex', alignItems:'center', gap:14, padding:'13px 0',
                      borderBottom: i < history.length-1 ? '1px solid var(--glass-border)' : 'none'
                    }}
                  >
                    <div style={{ fontSize:24 }}>{m.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500 }}>
                        {entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1)}
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>
                        {entry.method === 'camera' ? '📷 Camera · DeepFace' : '✍️ Text · DistilRoBERTa'}
                        {entry.text_snippet && ` · "${entry.text_snippet.slice(0,50)}..."`}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <span className={`mood-tag ${m.cls}`} style={{ fontSize:11 }}>
                        {Math.round(entry.confidence * 100)}%
                      </span>
                      <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>
                        {timeAgo(entry.created_at)}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
