import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeAnalytics } from './analytics'
import { initializeErrorReporting } from './error-reporting'
import Privacy from './Privacy'
import './index.css'
import './App.css'
import './Privacy.css'

initializeAnalytics()
void initializeErrorReporting()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Privacy />
  </StrictMode>,
)
