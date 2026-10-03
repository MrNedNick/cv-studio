// @vitest-environment node
import { expect, it } from 'vitest'
import { collectKeys } from '../scripts/i18n-keys.mjs'
import { detectLocale, dictionaries, translate } from './i18n'

const { keys } = collectKeys()

it.each(Object.keys(dictionaries))(
  'translates every interface string into %s',
  (locale) => {
    const dictionary = dictionaries[locale as keyof typeof dictionaries]!
    expect(keys.filter((key) => !(key in dictionary))).toEqual([])
    // Keys that no longer exist in the code are stale translations.
    expect(
      Object.keys(dictionary).filter((key) => !keys.includes(key)),
    ).toEqual([])
    for (const key of keys) {
      const placeholders = (text: string) =>
        (text.match(/\{\w+\}/g) || []).sort()
      expect(placeholders(dictionary[key])).toEqual(placeholders(key))
    }
  },
)

it('fills placeholders and falls back to English', () => {
  expect(
    translate('de', 'Страница {page}', 'Resume, page {page}', { page: 2 }),
  ).toBe('Lebenslauf, Seite 2')
  expect(translate('ru', 'Страница {page}', 'Page {page}', { page: 3 })).toBe(
    'Страница 3',
  )
  expect(translate('uk', 'нет', 'Not in the dictionary')).toBe(
    'Not in the dictionary',
  )
})

it('picks the first supported browser language', () => {
  expect(detectLocale(['de-AT', 'en-US'])).toBe('de')
  expect(detectLocale(['fr-FR', 'uk-UA', 'ru'])).toBe('uk')
  expect(detectLocale(['ES'])).toBe('es')
  expect(detectLocale(['fr', 'it'])).toBe('en')
  expect(detectLocale([])).toBe('en')
})
