import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Persist user ID across sessions
if (!localStorage.getItem('vibeverse_user_id')) {
  localStorage.setItem('vibeverse_user_id', 'user_' + Math.random().toString(36).substr(2, 9))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
