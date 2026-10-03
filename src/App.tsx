import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import {
  ArrowRight,
  Check,
  CheckCheck,
  FileText,
  Globe2,
  LockKeyhole,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Upload,
  X,
  LoaderCircle,
  Lightbulb,
} from 'lucide-react'
import {
  createDocument,
  parseDocument,
  toJsonResume,
  sections,
  type Locale,
  isLocale,
  isEmptyVersion,
  pdfMetadata,
  locales,
  localeNames,
  type ResumeDocument,
  type Template,
} from './model'
import { loadDocument, saveDocument } from './storage'
import { Dialog, MiniResume, TemplateCards, templates } from './components'
import { Disclosure, useLingering } from './motion'
import { detectLocale, translator } from './i18n'
import './App.css'
// The editor is a separate chunk so the home page paints first; it is fetched
// in the background right after the first render.
const GitHubMark = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
    />
  </svg>
)
const LinkedInMark = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      d="M13.63 0H2.37A2.37 2.37 0 0 0 0 2.37v11.26A2.37 2.37 0 0 0 2.37 16h11.26A2.37 2.37 0 0 0 16 13.63V2.37A2.37 2.37 0 0 0 13.63 0ZM4.9 13.5H2.6V6.1h2.3v7.4ZM3.75 5.08a1.34 1.34 0 1 1 0-2.67 1.34 1.34 0 0 1 0 2.67ZM13.5 13.5h-2.3V9.9c0-.86-.02-1.96-1.2-1.96-1.2 0-1.38.94-1.38 1.9v3.66H6.33V6.1h2.2v1.01h.03c.31-.58 1.06-1.2 2.18-1.2 2.33 0 2.76 1.54 2.76 3.53v4.06Z"
    />
  </svg>
)
const loadEditor = () => import('./Editor')
const Editor = lazy(loadEditor)
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
export default function App() {
  const navigate = useNavigate(),
    location = useLocation(),
    [doc, setDoc] = useState<ResumeDocument | null>(null),
    [ready, setReady] = useState(false),
    [loadError, setLoadError] = useState(false),
    [loadAttempt, setLoadAttempt] = useState(0),
    [saveAttempt, setSaveAttempt] = useState(0),
    [documentRevision, setDocumentRevision] = useState(0),
    [locale, setLocale] = useState<Locale>(() => {
      try {
        const stored = localStorage.getItem('neatcv-locale')
        if (isLocale(stored)) return stored
      } catch {
        /* Storage is unavailable; fall back to the browser language. */
      }
      return detectLocale(navigator.languages ?? [navigator.language])
    }),
    [theme, setTheme] = useState(() => {
      try {
        return (
          localStorage.getItem('neatcv-theme') ||
          (window.matchMedia?.('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light')
        )
      } catch {
        return 'light'
      }
    }),
    [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved'),
    [notice, setNotice] = useState(''),
    [pendingImport, setPendingImport] = useState<{
      doc: ResumeDocument
      filename: string
    } | null>(null),
    [pendingStart, setPendingStart] = useState<boolean | null>(null),
    [help, setHelp] = useState(false),
    [exporting, setExporting] = useState(false),
    [exportDocument, setExportDocument] = useState<ResumeDocument | null>(null),
    [editableExport, setEditableExport] = useState(false),
    [exportError, setExportError] = useState(false),
    [importing, setImporting] = useState(false),
    [history, setHistory] = useState<ResumeDocument[]>([]),
    [future, setFuture] = useState<ResumeDocument[]>([])
  // Dialogs stay mounted briefly after closing so they can animate out.
  const exportView = useLingering(exportDocument, exportDocument !== null),
    exportShown = exportView.value,
    importView = useLingering(pendingImport, pendingImport !== null),
    importShown = importView.value,
    startView = useLingering(pendingStart, pendingStart !== null),
    helpView = useLingering(help, help)
  const input = useRef<HTMLInputElement>(null),
    lastHistory = useRef({ time: 0, key: '' }),
    t = translator(locale)
  useEffect(() => {
    let active = true
    loadDocument()
      .then((value) => {
        if (active) {
          setLoadError(false)
          setSaveState('saved')
          setDoc(value && { ...value, language: locale })
        }
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [loadAttempt])
  useEffect(() => {
    const idle =
      window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 1500))
    idle(() => void loadEditor())
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  // Only an explicit choice is remembered; otherwise the device theme applies.
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem('neatcv-theme', next)
    } catch {
      /* Theme remains available for this visit. */
    }
    setTheme(next)
  }
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  useEffect(() => {
    if (!ready || !doc) return
    let active = true
    setSaveState('saving')
    const timer = setTimeout(() => {
      saveDocument(doc)
        .then(() => {
          if (active) setSaveState('saved')
        })
        .catch(() => {
          if (active) setSaveState('error')
        })
    }, 250)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [doc, ready, saveAttempt])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 7000)
    return () => clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (doc && saveState !== 'saved') event.preventDefault()
    }
    // Leaving or hiding the tab writes the latest edit at once instead of
    // waiting for the short save delay.
    const flush = () => {
      if (doc && saveState === 'saving') void saveDocument(doc).catch(() => {})
    }
    const hidden = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('beforeunload', beforeUnload)
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [doc, saveState])
  function update(next: ResumeDocument, group = '') {
    if (
      doc &&
      (!group ||
        group !== lastHistory.current.key ||
        Date.now() - lastHistory.current.time > 700)
    )
      setHistory((h) => [...h.slice(-49), doc])
    lastHistory.current = { time: group ? Date.now() : 0, key: group }
    setFuture([])
    setDoc(next)
  }
  function start(sample: boolean, force = false) {
    if (loadError) {
      navigate('/edit')
      return
    }

    if (doc && !force) {
      setPendingStart(sample)
      return
    }
    update(createDocument(sample, locale))
    setPendingStart(null)
    setDocumentRevision((value) => value + 1)
    navigate('/edit')
  }
  function pickTemplate(template: Template) {
    if (loadError) {
      navigate('/edit')
      return
    }
    const next = doc || createDocument(false, locale)
    update({ ...next, template })
    navigate('/edit')
  }
  async function importFile(file?: File) {
    if (!file) return
    setImporting(true)
    try {
      if (file.size > 10_000_000) {
        setNotice(
          t(
            'Файл больше 10 МБ. Выберите PDF или JSON меньшего размера.',
            'This file exceeds 10 MB. Choose a smaller PDF or JSON file.',
          ),
        )
        return
      }
      // Recognise PDFs by their signature too: a renamed or extensionless
      // download is still the same file.
      const name = file.name.toLowerCase(),
        isPdf =
          name.endsWith('.pdf') ||
          (!name.endsWith('.json') &&
            (await file.slice(0, 5).text()) === '%PDF-')
      const next = isPdf
        ? await (
            await import('./pdf-reader')
          ).importPdf(await file.arrayBuffer())
        : parseDocument(JSON.parse(await file.text()))
      setPendingImport({ doc: next, filename: file.name })
    } catch {
      setNotice(
        t(
          'Не удалось открыть файл. Выберите JSON Resume или редактируемую PDF-копию из NeatCV (до 10 МБ). PDF для отправки и сторонние PDF не содержат исходных данных.',
          'Could not open this file. Choose JSON Resume or an editable PDF copy from NeatCV (up to 10 MB). Sharing copies and other PDFs do not include editable source.',
        ),
      )
    } finally {
      setImporting(false)
      if (input.current) input.current.value = ''
    }
  }
  function confirmImport() {
    if (!pendingImport) return
    setLoadError(false)
    const imported = pendingImport.doc
    // The editor shows the site language. If that version is empty but the file
    // has text in another language (JSON Resume is read as English), start from it.
    update(
      isEmptyVersion(imported.versions[locale]) &&
        !isEmptyVersion(imported.versions[imported.language])
        ? {
            ...imported,
            language: locale,
            versions: {
              ...imported.versions,
              [locale]: imported.versions[imported.language],
            },
          }
        : { ...imported, language: locale },
    )
    setPendingImport(null)
    setDocumentRevision((value) => value + 1)
    navigate('/edit')
    setNotice(
      t(
        'Резюме открыто. Предыдущие данные можно вернуть кнопкой отмены.',
        'Resume opened. Undo restores the previous document.',
      ),
    )
  }
  function backup() {
    if (!doc) return
    download(
      new Blob([JSON.stringify(toJsonResume(doc), null, 2)], {
        type: 'application/json',
      }),
      'resume.json',
    )
  }
  async function exportFile() {
    if (!exportDocument || exporting) return
    const snapshot = exportDocument,
      editable = editableExport
    setExporting(true)
    setExportError(false)
    try {
      const { exportPdf } = await import('./pdf')
      const blob = await exportPdf(snapshot, { editable })
      download(
        blob,
        snapshot.pdf.fileName.trim()
          ? `${pdfMetadata(snapshot).fileName}${editable ? '-editable' : ''}.pdf`
          : `${
              snapshot.versions[snapshot.language].basics.name
                .trim()
                .replace(/[^\p{L}\p{N} -]/gu, '')
                .replace(/\s+/g, '-') || 'Resume'
            }-${snapshot.language.toUpperCase()}${editable ? '-editable' : ''}-CV.pdf`,
      )
      setNotice(
        editable
          ? t(
              'Редактируемая копия скачана. Откройте её здесь, чтобы восстановить все языковые версии и оформление.',
              'Editable copy downloaded. Open it here to restore every language version and the design settings.',
            )
          : t(
              'PDF для отправки скачан. В нём только выбранная языковая версия. Ваше резюме остаётся в редакторе.',
              'PDF downloaded for sharing. It contains only the selected language. Your resume remains in the editor.',
            ),
      )
      setExportDocument(null)
    } catch (error) {
      setExportError(true)
      console.error(error)
      setNotice(
        t(
          'Не удалось создать PDF. Попробуйте снова или сохраните JSON-копию.',
          'Could not create the PDF. Try again or save a JSON backup.',
        ),
      )
    } finally {
      setExporting(false)
    }
  }
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  function changeLocale(next: Locale) {
    try {
      localStorage.setItem('neatcv-locale', next)
    } catch {
      /* The language still changes for this visit. */
    }
    setLocale(next)
  }
  // The resume is always edited and exported in the site language; each
  // language keeps its own version of the text.
  useEffect(() => {
    setDoc((current) =>
      current && current.language !== locale
        ? { ...current, language: locale }
        : current,
    )
  }, [locale, doc?.language])
  function undo() {
    if (!doc || !history.length) return
    const previous = history[history.length - 1]
    setFuture((f) => [doc, ...f])
    setHistory((h) => h.slice(0, -1))
    setDoc(previous)
    lastHistory.current = { time: 0, key: '' }
  }
  function redo() {
    if (!doc || !future.length) return
    const next = future[0]
    setHistory((h) => [...h, doc])
    setFuture((f) => f.slice(1))
    setDoc(next)
    lastHistory.current = { time: 0, key: '' }
  }
  const openFile = () => input.current?.click()
  const landing = (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span />
            {t('БЕСПЛАТНЫЙ КОНСТРУКТОР РЕЗЮМЕ', 'FREE RESUME BUILDER')}
          </div>
          <h1>
            {t('Ваш опыт.', 'Your experience.')}
            <br />
            {t('В лучшем', 'At its')}
            <br />
            <em>{t('виде.', 'best.')}</em>
            <span className="heading-spark">✳</span>
          </h1>
          <p className="hero-description">
            {t(
              'Красивое резюме без лишних усилий. Заполните самое важное, выберите стиль и скачайте PDF. Всё бесплатно.',
              'A beautiful resume, without the busywork. Add your experience, choose a style, and download your PDF. All for free.',
            )}
          </p>
          <div className="hero-actions">
            <button
              className="button primary"
              disabled={!ready}
              onClick={() => (doc ? navigate('/edit') : start(false))}
            >
              {doc
                ? t('Продолжить резюме', 'Continue your resume')
                : t('Создать резюме', 'Create your resume')}
              <ArrowUpRight />
            </button>
            <button
              className="text-button"
              onClick={() => start(true)}
              disabled={!ready}
            >
              {t('Попробовать на примере', 'Try an example')}
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="hero-trust">
            <span>
              <Check size={15} />
              {t('Без регистрации', 'No sign-up')}
            </span>
            <span>
              <Check size={15} />
              {t('PDF без оплаты', 'Free PDF download')}
            </span>
            <span>
              <Check size={15} />
              {t('Без водяных знаков', 'No watermarks')}
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-grid" />
          <div className="art-label">
            {t('МЕНЬШЕ ОФОРМЛЕНИЯ. БОЛЬШЕ ВАС.', 'LESS FORMATTING. MORE YOU.')}
          </div>
          <div className="hero-paper">
            <MiniResume locale={locale} large />
          </div>
          <div className="floating-note">
            <span>
              <CheckCheck size={19} />
            </span>
            <div>
              <strong>
                {t('Готово к новому шагу', 'Ready for what’s next')}
              </strong>
              <small>
                {t('Ваш опыт говорит за себя', 'Let your experience speak')}
              </small>
            </div>
          </div>
          <div className="art-caption">
            <span className="small-dot" />
            {t('Шаблон Modern', 'Modern template')}
            <span>01 / {String(templates.length).padStart(2, '0')}</span>
          </div>
        </div>
      </section>
      <section className="promise-strip">
        <div>
          <LockKeyhole size={22} />
          <span>
            <strong>
              {t('Личное остаётся личным', 'Your story stays yours')}
            </strong>
            <small>
              {t(
                'Данные хранятся в вашем браузере',
                'Your data stays in your browser',
              )}
            </small>
          </span>
        </div>
        <div>
          <FileText size={22} />
          <span>
            <strong>
              {t(
                'Скачали — и всё ещё можете править',
                'Download it. Keep it editable.',
              )}
            </strong>
            <small>
              {t(
                'Сохраните редактируемую PDF-копию',
                'Keep an editable PDF copy for future changes',
              )}
            </small>
          </span>
        </div>
        <div>
          <Sparkles size={22} />
          <span>
            <strong>
              {t('Хороший дизайн для каждого', 'Good design, for everyone')}
            </strong>
            <small>
              {t(
                'Все шаблоны и функции бесплатны',
                'Every template and feature is free',
              )}
            </small>
          </span>
        </div>
      </section>
      <section className="templates-section">
        <div className="section-top">
          <div>
            <div className="eyebrow">
              {t('ФОРМА ПОД ВАШ ОПЫТ', 'A FORMAT FOR YOUR STORY')}
            </div>
            <h2>{t('Один опыт. Ваш стиль.', 'Your story. Your style.')}</h2>
          </div>
          <Link className="text-button" to="/templates">
            {t('Все шаблоны', 'Explore templates')}
            <ArrowRight size={18} />
          </Link>
        </div>
        <TemplateCards
          disabled={!ready}
          locale={locale}
          onPick={pickTemplate}
        />
      </section>
      <section className="steps-section">
        <div>
          <div className="eyebrow">
            {t('ПРОЩЕ, ЧЕМ КАЖЕТСЯ', 'SIMPLER THAN YOU THINK')}
          </div>
          <h2>
            {t('От чистого листа', 'From a blank page')}
            <br />
            {t('до нового начала.', 'to a fresh start.')}
          </h2>
        </div>
        {[
          {
            n: '01',
            title: t('Расскажите о себе', 'Tell your story'),
            text: t(
              'Заполните разделы в своём темпе. Изменения сохраняются автоматически.',
              'Fill in the sections at your own pace. Your changes save automatically.',
            ),
          },
          {
            n: '02',
            title: t('Найдите свой стиль', 'Make it yours'),
            text: t(
              'Выберите шаблон и цвет. Результат сразу виден рядом.',
              'Choose your template and color. See every change in the live preview.',
            ),
          },
          {
            n: '03',
            title: t('Сделайте следующий шаг', 'Take the next step'),
            text: t(
              'Скачайте PDF с выделяемым текстом. Возвращайтесь и правьте, когда нужно.',
              'Download a PDF with selectable text. Come back and edit whenever you need.',
            ),
          },
        ].map((step) => (
          <div className="step" key={step.n}>
            <span>{step.n}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </section>
    </>
  )
  return (
    <div
      className={`app-shell ${location.pathname === '/edit' && doc ? 'is-editing' : ''}`}
    >
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        {t('К содержимому', 'Skip to content')}
      </a>
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-symbol">
            <FileText size={20} aria-hidden="true" />
          </span>
          neat<span className="brand-light">cv</span>
          <span className="free-badge">FREE</span>
          <span className="visually-hidden">
            {t(' — на главную', ' — home')}
          </span>
        </Link>
        <nav aria-label={t('Главное меню', 'Main navigation')}>
          <Link to="/edit">{t('Редактор', 'Editor')}</Link>
          <Link to="/templates">{t('Шаблоны', 'Templates')}</Link>
          <button className="nav-help" onClick={() => setHelp(true)}>
            {t('Как это работает', 'How it works')}
          </button>
        </nav>
        <div className="header-tools">
          <label className="language-button">
            <Globe2 size={15} aria-hidden="true" />
            <span aria-hidden="true">{locale.toUpperCase()}</span>
            <select
              value={locale}
              onChange={(e) => changeLocale(e.target.value as Locale)}
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
      <main id="main" tabIndex={-1}>
        <input
          className="visually-hidden"
          type="file"
          ref={input}
          accept=".json,.pdf,application/json,application/pdf"
          onChange={(e) => void importFile(e.target.files?.[0])}
          tabIndex={-1}
          aria-label={t('Открыть файл резюме', 'Open resume file')}
        />
        <Routes>
          <Route path="/" element={landing} />
          <Route
            path="/templates"
            element={
              <div className="gallery-page">
                <div className="eyebrow">
                  {t('ВСЕ ШАБЛОНЫ БЕСПЛАТНЫ', 'EVERY TEMPLATE IS FREE')}
                </div>
                <h1>
                  {t('Хороший опыт заслуживает', 'Great experience deserves')}
                  <br />
                  <em>{t('хорошего оформления.', 'great presentation.')}</em>
                </h1>
                <p>
                  {t(
                    'Выбирайте по вкусу. Шаблон можно поменять в любой момент — текст останется на месте.',
                    'Choose what feels like you. Switch templates any time without losing a word.',
                  )}
                </p>
                <TemplateCards
                  disabled={!ready}
                  locale={locale}
                  onPick={pickTemplate}
                />
                <p className="gallery-note">
                  <Lightbulb size={18} />
                  {t(
                    'Для автоматического отбора подходит любой шаблон, кроме двухколоночного Editorial: текст в них читается сверху вниз.',
                    'For automated resume screening, choose any template except the two-column Editorial: the others read top to bottom.',
                  )}
                </p>
              </div>
            }
          />
          <Route
            path="/edit"
            element={
              !ready ? (
                // A separate node from the page that replaces it, so the swap
                // is not measured as a layout shift.
                <div className="loading" key="loading">
                  <LoaderCircle className="spin" />
                  {t('Открываем редактор…', 'Opening the editor…')}
                </div>
              ) : loadError ? (
                <div className="start-page" role="alert">
                  <span className="start-icon">
                    <FileText size={36} />
                  </span>
                  <h1>
                    {t(
                      'Не удалось открыть сохранённое резюме',
                      'Could not open your saved resume',
                    )}
                  </h1>
                  <p>
                    {t(
                      'Локальные данные не изменены. Попробуйте загрузить их ещё раз или откройте свою PDF / JSON-копию.',
                      'Your local data has not been changed. Try loading it again or open your PDF / JSON backup.',
                    )}
                  </p>
                  <div className="dialog-actions">
                    <button className="button secondary" onClick={openFile}>
                      {t('Открыть копию', 'Open backup')}
                    </button>
                    <button
                      className="button primary"
                      onClick={() => {
                        setReady(false)
                        setLoadAttempt((value) => value + 1)
                      }}
                    >
                      {t('Повторить загрузку', 'Retry loading')}
                    </button>
                  </div>
                </div>
              ) : !doc ? (
                <div className="start-page">
                  <span className="start-icon">
                    <FileText size={36} />
                  </span>
                  <div className="eyebrow">
                    {t('НАЧНЁМ С ВАШЕЙ ИСТОРИИ', 'LET’S START WITH YOUR STORY')}
                  </div>
                  <h1>
                    {t('Первый шаг — простой.', 'The first step is simple.')}
                  </h1>
                  <p>
                    {t(
                      'Начните с чистого листа или изучите редактор на готовом примере.',
                      'Start with a blank page or explore the editor with a filled-in example.',
                    )}
                  </p>
                  <div className="start-choices">
                    <button onClick={() => start(false)}>
                      <Plus />
                      <strong>{t('Новое резюме', 'A blank resume')}</strong>
                      <span>
                        {t(
                          'Только ваш опыт. В вашем темпе.',
                          'Your experience. At your pace.',
                        )}
                      </span>
                      <ArrowRight />
                    </button>
                    <button onClick={() => start(true)}>
                      <Sparkles />
                      <strong>
                        {t('Начать с примера', 'Start with an example')}
                      </strong>
                      <span>
                        {t(
                          'Посмотрите, как всё устроено.',
                          'Get a feel for how it works.',
                        )}
                      </span>
                      <ArrowRight />
                    </button>
                  </div>
                  <button className="text-button" onClick={openFile}>
                    <Upload size={17} />
                    {t(
                      'Открыть резюме из PDF или JSON',
                      'Open a resume from PDF or JSON',
                    )}
                  </button>
                  <p className="privacy-caption">
                    <LockKeyhole size={14} />
                    {t(
                      'Без регистрации. Ваши данные не отправляются на сервер.',
                      'No sign-up. Your resume is never sent to a server.',
                    )}
                  </p>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="editor-loading" role="status">
                      <LoaderCircle className="spin" size={22} />
                      {t('Открываем редактор…', 'Opening the editor…')}
                    </div>
                  }
                >
                  <Editor
                    key={documentRevision}
                    doc={doc}
                    locale={locale}
                    update={update}
                    undo={undo}
                    redo={redo}
                    canUndo={!!history.length}
                    canRedo={!!future.length}
                    saveState={saveState}
                    exporting={exporting}
                    exportFile={() => {
                      setEditableExport(false)
                      setExportError(false)
                      setExportDocument(doc)
                    }}
                    openFile={openFile}
                    start={() => start(false)}
                    startOwn={() => start(false, true)}
                    backup={backup}
                  />
                </Suspense>
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <Link className="brand" to="/">
          neat<span className="brand-light">cv</span>
          <span className="footer-dot">✳</span>
        </Link>
        <span>
          {t(
            'Ваш опыт. Ваши данные. Ваши возможности.',
            'Your story. Your data. Your next chapter.',
          )}
        </span>
        <p className="site-author">
          {t('Автор —', 'Made by')}{' '}
          <a href="https://www.linkedin.com/in/mrnednick/" rel="author">
            Nikita Nedyalkov
          </a>
          <a
            className="author-link"
            href="https://github.com/MrNedNick"
            aria-label="GitHub — Nikita Nedyalkov"
            title="GitHub"
          >
            <GitHubMark />
          </a>
          <a
            className="author-link"
            href="https://www.linkedin.com/in/mrnednick/"
            aria-label="LinkedIn — Nikita Nedyalkov"
            title="LinkedIn"
          >
            <LinkedInMark />
          </a>
        </p>
        <button className="text-button" onClick={() => setHelp(true)}>
          {t('Бесплатно. И это всё.', 'Free. That’s the whole story.')}
          <ArrowUpRight />
        </button>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label={t('Закрыть уведомление', 'Dismiss notification')}
            onClick={() => setNotice('')}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {importing && (
        <div className="toast" role="status">
          <LoaderCircle className="spin" size={18} />
          {t('Открываем файл…', 'Opening file…')}
        </div>
      )}
      {saveState === 'error' && !loadError && (
        <div className="storage-warning" role="alert">
          {t(
            'Браузер не разрешает сохранить данные. Скачайте JSON-копию, прежде чем закрыть страницу.',
            'This browser could not save your data. Download a JSON backup before leaving.',
          )}
          <button onClick={() => setSaveAttempt((value) => value + 1)}>
            {t('Повторить сохранение', 'Retry saving')}
          </button>
          {doc && (
            <button
              onClick={() =>
                download(
                  new Blob([JSON.stringify(toJsonResume(doc))], {
                    type: 'application/json',
                  }),
                  'resume.json',
                )
              }
            >
              JSON ↓
            </button>
          )}
        </div>
      )}
      {exportView.shown && exportShown && (
        <Dialog
          closing={exportView.closing}
          title={t('Скачать резюме', 'Download your resume')}
          close={() => setExportDocument(null)}
          closeLabel={t('Закрыть', 'Close')}
        >
          <div className="export-summary">
            <FileText size={22} />
            <div>
              <strong>
                {exportShown.versions[exportShown.language].basics.name ||
                  t('Моё резюме', 'My resume')}
              </strong>
              <span>{localeNames[exportShown.language]} · PDF · A4</span>
            </div>
          </div>
          <Disclosure
            className="export-metadata"
            summary={t('Свойства PDF', 'PDF properties')}
          >
            <dl>
              <dt>{t('Автор', 'Author')}</dt>
              <dd>{pdfMetadata(exportShown).author || '—'}</dd>
              <dt>{t('Тема', 'Subject')}</dt>
              <dd>{pdfMetadata(exportShown).subject || '—'}</dd>
              <dt>{t('Ключевые слова', 'Keywords')}</dt>
              <dd>{pdfMetadata(exportShown).keywords || '—'}</dd>
            </dl>
            <p>
              {t(
                'По умолчанию берутся из имени, должности и навыков. Изменить можно в «Дизайн → PDF». Метаданные описывают файл, но не гарантируют позиции в отборе.',
                'By default these come from your name, job title, and skills. Change them under Design → PDF. Metadata describes the file; it does not guarantee a screening rank.',
              )}
            </p>
          </Disclosure>
          <fieldset className="export-options" disabled={exporting}>
            <legend>
              {t('Какую копию сохранить?', 'Which copy do you need?')}
            </legend>
            <label className={!editableExport ? 'selected' : ''}>
              <input
                type="radio"
                name="export-mode"
                checked={!editableExport}
                onChange={() => setEditableExport(false)}
              />
              <span>
                <strong>{t('Для отправки', 'For sharing')}</strong>
                <small>
                  {t(
                    'Только выбранный язык, без вложения с исходными данными. Подойдёт для отклика на вакансию.',
                    'Only the selected language, without an editable attachment. Ready for a job application.',
                  )}
                </small>
              </span>
            </label>
            <label className={editableExport ? 'selected' : ''}>
              <input
                type="radio"
                name="export-mode"
                checked={editableExport}
                onChange={() => setEditableExport(true)}
              />
              <span>
                <strong>{t('Редактируемая копия', 'Editable copy')}</strong>
                <small>
                  {t(
                    'Внутри — все языковые версии и оформление. Сохраните для себя и откройте здесь, чтобы продолжить правки.',
                    'Includes every language version and the design settings. Keep it for yourself and reopen it here to continue editing.',
                  )}
                </small>
              </span>
            </label>
          </fieldset>
          {exportError && (
            <p className="export-error" role="alert">
              {t(
                'Не удалось создать PDF. Повторите скачивание или вернитесь к правкам и сохраните JSON-копию через меню.',
                'Could not create the PDF. Retry the download, or return to editing and save a JSON backup from the menu.',
              )}
            </p>
          )}
          <p className="export-note">
            {t(
              'Оба варианта бесплатны, без водяных знаков. Данные остаются на вашем устройстве.',
              'Both options are free, with no watermarks. Your data stays on your device.',
            )}
          </p>
          <div className="dialog-actions">
            <button
              className="button secondary"
              onClick={() => setExportDocument(null)}
            >
              {t('Назад к правкам', 'Back to editing')}
            </button>
            <button
              className="button primary"
              disabled={exporting}
              onClick={() => void exportFile()}
            >
              {exporting && <LoaderCircle className="spin" size={16} />}
              {exporting
                ? t('Готовим PDF…', 'Preparing PDF…')
                : t('Скачать', 'Download')}
            </button>
          </div>
        </Dialog>
      )}
      {importView.shown && importShown && (
        <Dialog
          closing={importView.closing}
          title={t('Открыть это резюме?', 'Open this resume?')}
          close={() => setPendingImport(null)}
          closeLabel={t('Закрыть', 'Close')}
        >
          <div className="import-summary">
            <FileText size={26} />
            <div>
              <strong>
                {importShown.doc.versions[importShown.doc.language].basics
                  .name || t('Резюме без имени', 'Untitled resume')}
              </strong>
              <span>{importShown.filename}</span>
              <small>
                {importShown.doc.language.toUpperCase()} ·{' '}
                {
                  sections.filter((section) => {
                    const resume =
                      importShown.doc.versions[importShown.doc.language]
                    return section === 'basics'
                      ? Object.values(resume.basics).some(Boolean)
                      : section === 'summary'
                        ? resume.basics.summary.trim()
                        : section === 'skills'
                          ? resume.skills.trim()
                          : resume[section].some(
                              (e) =>
                                e.title.trim() ||
                                e.subtitle.trim() ||
                                e.description.trim(),
                            )
                  }).length
                }{' '}
                / 7 {t('разделов заполнено', 'sections filled')}
              </small>
            </div>
          </div>
          <p>
            {doc
              ? t(
                  'Открытие заменит текущее резюме. Сохраните копию, чтобы вернуться к нему позже. Сразу после открытия также доступна отмена.',
                  'Opening replaces your current resume. Save a backup to return to it later. You can also undo right after opening.',
                )
              : t(
                  'Проверьте имя и файл, затем продолжите редактирование.',
                  'Check the name and file, then continue editing.',
                )}
          </p>
          <div className="dialog-actions import-actions">
            <button
              className="button secondary"
              onClick={() => setPendingImport(null)}
            >
              {t('Отмена', 'Cancel')}
            </button>
            {doc && (
              <button className="button secondary" onClick={backup}>
                {t('Сохранить копию', 'Save backup')}
              </button>
            )}
            <button className="button primary" onClick={confirmImport}>
              {t('Открыть резюме', 'Open resume')}
              <ArrowRight size={16} />
            </button>
          </div>
        </Dialog>
      )}
      {startView.shown && startView.value !== null && (
        <Dialog
          closing={startView.closing}
          closeLabel={t('Закрыть', 'Close')}
          title={t('Начать новое резюме?', 'Start a new resume?')}
          close={() => setPendingStart(null)}
        >
          <p>
            {t(
              'Текущее резюме будет заменено. Сначала сохраните копию, если хотите вернуться к нему позже.',
              'This will replace your current resume. Save a backup first if you want to return to it later.',
            )}
          </p>
          <div className="dialog-actions">
            {doc && (
              <button className="button secondary" onClick={backup}>
                {t('Сохранить копию', 'Save backup')}
              </button>
            )}
            <button
              className="button primary"
              onClick={() => start(startView.value!, true)}
            >
              {t('Начать новое', 'Start new')}
            </button>
          </div>
        </Dialog>
      )}
      {helpView.shown && (
        <Dialog
          closing={helpView.closing}
          closeLabel={t('Закрыть', 'Close')}
          title={t(
            'Ваше резюме, без условий.',
            'Your resume, no strings attached.',
          )}
          close={() => setHelp(false)}
        >
          <div className="help-content">
            <p>
              <strong>{t('Быстрые действия.', 'Keyboard shortcuts.')}</strong>{' '}
              {t(
                'Ctrl / ⌘ Z — отменить; Ctrl / ⌘ Shift Z — повторить; Ctrl / ⌘ S — сохранить JSON-копию. Подсказки под формой ведут к разделу, который стоит проверить.',
                'Ctrl / ⌘ Z to undo; Ctrl / ⌘ Shift Z to redo; Ctrl / ⌘ S to save a JSON backup. Guidance below the form takes you to the section to review.',
              )}
            </p>
            <p>
              <strong>
                {t(
                  'Бесплатно от первого слова до PDF.',
                  'Free from the first word to the final PDF.',
                )}
              </strong>{' '}
              {t(
                'Все шаблоны, скачивание и редактирование доступны без регистрации, подписок и водяных знаков.',
                'All templates, downloads, and editing are available without sign-up, subscriptions, or watermarks.',
              )}
            </p>
            <p>
              <strong>
                {t('Данные остаются у вас.', 'Your data stays with you.')}
              </strong>{' '}
              {t(
                'Резюме сохраняется только в этом браузере. Очистка данных браузера удалит локальную копию — сохраняйте редактируемый PDF или JSON.',
                'Your resume is stored only in this browser. Clearing browser data removes the local copy, so keep an editable PDF or JSON backup.',
              )}
            </p>
            <p>
              <strong>
                {t(
                  'Редактируемую копию можно открыть снова.',
                  'Editable copies can be reopened.',
                )}
              </strong>{' '}
              {t(
                'При скачивании выберите «Редактируемая копия», чтобы сохранить все языковые версии и оформление внутри PDF. Такая копия восстанавливается через «Открыть файл». Вариант «Для отправки» содержит только выбранный язык и не открывается для редактирования.',
                'Choose “Editable copy” when downloading to include every language version and the design settings. Use “Open file” to restore that copy. “For sharing” contains only the selected language and cannot be reopened for editing.',
              )}
            </p>
            <p>
              <strong>EN · RU · DE · ES · BG · UK.</strong>{' '}
              {t(
                'Язык интерфейса меняется вверху страницы, язык резюме — рядом с названием документа. У резюме может быть до шести языковых версий: текст переводите вы, контакты, даты и ссылки общие. В PDF попадает выбранная версия.',
                'Change the interface language at the top of the page and the resume language next to the document name. A resume can have up to six language versions: you translate the text; contacts, dates, and links are shared. The PDF shows the selected version.',
              )}
            </p>
          </div>
          <button className="button primary" onClick={() => setHelp(false)}>
            {t('Всё понятно', 'Got it')}
            <Check size={17} />
          </button>
        </Dialog>
      )}
    </div>
  )
}
function ArrowUpRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 18 18 6M6 6h12v12" />
    </svg>
  )
}
