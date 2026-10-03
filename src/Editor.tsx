import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  Check,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe2,
  GraduationCap,
  LayoutTemplate,
  Lightbulb,
  ListChecks,
  Menu,
  Plus,
  Redo2,
  Undo2,
  Upload,
  UserRound,
  X,
  BriefcaseBusiness,
  FolderOpen,
  PenLine,
  LoaderCircle,
  ClipboardCheck,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Copy,
  PanelLeftClose,
  PanelLeftOpen,
  Languages,
  PanelLeft,
  ChevronDown,
} from 'lucide-react'
import { Field } from './ui/components/field/field'
import {
  accents,
  emptyEntry,
  getTips,
  sectionLabels,
  sections,
  plainText,
  locales,
  localeNames,
  isEmptyVersion,
  sharedBasics,
  sharedEntryFields,
  templateOrder,
  type EntrySection,
  type Locale,
  type Resume,
  type Section,
  type StudioDocument,
} from './model'
import { ContentLang, MiniResume, FormField, templates } from './components'
import EntryCard from './EntryCard'
import { translator } from './i18n'
import { preparePhoto } from './photo'
import { canAnimate, useLingering, useMediaQuery } from './motion'
import { ReviewStep, WritingGuide } from './Coach'
const Preview = lazy(() => import('./Preview'))
const icons = {
  basics: UserRound,
  summary: PenLine,
  work: BriefcaseBusiness,
  education: GraduationCap,
  skills: ListChecks,
  projects: FolderOpen,
  languages: Globe2,
}
type Step = Section | 'review'
const steps: Step[] = [...sections, 'review']
const colorNames = [
  { ru: 'Лесной', en: 'Forest' },
  { ru: 'Синий', en: 'Blue' },
  { ru: 'Бордовый', en: 'Burgundy' },
  { ru: 'Фиолетовый', en: 'Purple' },
  { ru: 'Графит', en: 'Graphite' },
  { ru: 'Бирюзовый', en: 'Teal' },
  { ru: 'Терракота', en: 'Terracotta' },
  { ru: 'Тёмно-синий', en: 'Navy' },
  { ru: 'Оливковый', en: 'Olive' },
  { ru: 'Сливовый', en: 'Plum' },
]
const readSetting = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const writeSetting = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* Layout preferences apply to this visit only. */
  }
}
interface EditorProps {
  doc: StudioDocument
  locale: Locale
  update: (doc: StudioDocument, group?: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  saveState: string
  exporting: boolean
  exportFile: () => void
  openFile: () => void
  start: () => void
  backup: () => void
}
export default function Editor({
  doc,
  locale,
  update,
  undo,
  redo,
  canUndo,
  canRedo,
  saveState,
  exporting,
  exportFile,
  openFile,
  start,
  backup,
}: EditorProps) {
  const [section, setSection] = useState<Step>('basics'),
    [railed, setRailed] = useState(() => readSetting('cv-sidebar') === 'rail'),
    [formHidden, setFormHidden] = useState(
      () => readSetting('cv-form-hidden') === 'hidden',
    ),
    [widthOverride, setWidthOverride] = useState<string | null>(null),
    desktop = useMediaQuery('(min-width: 1050px)'),
    [resizing, setResizing] = useState(false),
    [formWidth, setFormWidth] = useState<number | null>(
      () => Number(readSetting('cv-form-width')) || null,
    ),
    [activeEntry, setActiveEntry] = useState<string | null>(null),
    [tab, setTab] = useState<'content' | 'design'>('content'),
    [mobilePreview, setMobilePreview] = useState(false),
    [menu, setMenu] = useState(false),
    [hiddenTips, setHiddenTips] = useState<string[]>([]),
    [entryAnnouncement, setEntryAnnouncement] = useState(''),
    [languageNotice, setLanguageNotice] = useState(''),
    [preferredSource, setCopySource] = useState<Locale>('en'),
    [collapsed, setCollapsed] = useState<Set<string>>(
      () =>
        new Set(
          (['work', 'education', 'projects', 'languages'] as const).flatMap(
            (section) =>
              doc.versions[doc.language][section]
                .slice(1)
                .map((entry) => `${section}:${entry.id}`),
          ),
        ),
    )
  const t = translator(locale),
    // The interface language (locale) and the resume version (lang) are independent.
    lang = doc.language,
    resume = doc.versions[lang],
    labels = sectionLabels[locale],
    allTips = getTips(resume, locale, lang).filter(
      (tip) => !hiddenTips.includes(tip.id),
    ),
    // Only the open section's tips; the Review step lists everything.
    tips = allTips.filter((tip) => tip.section === section),
    completedSections = sections.filter((s) =>
      s === 'basics'
        ? resume.basics.name.trim()
        : s === 'summary'
          ? resume.basics.summary.trim()
          : s === 'skills'
            ? resume.skills.trim()
            : resume[s].some(
                (e) =>
                  e.title.trim() || e.subtitle.trim() || e.description.trim(),
              ),
    ),
    completed = completedSections.length
  const form = useRef<HTMLElement>(null),
    menuButton = useRef<HTMLButtonElement>(null),
    menuPanel = useRef<HTMLDivElement>(null),
    focusSection = useRef(false),
    pendingEntry = useRef<{ id: string; field: boolean } | null>(null)
  function goSection(next: Step, reveal = false) {
    if (
      reveal &&
      next !== 'basics' &&
      next !== 'summary' &&
      next !== 'skills' &&
      next !== 'review'
    ) {
      setCollapsed((current) => {
        const expanded = new Set(current)
        resume[next].forEach((e) => expanded.delete(`${next}:${e.id}`))
        return expanded
      })
    }
    focusSection.current = true
    toggleForm(false)
    setSection(next)
    setTab('content')
    if (section === next && tab === 'content') focusForm()
  }
  function focusForm() {
    const heading = form.current?.querySelector('h1')
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView?.({ block: 'nearest' })
    focusSection.current = false
  }
  useEffect(() => {
    if (focusSection.current) focusForm()
  }, [section, tab])
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.isComposing || document.querySelector('dialog[open]')) return
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return
      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === 'y' && !event.shiftKey) {
        event.preventDefault()
        redo()
      } else if (key === 's') {
        event.preventDefault()
        backup()
      } else if (event.key === '\\') {
        event.preventDefault()
        toggleFormRef.current()
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [undo, redo, backup])
  useEffect(() => {
    if (!menu) return
    menuPanel.current?.querySelector('button')?.focus()
    function dismiss(event: PointerEvent) {
      if (
        !menuPanel.current?.contains(event.target as Node) &&
        !menuButton.current?.contains(event.target as Node)
      )
        setMenu(false)
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenu(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener('pointerdown', dismiss)
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('keydown', escape)
    }
  }, [menu])
  function mapVersions(change: (version: Resume) => Resume) {
    return Object.fromEntries(
      locales.map((l) => [l, change(doc.versions[l])]),
    ) as StudioDocument['versions']
  }
  function basic(key: keyof Resume['basics'], value: string) {
    const shared = (sharedBasics as readonly string[]).includes(key),
      versions = Object.fromEntries(
        locales.map((l) => {
          const version = doc.versions[l]
          return [
            l,
            l === lang || shared
              ? { ...version, basics: { ...version.basics, [key]: value } }
              : version,
          ]
        }),
      ) as StudioDocument['versions']
    update({ ...doc, versions }, `${lang}:basics:${key}`)
  }
  function entry(
    section: EntrySection,
    id: string,
    key: string,
    value: string | boolean,
  ) {
    const shared = (sharedEntryFields as readonly string[]).includes(key),
      versions = Object.fromEntries(
        locales.map((l) => {
          const version = doc.versions[l]
          return [
            l,
            l === lang || shared
              ? {
                  ...version,
                  [section]: version[section].map((e) =>
                    e.id === id ? { ...e, [key]: value } : e,
                  ),
                }
              : version,
          ]
        }),
      ) as StudioDocument['versions']
    update({ ...doc, versions }, `${lang}:${section}:${id}:${key}`)
  }
  useEffect(() => {
    if (!pendingEntry.current) return
    const card = Array.from(
      form.current?.querySelectorAll<HTMLElement>('[data-entry-id]') || [],
    ).find((element) => element.dataset.entryId === pendingEntry.current?.id)
    const target =
      card?.querySelector<HTMLElement>(
        pendingEntry.current.field ? 'input' : '.entry-toggle',
      ) || form.current?.querySelector<HTMLElement>('.add-entry')
    target?.focus({ preventScroll: true })
    target?.scrollIntoView?.({ block: 'nearest' })
    pendingEntry.current = null
  }, [doc])
  function toggleEntry(id: string) {
    id = `${section}:${id}`
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function add(section: EntrySection) {
    if (resume[section].length >= 100) return
    const e = emptyEntry()
    pendingEntry.current = { id: e.id, field: true }
    update({
      ...doc,
      versions: mapVersions((version) => ({
        ...version,
        [section]: [...version[section], { ...e }],
      })),
    })
  }
  function remove(section: EntrySection, id: string) {
    const index = resume[section].findIndex((e) => e.id === id)
    const next = resume[section][index + 1] || resume[section][index - 1]
    pendingEntry.current = { id: next?.id || '', field: false }
    update({
      ...doc,
      versions: mapVersions((version) => ({
        ...version,
        [section]: version[section].filter((e) => e.id !== id),
      })),
    })
  }
  function move(section: EntrySection, index: number, direction: number) {
    pendingEntry.current = { id: resume[section][index].id, field: false }
    setEntryAnnouncement(
      t('{title}: {position} из {total}', '{title}: {position} of {total}', {
        title: resume[section][index].title || labels[section],
        position: index + direction + 1,
        total: resume[section].length,
      }),
    )
    const entries = [...resume[section]]
    ;[entries[index], entries[index + direction]] = [
      entries[index + direction],
      entries[index],
    ]
    update({
      ...doc,
      versions: {
        ...doc.versions,
        [locale]: { ...resume, [section]: entries },
      },
    })
  }
  const order = doc.sectionOrder.length
    ? doc.sectionOrder
    : templateOrder(doc.template)
  function moveSection(index: number, direction: number) {
    const next = [...order]
    ;[next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ]
    update({ ...doc, sectionOrder: next })
  }
  const [copied, setCopied] = useState(false),
    copyView = useLingering(copied, copied),
    menuView = useLingering(menu, menu)
  async function copyText() {
    try {
      await navigator.clipboard.writeText(plainText(doc))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      downloadText()
    }
  }
  function downloadText() {
    const url = URL.createObjectURL(
      new Blob([plainText(doc)], { type: 'text/plain;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `${(resume.basics.name || 'resume').trim().replace(/\s+/g, '-')}-${lang.toUpperCase()}-CV.txt`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const [photoError, setPhotoError] = useState('')
  async function choosePhoto(file: File) {
    setPhotoError('')
    try {
      update({ ...doc, photo: await preparePhoto(file) })
    } catch {
      setPhotoError(
        t(
          'Не удалось открыть изображение. Выберите JPG, PNG или WebP до 15 МБ.',
          'Could not open that image. Choose a JPG, PNG or WebP up to 15 MB.',
        ),
      )
    }
  }
  function addSkill(term: string) {
    const current = resume.skills.replace(/[,\s]*$/, '')
    update(
      {
        ...doc,
        versions: {
          ...doc.versions,
          [lang]: {
            ...resume,
            skills: current ? `${current}, ${term}` : term,
          },
        },
      },
      `${lang}:skills`,
    )
  }
  const caretEntry = useRef<string | null>(null)
  function verbTarget(target: EntrySection) {
    const list = resume[target]
    return (
      list.find((e) => e.id === activeEntry) ||
      list.find((e) => !collapsed.has(`${target}:${e.id}`)) ||
      list[0]
    )
  }
  function insertVerb(target: EntrySection, verb: string) {
    const e = verbTarget(target)
    if (!e) return
    const text = e.description.replace(/\s*$/, '')
    setCollapsed((current) => {
      const next = new Set(current)
      next.delete(`${target}:${e.id}`)
      return next
    })
    caretEntry.current = e.id
    setActiveEntry(e.id)
    entry(target, e.id, 'description', `${text ? `${text}\n` : ''}${verb} `)
  }
  useEffect(() => {
    if (!caretEntry.current) return
    const field = form.current?.querySelector<HTMLTextAreaElement>(
      `[data-entry-id="${CSS.escape(caretEntry.current)}"] textarea`,
    )
    caretEntry.current = null
    if (!field) return
    field.focus({ preventScroll: true })
    field.setSelectionRange(field.value.length, field.value.length)
    field.scrollIntoView?.({ block: 'nearest' })
  }, [doc])
  function toggleRail() {
    writeSetting('cv-sidebar', railed ? null : 'rail')
    setRailed(!railed)
  }
  const body = useRef<HTMLDivElement>(null),
    layoutTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const releaseOverride = useRef(false)
  useEffect(() => () => clearTimeout(layoutTimer.current), [])
  useLayoutEffect(() => {
    if (widthOverride !== null || !releaseOverride.current || !body.current)
      return
    releaseOverride.current = false
    void body.current.offsetWidth
    body.current.style.transition = ''
  }, [widthOverride])
  // Grid tracks only animate between plain lengths, so pin the current width,
  // move to the target width, then hand back to the flexible track.
  function animateForm(target: number) {
    const grid = body.current,
      from = form.current?.getBoundingClientRect().width
    if (
      !grid ||
      from === undefined ||
      !canAnimate(grid) ||
      window.innerWidth < 1050
    )
      return
    clearTimeout(layoutTimer.current)
    // Switch tracks without a transition: flexible ↔ fixed sizes cannot interpolate.
    grid.style.transition = 'none'
    grid.style.setProperty('--form-w', `${from}px`)
    void grid.offsetWidth
    grid.style.transition = ''
    setWidthOverride(`${target}px`)
    layoutTimer.current = setTimeout(() => {
      grid.style.transition = 'none'
      releaseOverride.current = true
      setWidthOverride(null)
    }, 340)
  }
  function standardWidth() {
    const free =
      (body.current?.getBoundingClientRect().width || 1400) -
      (railed ? 64 : 212)
    let width = (free * 0.9) / 2.05
    if (free - width < 370) width = free - 370
    return Math.max(360, width)
  }
  function changeFormWidth(next: number | null, animate = true) {
    if (animate) animateForm(formHidden ? 0 : (next ?? standardWidth()))
    writeSetting('cv-form-width', next ? String(Math.round(next)) : null)
    setFormWidth(next)
  }
  const toggleFormRef = useRef(() => {})
  toggleFormRef.current = () => toggleForm()
  function toggleForm(hidden = !formHidden) {
    if (hidden === formHidden) return
    animateForm(hidden ? 0 : (formWidth ?? standardWidth()))
    writeSetting('cv-form-hidden', hidden ? 'hidden' : null)
    setFormHidden(hidden)
  }
  function widthLimits() {
    const total = body.current?.getBoundingClientRect().width || 1400
    return { min: 340, max: Math.max(340, total - (railed ? 64 : 212) - 420) }
  }
  // Behaves like a macOS split view: the form stops at its minimum width,
  // snaps shut when dragged well past it, and opens again from the edge.
  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    const start = form.current?.getBoundingClientRect().left
    if (start === undefined || event.button !== 0) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture?.(event.pointerId)
    const { min, max } = widthLimits(),
      collapseAt = min * 0.55
    let width = formHidden
        ? (formWidth ?? standardWidth())
        : (form.current?.getBoundingClientRect().width ?? min),
      hidden = formHidden,
      dragging = true,
      snapTimer: ReturnType<typeof setTimeout> | undefined
    setResizing(true)
    const move = (e: PointerEvent) => {
      const raw = e.clientX - start,
        nextHidden = raw < collapseAt
      if (nextHidden !== hidden) {
        hidden = nextHidden
        // Let the snap itself animate, then go back to direct tracking.
        setResizing(false)
        clearTimeout(snapTimer)
        snapTimer = setTimeout(() => dragging && setResizing(true), 280)
        setFormHidden(hidden)
      }
      if (!hidden) {
        width = Math.min(max, Math.max(min, raw))
        setFormWidth(width)
      }
    }
    const stop = () => {
      dragging = false
      clearTimeout(snapTimer)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', stop)
      handle.removeEventListener('pointercancel', stop)
      setResizing(false)
      writeSetting('cv-form-hidden', hidden ? 'hidden' : null)
      changeFormWidth(width, false)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', stop)
    handle.addEventListener('pointercancel', stop)
  }
  function resizeWithKeys(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleForm()
      return
    }
    const { min, max } = widthLimits(),
      current = formHidden
        ? 0
        : formWidth || form.current?.getBoundingClientRect().width || min,
      step = event.shiftKey ? 80 : 20
    const next =
      event.key === 'ArrowLeft'
        ? current - step
        : event.key === 'ArrowRight'
          ? Math.max(min, current + step)
          : event.key === 'Home'
            ? min
            : event.key === 'End'
              ? max
              : null
    if (next === null) return
    event.preventDefault()
    if (next < min) {
      toggleForm(true)
      return
    }
    if (formHidden) toggleForm(false)
    changeFormWidth(Math.min(max, next), false)
  }
  const emptyVersion = isEmptyVersion(resume),
    sources = locales.filter(
      (l) => l !== lang && !isEmptyVersion(doc.versions[l]),
    ),
    copySource = sources.includes(preferredSource)
      ? preferredSource
      : sources[0]
  const subtitles: Record<Section, string> = {
    basics: t(
      'Начните с главного: как вас зовут и чем вы занимаетесь.',
      'Start with the essentials: who you are and what you do.',
    ),
    summary: t(
      'Несколько предложений о вашем опыте и сильных сторонах.',
      'A few focused sentences about your experience and strengths.',
    ),
    work: t(
      'Начните с последнего места работы. Расскажите о результатах.',
      'Start with your most recent role. Focus on what you achieved.',
    ),
    education: t(
      'Укажите образование и значимые курсы.',
      'Add your education and relevant courses.',
    ),
    skills: t(
      'Добавьте навыки, которые важны для вашей следующей роли.',
      'Include the skills that matter for your next role.',
    ),
    projects: t(
      'Покажите работу, которой вы гордитесь.',
      'Show work you’re proud of.',
    ),
    languages: t(
      'Укажите языки и уровень владения.',
      'List the languages you speak and your proficiency.',
    ),
  }
  return (
    <div className="editor">
      <p className="visually-hidden" role="status">
        {entryAnnouncement}
      </p>
      <p className="visually-hidden" role="status">
        {languageNotice}
      </p>
      {copyView.shown && (
        <p
          className={`copy-toast ${copyView.closing ? 'is-closing' : ''}`}
          role="status"
        >
          <Check size={16} />
          {t(
            'Текст резюме скопирован — вставьте его в анкету.',
            'Resume text copied — paste it into the application form.',
          )}
        </p>
      )}
      <div className="editor-toolbar">
        <button
          className="icon-button form-toggle"
          onClick={() => toggleForm()}
          aria-expanded={!formHidden}
          aria-controls="editor-form"
          aria-label={t('Панель формы', 'Form panel')}
          title={
            formHidden
              ? t('Показать форму · Ctrl/⌘ \\', 'Show form · Ctrl/⌘ \\')
              : t('Скрыть форму · Ctrl/⌘ \\', 'Hide form · Ctrl/⌘ \\')
          }
          aria-keyshortcuts="Control+Backslash Meta+Backslash"
        >
          <PanelLeft size={18} />
        </button>
        <div className="document-title">
          <div>
            <strong>
              {resume.basics.name || t('Моё резюме', 'My resume')}
            </strong>
            <span>
              <span className={`save-dot ${saveState}`} />
              {saveState === 'saved'
                ? t('Сохранено в браузере', 'Saved in this browser')
                : saveState === 'saving'
                  ? t('Сохраняем…', 'Saving…')
                  : t('Не сохранено', 'Not saved')}
              <span aria-hidden="true">·</span>
              <label className="version-select">
                <span className="visually-hidden">
                  {t('Язык резюме', 'Resume language')}
                </span>
                <select
                  value={lang}
                  title={t('Язык резюме', 'Resume language')}
                  onChange={(event) => {
                    const next = event.target.value as Locale
                    update({ ...doc, language: next })
                    setLanguageNotice(
                      t(
                        'Редактируется версия: {language}',
                        'Now editing the {language} version',
                        { language: localeNames[next] },
                      ),
                    )
                  }}
                >
                  {locales.map((l) => (
                    <option key={l} value={l}>
                      {localeNames[l]}
                      {l !== lang && isEmptyVersion(doc.versions[l])
                        ? ` — ${t('пусто', 'empty')}`
                        : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} aria-hidden="true" />
              </label>
            </span>
          </div>
        </div>
        <div className="editor-actions">
          <div className="history-actions">
            <button
              className="icon-button"
              onClick={undo}
              disabled={!canUndo}
              aria-label={t('Отменить', 'Undo')}
              title={t('Отменить · Ctrl/⌘ Z', 'Undo · Ctrl/⌘ Z')}
              aria-keyshortcuts="Control+Z Meta+Z"
            >
              <Undo2 size={18} />
            </button>
            <button
              className="icon-button"
              onClick={redo}
              disabled={!canRedo}
              aria-label={t('Повторить', 'Redo')}
              title={t('Повторить · Ctrl/⌘ Shift Z', 'Redo · Ctrl/⌘ Shift Z')}
              aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
            >
              <Redo2 size={18} />
            </button>
          </div>
          <button
            className="button primary export-button"
            onClick={exportFile}
            disabled={exporting}
          >
            {exporting ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Download size={17} />
            )}
            <span className="export-label">
              {exporting
                ? t('Готовим PDF…', 'Preparing…')
                : t('Скачать PDF', 'Download PDF')}
            </span>
            <span className="export-label-short" aria-hidden="true">
              PDF
            </span>
          </button>
          <button
            className="icon-button"
            aria-label={t('Действия с резюме', 'Resume actions')}
            ref={menuButton}
            aria-controls="document-menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
      {menuView.shown && (
        <div
          id="document-menu"
          className={`document-menu ${menuView.closing ? 'is-closing' : ''}`}
          ref={menuPanel}
          inert={menuView.closing}
        >
          <button
            onClick={() => {
              backup()
              setMenu(false)
            }}
          >
            <Download size={16} />
            {t('Сохранить JSON-копию', 'Save JSON backup')}
          </button>
          <button
            onClick={() => {
              openFile()
              setMenu(false)
            }}
          >
            <Upload size={16} />
            {t('Открыть PDF / JSON', 'Open PDF / JSON')}
          </button>
          <button
            onClick={() => {
              start()
              setMenu(false)
            }}
          >
            <Plus size={16} />
            {t('Новое резюме', 'New resume')}
          </button>
          <button
            onClick={() => {
              void copyText()
              setMenu(false)
            }}
          >
            <Copy size={16} />
            {t('Копировать как текст', 'Copy as plain text')}
          </button>
          <button
            onClick={() => {
              downloadText()
              setMenu(false)
            }}
          >
            <FileText size={16} />
            {t('Скачать .txt для анкет', 'Download .txt for forms')}
          </button>
        </div>
      )}
      <div className="mobile-view-switch">
        <button
          aria-pressed={!mobilePreview}
          className={!mobilePreview ? 'active' : ''}
          onClick={() => setMobilePreview(false)}
        >
          <PenLine size={16} />
          {t('Редактор', 'Editor')}
        </button>
        <button
          aria-pressed={mobilePreview}
          className={mobilePreview ? 'active' : ''}
          onClick={() => setMobilePreview(true)}
        >
          <Eye size={16} />
          {t('Просмотр', 'Preview')}
        </button>
      </div>
      <div
        ref={body}
        className={`editor-body ${mobilePreview ? 'show-preview' : ''} ${railed ? 'railed' : ''} ${formHidden ? 'form-hidden' : ''} ${resizing ? 'is-resizing' : ''}`}
        style={
          {
            '--sidebar-w': railed ? '64px' : '212px',
            '--form-w':
              widthOverride ??
              (formHidden
                ? '0px'
                : formWidth
                  ? `${formWidth}px`
                  : 'minmax(360px, 0.9fr)'),
          } as CSSProperties
        }
      >
        <aside className="editor-sidebar">
          <div className="editor-mode">
            <button
              aria-pressed={tab === 'content'}
              className={tab === 'content' ? 'active' : ''}
              onClick={() => setTab('content')}
            >
              <PenLine size={15} />
              <span className="rail-hide">{t('Текст', 'Content')}</span>
            </button>
            <button
              aria-pressed={tab === 'design'}
              className={tab === 'design' ? 'active' : ''}
              onClick={() => {
                focusSection.current = true
                setTab('design')
              }}
            >
              <LayoutTemplate size={15} />
              <span className="rail-hide">{t('Дизайн', 'Design')}</span>
            </button>
          </div>
          <div className="section-nav">
            {steps.map((s, i) => {
              const Icon = s === 'review' ? ClipboardCheck : icons[s],
                label = s === 'review' ? t('Проверка', 'Review') : labels[s],
                done = s !== 'review' && completedSections.includes(s)
              return (
                <button
                  key={s}
                  aria-pressed={section === s && tab === 'content'}
                  className={`${section === s && tab === 'content' ? 'active' : ''} ${s === 'review' ? 'review-link' : ''}`}
                  aria-label={railed ? label : undefined}
                  title={railed ? label : undefined}
                  onClick={() => {
                    goSection(s)
                  }}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  <small className={done ? 'section-complete' : ''}>
                    {done ? (
                      <Check size={15} aria-label={t('Заполнено', 'Filled')} />
                    ) : (
                      `0${i + 1}`
                    )}
                  </small>
                </button>
              )
            })}
          </div>
          <div className="sidebar-bottom">
            <div
              className="completion"
              title={t('Заполнено разделов', 'Sections filled')}
            >
              <span>{t('Заполнено', 'Filled')}</span>
              <strong>{completed} / 7</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${(completed / 7) * 100}%` }} />
            </div>
            <button
              className="icon-button rail-toggle"
              onClick={toggleRail}
              aria-expanded={!railed}
              aria-label={
                railed
                  ? t('Развернуть панель разделов', 'Expand section panel')
                  : t('Свернуть панель разделов', 'Collapse section panel')
              }
              title={
                railed
                  ? t('Развернуть панель', 'Expand panel')
                  : t('Свернуть панель', 'Collapse panel')
              }
            >
              {railed ? (
                <PanelLeftOpen size={17} />
              ) : (
                <PanelLeftClose size={17} />
              )}
            </button>
          </div>
        </aside>
        <section
          id="editor-form"
          className="editor-form"
          ref={form}
          lang={locale}
          spellCheck
          inert={formHidden && desktop}
          aria-hidden={(formHidden && desktop) || undefined}
        >
          <ContentLang.Provider value={lang}>
            <div key={`${tab}:${section}`} className="step-enter">
              {tab === 'design' ? (
                <>
                  <div className="form-step">
                    <div className="eyebrow">
                      {t('ВАШ СТИЛЬ', 'MAKE IT YOURS')}
                    </div>
                  </div>
                  <h1 tabIndex={-1}>{t('Оформление', 'Design')}</h1>
                  <p className="form-description">
                    {t(
                      'Попробуйте разные варианты. Текст останется на месте.',
                      'Try different looks. Your content stays the same.',
                    )}
                  </p>
                  <div className="design-options">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        aria-pressed={doc.template === template.id}
                        className={
                          doc.template === template.id ? 'selected' : ''
                        }
                        onClick={() =>
                          update({ ...doc, template: template.id })
                        }
                      >
                        <MiniResume template={template.id} locale={locale} />
                        <div>
                          <strong>{template.name}</strong>
                          {doc.template === template.id && <Check size={16} />}
                        </div>
                        <span>{t(template.ru, template.en)}</span>
                      </button>
                    ))}
                  </div>
                  {doc.template === 'sidebar' && (
                    <p className="inline-tip">
                      {t(
                        'Для автоматического отбора лучше выбрать одноколоночный шаблон.',
                        'A single-column template is a safer choice for automated screening.',
                      )}
                    </p>
                  )}
                  <h2 className="control-heading">
                    {t('Порядок разделов', 'Section order')}
                  </h2>
                  <p className="field-hint">
                    {t(
                      'Переставьте разделы или скройте лишние. Данные скрытых разделов сохраняются.',
                      'Reorder sections or hide the ones you don’t need. Hidden content is kept.',
                    )}
                  </p>
                  <ol className="section-order">
                    {order.map((s, i) => {
                      const hidden = doc.hiddenSections.includes(s)
                      return (
                        <li key={s} className={hidden ? 'is-hidden' : ''}>
                          <span>{labels[s]}</span>
                          {doc.template === 'sidebar' && (
                            <small>
                              {['summary', 'work', 'projects'].includes(s)
                                ? t('основная колонка', 'main column')
                                : t('боковая колонка', 'side column')}
                            </small>
                          )}
                          <button
                            className="icon-button"
                            disabled={i === 0}
                            onClick={() => moveSection(i, -1)}
                            aria-label={`${labels[s]}: ${t('выше', 'move up')}`}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            className="icon-button"
                            disabled={i === order.length - 1}
                            onClick={() => moveSection(i, 1)}
                            aria-label={`${labels[s]}: ${t('ниже', 'move down')}`}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            className="icon-button"
                            aria-pressed={!hidden}
                            onClick={() =>
                              update({
                                ...doc,
                                hiddenSections: hidden
                                  ? doc.hiddenSections.filter((h) => h !== s)
                                  : [...doc.hiddenSections, s],
                              })
                            }
                            aria-label={`${labels[s]}: ${t('показывать в PDF', 'show in PDF')}`}
                          >
                            {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                  {(doc.sectionOrder.length > 0 ||
                    doc.hiddenSections.length > 0) && (
                    <button
                      className="text-button"
                      onClick={() =>
                        update({ ...doc, sectionOrder: [], hiddenSections: [] })
                      }
                    >
                      {t(
                        'Вернуть порядок шаблона',
                        'Reset to the template’s order',
                      )}
                    </button>
                  )}
                  <h2 className="control-heading">
                    {t('Цвет акцента', 'Accent color')}
                  </h2>
                  <div className="color-options">
                    {accents.map((color, i) => (
                      <button
                        key={color}
                        aria-label={t(colorNames[i].ru, colorNames[i].en)}
                        aria-pressed={doc.accent === color}
                        style={{ background: color }}
                        onClick={() => update({ ...doc, accent: color })}
                      >
                        {doc.accent === color && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                  {doc.template === 'classic' && (
                    <p className="field-hint">
                      {t(
                        'Classic использует строгую монохромную палитру.',
                        'Classic uses a timeless monochrome palette.',
                      )}
                    </p>
                  )}
                  <Field
                    className="field"
                    label={t('Шрифт резюме', 'Resume typography')}
                    hint={t(
                      'Все варианты поддерживают латиницу и кириллицу.',
                      'Every option supports Latin and Cyrillic text.',
                    )}
                  >
                    <select
                      value={doc.typography}
                      onChange={(event) =>
                        update({
                          ...doc,
                          typography: event.target
                            .value as StudioDocument['typography'],
                        })
                      }
                    >
                      <option value="sans">
                        {t('Современный — Noto Sans', 'Modern — Noto Sans')}
                      </option>
                      <option value="serif">
                        {t('Классический — Noto Serif', 'Classic — Noto Serif')}
                      </option>
                      <option value="mixed">
                        {t('Сочетание — Serif + Sans', 'Mixed — Serif + Sans')}
                      </option>
                    </select>
                  </Field>
                  <Field
                    className="field"
                    label={t('Плотность текста', 'Text density')}
                  >
                    <select
                      value={doc.density}
                      onChange={(e) =>
                        update({
                          ...doc,
                          density: e.target.value as StudioDocument['density'],
                        })
                      }
                    >
                      <option value="comfortable">
                        {t('Свободнее', 'Comfortable')}
                      </option>
                      <option value="compact">
                        {t('Компактнее', 'Compact')}
                      </option>
                    </select>
                  </Field>
                </>
              ) : (
                <>
                  <div className="form-step">
                    <div className="eyebrow">
                      {t('ШАГ', 'STEP')} 0{steps.indexOf(section) + 1} / 0
                      {steps.length}
                    </div>
                  </div>
                  {section === 'review' ? (
                    <>
                      <h1 tabIndex={-1}>
                        {t('Проверка и отправка', 'Review & finish')}
                      </h1>
                      <p className="form-description">
                        {t(
                          'Последний шаг: проверьте содержание, сверьтесь с вакансией и скачайте PDF.',
                          'Last step: check the content, compare with a vacancy, and download your PDF.',
                        )}
                      </p>
                      <ReviewStep
                        resume={resume}
                        locale={locale}
                        lang={lang}
                        goSection={(next) => goSection(next, true)}
                        addSkill={addSkill}
                        exportFile={exportFile}
                        exporting={exporting}
                      />
                    </>
                  ) : (
                    <>
                      <h1 tabIndex={-1}>{labels[section]}</h1>
                      <p className="form-description">{subtitles[section]}</p>
                      {emptyVersion && sources.length > 0 && (
                        <div className="version-start" role="note">
                          <Languages size={18} aria-hidden="true" />
                          <div>
                            <strong>
                              {t(
                                'Версия «{language}» пока пустая',
                                'The {language} version is empty',
                                { language: localeNames[lang] },
                              )}
                            </strong>
                            <p>
                              {t(
                                'Скопируйте текст из другой версии и переведите его — или заполните с нуля. Контакты и даты уже общие.',
                                'Copy the text from another version and translate it, or start from scratch. Contacts and dates are already shared.',
                              )}
                            </p>
                            <div className="version-start-actions">
                              <select
                                aria-label={t('Скопировать из', 'Copy from')}
                                value={copySource}
                                onChange={(e) =>
                                  setCopySource(e.target.value as Locale)
                                }
                              >
                                {sources.map((l) => (
                                  <option key={l} value={l}>
                                    {localeNames[l]}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="button secondary"
                                onClick={() =>
                                  update({
                                    ...doc,
                                    versions: {
                                      ...doc.versions,
                                      [lang]: JSON.parse(
                                        JSON.stringify(
                                          doc.versions[copySource],
                                        ),
                                      ),
                                    },
                                  })
                                }
                              >
                                <Copy size={15} />
                                {t('Скопировать текст', 'Copy text')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <WritingGuide
                        section={section}
                        locale={locale}
                        lang={lang}
                        onPattern={
                          section === 'summary' && !resume.basics.summary.trim()
                            ? (pattern) => basic('summary', pattern)
                            : undefined
                        }
                        onVerb={
                          section === 'work' || section === 'projects'
                            ? (verb) => insertVerb(section, verb)
                            : undefined
                        }
                        verbTarget={
                          section === 'work' || section === 'projects'
                            ? (() => {
                                const target = verbTarget(section)
                                return target
                                  ? target.title ||
                                      `${labels[section]} ${resume[section].indexOf(target) + 1}`
                                  : undefined
                              })()
                            : undefined
                        }
                      />
                      {section === 'basics' ? (
                        <>
                          <div className="photo-field">
                            <div className="photo-preview" aria-hidden="true">
                              {doc.photo ? (
                                <img src={doc.photo} alt="" />
                              ) : (
                                <UserRound size={26} />
                              )}
                            </div>
                            <div>
                              <strong>
                                {t('Фото (необязательно)', 'Photo (optional)')}
                              </strong>
                              <p>
                                {t(
                                  'Принято в Германии, Австрии и Швейцарии. В США, Великобритании и Канаде фото обычно не добавляют.',
                                  'Common in Germany, Austria and Switzerland. Usually left out in the US, UK and Canada.',
                                )}
                              </p>
                              <div className="photo-actions">
                                <label className="button secondary">
                                  <Upload size={15} />
                                  {doc.photo
                                    ? t('Заменить', 'Replace')
                                    : t('Добавить фото', 'Add photo')}
                                  <input
                                    className="visually-hidden"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0]
                                      event.target.value = ''
                                      if (file) void choosePhoto(file)
                                    }}
                                  />
                                </label>
                                {doc.photo && (
                                  <button
                                    className="text-button"
                                    onClick={() =>
                                      update({ ...doc, photo: '' })
                                    }
                                  >
                                    {t('Убрать фото', 'Remove photo')}
                                  </button>
                                )}
                              </div>
                              {photoError && (
                                <p className="field-error" role="alert">
                                  {photoError}
                                </p>
                              )}
                            </div>
                          </div>
                          <FormField
                            label={t('Имя и фамилия', 'Full name')}
                            value={resume.basics.name}
                            onChange={(v) => basic('name', v)}
                            placeholder={t(
                              'Как к вам обращаться?',
                              'Your full name',
                            )}
                          />
                          <FormField
                            label={t(
                              'Должность или специализация',
                              'Job title or speciality',
                            )}
                            value={resume.basics.label}
                            onChange={(v) => basic('label', v)}
                            placeholder={t(
                              'Например, продуктовый дизайнер',
                              'e.g. Product designer',
                            )}
                          />
                          <div className="form-divider">
                            {t('КОНТАКТЫ', 'CONTACT DETAILS')}
                          </div>
                          <div className="field-row">
                            <FormField
                              label={t('Электронная почта', 'Email')}
                              value={resume.basics.email}
                              onChange={(v) => basic('email', v)}
                              type="email"
                              placeholder="you@example.com"
                            />
                            <FormField
                              label={t('Телефон', 'Phone')}
                              value={resume.basics.phone}
                              onChange={(v) => basic('phone', v)}
                              type="tel"
                              placeholder="+420 …"
                            />
                          </div>
                          <FormField
                            label={t('Город и страна', 'City and country')}
                            value={resume.basics.location}
                            onChange={(v) => basic('location', v)}
                            placeholder={t(
                              'Например, Прага, Чехия',
                              'e.g. Prague, Czechia',
                            )}
                          />
                          <FormField
                            label={t(
                              'Сайт или портфолио',
                              'Website or portfolio',
                            )}
                            value={resume.basics.url}
                            onChange={(v) => basic('url', v)}
                            placeholder="https://…"
                            hint={t(
                              'Необязательные поля можно оставить пустыми — они не попадут в PDF.',
                              'Leave optional fields blank — they won’t appear in your PDF.',
                            )}
                          />
                          <FormField
                            label="LinkedIn"
                            value={resume.basics.linkedin}
                            onChange={(v) => basic('linkedin', v)}
                            placeholder="linkedin.com/in/your-name"
                          />
                          <FormField
                            label="GitHub"
                            value={resume.basics.github}
                            onChange={(v) => basic('github', v)}
                            placeholder="github.com/your-name"
                          />
                        </>
                      ) : section === 'summary' ? (
                        <FormField
                          label={t(
                            'Коротко о вас',
                            'Your professional profile',
                          )}
                          value={resume.basics.summary}
                          onChange={(v) => basic('summary', v)}
                          multiline
                          placeholder={t(
                            'Что вы умеете, какой у вас опыт и какую пользу приносите?',
                            'What do you do well, and what value do you bring?',
                          )}
                          hint={t(
                            '2–4 предложения. Пишите конкретно, без общих фраз.',
                            'Aim for 2–4 specific sentences. Skip generic buzzwords.',
                          )}
                        />
                      ) : section === 'skills' ? (
                        <>
                          <FormField
                            label={t('Ваши навыки', 'Your skills')}
                            value={resume.skills}
                            onChange={(v) =>
                              update(
                                {
                                  ...doc,
                                  versions: {
                                    ...doc.versions,
                                    [lang]: { ...resume, skills: v },
                                  },
                                },
                                `${lang}:skills`,
                              )
                            }
                            multiline
                            placeholder="Figma, HTML, CSS, …"
                            hint={t(
                              'Разделяйте запятыми. Используйте названия из вакансии, только если владеете навыком. Подтвердите ключевые навыки примерами в опыте.',
                              'Separate with commas. Use the job posting’s terms for skills you actually have, and show your key skills in your experience.',
                            )}
                          />
                          <div className="skill-chips">
                            {resume.skills
                              .split(',')
                              .filter((s) => s.trim())
                              .map((s, i) => (
                                <span key={i}>{s.trim()}</span>
                              ))}
                          </div>
                        </>
                      ) : (
                        <>
                          {resume[section].length > 1 && (
                            <div className="entries-toolbar">
                              <span>
                                {t('Записей', 'Entries')}:{' '}
                                {resume[section].length}
                              </span>
                              <button
                                className="text-button"
                                onClick={() => {
                                  const allCollapsed = resume[section].every(
                                    (e) => collapsed.has(`${section}:${e.id}`),
                                  )
                                  setCollapsed((current) => {
                                    const next = new Set(current)
                                    resume[section].forEach((e) => {
                                      if (allCollapsed)
                                        next.delete(`${section}:${e.id}`)
                                      else next.add(`${section}:${e.id}`)
                                    })
                                    return next
                                  })
                                }}
                              >
                                {resume[section].every((e) =>
                                  collapsed.has(`${section}:${e.id}`),
                                )
                                  ? t('Развернуть все', 'Expand all')
                                  : t('Свернуть все', 'Collapse all')}
                              </button>
                            </div>
                          )}
                          {resume[section].map((e, i) => (
                            <EntryCard
                              key={e.id}
                              entry={e}
                              title={e.title || `${labels[section]} ${i + 1}`}
                              locale={locale}
                              expanded={!collapsed.has(`${section}:${e.id}`)}
                              toggle={() => toggleEntry(e.id)}
                              moveUp={
                                i > 0 ? () => move(section, i, -1) : undefined
                              }
                              moveDown={
                                i < resume[section].length - 1
                                  ? () => move(section, i, 1)
                                  : undefined
                              }
                              remove={() => remove(section, e.id)}
                            >
                              <FormField
                                label={
                                  section === 'work'
                                    ? t('Должность', 'Job title')
                                    : section === 'education'
                                      ? t(
                                          'Специальность / степень',
                                          'Degree / field of study',
                                        )
                                      : section === 'languages'
                                        ? t('Язык', 'Language')
                                        : t('Название проекта', 'Project name')
                                }
                                value={e.title}
                                onChange={(v) =>
                                  entry(section, e.id, 'title', v)
                                }
                              />
                              <FormField
                                label={
                                  section === 'work'
                                    ? t('Компания', 'Company')
                                    : section === 'education'
                                      ? t('Учебное заведение', 'Institution')
                                      : section === 'languages'
                                        ? t('Уровень владения', 'Proficiency')
                                        : t(
                                            'Роль / организация',
                                            'Role / organization',
                                          )
                                }
                                value={e.subtitle}
                                onChange={(v) =>
                                  entry(section, e.id, 'subtitle', v)
                                }
                              />
                              {section !== 'languages' && (
                                <>
                                  <div className="field-row">
                                    <FormField
                                      label={t('Начало', 'Start date')}
                                      type="month"
                                      value={e.startDate}
                                      onChange={(v) =>
                                        entry(section, e.id, 'startDate', v)
                                      }
                                    />
                                    {!e.current && (
                                      <FormField
                                        label={t('Окончание', 'End date')}
                                        type="month"
                                        value={e.endDate}
                                        onChange={(v) =>
                                          entry(section, e.id, 'endDate', v)
                                        }
                                      />
                                    )}
                                  </div>
                                  <label className="checkbox">
                                    <input
                                      type="checkbox"
                                      checked={e.current}
                                      onChange={(event) =>
                                        entry(
                                          section,
                                          e.id,
                                          'current',
                                          event.target.checked,
                                        )
                                      }
                                    />
                                    {t('По настоящее время', 'Present')}
                                  </label>
                                  <FormField
                                    label={
                                      section === 'work'
                                        ? t(
                                            'Результаты и достижения',
                                            'Achievements and impact',
                                          )
                                        : t('Описание', 'Description')
                                    }
                                    multiline
                                    value={e.description}
                                    onChange={(v) =>
                                      entry(section, e.id, 'description', v)
                                    }
                                    onFocus={() => setActiveEntry(e.id)}
                                    hint={
                                      section === 'work'
                                        ? t(
                                            'Каждая новая строка — отдельный пункт. Добавьте результаты в цифрах.',
                                            'One achievement per line. Include measurable results.',
                                          )
                                        : undefined
                                    }
                                  />
                                  {section === 'projects' && (
                                    <FormField
                                      label={t(
                                        'Ссылка на проект',
                                        'Project link',
                                      )}
                                      value={e.url}
                                      onChange={(v) =>
                                        entry(section, e.id, 'url', v)
                                      }
                                      placeholder="https://…"
                                    />
                                  )}
                                </>
                              )}
                            </EntryCard>
                          ))}
                          {resume[section].length === 0 && (
                            <div className="empty-section">
                              <Plus size={24} />
                              <p>{t('Здесь пока пусто', 'Nothing here yet')}</p>
                              <span>
                                {t(
                                  'Добавьте запись или пропустите раздел.',
                                  'Add an entry, or skip this section.',
                                )}
                              </span>
                            </div>
                          )}
                          <button
                            className="button add-entry"
                            disabled={resume[section].length >= 100}
                            onClick={() => add(section)}
                          >
                            <Plus size={17} />
                            {t('Добавить запись', 'Add entry')}
                          </button>
                          <p className="field-hint">
                            {resume[section].length >= 100
                              ? t(
                                  'В разделе уже 100 записей. Отредактируйте или удалите одну, чтобы добавить новую.',
                                  'This section has 100 entries. Edit or remove an entry before adding another.',
                                )
                              : t(
                                  'Удаление и изменения можно отменить стрелкой вверху.',
                                  'Use Undo above to restore removed entries or changes.',
                                )}
                          </p>
                        </>
                      )}
                      {tips.length > 0 && (
                        <div className="tips">
                          <div>
                            <Lightbulb size={17} />
                            <strong>
                              {t('Небольшая подсказка', 'A little guidance')}
                            </strong>
                          </div>
                          {tips.map((tip) => (
                            <p key={tip.id}>
                              <button
                                className="tip-link"
                                onClick={() => goSection(tip.section, true)}
                              >
                                {tip.message}
                                <ChevronRight size={14} />
                              </button>
                              <button
                                aria-label={`${t('Скрыть подсказку', 'Dismiss tip')}: ${tip.message}`}
                                onClick={() =>
                                  setHiddenTips([...hiddenTips, tip.id])
                                }
                              >
                                <X size={14} />
                              </button>
                            </p>
                          ))}
                        </div>
                      )}
                      {hiddenTips.length > 0 && (
                        <button
                          className="text-button restore-tips"
                          onClick={() => setHiddenTips([])}
                        >
                          {t(
                            'Показать скрытые подсказки',
                            'Show dismissed tips',
                          )}
                        </button>
                      )}
                      <div className="form-bottom">
                        <button
                          className="button secondary"
                          onClick={() =>
                            steps.indexOf(section) < steps.length - 1
                              ? goSection(steps[steps.indexOf(section) + 1])
                              : ((focusSection.current = true),
                                setTab('design'))
                          }
                        >
                          {steps.indexOf(section) < steps.length - 1
                            ? t('Далее', 'Next')
                            : t('К оформлению', 'Choose a design')}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </ContentLang.Provider>
        </section>
        <section
          className="preview-panel"
          aria-label={t('Предпросмотр резюме', 'Resume preview')}
        >
          <div
            className="panel-resizer"
            role="separator"
            aria-orientation="vertical"
            aria-label={t('Ширина формы', 'Form width')}
            aria-valuenow={
              formHidden
                ? 0
                : Math.round(
                    formWidth ||
                      form.current?.getBoundingClientRect().width ||
                      0,
                  )
            }
            aria-valuemin={0}
            aria-valuemax={Math.round(widthLimits().max)}
            tabIndex={0}
            title={t(
              'Потяните, чтобы изменить ширину. Двойной клик — сброс.',
              'Drag to resize. Double-click to reset.',
            )}
            onPointerDown={startResize}
            onKeyDown={resizeWithKeys}
            onDoubleClick={() => {
              if (formHidden) toggleForm(false)
              changeFormWidth(null)
            }}
          />
          <Suspense
            fallback={
              <div className="loading">
                <LoaderCircle className="spin" />
                {t('Готовим просмотр…', 'Preparing preview…')}
              </div>
            }
          >
            <Preview doc={doc} locale={locale} />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
