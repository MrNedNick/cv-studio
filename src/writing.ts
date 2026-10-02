import {
  sectionLabels,
  weakStart,
  type Locale,
  type Resume,
  type Section,
} from './model'
import { translator } from './i18n'

/** Guidance text: Russian and English here, other languages via dictionaries. */
type Text = { ru: string; en: string }

export interface Guide {
  rules: Text[]
  before?: Text
  after?: Text
  pattern?: Text
}

// Writing guidance per section, condensed from recruiter guides and the
// practices shared by the major resume builders.
export const guides: Partial<Record<Section, Guide>> = {
  basics: {
    rules: [
      {
        en: 'Use the job title you are applying for, written the way vacancies write it.',
        ru: 'Укажите должность, на которую откликаетесь, — так, как её пишут в вакансиях.',
      },
      {
        en: 'Add LinkedIn and a portfolio or GitHub link. Recruiters open them before calling.',
        ru: 'Добавьте LinkedIn и ссылку на портфолио или GitHub — их открывают до звонка.',
      },
      {
        en: 'City and country are enough. A full street address is not needed.',
        ru: 'Достаточно города и страны. Полный адрес не нужен.',
      },
    ],
  },
  summary: {
    rules: [
      {
        en: 'Three sentences: who you are, your strongest proof, what you want next.',
        ru: 'Три предложения: кто вы, главное доказательство, что ищете дальше.',
      },
      {
        en: 'Include one result with a number.',
        ru: 'Добавьте один результат с цифрой.',
      },
      {
        en: 'Skip “I” and clichés like “team player” or “hard-working”.',
        ru: 'Без «я» и штампов вроде «коммуникабельный» или «стрессоустойчивый».',
      },
    ],
    before: {
      en: 'Hard-working team player looking for new challenges.',
      ru: 'Ответственный и коммуникабельный специалист, ищу интересную работу.',
    },
    after: {
      en: 'Frontend engineer with 6 years in Vue and React. Cut page load time by 45% for 2M monthly users. Looking for a product team building complex interfaces.',
      ru: 'Фронтенд-разработчик, 6 лет на Vue и React. Ускорил загрузку страниц на 45% для 2 млн пользователей в месяц. Ищу продуктовую команду со сложными интерфейсами.',
    },
    pattern: {
      en: '[Job title] with [N] years of experience in [field]. [Strongest result with a number]. Looking for [the role or team you want].',
      ru: '[Должность], [N] лет опыта в [область]. [Главный результат с цифрой]. Ищу [какую роль или команду].',
    },
  },
  work: {
    rules: [
      {
        en: 'Most recent job first. 3–6 points for recent roles, 2–3 for older ones.',
        ru: 'Сначала последнее место работы. 3–6 пунктов для недавних ролей, 2–3 для старых.',
      },
      {
        en: 'Formula: action verb + what you did + measurable result (Google’s X‑Y‑Z).',
        ru: 'Формула: глагол действия + что сделали + измеримый результат (X‑Y‑Z от Google).',
      },
      {
        en: 'Aim for numbers in at least half of the points: %, money, time, users, team size.',
        ru: 'Цифры хотя бы в половине пунктов: %, деньги, сроки, пользователи, размер команды.',
      },
      {
        en: 'Replace “responsible for” and “helped” with what you actually did.',
        ru: 'Замените «отвечал за» и «помогал» на то, что вы сделали.',
      },
    ],
    before: {
      en: 'Responsible for the checkout page.',
      ru: 'Отвечал за страницу оформления заказа.',
    },
    after: {
      en: 'Redesigned the checkout flow, raising conversion by 18% in three months.',
      ru: 'Переработал оформление заказа и за три месяца поднял конверсию на 18%.',
    },
    pattern: {
      en: '[Action verb] [what you did], [result with a number] by [how].',
      ru: '[Глагол] [что сделали], [результат в цифрах] за счёт [как].',
    },
  },
  education: {
    rules: [
      {
        en: 'Degree, institution and years. Recent graduates can add relevant courses or a thesis.',
        ru: 'Степень, учебное заведение и годы. Недавним выпускникам — профильные курсы или диплом.',
      },
      {
        en: 'Certificates that a vacancy names belong here too.',
        ru: 'Сертификаты, которые упоминает вакансия, тоже указывайте здесь.',
      },
    ],
  },
  skills: {
    rules: [
      {
        en: 'List 8–25 concrete skills: tools, languages, methods. Skip “communication”.',
        ru: '8–25 конкретных навыков: инструменты, языки, методы. Без «коммуникабельности».',
      },
      {
        en: 'Use the vacancy’s exact terms for skills you really have (React, not “React.js framework”).',
        ru: 'Пишите навыки так, как в вакансии, если они у вас есть (React, а не «фреймворк React.js»).',
      },
      {
        en: 'Prove your top skills with a point in your experience — that is what readers trust.',
        ru: 'Подтвердите главные навыки пунктом в опыте — этому верят больше всего.',
      },
    ],
  },
  projects: {
    rules: [
      {
        en: 'Pick 2–4 projects that match the role. Link to the live version or code.',
        ru: 'Выберите 2–4 проекта под роль. Дайте ссылку на работающую версию или код.',
      },
      {
        en: 'One line on the problem, one on what you built, one on the result.',
        ru: 'Строка о задаче, строка о решении, строка о результате.',
      },
    ],
  },
  languages: {
    rules: [
      {
        en: 'Use CEFR levels (A1–C2) or “Native”. Recruiters in Europe filter by them.',
        ru: 'Указывайте уровни CEFR (A1–C2) или «Родной» — по ним фильтруют в Европе.',
      },
    ],
  },
}

/** Verb groups are interface labels; the verbs follow the resume language. */
export const verbGroups: Text[] = [
  { ru: 'Руководство', en: 'Lead' },
  { ru: 'Создание', en: 'Build' },
  { ru: 'Улучшение', en: 'Improve' },
  { ru: 'Рост', en: 'Grow' },
  { ru: 'Экономия', en: 'Save' },
  { ru: 'Анализ', en: 'Research' },
]
export const actionVerbs: Record<Locale, string[][]> = {
  en: [
    ['Led', 'Directed', 'Mentored', 'Coordinated', 'Owned'],
    ['Built', 'Designed', 'Developed', 'Launched', 'Implemented'],
    ['Improved', 'Optimized', 'Automated', 'Streamlined', 'Redesigned'],
    ['Increased', 'Grew', 'Expanded', 'Accelerated', 'Won'],
    ['Reduced', 'Cut', 'Saved', 'Eliminated', 'Consolidated'],
    ['Analyzed', 'Researched', 'Tested', 'Measured', 'Validated'],
  ],
  ru: [
    ['Руководил', 'Возглавил', 'Наставлял', 'Координировал', 'Организовал'],
    ['Разработал', 'Создал', 'Спроектировал', 'Запустил', 'Внедрил'],
    ['Улучшил', 'Оптимизировал', 'Автоматизировал', 'Упростил', 'Переработал'],
    ['Увеличил', 'Вырастил', 'Расширил', 'Ускорил', 'Привлёк'],
    ['Сократил', 'Снизил', 'Сэкономил', 'Устранил', 'Объединил'],
    ['Проанализировал', 'Исследовал', 'Протестировал', 'Измерил', 'Проверил'],
  ],
  de: [
    ['Leitete', 'Führte', 'Betreute', 'Koordinierte', 'Steuerte'],
    ['Entwickelte', 'Gestaltete', 'Konzipierte', 'Startete', 'Implementierte'],
    [
      'Verbesserte',
      'Optimierte',
      'Automatisierte',
      'Vereinfachte',
      'Überarbeitete',
    ],
    ['Steigerte', 'Erhöhte', 'Erweiterte', 'Beschleunigte', 'Gewann'],
    ['Senkte', 'Reduzierte', 'Sparte', 'Beseitigte', 'Bündelte'],
    ['Analysierte', 'Untersuchte', 'Testete', 'Maß', 'Validierte'],
  ],
  es: [
    ['Lideré', 'Dirigí', 'Coordiné', 'Gestioné', 'Supervisé'],
    ['Desarrollé', 'Diseñé', 'Creé', 'Lancé', 'Implementé'],
    ['Mejoré', 'Optimicé', 'Automaticé', 'Simplifiqué', 'Rediseñé'],
    ['Aumenté', 'Incrementé', 'Amplié', 'Aceleré', 'Conseguí'],
    ['Reduje', 'Recorté', 'Ahorré', 'Eliminé', 'Unifiqué'],
    ['Analicé', 'Investigué', 'Probé', 'Medí', 'Validé'],
  ],
  bg: [
    ['Ръководих', 'Оглавих', 'Наставлявах', 'Координирах', 'Организирах'],
    ['Разработих', 'Създадох', 'Проектирах', 'Стартирах', 'Внедрих'],
    ['Подобрих', 'Оптимизирах', 'Автоматизирах', 'Опростих', 'Преработих'],
    ['Увеличих', 'Разширих', 'Ускорих', 'Привлякох', 'Постигнах'],
    ['Намалих', 'Съкратих', 'Спестих', 'Премахнах', 'Обединих'],
    ['Анализирах', 'Проучих', 'Тествах', 'Измерих', 'Проверих'],
  ],
  uk: [
    ['Керував', 'Очолив', 'Наставляв', 'Координував', 'Організував'],
    ['Розробив', 'Створив', 'Спроєктував', 'Запустив', 'Впровадив'],
    ['Покращив', 'Оптимізував', 'Автоматизував', 'Спростив', 'Переробив'],
    ['Збільшив', 'Виростив', 'Розширив', 'Пришвидшив', 'Залучив'],
    ['Скоротив', 'Знизив', 'Заощадив', 'Усунув', 'Об’єднав'],
    ['Проаналізував', 'Дослідив', 'Протестував', 'Виміряв', 'Перевірив'],
  ],
}

const cliches: Record<Locale, string[]> = {
  en: [
    'team player',
    'hard-working',
    'hardworking',
    'detail-oriented',
    'self-motivated',
    'results-driven',
    'go-getter',
    'think outside the box',
    'synergy',
    'dynamic professional',
  ],
  ru: [
    'коммуникабельн',
    'стрессоустойчив',
    'командный игрок',
    'целеустремл',
    'исполнительн',
    'обучаем',
    'ответственный подход',
    'нацелен на результат',
  ],
  de: [
    'teamfähig',
    'teamplayer',
    'belastbar',
    'zielstrebig',
    'kommunikationsstark',
    'hochmotiviert',
    'flexibel und',
  ],
  es: [
    'trabajo en equipo',
    'jugador de equipo',
    'proactiv',
    'dinámic',
    'orientado a resultados',
    'orientada a resultados',
    'gran capacidad',
  ],
  bg: [
    'комуникативен',
    'комуникативна',
    'стресоустойчив',
    'екипен играч',
    'целеустремен',
    'целеустремена',
    'отговорен и',
  ],
  uk: [
    'комунікабельн',
    'стресостійк',
    'командний гравець',
    'цілеспрямован',
    'відповідальн',
    'навчаєм',
  ],
}
const pronoun: Record<Locale, RegExp> = {
  en: /(^|[^\p{L}])(I|me|my|myself)(?=[^\p{L}]|$)/u,
  ru: /(^|[^\p{L}])(я|мне|мой|моя|мои|меня)(?=[^\p{L}]|$)/iu,
  de: /(^|[^\p{L}])(ich|mein|meine|meinen|meinem|meiner|mir|mich)(?=[^\p{L}]|$)/iu,
  es: /(^|[^\p{L}])(yo|mi|mis|me|conmigo)(?=[^\p{L}]|$)/iu,
  bg: /(^|[^\p{L}])(аз|мен|мой|моя|мое|мои)(?=[^\p{L}]|$)/iu,
  uk: /(^|[^\p{L}])(я|мені|мій|моя|моє|мої|мене)(?=[^\p{L}]|$)/iu,
}
const bullet = (line: string) => line.trim().replace(/^[•*–—-]\s*/, '')
const lines = (text: string) => text.split('\n').map(bullet).filter(Boolean)
const words = (text: string) => text.split(/\s+/).filter(Boolean).length

export interface Check {
  id: string
  section: Section
  ok: boolean
  title: string
  detail: string
}

export function reviewResume(
  resume: Resume,
  locale: Locale,
  lang: Locale = locale,
): Check[] {
  const t = translator(locale),
    checks: Check[] = [],
    add = (
      id: string,
      section: Section,
      ok: boolean,
      title: string,
      detail: string,
    ) => checks.push({ id, section, ok, title, detail })
  const b = resume.basics,
    work = resume.work.filter((e) => e.title || e.subtitle || e.description),
    points = work.flatMap((e) => lines(e.description)),
    prose = [b.summary, ...points].join('\n'),
    allText = [
      b.name,
      b.label,
      b.summary,
      resume.skills,
      ...(['work', 'education', 'projects', 'languages'] as const).flatMap(
        (s) => resume[s].flatMap((e) => [e.title, e.subtitle, e.description]),
      ),
    ].join('\n'),
    skills = resume.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  add(
    'contact',
    'basics',
    Boolean(b.name.trim() && (b.email.trim() || b.phone.trim())),
    t('Имя и контакт', 'Name and contact'),
    t(
      'Имя и почта или телефон, чтобы с вами могли связаться.',
      'Your name plus an email or phone number.',
    ),
  )
  add(
    'title',
    'basics',
    Boolean(b.label.trim()),
    t('Целевая должность', 'Target job title'),
    t(
      'Заголовок под именем — первое, что сверяют с вакансией.',
      'The title under your name is the first thing matched to a vacancy.',
    ),
  )
  add(
    'links',
    'basics',
    Boolean(b.linkedin.trim() || b.url.trim() || b.github.trim()),
    t('Ссылки на профиль', 'Profile links'),
    t(
      'LinkedIn, портфолио или GitHub — кликабельные, с полным адресом.',
      'LinkedIn, a portfolio, or GitHub — clickable, with the full address.',
    ),
  )
  const sentences = b.summary.split(/[.!?]+\s/).filter((s) => s.trim()).length
  add(
    'summary',
    'summary',
    b.summary.trim().length >= 120 && b.summary.length <= 600 && sentences <= 5,
    t('«О себе»: 2–4 предложения', 'Profile: 2–4 sentences'),
    t(
      'Коротко: кто вы, главный результат, что ищете.',
      'Briefly: who you are, your best result, what you want next.',
    ),
  )
  add(
    'experience',
    'work',
    work.length > 0 && lines(work[0].description).length >= 3,
    t('Пункты в последней роли', 'Points for your latest role'),
    t(
      'Хотя бы 3 пункта о результатах на последнем месте работы.',
      'At least 3 achievement points for your most recent job.',
    ),
  )
  const measured = points.filter((p) => /\d/.test(p)).length
  add(
    'numbers',
    'work',
    points.length > 0 && measured / points.length >= 0.5,
    t('Результаты в цифрах', 'Measurable results'),
    points.length
      ? t(
          'Цифры есть в {measured} из {total} пунктов. Цель — хотя бы половина.',
          '{measured} of {total} points include a number. Aim for at least half.',
          { measured, total: points.length },
        )
      : t('Добавьте пункты с цифрами.', 'Add points that include numbers.'),
  )
  const weak = points.filter((p) => weakStart[lang].test(p))
  add(
    'verbs',
    'work',
    weak.length === 0,
    t('Сильные глаголы', 'Strong action verbs'),
    weak.length
      ? t(
          'Перепишите: «{text}» — начните с действия.',
          'Rewrite “{text}” to start with an action.',
          { text: weak[0].slice(0, 60) },
        )
      : t(
          'Пункты начинаются с действия, а не с обязанностей.',
          'Points start with actions, not duties.',
        ),
  )
  const long = points.filter((p) => words(p) > 35 || p.length > 240)
  add(
    'length',
    'work',
    long.length === 0,
    t('Короткие пункты', 'Concise points'),
    t(
      'Один пункт — одна-две строки, до ~35 слов.',
      'One point, one or two lines — under about 35 words.',
    ),
  )
  const found = cliches[lang].find((c) => prose.toLowerCase().includes(c))
  add(
    'cliches',
    'summary',
    !found,
    t('Без штампов', 'No clichés'),
    found
      ? t(
          '«{text}…» ничего не доказывает — замените фактом.',
          '“{text}” proves nothing — show it with a fact instead.',
          { text: found },
        )
      : t('Качества показаны через факты.', 'Qualities are shown with facts.'),
  )
  add(
    'pronouns',
    'summary',
    !lines(prose).some((l) => pronoun[lang].test(l)),
    t('Без «я» и «мой»', 'No “I” or “my”'),
    t(
      'Резюме пишут без местоимений: «Запустил…», а не «Я запустил…».',
      'Resumes skip pronouns: “Launched…”, not “I launched…”.',
    ),
  )
  add(
    'skills',
    'skills',
    skills.length >= 6 && skills.length <= 30,
    t('6–30 навыков', '6–30 skills'),
    t(
      'Сейчас: {count}. Конкретные инструменты и методы, без общих слов.',
      'Now: {count}. Concrete tools and methods, no generic traits.',
      { count: skills.length },
    ),
  )
  const undated = (['work', 'education'] as const).find((s) =>
    resume[s].some((e) => (e.title || e.subtitle) && !e.startDate),
  )
  add(
    'dates',
    undated || 'work',
    !undated,
    t('Даты у опыта и учёбы', 'Dates for jobs and studies'),
    t(
      'Месяц и год начала у каждой записи — без них системы отбора путают хронологию.',
      'A start month and year for each entry; screening systems rely on them.',
    ),
  )
  const starts = work.map((e) => e.startDate).filter(Boolean)
  add(
    'order',
    'work',
    starts.every((d, i) => i === 0 || d <= starts[i - 1]),
    t('Сначала последняя работа', 'Most recent job first'),
    t(
      'Обратный хронологический порядок — стандарт, который ждут читатели.',
      'Reverse chronological order is what readers expect.',
    ),
  )
  add(
    'placeholders',
    'summary',
    !/\[[^\]]{2,}\]/.test(allText),
    t('Шаблоны заполнены', 'No placeholders left'),
    t(
      'Замените фрагменты в [квадратных скобках] своими данными.',
      'Replace text in [square brackets] with your own details.',
    ),
  )
  add(
    'size',
    'work',
    words(allText) <= 900,
    t('1–2 страницы', '1–2 pages'),
    t(
      'Сейчас около {count} слов. Оставьте то, что важно для этой роли.',
      'About {count} words now. Keep what matters for this role.',
      { count: words(allText) },
    ),
  )
  return checks
}

const skillTerms = [
  // Engineering
  'JavaScript',
  'TypeScript',
  'React',
  'React Native',
  'Next.js',
  'Vue',
  'Vue.js',
  'Nuxt',
  'Angular',
  'Svelte',
  'SvelteKit',
  'Astro',
  'Redux',
  'Zustand',
  'Pinia',
  'Vuex',
  'RxJS',
  'jQuery',
  'HTML',
  'CSS',
  'SCSS',
  'Sass',
  'Tailwind',
  'Tailwind CSS',
  'Bootstrap',
  'Material UI',
  'Storybook',
  'Web Components',
  'Accessibility',
  'WCAG',
  'SEO',
  'PWA',
  'WebSockets',
  'WebGL',
  'Node.js',
  'Express',
  'NestJS',
  'Deno',
  'Bun',
  'Python',
  'Django',
  'Flask',
  'FastAPI',
  'Java',
  'Spring',
  'Kotlin',
  'Swift',
  'SwiftUI',
  'Go',
  'Golang',
  'Rust',
  'C#',
  '.NET',
  'C++',
  'PHP',
  'Laravel',
  'Symfony',
  'Ruby',
  'Rails',
  'Scala',
  'Elixir',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'GraphQL',
  'REST',
  'REST API',
  'gRPC',
  'Kafka',
  'RabbitMQ',
  'Microservices',
  'Docker',
  'Kubernetes',
  'Terraform',
  'AWS',
  'Azure',
  'GCP',
  'Google Cloud',
  'Firebase',
  'Supabase',
  'Vercel',
  'Linux',
  'CI/CD',
  'GitHub Actions',
  'GitLab CI',
  'Jenkins',
  'Git',
  'Jest',
  'Vitest',
  'Cypress',
  'Playwright',
  'Testing Library',
  'Selenium',
  'Unit testing',
  'E2E',
  'TDD',
  'Webpack',
  'Vite',
  'Babel',
  'ESLint',
  'Monorepo',
  'Micro-frontends',
  'SSR',
  'Performance',
  'Core Web Vitals',
  'Lighthouse',
  'Security',
  'OAuth',
  // Data and AI
  'Machine learning',
  'Deep learning',
  'LLM',
  'NLP',
  'PyTorch',
  'TensorFlow',
  'pandas',
  'NumPy',
  'Spark',
  'Airflow',
  'dbt',
  'Snowflake',
  'BigQuery',
  'Tableau',
  'Power BI',
  'Looker',
  'Excel',
  'Statistics',
  'A/B testing',
  'Data analysis',
  'ETL',
  // Design and product
  'Figma',
  'Sketch',
  'Adobe XD',
  'Photoshop',
  'Illustrator',
  'InDesign',
  'After Effects',
  'UX',
  'UI',
  'UX research',
  'User research',
  'Usability testing',
  'Prototyping',
  'Wireframing',
  'Design systems',
  'Interaction design',
  'Typography',
  'Product management',
  'Roadmap',
  'Discovery',
  'OKR',
  'KPI',
  'Stakeholder management',
  'Analytics',
  'Google Analytics',
  'Amplitude',
  'Mixpanel',
  'Jira',
  'Confluence',
  'Notion',
  'Miro',
  // Process and business
  'Agile',
  'Scrum',
  'Kanban',
  'Project management',
  'Budgeting',
  'Forecasting',
  'Negotiation',
  'Sales',
  'B2B',
  'B2C',
  'SaaS',
  'CRM',
  'Salesforce',
  'HubSpot',
  'SAP',
  'E-commerce',
  'Marketing',
  'Content marketing',
  'SEM',
  'PPC',
  'Copywriting',
  'Social media',
  'Email marketing',
  'Customer success',
  'Customer support',
  'Recruiting',
  'Onboarding',
  'Leadership',
  'Mentoring',
  'Code review',
  'Architecture',
  'System design',
  'Cross-functional',
  'Remote',
  'English',
  'German',
  'French',
  'Spanish',
  'Russian',
  'Ukrainian',
  'Polish',
  'Czech',
  // Russian-language postings
  'Английский',
  'Немецкий',
  'Аналитика',
  'Тестирование',
  'Наставничество',
  'Управление проектами',
]
const stop = new Set(
  (
    'about above after again also and any are because been before being both but can could did does doing down during each few for from further had has have having here how into its itself just more most must nor not now off once only other our out over own same should some such than that the their them then there these they this those through too under until very was were what when where which while who whom why will with would you your able work working team teams role join help using use including experience years strong good great new our we us job company position candidate candidates skills requirements responsibilities knowledge plus nice well within across ability looking offer benefits ' +
    'und der die das mit für von bei wir sie ihr ihre eine einen einem einer oder auch sind ist werden wird haben hast hat über nach sowie unsere unser deine deinen gute sehr kenntnisse erfahrung aufgaben profil bieten ' +
    'и в во на с со по для от до из к ко у о об а но или что как это мы вы вас нас наш наша наши ваш ваша ваши будет быть есть так же уже при над под без опыт опыта работы работа работе знание знания навыки требования обязанности условия компания команда команде команды года лет хорошее хорошие умение' +
    ' ' +
    'el la los las un una unos unas de del al y o en con por para que como es son ser será este esta estos estas nuestro nuestra nuestros tu tus su sus experiencia años empresa equipo puesto requisitos funciones ofrecemos conocimientos buscamos valorable trabajo ' +
    'и в във на с със за от до по при към че как това ние вие ви нас нашия нашата нашите вашия ще е са бъде опит години работа екип компания позиция изисквания задължения предлагаме познания търсим ' +
    'і й та в у на з із зі до від по для при що як це ми ви вас нас наш наша наші ваш ваша буде бути є досвід років роботи робота команда компанія посада вимоги обов’язки пропонуємо знання шукаємо'
  ).split(' '),
)
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const termRegex = (term: string) => {
  // Plural forms count as the same skill: "design system" ↔ "Design systems".
  const stem =
    /[a-z]s$/i.test(term) && term.length > 4 ? term.slice(0, -1) : term
  return new RegExp(
    `(^|[^\\p{L}\\p{N}+#.])${escape(stem)}${stem === term ? '' : 's?'}(?=$|[^\\p{L}\\p{N}+#])`,
    'iu',
  )
}
const synonyms = [
  ['UX research', 'User research'],
  ['Accessibility', 'WCAG', 'a11y'],
  ['A/B testing', 'A/B tests', 'Split testing'],
  ['Go', 'Golang'],
  ['GCP', 'Google Cloud'],
  ['Vue', 'Vue.js'],
  ['Node.js', 'Node'],
  ['Next.js', 'NextJS'],
  ['Tailwind', 'Tailwind CSS'],
  ['REST', 'REST API', 'RESTful'],
  ['CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins'],
  ['E2E', 'End-to-end testing', 'Cypress', 'Playwright'],
  ['Unit testing', 'Jest', 'Vitest'],
  ['Mentoring', 'Наставничество'],
  ['English', 'Английский'],
  ['German', 'Немецкий'],
  ['Data analysis', 'Аналитика', 'Analytics'],
  ['Project management', 'Управление проектами'],
  ['Machine learning', 'ML'],
]
const variants = (term: string) => {
  const key = term.toLowerCase()
  return [
    term,
    ...(synonyms.find((group) =>
      group.some((item) => item.toLowerCase() === key),
    ) || []),
  ]
}
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.js$/, '')
    .replace(/\s+css$/, '')

export interface JobMatch {
  matched: string[]
  missing: string[]
  frequent: { term: string; present: boolean }[]
}

export function resumeText(resume: Resume) {
  return [
    resume.basics.label,
    resume.basics.summary,
    resume.skills,
    ...(['work', 'education', 'projects', 'languages'] as const).flatMap((s) =>
      resume[s].flatMap((e) => [e.title, e.subtitle, e.description]),
    ),
  ].join('\n')
}

// Compares a pasted vacancy with the resume using a skills dictionary and
// repeated words. Runs locally; nothing is sent anywhere.
export function matchJob(resume: Resume, posting: string): JobMatch {
  const text = resumeText(resume),
    seen = new Set<string>(),
    matched: string[] = [],
    missing: string[] = []
  for (const term of [...skillTerms].sort((a, b) => b.length - a.length)) {
    const key = normalize(term)
    if (seen.has(key) || !termRegex(term).test(posting)) continue
    // Count a skill once, however many spellings the posting uses.
    for (const variant of variants(term)) seen.add(normalize(variant))
    for (const other of skillTerms)
      if (normalize(other) === key) seen.add(normalize(other))
    const present = [
      ...variants(term),
      ...skillTerms.filter((t) => normalize(t) === key),
    ].some((variant) => termRegex(variant).test(text))
    ;(present ? matched : missing).push(term)
  }
  const foundWords = new Set(
    [...matched, ...missing].flatMap((term) =>
      term.toLowerCase().split(/[\s/-]+/),
    ),
  )
  const counts = new Map<string, { term: string; n: number }>()
  for (const raw of posting.match(/[\p{L}][\p{L}\p{N}+#.-]{3,}/gu) || []) {
    const word = raw.replace(/[.-]+$/, ''),
      key = word.toLowerCase()
    if (
      stop.has(key) ||
      seen.has(normalize(word)) ||
      foundWords.has(key) ||
      foundWords.has(key.replace(/s$/, ''))
    )
      continue
    const current = counts.get(key)
    counts.set(key, { term: current?.term || word, n: (current?.n || 0) + 1 })
  }
  const frequent = [...counts.values()]
    .filter((v) => v.n >= 2)
    .sort((a, b) => b.n - a.n)
    .slice(0, 12)
    .map(({ term }) => ({ term, present: termRegex(term).test(text) }))
  return { matched, missing, frequent }
}

export const sectionName = (section: Section, locale: Locale) =>
  sectionLabels[locale][section]
