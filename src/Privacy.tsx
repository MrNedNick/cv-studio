import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Moon,
  Sun,
} from 'lucide-react'
import { analyticsConfiguration } from './analytics'
import { errorReportingConfiguration } from './error-reporting'
import { detectLocale, hasDictionary, loadLocale, translator } from './i18n'
import { isLocale, localeNames, locales, type Locale } from './model'
import { privacyCopy } from './privacy-copy'

const topics = [
  'files',
  'storage',
  'sources',
  'umami',
  'sentry',
  'hosting',
  'choices',
  'contact',
] as const

function initialLocale() {
  try {
    const stored = localStorage.getItem('neatcv-locale')
    if (isLocale(stored)) return stored
  } catch {
    /* Browser preferences are optional. */
  }
  return detectLocale(navigator.languages ?? [navigator.language])
}
function initialTheme() {
  try {
    const stored = localStorage.getItem('neatcv-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* Use the device preference. */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function Privacy() {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [ready, setReady] = useState(() => hasDictionary(locale))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [theme, setTheme] = useState(initialTheme)
  const request = useRef(0)
  const t = translator(locale)
  const sentry = errorReportingConfiguration()
  const text = (key: keyof typeof privacyCopy) => {
    const copy = privacyCopy[key]
    return t(copy.ru, copy.en)
  }
  useEffect(() => {
    if (ready) return
    let active = true
    void loadLocale(locale)
      .then(() => {
        if (active) setReady(true)
      })
      .catch(() => {
        if (!active) return
        setLocale('en')
        setReady(true)
        setError(true)
      })
    return () => {
      active = false
    }
  }, [locale, ready])
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = locale
    document.title = `${text('title')} — NeatCV`
  }, [theme, locale, ready])
  async function changeLocale(next: Locale) {
    const current = ++request.current
    setLoading(true)
    try {
      await loadLocale(next)
      if (current !== request.current) return
      setLocale(next)
      setError(false)
      try {
        localStorage.setItem('neatcv-locale', next)
      } catch {
        /* Keep this page's choice. */
      }
    } catch {
      if (current === request.current) setError(true)
    } finally {
      if (current === request.current) setLoading(false)
    }
  }
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.themeAnimated = 'true'
    setTheme(next)
    try {
      localStorage.setItem('neatcv-theme', next)
    } catch {
      /* Keep this page's choice. */
    }
  }
  if (!ready)
    return (
      <main className="loading" role="status">
        <LoaderCircle className="spin" />
        NeatCV
      </main>
    )
  return (
    <div className="app-shell privacy-shell">
      <a className="skip-link" href="#privacy-main">
        {t('К содержимому', 'Skip to content')}
      </a>
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-symbol">
            <img src="/brand.svg" width="34" height="34" alt="" />
          </span>
          neat<span className="brand-light">cv</span>
          <span className="visually-hidden">
            {t(' — на главную', ' — home')}
          </span>
        </a>
        <div className="header-tools">
          <label className="language-button">
            {loading ? (
              <LoaderCircle size={15} className="spin" aria-hidden="true" />
            ) : (
              <Globe2 size={15} aria-hidden="true" />
            )}
            <span aria-hidden="true">{locale.toUpperCase()}</span>
            <select
              value={locale}
              aria-busy={loading}
              onChange={(e) => void changeLocale(e.target.value as Locale)}
              aria-label={t('Язык интерфейса', 'Interface language')}
            >
              {locales.map((l) => (
                <option key={l} value={l} lang={l}>
                  {localeNames[l]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={t('Переключить тему', 'Toggle color theme')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      <main id="privacy-main" tabIndex={-1} className="privacy-page">
        <a className="text-button privacy-back" href="/">
          <ArrowLeft size={17} />
          {text('back')}
        </a>
        {error && (
          <p role="alert">
            {t(
              'Не удалось загрузить язык. Перезагрузите страницу и попробуйте снова.',
              'Could not load this language. Reload and try again.',
            )}
          </p>
        )}
        <div className="eyebrow">
          <LockKeyhole size={18} />
          {text('title')}
        </div>
        <h1>{text('headline')}</h1>
        <p className="privacy-intro">{text('intro')}</p>
        <p className="privacy-updated">
          <time dateTime="2026-10-06">{text('updated')}</time>
        </p>
        <div className="privacy-layout">
          <nav className="privacy-contents" aria-label={text('contents')}>
            <strong>{text('contents')}</strong>
            {topics.map((topic, i) => (
              <a key={topic} href={`#${topic}`}>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {text(topic)}
              </a>
            ))}
          </nav>
          <article aria-label={text('title')}>
            {topics.map((topic) => (
              <section
                key={topic}
                id={topic}
                tabIndex={-1}
                className="privacy-section"
                aria-labelledby={`${topic}-title`}
              >
                <h2 id={`${topic}-title`}>{text(topic)}</h2>
                {topic === 'umami' && (
                  <p className="privacy-service-status">
                    {text(analyticsConfiguration() ? 'configured' : 'disabled')}
                  </p>
                )}
                {topic === 'sentry' && (
                  <p className="privacy-service-status">
                    {text(sentry ? 'configured' : 'disabled')}
                  </p>
                )}
                <p>{text(`${topic}Body` as keyof typeof privacyCopy)}</p>
                {topic === 'files' && <p>{text('exports')}</p>}
                {topic === 'umami' && (
                  <>
                    <p>{text('umamiConnection')}</p>
                    <p>{text('optout')}</p>
                    <a href="https://umami.is/privacy">{text('umamiNotice')}</a>
                  </>
                )}
                {topic === 'sentry' && (
                  <>
                    <p>{text('sentryConnection')}</p>
                    {sentry && (
                      <p>
                        {t(
                          'Получатель отчётов: {host}',
                          'Reporting host: {host}',
                          { host: sentry.host },
                        )}
                      </p>
                    )}
                    <a href="https://docs.sentry.io/platforms/javascript/data-management/data-collected/">
                      {text('sentryDocs')}
                    </a>
                  </>
                )}
                {topic === 'hosting' && (
                  <>
                    <p>{text('external')}</p>
                    <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                      {text('githubNotice')}
                    </a>
                  </>
                )}
                {topic === 'contact' && (
                  <a href="https://www.linkedin.com/in/mrnednick/">
                    Nikita Nedyalkov · LinkedIn
                  </a>
                )}
              </section>
            ))}
          </article>
        </div>
      </main>
      <footer className="site-footer">
        <span>NeatCV · Nikita Nedyalkov</span>
        <a className="text-button" href="/">
          {text('back')}
        </a>
      </footer>
    </div>
  )
}
