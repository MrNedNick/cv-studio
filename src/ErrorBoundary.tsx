import { Component, type ReactNode } from 'react'
import { detectLocale, translator } from './i18n'
import { isLocale } from './model'
import { loadDocument } from './storage'

function currentLocale() {
  try {
    const stored = localStorage.getItem('neatcv-locale')
    if (isLocale(stored)) return stored
  } catch {
    /* Storage is blocked; use the browser language. */
  }
  return detectLocale(navigator.languages ?? [navigator.language])
}

/**
 * A crash in the interface must not look like lost work: the resume lives in
 * IndexedDB, so the fallback says so and offers a reload and a backup.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error(error)
  }
  async backup() {
    try {
      const doc = await loadDocument()
      if (!doc) return
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }),
      )
      const a = document.createElement('a')
      a.href = url
      a.download = 'neatcv-backup.json'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch (error) {
      console.error(error)
    }
  }
  render() {
    if (!this.state.failed) return this.props.children
    const t = translator(currentLocale())
    return (
      <main className="crash" role="alert">
        <h1>{t('Что-то пошло не так', 'Something went wrong')}</h1>
        <p>
          {t(
            'Ваше резюме сохранено в этом браузере и никуда не делось. Перезагрузите страницу — или сначала скачайте копию.',
            'Your resume is saved in this browser and nothing is lost. Reload the page — or download a copy first.',
          )}
        </p>
        <div className="crash-actions">
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            {t('Перезагрузить', 'Reload')}
          </button>
          <button className="button secondary" onClick={() => this.backup()}>
            {t('Скачать копию (JSON)', 'Download a copy (JSON)')}
          </button>
        </div>
        <a
          className="text-button"
          href="https://github.com/MrNedNick/cv-studio/issues/new"
          target="_blank"
          rel="noreferrer"
        >
          {t('Сообщить о проблеме', 'Report the problem')}
        </a>
      </main>
    )
  }
}
