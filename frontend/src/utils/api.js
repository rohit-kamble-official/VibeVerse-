import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor
api.interceptors.request.use(config => {
  const userId = localStorage.getItem('vibeverse_user_id')
  if (userId) config.headers['X-User-ID'] = userId
  return config
})

// Response interceptor
api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.detail || err.message || 'Network error'
    return Promise.reject(new Error(message))
  }
)

export const emotionAPI = {
  detectText: (text, userId) =>
    api.post('/detect-text', { text, user_id: userId }),

  detectFace: (imageBase64, userId) =>
    api.post('/detect-face', { image_base64: imageBase64, user_id: userId }),
}

export const musicAPI = {
  getSongs: (emotion, userId, limit = 6) =>
    api.get(`/songs/${emotion}`, { params: { user_id: userId, limit } }),

  addSong: (songData) =>
    api.post('/songs', songData),

  submitFeedback: (songId, feedback, userId) =>
    api.post('/feedback', { song_id: songId, feedback, user_id: userId }),

  listAll: (emotion, limit = 50) =>
    api.get('/songs', { params: { emotion, limit } }),
}

export const historyAPI = {
  getHistory: (userId, limit = 10) =>
    api.get('/history', { params: { user_id: userId, limit } }),

  saveHistory: (entry) =>
    api.post('/history', entry),

  getStats: (userId) =>
    api.get('/history/stats', { params: { user_id: userId } }),

  clearHistory: (userId) =>
    api.delete('/history', { params: { user_id: userId } }),
}

export default api
