import {
  lazy,
  Suspense,
  useEffect,
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
  LockKeyhole,
  Menu,
  Plus,
  Redo2,
  ShieldCheck,
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
  Columns2,
} from 'lucide-react'
import { Field } from './ui/components/field/field'
import {
  accents,
  emptyEntry,
  getTips,
  sectionLabels,
  sections,
  plainText,
  templateOrder,
  type EntrySection,
  type Locale,
  type Resume,
  type Section,
  type StudioDocument,
} from './model'
import { MiniResume, FormField, templates } from './components'
import EntryCard from './EntryCard'
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
const NARROW_FORM = 360
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
    [formWidth, setFormWidth] = useState<number | null>(
      () => Number(readSetting('cv-form-width')) || null,
    ),
    [activeEntry, setActiveEntry] = useState<string | null>(null),
    [tab, setTab] = useState<'content' | 'design'>('content'),
    [mobilePreview, setMobilePreview] = useState(false),
    [menu, setMenu] = useState(false),
    [hiddenTips, setHiddenTips] = useState<string[]>([]),
    [entryAnnouncement, setEntryAnnouncement] = useState(''),
    [collapsed, setCollapsed] = useState<Set<string>>(
      () =>
        new Set(
          (['work', 'education', 'projects', 'languages'] as const).flatMap(
            (section) =>
              doc.versions[locale][section]
                .slice(1)
                .map((entry) => `${section}:${entry.id}`),
          ),
        ),
    )
  const ru = locale === 'ru',
    t = (a: string, b: string) => (ru ? a : b),
    resume = doc.versions[locale],
    other = locale === 'ru' ? 'en' : 'ru',
    labels = sectionLabels[locale],
    tips = getTips(resume, locale).filter(
      (tip) => !hiddenTips.includes(tip.id),
    ),
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
  function basic(key: keyof Resume['basics'], value: string) {
    const versions = {
      ...doc.versions,
      [locale]: { ...resume, basics: { ...resume.basics, [key]: value } },
    }
    if (['email', 'phone', 'url', 'linkedin', 'github'].includes(key))
      versions[other] = {
        ...versions[other],
        basics: { ...versions[other].basics, [key]: value },
      }
    update({ ...doc, versions }, `${locale}:basics:${key}`)
  }
  function entry(
    section: EntrySection,
    id: string,
    key: string,
    value: string | boolean,
  ) {
    const versions = {
      ...doc.versions,
      [locale]: {
        ...resume,
        [section]: resume[section].map((e) =>
          e.id === id ? { ...e, [key]: value } : e,
        ),
      },
    }
    if (['startDate', 'endDate', 'current', 'url'].includes(key))
      versions[other] = {
        ...versions[other],
        [section]: versions[other][section].map((e) =>
          e.id === id ? { ...e, [key]: value } : e,
        ),
      }
    update({ ...doc, versions }, `${locale}:${section}:${id}:${key}`)
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
      versions: {
        ...doc.versions,
        [locale]: { ...resume, [section]: [...resume[section], e] },
        [other]: {
          ...doc.versions[other],
          [section]: [...doc.versions[other][section], { ...e }],
        },
      },
    })
  }
  function remove(section: EntrySection, id: string) {
    const index = resume[section].findIndex((e) => e.id === id)
    const next = resume[section][index + 1] || resume[section][index - 1]
    pendingEntry.current = { id: next?.id || '', field: false }
    update({
      ...doc,
      versions: {
        ...doc.versions,
        [locale]: {
          ...resume,
          [section]: resume[section].filter((e) => e.id !== id),
        },
        [other]: {
          ...doc.versions[other],
          [section]: doc.versions[other][section].filter((e) => e.id !== id),
        },
      },
    })
  }
  function move(section: EntrySection, index: number, direction: number) {
    pendingEntry.current = { id: resume[section][index].id, field: false }
    setEntryAnnouncement(
      `${resume[section][index].title || labels[section]}: ${index + direction + 1} ${t('из', 'of')} ${resume[section].length}`,
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
  const [copied, setCopied] = useState(false)
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
    link.download = `${(resume.basics.name || 'resume').trim().replace(/\s+/g, '-')}-${locale.toUpperCase()}-CV.txt`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function addSkill(term: string) {
    const current = resume.skills.replace(/[,\s]*$/, '')
    update(
      {
        ...doc,
        versions: {
          ...doc.versions,
          [locale]: {
            ...resume,
            skills: current ? `${current}, ${term}` : term,
          },
        },
      },
      `${locale}:skills`,
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
  function changeFormWidth(next: number | null) {
    writeSetting('cv-form-width', next ? String(Math.round(next)) : null)
    setFormWidth(next)
  }
  const body = useRef<HTMLDivElement>(null)
  function widthLimits() {
    const total = body.current?.getBoundingClientRect().width || 1400
    return { min: 320, max: Math.max(320, total - (railed ? 64 : 212) - 380) }
  }
  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    const start = form.current?.getBoundingClientRect().left
    if (start === undefined) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture?.(event.pointerId)
    const { min, max } = widthLimits()
    let width = formWidth
    const move = (e: PointerEvent) => {
      width = Math.min(max, Math.max(min, e.clientX - start))
      setFormWidth(width)
    }
    const stop = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', stop)
      handle.removeEventListener('pointercancel', stop)
      changeFormWidth(width)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', stop)
    handle.addEventListener('pointercancel', stop)
  }
  function resizeWithKeys(event: ReactKeyboardEvent<HTMLDivElement>) {
    const { min, max } = widthLimits(),
      current = formWidth || form.current?.getBoundingClientRect().width || 480,
      step = event.shiftKey ? 80 : 20
    const next =
      event.key === 'ArrowLeft'
        ? current - step
        : event.key === 'ArrowRight'
          ? current + step
          : event.key === 'Home'
            ? min
            : event.key === 'End'
              ? max
              : null
    if (next === null) return
    event.preventDefault()
    changeFormWidth(Math.min(max, Math.max(min, next)))
  }
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
      {copied && (
        <p className="copy-toast" role="status">
          <Check size={16} />
          {t(
            'Текст резюме скопирован — вставьте его в анкету.',
            'Resume text copied — paste it into the application form.',
          )}
        </p>
      )}
      <div className="editor-toolbar">
        <div className="document-title">
          <FileText size={20} />
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
          <button className="button secondary open-file" onClick={openFile}>
            <Upload size={16} />
            {t('Открыть файл', 'Open file')}
          </button>
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
            {exporting
              ? t('Готовим PDF…', 'Preparing…')
              : t('Скачать PDF', 'Download PDF')}
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
      {menu && (
        <div id="document-menu" className="document-menu" ref={menuPanel}>
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
        className={`editor-body ${mobilePreview ? 'show-preview' : ''} ${railed ? 'railed' : ''}`}
        style={
          {
            '--sidebar-w': railed ? '64px' : '212px',
            '--form-w': formWidth ? `${formWidth}px` : 'minmax(360px, 0.9fr)',
          } as CSSProperties
        }
      >
        <aside className="editor-sidebar">
          <div className="sidebar-head">
            <div className="sidebar-title">
              {t('ВАШЕ РЕЗЮМЕ', 'YOUR RESUME')}
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
            <div className="completion">
              <span>{t('Заполнено разделов', 'Sections filled')}</span>
              <strong>{completed} / 7</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(completed / 7) * 100}%` }} />
            </div>
            <p>
              {t(
                'Все разделы необязательны. Оставьте важное для вашей работы.',
                'Every section is optional. Keep what matters for your next role.',
              )}
            </p>
            <button
              className="button primary sidebar-export"
              onClick={exportFile}
              disabled={exporting}
            >
              <Download size={16} />
              <span className="rail-hide">
                {t('Получить PDF', 'Finish & export')}
              </span>
            </button>
            <div className="local-badge">
              <ShieldCheck size={16} />
              {t('Только на вашем устройстве', 'Only on your device')}
            </div>
          </div>
        </aside>
        <section className="editor-form" ref={form} lang={locale} spellCheck>
          {tab === 'design' ? (
            <>
              <div className="eyebrow">{t('ВАШ СТИЛЬ', 'MAKE IT YOURS')}</div>
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
                    className={doc.template === template.id ? 'selected' : ''}
                    onClick={() => update({ ...doc, template: template.id })}
                  >
                    <MiniResume template={template.id} locale={locale} />
                    <div>
                      <strong>{template.name}</strong>
                      {doc.template === template.id && <Check size={16} />}
                    </div>
                    <span>{template[locale]}</span>
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
                    aria-label={t(
                      ['Лесной', 'Синий', 'Бордовый', 'Фиолетовый', 'Графит'][
                        i
                      ],
                      ['Forest', 'Blue', 'Burgundy', 'Purple', 'Graphite'][i],
                    )}
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
                  'Все варианты поддерживают русский и английский текст.',
                  'Every option supports Russian and English text.',
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
                  <option value="compact">{t('Компактнее', 'Compact')}</option>
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
                <div className="form-step-tools">
                  <button
                    className="icon-button form-width-toggle"
                    aria-pressed={formWidth === NARROW_FORM}
                    onClick={() =>
                      changeFormWidth(
                        formWidth === NARROW_FORM ? null : NARROW_FORM,
                      )
                    }
                    title={
                      formWidth === NARROW_FORM
                        ? t('Обычная ширина формы', 'Standard form width')
                        : t('Узкая форма', 'Narrow form')
                    }
                    aria-label={t('Узкая форма', 'Narrow form')}
                  >
                    <Columns2 size={16} />
                  </button>
                  <span className="locale-badge">{locale.toUpperCase()}</span>
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
                  <WritingGuide
                    section={section}
                    locale={locale}
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
                        label={t('Сайт или портфолио', 'Website or portfolio')}
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
                      label={t('Коротко о вас', 'Your professional profile')}
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
                                [locale]: { ...resume, skills: v },
                              },
                            },
                            `${locale}:skills`,
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
                            {t('Записей', 'Entries')}: {resume[section].length}
                          </span>
                          <button
                            className="text-button"
                            onClick={() => {
                              const allCollapsed = resume[section].every((e) =>
                                collapsed.has(`${section}:${e.id}`),
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
                            onChange={(v) => entry(section, e.id, 'title', v)}
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
                                  label={t('Ссылка на проект', 'Project link')}
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
                        {t(
                          resume[section].length >= 100
                            ? 'В разделе уже 100 записей. Отредактируйте или удалите одну, чтобы добавить новую.'
                            : 'Удаление и изменения можно отменить стрелкой вверху.',
                          resume[section].length >= 100
                            ? 'This section has 100 entries. Edit or remove an entry before adding another.'
                            : 'Use Undo above to restore removed entries or changes.',
                        )}
                      </p>
                    </>
                  )}
                  <details className="screening-guide">
                    <summary>
                      {t(
                        'Резюме для людей и систем отбора',
                        'Make it easy to read & parse',
                      )}
                    </summary>
                    <p>
                      {t(
                        'Выбирайте одну колонку для систем отбора. Добавляйте реальные навыки из вакансии в видимый текст и показывайте, как применяли их в работе. Скрытые ключевые слова не заменяют опыт.',
                        'Choose a single column for application systems. Include relevant skills from the job posting in visible text, backed by examples of your work. Hidden keywords do not replace experience.',
                      )}
                    </p>
                    <p>
                      {t(
                        'Проверьте текст PDF после скачивания: имя, контакты, даты, порядок разделов. Если работодатель просит другой формат, следуйте его инструкции. Универсального балла ATS нет.',
                        'After downloading, check the PDF text: your name, contacts, dates, and section order. Follow the employer’s requested file format. There is no universal ATS score.',
                      )}
                    </p>
                    <a
                      href="https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Greenhouse: resume parsing ↗
                    </a>
                    <a
                      href="https://cloudfront.careeronestop.org/JobSearch/Resumes/ResumeGuide/formatting.aspx"
                      target="_blank"
                      rel="noreferrer"
                    >
                      CareerOneStop: formatting ↗
                    </a>
                  </details>
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
                      {t('Показать скрытые подсказки', 'Show dismissed tips')}
                    </button>
                  )}
                  <div className="form-bottom">
                    <span>
                      {t(
                        'Пустые разделы не попадут в PDF',
                        'Empty sections stay out of your PDF',
                      )}
                    </span>
                    <button
                      className="button secondary"
                      onClick={() =>
                        steps.indexOf(section) < steps.length - 1
                          ? goSection(steps[steps.indexOf(section) + 1])
                          : ((focusSection.current = true), setTab('design'))
                      }
                    >
                      {steps.indexOf(section) < steps.length - 1
                        ? t('Далее', 'Next')
                        : t('К оформлению', 'Choose a design')}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <p className="translation-note">
                    <Globe2 size={14} />
                    {t(
                      'RU / EN вверху переключает версии. Перевод заполняется вручную.',
                      'RU / EN above switches versions. Translations are entered manually.',
                    )}
                  </p>
                </>
              )}
            </>
          )}
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
            aria-valuenow={Math.round(
              formWidth || form.current?.getBoundingClientRect().width || 0,
            )}
            aria-valuemin={320}
            tabIndex={0}
            title={t(
              'Потяните, чтобы изменить ширину. Двойной клик — сброс.',
              'Drag to resize. Double-click to reset.',
            )}
            onPointerDown={startResize}
            onKeyDown={resizeWithKeys}
            onDoubleClick={() => changeFormWidth(null)}
          />
          <div className="preview-heading">
            <span>
              <Eye size={16} />
              {t('Живой просмотр', 'Live preview')}
            </span>
            <span>
              {templates.find((v) => v.id === doc.template)?.name}
              <span className="preview-tag">PDF</span>
            </span>
          </div>
          <Suspense
            fallback={
              <div className="loading">
                <LoaderCircle className="spin" />
                {t('Готовим просмотр…', 'Preparing preview…')}
              </div>
            }
          >
            <Preview doc={doc} />
          </Suspense>
          <div className="preview-footnote">
            <LockKeyhole size={13} />
            {t(
              'Без водяных знаков. Без оплаты за скачивание.',
              'No watermarks. No paywall at download.',
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
