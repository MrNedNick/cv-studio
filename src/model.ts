export type Locale = 'ru' | 'en'
export type Template = 'modern' | 'classic' | 'compact' | 'sidebar'
export type Section =
  | 'basics'
  | 'summary'
  | 'work'
  | 'education'
  | 'skills'
  | 'projects'
  | 'languages'
export type EntrySection = Exclude<Section, 'basics' | 'summary' | 'skills'>
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
    summary: string
  }
  work: Entry[]
  education: Entry[]
  projects: Entry[]
  languages: Entry[]
  skills: string
}
export interface StudioDocument {
  schemaVersion: 1
  language: Locale
  template: Template
  accent: string
  typography: 'sans' | 'serif' | 'mixed'
  density: 'comfortable' | 'compact'
  versions: Record<Locale, Resume>
}
export const accents = ['#24594b', '#284c78', '#7b3d50', '#584689', '#333c40']
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
      summary: '',
    },
    work: [],
    education: [],
    projects: [],
    languages: [],
    skills: '',
  }
}
export function createDocument(sample = false): StudioDocument {
  const ru = emptyResume(),
    en = emptyResume()
  if (sample) {
    ru.basics = {
      name: 'Александра Морозова',
      label: 'Продуктовый дизайнер',
      email: 'alex@example.com',
      phone: '',
      location: 'Прага, Чехия',
      url: 'https://example.com',
      summary:
        'Создаю понятные цифровые продукты — от первого исследования до запуска. Соединяю потребности людей и задачи бизнеса в простых, продуманных решениях.',
    }
    en.basics = {
      ...ru.basics,
      name: 'Alex Morgan',
      label: 'Product designer',
      location: 'Prague, Czechia',
      summary:
        'I turn complex problems into thoughtful digital experiences. From first insight to launch, I connect user needs with business goals through clear, considered design.',
    }
    ru.work = [
      {
        ...emptyEntry('work-1'),
        title: 'Продуктовый дизайнер',
        subtitle: 'Forma Studio',
        startDate: '2022-03',
        current: true,
        description:
          'Переработала оформление заказа и повысила конверсию на 24%.\nСоздала дизайн-систему из 60 компонентов для трёх продуктов.\nПровела 30 интервью и проверила гипотезы с командой разработки.',
      },
      {
        ...emptyEntry('work-2'),
        title: 'UX/UI-дизайнер',
        subtitle: 'North Digital',
        startDate: '2020-06',
        endDate: '2022-02',
        description:
          'Спроектировала личный кабинет для 12 000 пользователей.\nСократила время выполнения основного сценария на 35%.',
      },
    ]
    en.work = [
      {
        ...ru.work[0],
        title: 'Product designer',
        description:
          'Redesigned checkout, increasing conversion by 24%.\nBuilt a 60-component design system across three products.\nLed 30 user interviews and tested ideas with engineering.',
      },
      {
        ...ru.work[1],
        title: 'UX/UI designer',
        description:
          'Designed a dashboard for 12,000 customers.\nReduced time to complete key tasks by 35%.',
      },
    ]
    ru.education = [
      {
        ...emptyEntry('education-1'),
        title: 'Дизайн и визуальные коммуникации',
        subtitle: 'Университет прикладных искусств',
        startDate: '2016-09',
        endDate: '2020-06',
      },
    ]
    en.education = [
      {
        ...ru.education[0],
        title: 'BA, Visual communication',
        subtitle: 'University of Applied Arts',
      },
    ]
    ru.skills =
      'Figma, UX-исследования, Прототипирование, Дизайн-системы, HTML / CSS'
    en.skills = 'Figma, User research, Prototyping, Design systems, HTML / CSS'
    ru.languages = [
      { ...emptyEntry('language-1'), title: 'Русский', subtitle: 'Родной' },
      {
        ...emptyEntry('language-2'),
        title: 'Английский',
        subtitle: 'C1 — продвинутый',
      },
    ]
    en.languages = [
      { ...ru.languages[0], title: 'Russian', subtitle: 'Native' },
      { ...ru.languages[1], title: 'English', subtitle: 'C1 — advanced' },
    ]
  }
  return {
    schemaVersion: 1,
    language: 'ru',
    template: 'modern',
    accent: accents[0],
    typography: 'sans',
    density: 'comfortable',
    versions: { ru, en },
  }
}
const str = (value: unknown) =>
  typeof value === 'string' ? value.slice(0, 30000) : ''
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
function cleanResume(value: unknown): Resume {
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
    result[section] = (Array.isArray(input[section]) ? input[section] : [])
      .slice(0, 100)
      .map((item: unknown) => {
        const source = obj(item),
          entry = emptyEntry(str(source.id) || crypto.randomUUID())
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
export function parseDocument(input: unknown): StudioDocument {
  const wrapper = obj(input)
  const source = wrapper.cvStudio ? obj(wrapper.cvStudio) : wrapper
  if (source.cvStudio) throw new Error('Nested resume source')
  if (
    source.schemaVersion === 1 &&
    obj(source.versions).ru &&
    obj(source.versions).en
  ) {
    const result = createDocument()
    result.versions = {
      ru: cleanResume(obj(source.versions).ru),
      en: cleanResume(obj(source.versions).en),
    }
    result.language = source.language === 'en' ? 'en' : 'ru'
    result.template = ['modern', 'classic', 'compact', 'sidebar'].includes(
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
  result.versions.en = resume
  for (const key of ['email', 'phone', 'url'] as const)
    result.versions.ru.basics[key] = resume.basics[key]
  for (const section of [
    'work',
    'education',
    'projects',
    'languages',
  ] as const) {
    result.versions.ru[section] = resume[section].map((e) => ({
      ...emptyEntry(e.id),
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      url: e.url,
    }))
  }
  return result
}
export function toJsonResume(doc: StudioDocument) {
  const r = doc.versions[doc.language]
  return {
    $schema:
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: { ...r.basics, location: { city: r.basics.location } },
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
    entry.current
      ? locale === 'ru'
        ? 'настоящее время'
        : 'Present'
      : format(entry.endDate),
  ]
    .filter(Boolean)
    .join(' — ')
}
export interface ResumeTip {
  id: string
  section: Section
  message: string
}
export function getTips(resume: Resume, locale: Locale): ResumeTip[] {
  const tips: ResumeTip[] = [],
    ru = locale === 'ru'
  const add = (id: string, section: Section, a: string, b: string) =>
    tips.push({ id, section, message: ru ? a : b })
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
  if (resume.basics.url.trim() && !safeUrl(resume.basics.url))
    add(
      'url',
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
        `«${label}»: заполните пустую запись или удалите её.`,
        `${label}: fill in the empty entry or remove it.`,
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
        `«${label}»: окончание раньше начала. Проверьте даты.`,
        `${label}: an end date is before its start date. Check the dates.`,
      )
    if (
      resume[section].some((e) =>
        e.description.split('\n').some((line) => line.length > 300),
      )
    )
      add(
        `${section}-length`,
        section,
        `«${label}»: разбейте длинный абзац на короткие пункты.`,
        `${label}: split long paragraphs into shorter points.`,
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
  const passive = ru
    ? /^(обязанности|отвечал[аи]? за|участвовал[аи]? в|работал[аи]? над)\s/i
    : /^(responsible for|worked on|participated in|duties)\b/i
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
