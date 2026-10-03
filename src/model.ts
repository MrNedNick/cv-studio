import { samples } from './samples'
import { translate, type Vars } from './i18n'
export const locales = ['en', 'de', 'es', 'bg', 'uk', 'ru'] as const
export type Locale = (typeof locales)[number]
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
  es: 'Español',
  bg: 'Български',
  uk: 'Українська',
}
export const isLocale = (value: unknown): value is Locale =>
  locales.includes(value as Locale)
/** Contact details shared by every language version. */
export const sharedBasics = [
  'email',
  'phone',
  'url',
  'linkedin',
  'github',
] as const
/** Entry fields shared by every language version. */
export const sharedEntryFields = [
  'startDate',
  'endDate',
  'current',
  'url',
] as const
export const templateIds = [
  'modern',
  'classic',
  'compact',
  'technical',
  'executive',
  'spotlight',
  'swiss',
  'timeline',
  'minimal',
  'bold',
  'ivy',
  'sidebar',
] as const
export type Template = (typeof templateIds)[number]
export type Section =
  | 'basics'
  | 'summary'
  | 'work'
  | 'education'
  | 'skills'
  | 'projects'
  | 'languages'
export type EntrySection = Exclude<Section, 'basics' | 'summary' | 'skills'>
export type BodySection = Exclude<Section, 'basics'>
export const bodySections: BodySection[] = [
  'summary',
  'work',
  'education',
  'skills',
  'projects',
  'languages',
]
export interface Entry {
  id: string
  title: string
  subtitle: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  url: string
}
export interface Resume {
  basics: {
    name: string
    label: string
    email: string
    phone: string
    location: string
    url: string
    linkedin: string
    github: string
    summary: string
  }
  work: Entry[]
  education: Entry[]
  projects: Entry[]
  languages: Entry[]
  skills: string
}
export interface ResumeDocument {
  schemaVersion: 1
  language: Locale
  template: Template
  accent: string
  typography: 'sans' | 'serif' | 'mixed'
  density: 'comfortable' | 'compact'
  /** Body text size of the PDF. */
  textSize: TextSize
  /** Advanced: overrides for the PDF file; empty fields use the resume text. */
  pdf: PdfMeta
  /** Custom section order; empty means the template's own order. */
  sectionOrder: BodySection[]
  hiddenSections: BodySection[]
  /** The built-in fictional example, until the person starts their own. */
  sample?: boolean
  /** The person confirmed a template (picked one or moved past the first step). */
  templateChosen?: boolean
  /** Optional portrait as a small JPEG or PNG data URL, shared by both languages. */
  photo: string
  versions: Record<Locale, Resume>
}
export const textSizes = ['xs', 's', 'm', 'l', 'xl'] as const
export type TextSize = (typeof textSizes)[number]
/** Body size in points for each text size. */
export const textSizePoints: Record<TextSize, number> = {
  xs: 8.5,
  s: 9.25,
  m: 10,
  l: 10.75,
  xl: 11.5,
}
export interface PdfMeta {
  fileName: string
  title: string
  author: string
  subject: string
  keywords: string
}
export const emptyPdfMeta = (): PdfMeta => ({
  fileName: '',
  title: '',
  author: '',
  subject: '',
  keywords: '',
})
/** Metadata written into the PDF: overrides first, then the visible resume. */
export function pdfMetadata(doc: ResumeDocument) {
  const r = doc.versions[doc.language],
    o = doc.pdf
  const name = r.basics.name.trim()
  return {
    title: o.title.trim() || `${name || 'Resume'} — CV`,
    author: o.author.trim() || name,
    subject: o.subject.trim() || r.basics.label.trim(),
    keywords:
      o.keywords.trim() ||
      r.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', '),
    fileName:
      (
        o.fileName.trim() ||
        `${name || 'Resume'}-${doc.language.toUpperCase()}-CV`
      )
        .replace(/\.pdf$/i, '')
        .replace(/[\\/:*?"<>|]+/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 120) || 'Resume',
  }
}
export const accents = [
  '#24594b',
  '#284c78',
  '#7b3d50',
  '#584689',
  '#333c40',
  '#1f6f78',
  '#9a4a2f',
  '#1d3557',
  '#5b6b2f',
  '#6d2e64',
]
export const MAX_PHOTO_LENGTH = 400_000
export function validPhoto(value: unknown): string {
  return typeof value === 'string' &&
    value.length <= MAX_PHOTO_LENGTH &&
    /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
    ? value
    : ''
}
export const sections: Section[] = [
  'basics',
  'summary',
  'work',
  'education',
  'skills',
  'projects',
  'languages',
]
export const sectionLabels: Record<Locale, Record<Section, string>> = {
  ru: {
    basics: 'Личные данные',
    summary: 'О себе',
    work: 'Опыт работы',
    education: 'Образование',
    skills: 'Навыки',
    projects: 'Проекты',
    languages: 'Языки',
  },
  en: {
    basics: 'Personal details',
    summary: 'Profile',
    work: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    languages: 'Languages',
  },
  de: {
    basics: 'Persönliche Daten',
    summary: 'Profil',
    work: 'Berufserfahrung',
    education: 'Ausbildung',
    skills: 'Kenntnisse',
    projects: 'Projekte',
    languages: 'Sprachen',
  },
  es: {
    basics: 'Datos personales',
    summary: 'Perfil',
    work: 'Experiencia',
    education: 'Formación',
    skills: 'Habilidades',
    projects: 'Proyectos',
    languages: 'Idiomas',
  },
  bg: {
    basics: 'Лични данни',
    summary: 'Профил',
    work: 'Професионален опит',
    education: 'Образование',
    skills: 'Умения',
    projects: 'Проекти',
    languages: 'Езици',
  },
  uk: {
    basics: 'Особисті дані',
    summary: 'Про себе',
    work: 'Досвід роботи',
    education: 'Освіта',
    skills: 'Навички',
    projects: 'Проєкти',
    languages: 'Мови',
  },
}
const present: Record<Locale, string> = {
  en: 'Present',
  ru: 'настоящее время',
  de: 'heute',
  es: 'actualidad',
  bg: 'момента',
  uk: 'теперішній час',
}
export function emptyEntry(id: string = crypto.randomUUID()): Entry {
  return {
    id,
    title: '',
    subtitle: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    url: '',
  }
}
export function emptyResume(): Resume {
  return {
    basics: {
      name: '',
      label: '',
      email: '',
      phone: '',
      location: '',
      url: '',
      linkedin: '',
      github: '',
      summary: '',
    },
    work: [],
    education: [],
    projects: [],
    languages: [],
    skills: '',
  }
}
export function createDocument(
  sample = false,
  language: Locale = 'en',
): ResumeDocument {
  const versions = Object.fromEntries(
    locales.map((locale) => [
      locale,
      sample ? sampleResume(locale) : emptyResume(),
    ]),
  ) as Record<Locale, Resume>
  return {
    schemaVersion: 1,
    language,
    template: 'modern',
    accent: accents[0],
    typography: 'sans',
    density: 'comfortable',
    textSize: 'm',
    pdf: emptyPdfMeta(),
    sectionOrder: [],
    hiddenSections: [],
    photo: '',
    sample,
    templateChosen: sample,
    versions,
  }
}
function sampleResume(locale: Locale): Resume {
  const text = samples[locale],
    resume = emptyResume()
  resume.basics = {
    ...resume.basics,
    name: text.name,
    label: text.label,
    email: 'alex@example.com',
    phone: '+49 30 1234 5678',
    location: text.location,
    url: 'https://example.com',
    summary: text.summary,
  }
  resume.work = [
    {
      ...emptyEntry('work-1'),
      title: text.work[0][0],
      subtitle: 'Forma Studio GmbH',
      startDate: '2022-03',
      current: true,
      description: text.work[0][1],
    },
    {
      ...emptyEntry('work-2'),
      title: text.work[1][0],
      subtitle: 'Nordlicht Digital',
      startDate: '2020-06',
      endDate: '2022-02',
      description: text.work[1][1],
    },
  ]
  resume.education = [
    {
      ...emptyEntry('education-1'),
      title: text.education[0],
      subtitle: text.education[1],
      startDate: '2016-09',
      endDate: '2020-06',
    },
  ]
  resume.skills = text.skills
  resume.languages = text.languages.map(([title, subtitle], i) => ({
    ...emptyEntry(`language-${i + 1}`),
    title,
    subtitle,
  }))
  return resume
}
/**
 * A version with the shared details of `base` (contacts, dates, links) and
 * empty translatable text, so entries stay paired across languages.
 */
export function skeletonOf(base: Resume): Resume {
  const resume = emptyResume()
  for (const key of sharedBasics) resume.basics[key] = base.basics[key]
  for (const section of ['work', 'education', 'projects', 'languages'] as const)
    resume[section] = base[section].map((e) => ({
      ...emptyEntry(e.id),
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      url: e.url,
    }))
  return resume
}
/** True when a version has no text of its own yet. */
export function isEmptyVersion(resume: Resume) {
  return (
    !resume.basics.name.trim() &&
    !resume.basics.label.trim() &&
    !resume.basics.summary.trim() &&
    !resume.skills.trim() &&
    (['work', 'education', 'projects', 'languages'] as const).every((s) =>
      resume[s].every((e) => !e.title.trim() && !e.description.trim()),
    )
  )
}
const str = (value: unknown) =>
  typeof value === 'string' ? value.slice(0, 30000) : ''
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
/** `others` are the sibling versions: repaired IDs avoid every ID they use, so pairs stay aligned. */
function cleanResume(value: unknown, others: unknown[] = []): Resume {
  const input = obj(value),
    basics = obj(input.basics),
    result = emptyResume()
  for (const key of Object.keys(result.basics) as (keyof Resume['basics'])[])
    result.basics[key] = str(basics[key])
  result.skills = str(input.skills)
  for (const section of [
    'work',
    'education',
    'projects',
    'languages',
  ] as const) {
    const items = (Array.isArray(input[section]) ? input[section] : []).slice(
      0,
      100,
    )
    const reserved = new Set(
      [
        ...items,
        ...others.flatMap((other) => {
          const list = obj(other)[section]
          return Array.isArray(list) ? list.slice(0, 100) : []
        }),
      ]
        .map((item) => str(obj(item).id))
        .filter(Boolean),
    )
    const used = new Set<string>()
    result[section] = items.map((item: unknown) => {
      const source = obj(item),
        originalId = str(source.id) || crypto.randomUUID()
      let id = originalId,
        suffix = 2
      while (used.has(id)) {
        do {
          id = `${originalId}~${suffix++}`
        } while (reserved.has(id))
      }
      used.add(id)
      const entry = emptyEntry(id)
      for (const key of [
        'title',
        'subtitle',
        'startDate',
        'endDate',
        'description',
        'url',
      ] as const)
        entry[key] = str(source[key])
      entry.current = source.current === true
      return entry
    })
  }
  return result
}
export function parseDocument(input: unknown): ResumeDocument {
  const wrapper = obj(input)
  const source = wrapper.cvStudio ? obj(wrapper.cvStudio) : wrapper
  if (source.cvStudio) throw new Error('Nested resume source')
  const sourceVersions = obj(source.versions),
    stored = locales.filter((l) => sourceVersions[l])
  if (source.schemaVersion === 1 && stored.length) {
    const result = createDocument()
    // Older files have only ru/en; missing versions are skeletons of the first one.
    const siblings = (locale: Locale) =>
        stored.filter((l) => l !== locale).map((l) => sourceVersions[l]),
      base = cleanResume(sourceVersions[stored[0]], siblings(stored[0]))
    for (const locale of locales)
      result.versions[locale] = sourceVersions[locale]
        ? cleanResume(sourceVersions[locale], siblings(locale))
        : skeletonOf(base)
    result.language = isLocale(source.language) ? source.language : stored[0]
    result.template = (templateIds as readonly string[]).includes(
      str(source.template),
    )
      ? (source.template as Template)
      : 'modern'
    result.accent = accents.includes(str(source.accent))
      ? str(source.accent)
      : accents[0]
    result.typography =
      source.typography === 'serif' || source.typography === 'mixed'
        ? source.typography
        : 'sans'
    result.density = source.density === 'compact' ? 'compact' : 'comfortable'
    result.textSize = (textSizes as readonly string[]).includes(
      str(source.textSize),
    )
      ? (source.textSize as TextSize)
      : 'm'
    const meta = obj(source.pdf)
    result.pdf = {
      fileName: str(meta.fileName).slice(0, 120),
      title: str(meta.title).slice(0, 300),
      author: str(meta.author).slice(0, 300),
      subject: str(meta.subject).slice(0, 300),
      keywords: str(meta.keywords).slice(0, 2000),
    }
    const known = (value: unknown) =>
      Array.isArray(value)
        ? [...new Set(value)].filter((v): v is BodySection =>
            bodySections.includes(v as BodySection),
          )
        : []
    const order = known(source.sectionOrder)
    result.sectionOrder = order.length
      ? [...order, ...bodySections.filter((s) => !order.includes(s))]
      : []
    result.hiddenSections = known(source.hiddenSections)
    result.photo = validPhoto(source.photo)
    result.sample = source.sample === true
    result.templateChosen = source.templateChosen === true
    return result
  }
  if (
    source.schemaVersion !== undefined ||
    !source.basics ||
    !Object.keys(obj(source.basics)).some((key) =>
      ['name', 'label', 'email', 'summary'].includes(key),
    )
  )
    throw new Error('Unsupported resume')
  const resume = emptyResume(),
    b = obj(source.basics)
  for (const key of Object.keys(resume.basics) as (keyof Resume['basics'])[])
    resume.basics[key] = str(b[key])
  resume.basics.location = str(obj(b.location).city) || str(b.location)
  for (const profile of Array.isArray(b.profiles)
    ? b.profiles.slice(0, 100)
    : []) {
    const entry = obj(profile),
      network = str(entry.network).toLowerCase()
    if (network === 'linkedin' || network === 'github')
      resume.basics[network] = str(entry.url)
  }
  const mappings = {
    work: ['position', 'name'],
    education: ['studyType', 'institution'],
    projects: ['name', 'entity'],
    languages: ['language', 'fluency'],
  } as const
  for (const section of Object.keys(mappings) as EntrySection[]) {
    resume[section] = (Array.isArray(source[section]) ? source[section] : [])
      .slice(0, 100)
      .map((item: unknown) => {
        const entry = obj(item),
          [title, subtitle] = mappings[section]
        return {
          ...emptyEntry(),
          title:
            str(entry[title]) +
            (section === 'education' && entry.area
              ? ` · ${str(entry.area)}`
              : ''),
          subtitle: str(entry[subtitle]),
          startDate: str(entry.startDate).slice(0, 7),
          endDate: str(entry.endDate).slice(0, 7),
          current: section === 'work' && !!entry.startDate && !entry.endDate,
          description: [
            str(entry.summary) || str(entry.description),
            ...(Array.isArray(entry.courses) ? entry.courses.map(str) : []),
            ...(Array.isArray(entry.highlights)
              ? entry.highlights.map(str)
              : []),
          ]
            .filter(Boolean)
            .join('\n'),
          url: str(entry.url),
        }
      })
  }
  resume.skills = (Array.isArray(source.skills) ? source.skills : [])
    .flatMap((item: unknown) => {
      const skill = obj(item)
      return [
        str(skill.name),
        ...(Array.isArray(skill.keywords) ? skill.keywords.map(str) : []),
      ]
    })
    .filter(Boolean)
    .join(', ')
  const result = createDocument()
  result.language = 'en'
  for (const locale of locales)
    result.versions[locale] = locale === 'en' ? resume : skeletonOf(resume)
  return result
}
export function toJsonResume(doc: ResumeDocument) {
  const r = doc.versions[doc.language]
  return {
    $schema:
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: r.basics.name,
      label: r.basics.label,
      email: r.basics.email,
      phone: r.basics.phone,
      url: r.basics.url,
      summary: r.basics.summary,
      location: { city: r.basics.location },
      profiles: (['linkedin', 'github'] as const)
        .filter((key) => r.basics[key])
        .map((key) => ({
          network: key === 'github' ? 'GitHub' : 'LinkedIn',
          url: r.basics[key],
        })),
    },
    work: r.work.map((e) => ({
      name: e.subtitle,
      position: e.title,
      startDate: e.startDate,
      endDate: e.current ? '' : e.endDate,
      highlights: e.description.split('\n').filter(Boolean),
      url: e.url,
    })),
    education: r.education.map((e) => ({
      institution: e.subtitle,
      studyType: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      courses: e.description.split('\n').filter(Boolean),
    })),
    projects: r.projects.map((e) => ({
      name: e.title,
      entity: e.subtitle,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
      url: e.url,
    })),
    skills: [
      {
        name: 'Skills',
        keywords: r.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
    ],
    languages: r.languages.map((e) => ({
      language: e.title,
      fluency: e.subtitle,
    })),
    cvStudio: doc,
  }
}
export function safeUrl(url: string): string | undefined {
  try {
    const value = url.trim()
    if (
      !value ||
      (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value))
    )
      return undefined
    const parsed = new URL(value.includes('://') ? value : `https://${value}`)
    return ['https:', 'http:'].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password
      ? parsed.href
      : undefined
  } catch {
    return undefined
  }
}
export function dateRange(entry: Entry, locale: Locale) {
  const format = (value: string) => {
    if (!/^\d{4}-\d{2}$/.test(value)) return value
    const date = new Date(`${value}-01T12:00:00`)
    return Number.isNaN(+date)
      ? value
      : date.toLocaleDateString(locale, { month: 'short', year: 'numeric' })
  }
  return [
    format(entry.startDate),
    entry.current ? present[locale] : format(entry.endDate),
  ]
    .filter(Boolean)
    .join(' — ')
}
export interface ResumeTip {
  id: string
  section: Section
  message: string
}
/** Openers that describe duties instead of results, per resume language. */
export const weakStart: Record<Locale, RegExp> = {
  en: /^(responsible for|helped|assisted|worked on|participated in|involved in|duties included|tasked with)\b/i,
  ru: /^(отвечал[аи]? за|помогал[аи]?|занимал(?:ся|ась|ись)|участвовал[аи]?|работал[аи]? над|обязанности|в мои обязанности)(?=\s|:|$)/iu,
  de: /^(verantwortlich für|zuständig für|half|unterstützte|mitarbeit an|beteiligt an|aufgaben)(?=\s|:|$)/iu,
  es: /^(responsable de|encargad[oa] de|ayudé|ayudaba|colaboré en|participé en|tareas|funciones)(?=\s|:|$)/iu,
  bg: /^(отговарях за|отговорен за|отговорна за|помагах|участвах|занимавах се|задължения)(?=\s|:|$)/iu,
  uk: /^(відповідав|відповідала|допомагав|допомагала|займав(?:ся|ась)|займалася|брав участь|брала участь|обов[’']язки)(?=\s|:|$)/iu,
}
export function getTips(
  resume: Resume,
  locale: Locale,
  lang: Locale = locale,
): ResumeTip[] {
  const tips: ResumeTip[] = []
  const add = (
    id: string,
    section: Section,
    a: string,
    b: string,
    vars?: Vars,
  ) => tips.push({ id, section, message: translate(locale, a, b, vars) })
  if (!resume.basics.name.trim())
    add(
      'name',
      'basics',
      'Добавьте имя, чтобы резюме было легко найти.',
      'Add your name so your resume is easy to identify.',
    )
  if (!resume.basics.email.trim() && !resume.basics.phone.trim())
    add(
      'contact',
      'basics',
      'Добавьте почту или телефон для связи.',
      'Add an email or phone number so people can contact you.',
    )
  if (
    resume.basics.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.basics.email.trim())
  )
    add(
      'email',
      'basics',
      'Проверьте почту: адрес должен содержать @ и домен.',
      'Check your email: include @ and a domain.',
    )
  for (const key of ['url', 'linkedin', 'github'] as const)
    if (resume.basics[key].trim() && !safeUrl(resume.basics[key]))
      add(
        key,
        'basics',
        'Проверьте ссылку на сайт. Используйте адрес http или https.',
        'Check your website link. Use an http or https address.',
      )
  if (resume.basics.summary.length > 600)
    add(
      'summary-length',
      'summary',
      'Сократите раздел «О себе» до 2–4 предложений.',
      'Keep your profile to 2–4 focused sentences.',
    )
  for (const section of [
    'work',
    'education',
    'projects',
    'languages',
  ] as const) {
    const label = sectionLabels[locale][section]
    if (
      resume[section].some(
        (e) => !e.title.trim() && !e.subtitle.trim() && !e.description.trim(),
      )
    )
      add(
        `${section}-empty`,
        section,
        '«{label}»: заполните пустую запись или удалите её.',
        '{label}: fill in the empty entry or remove it.',
        { label },
      )
    if (
      resume[section].some(
        (e) =>
          e.startDate && e.endDate && !e.current && e.startDate > e.endDate,
      )
    )
      add(
        `${section}-dates`,
        section,
        '«{label}»: окончание раньше начала. Проверьте даты.',
        '{label}: an end date is before its start date. Check the dates.',
        { label },
      )
    if (
      resume[section].some((e) =>
        e.description.split('\n').some((line) => line.length > 300),
      )
    )
      add(
        `${section}-length`,
        section,
        '«{label}»: разбейте длинный абзац на короткие пункты.',
        '{label}: split long paragraphs into shorter points.',
        { label },
      )
  }
  if (
    resume.work.some((e) => e.description.trim() && !/\d/.test(e.description))
  )
    add(
      'work-results',
      'work',
      'Добавьте в опыт конкретный результат: цифру, срок или масштаб работы.',
      'Add measurable outcomes to your experience: numbers, time saved, or scale.',
    )
  const passive = weakStart[lang]
  if (
    resume.work.some((e) =>
      e.description
        .split('\n')
        .some((line) => passive.test(line.trim().replace(/^[•*–—-]\s*/, ''))),
    )
  )
    add(
      'work-verbs',
      'work',
      'Начните пункт с действия: «Запустила», «Улучшил», «Разработала» — и добавьте результат.',
      'Start with an action: “Launched”, “Improved”, “Built” — then add the outcome.',
    )
  return tips
}

export function templateOrder(template: Template): BodySection[] {
  return template === 'technical'
    ? ['summary', 'skills', 'work', 'education', 'projects', 'languages']
    : bodySections
}
/** Sections in reading order, without the ones the person chose to hide. */
export function visibleSections(doc: ResumeDocument): BodySection[] {
  return (
    doc.sectionOrder.length ? doc.sectionOrder : templateOrder(doc.template)
  ).filter((s) => !doc.hiddenSections.includes(s))
}
export function plainText(doc: ResumeDocument): string {
  const r = doc.versions[doc.language],
    labels = sectionLabels[doc.language],
    b = r.basics
  const head = [
    b.name,
    b.label,
    [b.location, b.email, b.phone].filter(Boolean).join(' · '),
    [b.url, b.linkedin, b.github].filter(Boolean).join(' · '),
  ].filter(Boolean)
  const blocks = visibleSections(doc).flatMap((section) => {
    if (section === 'summary')
      return b.summary.trim() ? [[labels.summary.toUpperCase(), b.summary]] : []
    if (section === 'skills') {
      const skills = r.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      return skills.length
        ? [[labels.skills.toUpperCase(), skills.join(', ')]]
        : []
    }
    const entries = r[section].filter(
      (e) => e.title || e.subtitle || e.description,
    )
    if (!entries.length) return []
    return [
      [
        labels[section].toUpperCase(),
        ...entries.map((e) =>
          [
            [e.title, e.subtitle].filter(Boolean).join(' — '),
            section === 'languages' ? '' : dateRange(e, doc.language),
            ...e.description
              .split('\n')
              .filter((line) => line.trim())
              .map((line) => (section === 'work' ? `• ${line.trim()}` : line)),
            e.url,
          ]
            .filter(Boolean)
            .join('\n'),
        ),
      ],
    ]
  })
  return [head.join('\n'), ...blocks.map((block) => block.join('\n\n'))]
    .join('\n\n')
    .trim()
    .concat('\n')
}
