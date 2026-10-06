import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary'
import { initializeAnalytics } from './analytics'
import { initializeErrorReporting } from './error-reporting'
import { isLocale } from './model'
import { loadLocale } from './i18n'
import { homeLocale, publicPath as normalizePublicPath } from './public-pages'

initializeAnalytics()
void initializeErrorReporting()

const root = document.getElementById('root')!
const publicPath = root.dataset.publicPath
const hashPath = window.location.hash.split('?')[0].replace(/^#/, '')
async function mount() {
  const physical = normalizePublicPath(window.location.pathname)
  const route = publicPath ?? (homeLocale(physical) ? '/' : physical)
  const locale = isLocale(root.dataset.publicLocale)
    ? root.dataset.publicLocale
    : (homeLocale(physical) ?? 'en')
  let bootstrap =
    !hashPath || hashPath === route ? { locale, path: route } : undefined
  if (bootstrap) {
    try {
      await loadLocale(locale)
    } catch {
      bootstrap = undefined
    }
  }
  const application = (
    <StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <App bootstrap={bootstrap} />
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>
  )
  if (publicPath && bootstrap) hydrateRoot(root, application)
  else {
    root.replaceChildren()
    createRoot(root).render(application)
  }
}
void mount()
