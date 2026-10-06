import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeAnalytics } from './analytics'
import Privacy from './Privacy'
import './index.css'
import './App.css'
import './Privacy.css'

initializeAnalytics()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Privacy />
  </StrictMode>,
)
