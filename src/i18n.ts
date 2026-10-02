import type { Locale } from './model'
import de from './locales/de'
import es from './locales/es'
import bg from './locales/bg'
import uk from './locales/uk'

/** Interface translations beyond Russian and English, keyed by the English text. */
export const dictionaries: Partial<Record<Locale, Record<string, string>>> = {
  de,
  es,
  bg,
  uk,
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
