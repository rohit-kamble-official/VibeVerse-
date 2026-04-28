import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useStore } from './store/useStore'
import HomePage from './pages/HomePage'
import DetectPage from './pages/DetectPage'
import MyVibesPage from './pages/MyVibesPage'
import AddSongPage from './pages/AddSongPage'
import AboutPage from './pages/AboutPage'
import MiniPlayer from './components/MiniPlayer'
import './App.css'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '⊞' },
  { path: '/detect', label: 'Detect Mood', icon: '◉' },
  { path: '/vibes', label: 'My Vibes', icon: '♡' },
  { path: '/add', label: 'Add Song', icon: '＋' },
  { path: '/about', label: 'About', icon: '◌' },
]

function AppContent() {
  const location = useLocation()
  const { currentMood, getMoodTheme } = useStore()
  const theme = getMoodTheme()
  const orbRef = useRef(null)

  useEffect(() => {
    if (orbRef.current && currentMood) {
      orbRef.current.style.setProperty('--mood-color', theme.glow)
    }
  }, [currentMood, theme])

  return (
    <div className="app" style={{ '--accent': theme.primary, '--mood-glow': theme.glow }}>
      <div className="ambient-orb orb-1" ref={orbRef}></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      {/* Sidebar */}
      <motion.nav
        className="sidebar"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="logo">
          <motion.div
            className="logo-icon"
            animate={{ background: theme.gradient }}
            transition={{ duration: 0.8 }}
          >
            🎵
          </motion.div>
          <span className="logo-text">VibeVerse</span>
          <span className="logo-version">2.0</span>
        </div>

        <nav className="nav-links">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      className="nav-indicator"
                      layoutId="nav-indicator"
                      style={{ background: theme.gradient }}
                    />
                  )}
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {currentMood && (
            <motion.div
              className="mood-chip"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ borderColor: theme.primary, background: theme.bg }}
            >
              <span>{useStore.getState().getMoodEmoji()}</span>
              <div>
                <div className="mood-chip-label">Current Vibe</div>
                <div className="mood-chip-value" style={{ color: theme.primary }}>
                  {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
                </div>
              </div>
            </motion.div>
          )}
          <div className="user-chip">
            <div className="user-avatar">VV</div>
            <div>
              <div className="user-name">Vibe User</div>
              <div className="user-sub">Free plan</div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="page-wrapper"
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/detect" element={<DetectPage />} />
              <Route path="/vibes" element={<MyVibesPage />} />
              <Route path="/add" element={<AddSongPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <MiniPlayer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
