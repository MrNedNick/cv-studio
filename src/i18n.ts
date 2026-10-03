import { isLocale, type Locale } from './model'
/** Interface dictionaries are fetched only when their language is requested. */
export const dictionaries: Partial<Record<Locale, Record<string, string>>> = {}
const loaders = {
  de: () => import('./locales/de'),
  es: () => import('./locales/es'),
  bg: () => import('./locales/bg'),
  uk: () => import('./locales/uk'),
}
const pending = new Map<Locale, Promise<void>>()
export const hasDictionary = (locale: Locale) =>
  locale === 'en' || locale === 'ru' || Boolean(dictionaries[locale])

export function loadLocale(locale: Locale): Promise<void> {
  if (hasDictionary(locale)) return Promise.resolve()
  const current = pending.get(locale)
  if (current) return current
  const request = loaders[locale as keyof typeof loaders]()
    .then(({ default: dictionary }) => {
      dictionaries[locale] = dictionary
    })
    .finally(() => {
      pending.delete(locale)
    })
  pending.set(locale, request)
  return request
}

export type Vars = Record<string, string | number>

/**
 * Russian and English live next to the code; other languages come from the
 * dictionaries and fall back to English. `{name}` placeholders take `vars`.
 */
export function translate(
  locale: Locale,
  ru: string,
  en: string,
  vars?: Vars,
): string {
  const text =
    locale === 'ru'
      ? ru
      : locale === 'en'
        ? en
        : (dictionaries[locale]?.[en] ?? en)
  return vars
    ? text.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in vars ? String(vars[key]) : match,
      )
    : text
}

export const translator =
  (locale: Locale) => (ru: string, en: string, vars?: Vars) =>
    translate(locale, ru, en, vars)

/** The first browser language the site supports, e.g. `de-AT` → `de`; English otherwise. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return 'en'
}
