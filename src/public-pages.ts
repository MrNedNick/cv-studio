import { templates } from './template-data.ts'
export const publicLocales = ['en', 'de', 'es', 'bg', 'uk', 'ru'] as const
type Locale = (typeof publicLocales)[number]
export const homePath = (locale: Locale) =>
  locale === 'en' ? '/' : `/${locale}`
export function homeLocale(path: string): Locale | undefined {
  const normalized = path.replace(/\/$/, '') || '/'
  return publicLocales.find((locale) => homePath(locale) === normalized)
}
const homeMetadata: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'NeatCV — free resume builder with PDF download',
    description:
      'Write your resume, pick one of 12 designs and download a clean PDF with real text and clickable links. Free, no sign-up, no watermarks. Your resume stays on your device.',
  },
  de: {
    title: 'NeatCV — kostenloser Lebenslauf-Editor mit PDF-Download',
    description:
      'Erstelle deinen Lebenslauf, wähle eines von 12 Designs und lade ein PDF mit echtem Text und anklickbaren Links herunter. Kostenlos, ohne Anmeldung und Wasserzeichen. Deine Daten bleiben auf deinem Gerät.',
  },
  es: {
    title: 'NeatCV — creador de currículums gratis con descarga en PDF',
    description:
      'Escribe tu currículum, elige uno de 12 diseños y descarga un PDF con texto real y enlaces. Gratis, sin registro ni marcas de agua. Tu currículum permanece en tu dispositivo.',
  },
  bg: {
    title: 'NeatCV — безплатен редактор на CV с изтегляне в PDF',
    description:
      'Напиши автобиографията си, избери един от 12 дизайна и изтегли PDF с истински текст и активни връзки. Безплатно, без регистрация и водни знаци. Данните остават на твоето устройство.',
  },
  uk: {
    title: 'NeatCV — безкоштовний редактор резюме із завантаженням PDF',
    description:
      'Напиши резюме, вибери один із 12 дизайнів і завантаж PDF зі справжнім текстом і посиланнями. Безкоштовно, без реєстрації та водяних знаків. Резюме залишається на твоєму пристрої.',
  },
  ru: {
    title: 'NeatCV — бесплатный редактор резюме со скачиванием PDF',
    description:
      'Напиши резюме, выбери один из 12 дизайнов и скачай PDF с настоящим текстом и ссылками. Бесплатно, без регистрации и водяных знаков. Резюме остаётся на твоём устройстве.',
  },
}

export const publicPaths = [
  '/',
  '/templates',
  '/help',
  ...templates.map((t) => `/templates/${t.id}`),
  ...publicLocales.filter((locale) => locale !== 'en').map(homePath),
]
export function publicPath(pathname: string) {
  const path = pathname.replace(/\/$/, '') || '/'
  return publicPaths.includes(path) ? path : '/'
}
export function publicUrl(path: string) {
  return `https://neatcv.cc${path === '/' ? '/' : path + '/'}`
}
export function publicMetadata(path: string) {
  const locale = homeLocale(path)
  if (locale) return homeMetadata[locale]
  if (path === '/help')
    return {
      title: 'How NeatCV works — resume, PDF and backup FAQ',
      description:
        'Learn how to write a resume, choose a free template, check PDF text, and keep an editable backup. Answers about privacy, languages and reopening files.',
    }
  const template = templates.find((t) => path === `/templates/${t.id}`)
  if (template)
    return {
      title: `${template.name} resume template — free PDF | NeatCV`,
      description: `${template.en}. Explore the ${template.name} resume design, when to choose it and how to download a free PDF. No sign-up or watermarks.`,
    }
  if (path === '/templates')
    return {
      title: '12 free resume templates with PDF download — NeatCV',
      description:
        'Compare twelve free resume designs, from Modern and Classic to Technical and Editorial. Change templates without losing your text and download a PDF.',
    }
  return homeMetadata.en
}
