import { motion } from 'framer-motion'

const MOOD_META = {
  happy:   { emoji: '😊', color: '#fbbf24', bar: 'linear-gradient(90deg,#fbbf24,#f97316)', label: 'Happy' },
  sad:     { emoji: '😢', color: '#60a5fa', bar: 'linear-gradient(90deg,#60a5fa,#3b82f6)', label: 'Sad' },
  angry:   { emoji: '😤', color: '#f87171', bar: 'linear-gradient(90deg,#f87171,#ef4444)', label: 'Angry' },
  calm:    { emoji: '😌', color: '#a78bfa', bar: 'linear-gradient(90deg,#a78bfa,#7c3aed)', label: 'Calm' },
  neutral: { emoji: '😐', color: '#94a3b8', bar: 'linear-gradient(90deg,#94a3b8,#64748b)', label: 'Neutral' },
}

const CIRCUMFERENCE = 2 * Math.PI * 28 // r=28

export default function EmotionResult({ emotion, confidence, allEmotions, method }) {
  const meta = MOOD_META[emotion] || MOOD_META.neutral
  const pct = Math.round(confidence * 100)
  const dashOffset = CIRCUMFERENCE * (1 - confidence)

  return (
    <div className="glass-card" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <motion.div
          style={{ fontSize: 56 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {meta.emoji}
        </motion.div>

        <div style={{ flex: 1, minWidth: 140 }}>
          <motion.div
            style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: meta.color, marginBottom: 4 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {meta.label}
          </motion.div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{method}</div>

          {/* Confidence bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 4, background: meta.bar }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: meta.color, minWidth: 44 }}>{pct}%</span>
          </div>
        </div>

        {/* Circular confidence ring */}
        <div style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
          <svg viewBox="0 0 70 70" width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <motion.circle
              cx="35" cy="35" r="28" fill="none"
              stroke={meta.color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            fontSize: 13, fontWeight: 700, color: meta.color, textAlign: 'center'
          }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* All emotions breakdown */}
      {allEmotions && Object.keys(allEmotions).length > 1 && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Full Emotion Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {Object.entries(allEmotions)
              .sort(([,a],[,b]) => b - a)
              .map(([em, score]) => {
                const m = MOOD_META[em] || MOOD_META.neutral
                return (
                  <div key={em}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: 'var(--muted)' }}>{m.emoji} {em}</span>
                      <span style={{ color: m.color, fontWeight: 600 }}>{Math.round(score * 100)}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: 2, background: m.bar }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(score * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
