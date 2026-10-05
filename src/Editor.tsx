import {
  cloneElement,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Download,
  Eye,
  FileText,
  Globe2,
  GraduationCap,
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
  Languages,
  PanelLeft,
  GripVertical,
  Palette,
  RotateCcw,
  Sparkles,
  SquarePen,
  MessageSquareWarning,
  CircleHelp,
} from 'lucide-react'
import {
  accents,
  createDocument,
  emptyEntry,
  sectionLabels,
  sections,
  safeUrl,
  safeEmailUrl,
  pdfMetadata,
  emptyPdfMeta,
  textSizes,
  textSizePoints,
  plainText,
  locales,
  localeNames,
  isEmptyVersion,
  sharedBasics,
  sharedEntryFields,
  templateOrder,
  type BodySection,
  type EntrySection,
  type Locale,
  type Resume,
  type Section,
  type ResumeDocument,
} from './model'
import {
  ContentLang,
  MiniResume,
  FormField,
  templates,
  Dialog,
} from './components'
import { Select } from './ui/components/select/select'
import { Switch } from './ui/components/switch/switch'
import EntryCard from './EntryCard'
import { translator } from './i18n'
import { preparePhoto } from './photo'
import {
  canAnimate,
  Collapse,
  Disclosure,
  useLingering,
  useMediaQuery,
} from './motion'
import { ReviewStep, WritingGuide } from './Coach'
import { SkillsField } from './SkillsField'
import { LanguageFields } from './LanguageFields'
import {
  EditorGuide,
  GuideTip,
  guideStep,
  tourTopics,
  useOnboarding,
  type GuideTopic,
} from './Onboarding'
import { languageName, proficiency } from './suggestions'
import { reviewResume } from './writing'
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
type Step = 'design' | Section | 'review'
// A template comes first: people pick a look, then fill in the content.
const steps: Step[] = ['design', ...sections, 'review']
/** Steps that can be left out of the resume; personal details always stay. */
const hideable = (step: Step): step is BodySection =>
  step !== 'design' && step !== 'review' && step !== 'basics'
const entrySections = ['work', 'education', 'projects', 'languages'] as const
const isEntrySection = (step: Step): step is EntrySection =>
  (entrySections as readonly Step[]).includes(step)
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
  doc: ResumeDocument
  locale: Locale
  update: (doc: ResumeDocument, group?: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  saveState: string
  exporting: boolean
  exportFile: () => void
  openFile: () => void
  start: () => void
  startOwn: () => void
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
  startOwn,
  backup,
}: EditorProps) {
  const [section, setSection] = useState<Step>(() =>
      doc.sample || isEmptyVersion(doc.versions[doc.language])
        ? 'design'
        : 'basics',
    ),
    [sidebarHidden, setSidebarHidden] = useState(
      () => readSetting('neatcv-sidebar') === 'hidden',
    ),
    [formHidden, setFormHidden] = useState(
      () => readSetting('neatcv-form-hidden') === 'hidden',
    ),
    [widthOverride, setWidthOverride] = useState<string | null>(null),
    desktop = useMediaQuery('(min-width: 1050px)'),
    mobile = useMediaQuery('(max-width: 1049px)'),
    [resizing, setResizing] = useState(false),
    [formWidth, setFormWidth] = useState<number | null>(
      () => Number(readSetting('neatcv-form-width')) || null,
    ),
    [activeEntry, setActiveEntry] = useState<string | null>(null),
    [freshEntry, setFreshEntry] = useState<string | null>(null),
    [mobilePreview, setMobilePreview] = useState(false),
    [mobileSteps, setMobileSteps] = useState(false),
    [menu, setMenu] = useState(false),
    [entryAnnouncement, setEntryAnnouncement] = useState(''),
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
  const onboarding = useOnboarding()
  const [guideOpen, setGuideOpen] = useState(false)
  const referenceView = useLingering(guideOpen, guideOpen)
  const pickerView = useLingering(mobileSteps, mobileSteps && !desktop)
  const [tourIndex, setTourIndex] = useState<number | null>(null)
  const pendingTour = useRef<number | null>(null)
  const guideOpener = useRef<HTMLButtonElement>(null)
  const pendingGuideTopic = useRef<GuideTopic | null>(null)
  const t = translator(locale),
    // The interface language (locale) and the resume version (lang) are independent.
    lang = doc.language,
    resume = doc.versions[lang],
    labels = sectionLabels[locale],
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
    isHidden = (step: Step) =>
      hideable(step) && doc.hiddenSections.includes(step),
    reviewChecks = useMemo(
      () => reviewResume(resume, locale, lang),
      [resume, locale, lang],
    ),
    reviewScore =
      reviewChecks.filter((c) => c.ok).length / (reviewChecks.length || 1),
    // Every row in the step list can earn a check, so the count matches the list.
    stepDone = (step: Step) =>
      step === 'design'
        ? Boolean(doc.templateChosen)
        : step === 'review'
          ? reviewScore >= 0.85
          : (completedSections as Step[]).includes(step),
    countedSteps = steps.filter((step) => !isHidden(step)),
    completed = countedSteps.filter(stepDone).length,
    totalSteps = countedSteps.length
  const currentDocument = useRef(doc)
  currentDocument.current = doc
  const currentSection = useRef(section)
  currentSection.current = section
  const form = useRef<HTMLElement>(null),
    menuButton = useRef<HTMLButtonElement>(null),
    menuPanel = useRef<HTMLDivElement>(null),
    focusSection = useRef(false),
    pendingEntry = useRef<{ id: string; field: boolean } | null>(null)
  function goSection(next: Step, reveal = false) {
    onboarding.request(null)
    setTourIndex(null)
    setMobileSteps(false)
    setMobilePreview(false)
    if (
      reveal &&
      next !== 'basics' &&
      next !== 'summary' &&
      next !== 'skills' &&
      next !== 'review' &&
      next !== 'design'
    ) {
      setCollapsed((current) => {
        const expanded = new Set(current)
        resume[next].forEach((e) => expanded.delete(`${next}:${e.id}`))
        return expanded
      })
    }
    focusSection.current = true
    toggleForm(false)
    if (section === 'design' && next !== 'design' && !doc.templateChosen)
      update({ ...doc, templateChosen: true })
    setSection(next)
    if (section === next) focusForm()
  }
  function openGuide() {
    const opener =
      (desktop && formHidden) || (mobile && mobilePreview)
        ? menuButton
        : guideOpener
    opener.current?.focus({ preventScroll: true })
    onboarding.request(null)
    setTourIndex(null)
    setGuideOpen(true)
  }
  function showGuideTopic(topic: GuideTopic, index: number | null = null) {
    setMobileSteps(false)
    setMenu(false)
    if (topic === 'preview') {
      setMobilePreview(true)
      if (desktop) toggleForm(true)
    } else {
      goSection(guideStep[topic])
      focusSection.current = false
      if (desktop && sidebarHidden) toggleSidebar()
    }
    setTourIndex(index)
    onboarding.request(topic)
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(guideAnchors[topic])
      target?.scrollIntoView?.({ block: 'center', behavior: 'instant' })
    })
  }
  useEffect(() => {
    if (referenceView.shown || !pendingGuideTopic.current) return
    const topic = pendingGuideTopic.current
    pendingGuideTopic.current = null
    const index = pendingTour.current
    pendingTour.current = null
    showGuideTopic(topic, index)
  }, [referenceView.shown])
  const tab = section === 'design' ? 'design' : 'content'
  function focusForm() {
    if (
      (desktop && formHidden) ||
      (mobile && mobilePreview) ||
      pickerView.shown ||
      referenceView.shown ||
      document.querySelector('dialog[open]')
    )
      return
    const heading = form.current?.querySelector('h1')
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView?.({ block: 'nearest' })
    focusSection.current = false
  }
  useEffect(() => {
    if (focusSection.current) focusForm()
  }, [
    section,
    tab,
    formHidden,
    mobilePreview,
    pickerView.shown,
    referenceView.shown,
  ])
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
    menuPanel.current
      ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      ?.focus()
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
  function mapVersions(change: (version: Resume) => Resume, source = doc) {
    return Object.fromEntries(
      locales.map((l) => [l, change(source.versions[l])]),
    ) as ResumeDocument['versions']
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
      ) as ResumeDocument['versions']
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
      ) as ResumeDocument['versions']
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
    setFreshEntry(e.id)
    update({
      ...doc,
      versions: mapVersions((version) => ({
        ...version,
        [section]: [...version[section], { ...e }],
      })),
    })
  }
  /** Writes per-version values into one entry, e.g. a language name in each language. */
  function entryEverywhere(
    section: EntrySection,
    id: string,
    values: (version: Locale) => Partial<Resume['work'][number]>,
    group: string,
  ) {
    const versions = Object.fromEntries(
      locales.map((l) => [
        l,
        {
          ...doc.versions[l],
          [section]: doc.versions[l][section].map((e) =>
            e.id === id ? { ...e, ...values(l) } : e,
          ),
        },
      ]),
    ) as ResumeDocument['versions']
    update({ ...doc, versions }, group)
  }
  function toggleHidden(step: BodySection) {
    const hidden = doc.hiddenSections.includes(step)
    update({
      ...doc,
      hiddenSections: hidden
        ? doc.hiddenSections.filter((h) => h !== step)
        : [...doc.hiddenSections, step],
    })
  }
  // A section with entries opens with one empty entry ready to fill,
  // instead of an empty state and an extra click.
  useEffect(() => {
    if (
      !isEntrySection(section) ||
      resume[section].length ||
      doc.hiddenSections.includes(section)
    )
      return
    const e = emptyEntry()
    update({
      ...doc,
      versions: mapVersions((version) => ({
        ...version,
        [section]: [...version[section], { ...e }],
      })),
    })
    // Only when a section is opened or shown again; deleting the last entry keeps it empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, isHidden(section)])
  function remove(section: EntrySection, id: string) {
    const current = currentDocument.current
    const entries = current.versions[current.language][section]
    const index = entries.findIndex((e) => e.id === id)
    if (index < 0) return
    const next = entries[index + 1] || entries[index - 1]
    if (currentSection.current === section)
      pendingEntry.current = { id: next?.id || '', field: false }
    const changed = {
      ...current,
      versions: mapVersions(
        (version) => ({
          ...version,
          [section]: version[section].filter((e) => e.id !== id),
        }),
        current,
      ),
    }
    currentDocument.current = changed
    update(changed)
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
  function toggleSidebar() {
    writeSetting('neatcv-sidebar', sidebarHidden ? null : 'hidden')
    setSidebarHidden(!sidebarHidden)
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
  const freezeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  /**
   * Keeps the form content at one width while its column animates, so the text
   * slides under the edge instead of re-wrapping on every frame.
   */
  function freezeForm(width: number) {
    const grid = body.current
    if (!grid) return
    clearTimeout(freezeTimer.current)
    grid.style.setProperty('--form-freeze', `${Math.round(width)}px`)
    grid.dataset.animating = 'form'
    freezeTimer.current = setTimeout(() => {
      delete grid.dataset.animating
      grid.style.removeProperty('--form-freeze')
    }, 360)
  }
  useEffect(() => () => clearTimeout(freezeTimer.current), [])
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
    freezeForm(Math.max(from, target))
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
      (sidebarHidden ? 0 : 212)
    let width = (free * 0.75) / 2
    if (free - width < 420) width = free - 420
    return Math.max(340, width)
  }
  function changeFormWidth(next: number | null, animate = true) {
    if (animate) animateForm(formHidden ? 0 : (next ?? standardWidth()))
    writeSetting('neatcv-form-width', next ? String(Math.round(next)) : null)
    setFormWidth(next)
  }
  const toggleFormRef = useRef(() => {})
  toggleFormRef.current = () => toggleForm()
  function toggleForm(hidden = !formHidden) {
    if (hidden === formHidden) return
    animateForm(hidden ? 0 : (formWidth ?? standardWidth()))
    writeSetting('neatcv-form-hidden', hidden ? 'hidden' : null)
    setFormHidden(hidden)
  }
  function widthLimits() {
    const total = body.current?.getBoundingClientRect().width || 1400
    return {
      min: 340,
      // Keep the preview the main thing: the form never takes over the screen.
      max: Math.max(
        340,
        Math.min(720, total - (sidebarHidden ? 0 : 212) - 520),
      ),
    }
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
        freezeForm(width)
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
      writeSetting('neatcv-form-hidden', hidden ? 'hidden' : null)
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
  const checkEmail = (v: string) =>
      safeEmailUrl(v)
        ? undefined
        : t(
            'Нужны @ и домен, например name@mail.com.',
            'Use @ and a domain, like name@mail.com.',
          ),
    checkPhone = (v: string) =>
      /^[+\d\s().-]+$/.test(v.trim()) && (v.match(/\d/g)?.length ?? 0) >= 6
        ? undefined
        : t(
            'Укажите номер телефона минимум из шести цифр.',
            'Use a phone number with at least six digits.',
          ),
    checkUrl = (v: string) =>
      safeUrl(v)
        ? undefined
        : t(
            'Нужна веб-ссылка, например linkedin.com/in/name.',
            'Use a web address, like linkedin.com/in/name.',
          )
  const contactKeyboard = {
    enterKeyHint: 'next' as const,
    autoCapitalize: 'none',
    spellCheck: false,
    onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
      if (
        event.key !== 'Enter' ||
        event.nativeEvent.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return
      event.preventDefault()
      const inputs = Array.from(
        event.currentTarget
          .closest('.editor-form')!
          .querySelectorAll<HTMLInputElement>(
            'input[name^="resume-"]:not(:disabled)',
          ),
      )
      const next = inputs[inputs.indexOf(event.currentTarget) + 1]
      if (next) next.focus()
      else event.currentTarget.blur()
    },
  }
  const stepIndex = steps.indexOf(section),
    // Back and Next skip the sections the person left out of the resume.
    prevStep = steps
      .slice(0, stepIndex)
      .reverse()
      .find((step) => !isHidden(step)),
    nextStep = steps.slice(stepIndex + 1).find((step) => !isHidden(step)),
    stepLabel = (step: Step) =>
      step === 'review'
        ? t('Проверка', 'Review')
        : step === 'design'
          ? t('Шаблон', 'Template')
          : labels[step]
  const guideAccess = (
    <div className="guide-access">
      <button
        ref={guideOpener}
        className="text-button guide-opener"
        aria-haspopup="dialog"
        onClick={openGuide}
      >
        <CircleHelp size={15} aria-hidden="true" />
        {t('Помощь по редактору', 'Editor guide')}
      </button>
    </div>
  )
  const guideAnchors: Record<GuideTopic, string> = {
    design:
      '.design-options button[aria-pressed="true"] > div:not(.mini-resume)',
    basics: 'input[name="resume-name"]',
    versions: '.site-header select',
    structure: '.guide-chip, .section-off button',
    skills: '.skills-field input, .section-off button',
    languages: '.level-chips, .section-off button',
    review: '.job-match textarea',
    preview: '.preview-modes button:last-child',
  }
  const inPreview = (mobile && mobilePreview) || (desktop && formHidden)
  const contextTopic: GuideTopic | null =
    onboarding.requested ??
    (inPreview
      ? 'preview'
      : section === 'design'
        ? doc.sample
          ? null
          : 'design'
        : section === 'basics'
          ? 'basics'
          : section === 'skills' ||
              section === 'languages' ||
              section === 'review'
            ? section
            : isHidden(section)
              ? null
              : 'structure')
  const contextTip =
    !guideOpen && contextTopic && onboarding.show(contextTopic) ? (
      <GuideTip
        key={`${contextTopic}:${tourIndex}`}
        topic={contextTopic}
        locale={locale}
        anchor={guideAnchors[contextTopic]}
        explicit={onboarding.requested !== null}
        paused={menu || pickerView.shown}
        index={tourIndex ?? undefined}
        back={
          tourIndex !== null && tourIndex > 0
            ? () => showGuideTopic(tourTopics[tourIndex - 1], tourIndex - 1)
            : undefined
        }
        dismiss={() => {
          if (tourIndex !== null) onboarding.setEnabled(false)
          else onboarding.dismiss(contextTopic)
          setTourIndex(null)
        }}
        help={openGuide}
        focusAfterDismiss={inPreview ? menuButton : guideOpener}
        primaryLabel={
          tourIndex !== null
            ? tourIndex === tourTopics.length - 1
              ? t('Скачать PDF', 'Download PDF')
              : t('Далее', 'Next')
            : contextTopic === 'design'
              ? t('Начать знакомство', 'Start walkthrough')
              : t('Понятно', 'Got it')
        }
        primary={() => {
          if (tourIndex !== null) {
            if (tourIndex === tourTopics.length - 1) {
              onboarding.setEnabled(false)
              setTourIndex(null)
              exportFile()
            } else showGuideTopic(tourTopics[tourIndex + 1], tourIndex + 1)
          } else if (contextTopic === 'design') showGuideTopic('design', 0)
          else {
            onboarding.dismiss(contextTopic)
            const target = document.querySelector<HTMLElement>(
              guideAnchors[contextTopic],
            )
            const control = target?.matches('button, input, textarea, select')
              ? target
              : (target?.closest<HTMLElement>('button') ??
                target?.querySelector<HTMLElement>('button'))
            control?.focus({ preventScroll: true })
          }
        }}
      />
    ) : null
  const contextView = useLingering(contextTip, Boolean(contextTip))
  const meta = pdfMetadata(doc)
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
  // On the template step an empty resume would show a blank page; show the
  // template with example text instead, so the choice is visible.
  const exampleVersion = useMemo(
      () => createDocument(true, lang).versions[lang],
      [lang],
    ),
    showExample = section === 'design' && emptyVersion,
    previewDoc = showExample
      ? {
          ...doc,
          versions: { ...doc.versions, [lang]: exampleVersion },
        }
      : doc
  const sectionOrderControls = (
    <>
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
      {(doc.sectionOrder.length > 0 || doc.hiddenSections.length > 0) && (
        <button
          className="text-button"
          onClick={() =>
            update({
              ...doc,
              sectionOrder: [],
              hiddenSections: [],
            })
          }
        >
          {t('Вернуть порядок шаблона', 'Reset to the template’s order')}
        </button>
      )}
    </>
  )
  const pdfControls = (
    <>
      <p className="form-description">
        {t(
          'Имя файла и свойства, которые видят программы и системы отбора. Пустые поля заполняются из резюме автоматически.',
          'The file name and the properties that apps and screening systems read. Empty fields are filled from your resume.',
        )}
      </p>
      {(
        [
          ['fileName', t('Имя файла', 'File name'), meta.fileName],
          ['title', t('Заголовок документа', 'Document title'), meta.title],
          ['author', t('Автор', 'Author'), meta.author],
          ['subject', t('Тема', 'Subject'), meta.subject],
          ['keywords', t('Ключевые слова', 'Keywords'), meta.keywords],
        ] as const
      ).map(([key, label, fallback]) => (
        <FormField
          key={key}
          label={label}
          value={doc.pdf[key]}
          multiline={key === 'keywords'}
          placeholder={fallback}
          hint={
            key === 'fileName'
              ? t(
                  'Без «.pdf» — расширение добавится само.',
                  'Without “.pdf” — it is added for you.',
                )
              : undefined
          }
          onChange={(v) =>
            update({ ...doc, pdf: { ...doc.pdf, [key]: v } }, `pdf:${key}`)
          }
        />
      ))}
      {Object.values(doc.pdf).some((v) => v.trim()) && (
        <button
          className="text-button"
          onClick={() => update({ ...doc, pdf: emptyPdfMeta() })}
        >
          {t('Вернуть автоматические значения', 'Use automatic values')}
        </button>
      )}
    </>
  )
  const stepNavigation = (
    <nav className="section-nav" aria-label={t('Шаги резюме', 'Resume steps')}>
      {steps.map((s, i) => {
        const Icon =
            s === 'review'
              ? ClipboardCheck
              : s === 'design'
                ? Palette
                : icons[s],
          label = stepLabel(s),
          hidden = isHidden(s),
          done = !hidden && stepDone(s)
        return (
          <div
            key={s}
            className={`section-row ${hidden ? 'is-off' : ''} ${s === 'review' ? 'review-row' : ''} ${s === 'design' ? 'design-row' : ''}`}
          >
            <button
              aria-pressed={section === s}
              className={`${section === s ? 'active' : ''} ${s === 'review' ? 'review-link' : ''} ${s === 'design' ? 'design-link' : ''}`}
              onClick={() => {
                goSection(s)
              }}
            >
              <Icon size={17} />
              <span title={label}>{label}</span>
              <small className={done ? 'section-complete' : ''}>
                {done ? (
                  <Check size={15} aria-label={t('Готово', 'Done')} />
                ) : (
                  `0${i + 1}`
                )}
              </small>
            </button>
            {hideable(s) && (
              <button
                className="section-eye"
                aria-pressed={!hidden}
                aria-label={t('«{section}» в резюме', '{section} in resume', {
                  section: label,
                })}
                title={
                  hidden
                    ? t('Показать в резюме', 'Show in resume')
                    : t('Скрыть из резюме', 'Hide from resume')
                }
                onClick={() => toggleHidden(s)}
              >
                {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </div>
        )
      })}
    </nav>
  )
  return (
    <div className="editor">
      <p className="visually-hidden" role="status">
        {entryAnnouncement}
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
        <div
          className="panel-toggles"
          role="group"
          aria-label={t('Панели', 'Panels')}
        >
          <button
            className="icon-button panel-toggle"
            onClick={toggleSidebar}
            aria-pressed={!sidebarHidden}
            aria-label={t('Разделы', 'Sections')}
            title={
              sidebarHidden
                ? t('Показать разделы', 'Show sections')
                : t('Скрыть разделы', 'Hide sections')
            }
          >
            <PanelLeft size={18} />
          </button>
          <button
            className="icon-button panel-toggle"
            onClick={() => toggleForm()}
            aria-pressed={!formHidden}
            aria-controls="editor-form"
            aria-label={t('Форма', 'Form')}
            title={
              formHidden
                ? t('Показать форму · Ctrl/⌘ \\', 'Show form · Ctrl/⌘ \\')
                : t('Скрыть форму · Ctrl/⌘ \\', 'Hide form · Ctrl/⌘ \\')
            }
            aria-keyshortcuts="Control+Backslash Meta+Backslash"
          >
            <SquarePen size={17} />
          </button>
        </div>
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
          {mobile && (
            <div className="mobile-menu-history">
              <button
                onClick={() => {
                  undo()
                  setMenu(false)
                }}
                disabled={!canUndo}
              >
                <Undo2 size={18} />
                {t('Отменить', 'Undo')}
              </button>
              <button
                onClick={() => {
                  redo()
                  setMenu(false)
                }}
                disabled={!canRedo}
              >
                <Redo2 size={18} />
                {t('Повторить', 'Redo')}
              </button>
            </div>
          )}
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
          <button
            onClick={() => {
              setMenu(false)
              openGuide()
            }}
          >
            <CircleHelp size={16} />
            {t('Помощь по редактору', 'Editor guide')}
          </button>
          <a
            href="https://github.com/MrNedNick/cv-studio/issues/new/choose"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenu(false)}
          >
            <MessageSquareWarning size={16} />
            {t('Сообщить о проблеме', 'Report a problem')}
          </a>
        </div>
      )}
      {contextView.shown &&
        contextView.value &&
        cloneElement(contextView.value, { closing: contextView.closing })}
      {referenceView.shown && (
        <EditorGuide
          closing={referenceView.closing}
          locale={locale}
          close={() => setGuideOpen(false)}
          enabled={onboarding.enabled}
          setEnabled={onboarding.setEnabled}
          reset={onboarding.reset}
          begin={() => {
            pendingGuideTopic.current = 'design'
            pendingTour.current = 0
            setGuideOpen(false)
          }}
          choose={(topic) => {
            pendingGuideTopic.current = topic
            setGuideOpen(false)
          }}
        />
      )}
      {pickerView.shown && !desktop && (
        <Dialog
          closing={pickerView.closing}
          title={t('Шаги резюме', 'Resume steps')}
          closeLabel={t('Закрыть', 'Close')}
          close={() => setMobileSteps(false)}
          className="mobile-steps-dialog"
        >
          <p className="mobile-completion">
            {t('Готово', 'Done')}: {completed} / {totalSteps}
          </p>
          {stepNavigation}
          <button
            className="text-button clear-all"
            onClick={() => {
              setMobileSteps(false)
              start()
            }}
          >
            <RotateCcw size={16} />
            {t('Очистить всё', 'Clear everything')}
          </button>
        </Dialog>
      )}
      <div className="mobile-view-switch">
        <button
          aria-pressed={!mobilePreview}
          className={!mobilePreview ? 'active' : ''}
          onClick={() => {
            setMobilePreview(false)
            onboarding.request(null)
            setTourIndex(null)
          }}
        >
          <PenLine size={16} />
          {t('Редактор', 'Editor')}
        </button>
        <button
          aria-pressed={mobilePreview}
          className={mobilePreview ? 'active' : ''}
          onClick={() => {
            setMobilePreview(true)
            onboarding.request(null)
            setTourIndex(null)
          }}
        >
          <Eye size={16} />
          {t('Просмотр', 'Preview')}
        </button>
        <button
          className="mobile-step-picker"
          aria-label={t('Шаги резюме', 'Resume steps')}
          aria-haspopup="dialog"
          aria-expanded={mobileSteps}
          onClick={(event) => {
            // Safari does not focus buttons on a tap; remember the dialog opener.
            event.currentTarget.focus()
            setMobileSteps(true)
          }}
          title={stepLabel(section)}
        >
          <ListChecks size={18} />
          <span>
            {stepIndex + 1} / {steps.length}
          </span>
        </button>
      </div>
      <div
        ref={body}
        className={`editor-body ${mobilePreview ? 'show-preview' : ''} ${sidebarHidden ? 'sidebar-hidden' : ''} ${formHidden ? 'form-hidden' : ''} ${resizing ? 'is-resizing' : ''}`}
        style={
          {
            '--sidebar-w': sidebarHidden ? '0px' : '212px',
            '--form-w':
              widthOverride ??
              (formHidden
                ? '0px'
                : formWidth
                  ? `${formWidth}px`
                  : 'minmax(340px, 0.75fr)'),
          } as CSSProperties
        }
      >
        <aside
          className="editor-sidebar"
          inert={sidebarHidden && desktop}
          aria-hidden={(sidebarHidden && desktop) || undefined}
        >
          {stepNavigation}
          <div className="sidebar-bottom">
            <div
              className="completion"
              title={t(
                'Готовые шаги; скрытые разделы не считаются',
                'Steps done; hidden sections are not counted',
              )}
            >
              <span>{t('Готово', 'Done')}</span>
              <strong>
                {completed} / {totalSteps}
              </strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${(completed / totalSteps) * 100}%` }} />
            </div>
            <button className="text-button clear-all" onClick={start}>
              <RotateCcw size={14} />
              {t('Очистить всё', 'Clear everything')}
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
          {doc.sample && (
            <div className="sample-banner" role="note">
              <Sparkles size={17} aria-hidden="true" />
              <p>
                <strong>{t('Это пример', 'This is an example')}</strong>
                {t(
                  'Посмотрите, как всё устроено, и начните своё резюме, когда будете готовы.',
                  'Look around, then start your own resume whenever you are ready.',
                )}
              </p>
              <button className="button primary" onClick={startOwn}>
                {t('Начать своё', 'Start my own')}
              </button>
              <button
                className="icon-button"
                aria-label={t('Оставить пример', 'Keep the example')}
                title={t('Оставить пример', 'Keep the example')}
                onClick={() => update({ ...doc, sample: false })}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <ContentLang.Provider value={lang}>
            <div key={`${tab}:${section}`} className="step-enter">
              {section === 'design' ? (
                <>
                  <div className="form-step">
                    <div className="eyebrow">
                      {t('ШАГ', 'STEP')} 01 / 0{steps.length}
                    </div>
                    {guideAccess}
                  </div>
                  <h1 tabIndex={-1}>{t('Шаблон', 'Template')}</h1>
                  <p className="form-description">
                    {t(
                      'Выберите вид резюме. Его можно сменить в любой момент — текст останется на месте.',
                      'Choose how your resume looks. You can switch at any time — your text stays.',
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
                          update({
                            ...doc,
                            template: template.id,
                            templateChosen: true,
                          })
                        }
                      >
                        <MiniResume template={template.id} locale={lang} />
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
                  <h2 className="design-subhead">
                    {t('Цвет и текст', 'Color and type')}
                  </h2>
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
                  <div className="control-block">
                    <h2 className="control-heading" id="size-heading">
                      {t('Размер текста', 'Text size')}
                    </h2>
                    <div
                      className="segmented"
                      role="group"
                      aria-labelledby="size-heading"
                    >
                      {textSizes.map((size) => (
                        <button
                          key={size}
                          aria-pressed={doc.textSize === size}
                          onClick={() => update({ ...doc, textSize: size })}
                          title={`${textSizePoints[size]} pt`}
                        >
                          <span
                            className="size-sample"
                            style={{
                              fontSize: `${10 + (textSizePoints[size] - 8.5) * 2.4}px`,
                            }}
                            aria-hidden="true"
                          >
                            Aa
                          </span>
                          <span className="visually-hidden">
                            {textSizePoints[size]} pt
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="control-block">
                    <h2 className="control-heading" id="typography-heading">
                      {t('Шрифт резюме', 'Resume typography')}
                    </h2>
                    <div
                      className="segmented"
                      role="group"
                      aria-labelledby="typography-heading"
                    >
                      {(
                        [
                          ['sans', t('Без засечек', 'Sans')],
                          ['serif', t('С засечками', 'Serif')],
                          ['mixed', t('Смешанный', 'Mixed')],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          aria-pressed={doc.typography === value}
                          onClick={() => update({ ...doc, typography: value })}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="control-block">
                    <h2 className="control-heading" id="density-heading">
                      {t('Плотность текста', 'Text density')}
                    </h2>
                    <div
                      className="segmented"
                      role="group"
                      aria-labelledby="density-heading"
                    >
                      {(
                        [
                          ['comfortable', t('Свободнее', 'Comfortable')],
                          ['compact', t('Компактнее', 'Compact')],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          aria-pressed={doc.density === value}
                          onClick={() => update({ ...doc, density: value })}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-step">
                    <div className="eyebrow">
                      {t('ШАГ', 'STEP')} 0{steps.indexOf(section) + 1} / 0
                      {steps.length}
                    </div>
                    {guideAccess}
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
                      />
                      <Disclosure
                        className="review-settings"
                        summary={t(
                          'Порядок и видимость разделов',
                          'Section order and visibility',
                        )}
                      >
                        {sectionOrderControls}
                      </Disclosure>
                      <Disclosure
                        className="review-settings"
                        summary={t('Свойства файла PDF', 'PDF file properties')}
                      >
                        {pdfControls}
                      </Disclosure>
                    </>
                  ) : (
                    <>
                      <div className="section-head">
                        <h1 tabIndex={-1}>{labels[section]}</h1>
                        {hideable(section) && (
                          <div className="switch-row">
                            <Switch
                              className="ui-switch"
                              checked={!isHidden(section)}
                              onChange={() => toggleHidden(section)}
                              label={t('В резюме', 'In resume')}
                            />
                          </div>
                        )}
                      </div>
                      <p className="form-description">{subtitles[section]}</p>
                      <Collapse open={isHidden(section)}>
                        <div className="section-off" role="note">
                          <EyeOff size={17} aria-hidden="true" />
                          <p>
                            {t(
                              'Раздел скрыт и не попадёт в PDF. Всё, что вы ввели, сохранено.',
                              'This section is hidden and won’t appear in your PDF. What you entered is kept.',
                            )}
                          </p>
                          <button
                            className="button secondary"
                            onClick={() => toggleHidden(section as BodySection)}
                          >
                            {t('Показать', 'Show it')}
                          </button>
                        </div>
                      </Collapse>
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
                              <Select
                                className="ui-select"
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
                              </Select>
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
                      <Collapse open={!isHidden(section)}>
                        <fieldset className="section-fields">
                          {section === 'basics' ? (
                            <>
                              <div className="photo-field">
                                <div
                                  className="photo-preview"
                                  aria-hidden="true"
                                >
                                  {doc.photo ? (
                                    <img src={doc.photo} alt="" />
                                  ) : (
                                    <UserRound size={26} />
                                  )}
                                </div>
                                <div>
                                  <strong>
                                    {t(
                                      'Фото (необязательно)',
                                      'Photo (optional)',
                                    )}
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
                                {...contactKeyboard}
                                name="resume-name"
                                autoComplete="name"
                                autoCapitalize="words"
                                label={t('Имя и фамилия', 'Full name')}
                                value={resume.basics.name}
                                onChange={(v) => basic('name', v)}
                                placeholder={t(
                                  'Как к вам обращаться?',
                                  'Your full name',
                                )}
                              />
                              <FormField
                                {...contactKeyboard}
                                name="resume-job-title"
                                autoComplete="organization-title"
                                autoCapitalize="words"
                                spellCheck
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
                                  {...contactKeyboard}
                                  name="resume-email"
                                  autoComplete="email"
                                  inputMode="email"
                                  label={t('Электронная почта', 'Email')}
                                  value={resume.basics.email}
                                  onChange={(v) => basic('email', v)}
                                  type="email"
                                  placeholder="you@example.com"
                                  validate={checkEmail}
                                />
                                <FormField
                                  {...contactKeyboard}
                                  name="resume-phone"
                                  autoComplete="tel"
                                  inputMode="tel"
                                  label={t('Телефон', 'Phone')}
                                  value={resume.basics.phone}
                                  onChange={(v) => basic('phone', v)}
                                  type="tel"
                                  placeholder="+49 …"
                                  validate={checkPhone}
                                />
                              </div>
                              <FormField
                                {...contactKeyboard}
                                name="resume-location"
                                autoComplete="off"
                                autoCapitalize="words"
                                label={t('Город и страна', 'City and country')}
                                value={resume.basics.location}
                                onChange={(v) => basic('location', v)}
                                placeholder={t(
                                  'Например, Берлин, Германия',
                                  'e.g. Berlin, Germany',
                                )}
                              />
                              <FormField
                                {...contactKeyboard}
                                name="resume-website"
                                autoComplete="url"
                                inputMode="url"
                                label={t(
                                  'Сайт или портфолио',
                                  'Website or portfolio',
                                )}
                                value={resume.basics.url}
                                onChange={(v) => basic('url', v)}
                                placeholder="https://…"
                                validate={checkUrl}
                                hint={t(
                                  'Необязательные поля можно оставить пустыми — они не попадут в PDF.',
                                  'Leave optional fields blank — they won’t appear in your PDF.',
                                )}
                              />
                              <FormField
                                {...contactKeyboard}
                                name="resume-linkedin"
                                autoComplete="off"
                                inputMode="url"
                                label="LinkedIn"
                                value={resume.basics.linkedin}
                                onChange={(v) => basic('linkedin', v)}
                                placeholder="linkedin.com/in/your-name"
                                validate={checkUrl}
                              />
                              <FormField
                                {...contactKeyboard}
                                name="resume-github"
                                autoComplete="off"
                                inputMode="url"
                                enterKeyHint="done"
                                label="GitHub"
                                value={resume.basics.github}
                                onChange={(v) => basic('github', v)}
                                placeholder="github.com/your-name"
                                validate={checkUrl}
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
                            <SkillsField
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
                              locale={locale}
                              lang={lang}
                              jobTitle={resume.basics.label}
                            />
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
                                      const allCollapsed = resume[
                                        section
                                      ].every((e) =>
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
                                  title={
                                    e.title || `${labels[section]} ${i + 1}`
                                  }
                                  locale={locale}
                                  contentLocale={lang}
                                  fresh={freshEntry === e.id}
                                  expanded={
                                    !collapsed.has(`${section}:${e.id}`)
                                  }
                                  toggle={() => toggleEntry(e.id)}
                                  moveUp={
                                    i > 0
                                      ? () => move(section, i, -1)
                                      : undefined
                                  }
                                  moveDown={
                                    i < resume[section].length - 1
                                      ? () => move(section, i, 1)
                                      : undefined
                                  }
                                  remove={() => remove(section, e.id)}
                                >
                                  {section === 'languages' ? (
                                    <LanguageFields
                                      entry={e}
                                      locale={locale}
                                      lang={lang}
                                      pickLanguage={(code) =>
                                        entryEverywhere(
                                          section,
                                          e.id,
                                          (l) => ({
                                            title: languageName(code, l),
                                          }),
                                          `languages:${e.id}:title`,
                                        )
                                      }
                                      pickLevel={(index) =>
                                        entryEverywhere(
                                          section,
                                          e.id,
                                          (l) => ({
                                            subtitle: proficiency[l][index],
                                          }),
                                          `languages:${e.id}:level`,
                                        )
                                      }
                                      setTitle={(v) =>
                                        entry(section, e.id, 'title', v)
                                      }
                                      setLevel={(v) =>
                                        entry(section, e.id, 'subtitle', v)
                                      }
                                    />
                                  ) : (
                                    <>
                                      <FormField
                                        label={
                                          section === 'work'
                                            ? t('Должность', 'Job title')
                                            : section === 'education'
                                              ? t(
                                                  'Специальность / степень',
                                                  'Degree / field of study',
                                                )
                                              : t(
                                                  'Название проекта',
                                                  'Project name',
                                                )
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
                                              ? t(
                                                  'Учебное заведение',
                                                  'Institution',
                                                )
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
                                    </>
                                  )}
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
                                            validate={(v) =>
                                              e.startDate && v < e.startDate
                                                ? t(
                                                    'Окончание раньше начала.',
                                                    'This is before the start date.',
                                                  )
                                                : undefined
                                            }
                                          />
                                        )}
                                      </div>
                                      <div className="switch-row">
                                        <Switch
                                          className="ui-switch"
                                          checked={e.current}
                                          onChange={(event) =>
                                            entry(
                                              section,
                                              e.id,
                                              'current',
                                              event.target.checked,
                                            )
                                          }
                                          label={t(
                                            'По настоящее время',
                                            'Present',
                                          )}
                                        />
                                      </div>
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
                                          validate={checkUrl}
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
                                  <p>
                                    {t('Здесь пока пусто', 'Nothing here yet')}
                                  </p>
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
                        </fieldset>
                      </Collapse>
                    </>
                  )}
                </>
              )}
            </div>
          </ContentLang.Provider>
          <footer className={`form-footer ${prevStep ? '' : 'no-back'}`}>
            {
              <>
                {/* The first step has nowhere to go back to; Next gets the room. */}
                {prevStep && (
                  <button
                    className="button secondary"
                    onClick={() => goSection(prevStep)}
                    aria-label={`${t('Назад', 'Back')}: ${stepLabel(prevStep)}`}
                  >
                    <ChevronLeft size={16} />
                    <span className="step-long">{stepLabel(prevStep)}</span>
                    <span className="step-short">{t('Назад', 'Back')}</span>
                  </button>
                )}
                <span className="form-footer-step" aria-hidden="true">
                  {stepIndex + 1} / {steps.length}
                </span>
                {section === 'review' || !nextStep ? (
                  <button
                    className="button primary"
                    onClick={exportFile}
                    disabled={exporting}
                  >
                    <Download size={16} />
                    {t('Скачать PDF', 'Download PDF')}
                  </button>
                ) : (
                  <button
                    className="button primary"
                    onClick={() => goSection(nextStep)}
                    aria-label={`${t('Далее', 'Next')}: ${stepLabel(nextStep)}`}
                  >
                    <span className="step-long">{stepLabel(nextStep)}</span>
                    <span className="step-short">{t('Далее', 'Next')}</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </>
            }
          </footer>
        </section>
        <section
          className="preview-panel"
          aria-label={t('Предпросмотр резюме', 'Resume preview')}
        >
          {((desktop && formHidden) || (mobile && mobilePreview)) && (
            <h1 className="visually-hidden">
              {t('Предпросмотр резюме', 'Resume preview')}
            </h1>
          )}
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
          >
            <span className="resizer-grip" aria-hidden="true">
              <GripVertical size={14} />
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
            {showExample && (!mobile || mobilePreview) && (
              <p className="preview-example" role="note">
                <Sparkles size={14} aria-hidden="true" />
                {t(
                  'Пример текста — ваш текст появится вместо него',
                  'Example text — your own text will replace it',
                )}
              </p>
            )}
            {(!mobile || mobilePreview) && (
              <Preview
                doc={previewDoc}
                locale={locale}
                goSection={(next) => goSection(next, true)}
              />
            )}
          </Suspense>
        </section>
      </div>
    </div>
  )
}
