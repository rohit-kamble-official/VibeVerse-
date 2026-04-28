import { create } from 'zustand'

const MOOD_THEMES = {
  happy: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fbbf24, #f97316)',
    bg: 'rgba(251,191,36,0.05)',
    glow: 'rgba(251,191,36,0.2)',
  },
  sad: {
    primary: '#60a5fa',
    secondary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    bg: 'rgba(96,165,250,0.05)',
    glow: 'rgba(96,165,250,0.2)',
  },
  angry: {
    primary: '#f87171',
    secondary: '#ef4444',
    gradient: 'linear-gradient(135deg, #f87171, #dc2626)',
    bg: 'rgba(248,113,113,0.05)',
    glow: 'rgba(248,113,113,0.2)',
  },
  calm: {
    primary: '#a78bfa',
    secondary: '#7c3aed',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    bg: 'rgba(167,139,250,0.05)',
    glow: 'rgba(167,139,250,0.2)',
  },
  neutral: {
    primary: '#94a3b8',
    secondary: '#64748b',
    gradient: 'linear-gradient(135deg, #94a3b8, #475569)',
    bg: 'rgba(148,163,184,0.05)',
    glow: 'rgba(148,163,184,0.2)',
  },
}

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😤',
  calm: '😌',
  neutral: '😐',
}

export const useStore = create((set, get) => ({
  // Current mood state
  currentMood: null,
  moodConfidence: 0,
  allEmotions: null,
  moodMethod: '',

  // Music player state
  currentSong: null,
  playlist: [],
  playerVisible: false,
  isPlaying: false,
  progress: 0,

  // UI state
  loading: false,
  loadingMessage: '',
  error: null,

  // History
  history: [],

  // User
  userId: 'user_' + Math.random().toString(36).substr(2, 9),

  // Getters
  getMoodTheme: () => {
    const mood = get().currentMood
    return MOOD_THEMES[mood] || MOOD_THEMES.neutral
  },
  getMoodEmoji: (mood) => MOOD_EMOJIS[mood || get().currentMood] || '🎵',
  getMoodColor: (mood) => MOOD_THEMES[mood || get().currentMood]?.primary || '#a78bfa',

  // Actions
  setMood: (emotion, confidence, allEmotions, method) => set({
    currentMood: emotion,
    moodConfidence: confidence,
    allEmotions,
    moodMethod: method,
  }),

  setLoading: (loading, message = '') => set({ loading, loadingMessage: message }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  setPlaylist: (songs) => set({ playlist: songs }),

  playSong: (song) => set({ currentSong: song, playerVisible: true, isPlaying: true, progress: 0 }),

  nextSong: () => {
    const { playlist, currentSong } = get()
    if (!playlist.length) return
    const idx = playlist.findIndex(s => s.id === currentSong?.id)
    const next = playlist[(idx + 1) % playlist.length]
    set({ currentSong: next, isPlaying: true, progress: 0 })
  },

  prevSong: () => {
    const { playlist, currentSong } = get()
    if (!playlist.length) return
    const idx = playlist.findIndex(s => s.id === currentSong?.id)
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length]
    set({ currentSong: prev, isPlaying: true, progress: 0 })
  },

  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
  setProgress: (progress) => set({ progress }),

  addHistory: (entry) => set(s => ({
    history: [entry, ...s.history].slice(0, 10)
  })),
  setHistory: (history) => set({ history }),
}))

export { MOOD_THEMES, MOOD_EMOJIS }
