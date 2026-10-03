import { useId, useMemo, useState } from 'react'
import { FormField } from './components'
import { Field } from './ui/components/field/field'
import { Select } from './ui/components/select/select'
import {
  languageCodes,
  languageName,
  proficiency,
  proficiencyShort,
} from './suggestions'
import { translator } from './i18n'
import type { Entry, Locale } from './model'

const OTHER = 'other'

/**
 * A language picked from a list (named in the resume language) and its level
 * picked from CEFR chips. Both stay editable as free text for anything else.
 */
export function LanguageFields({
  entry,
  locale,
  lang,
  pickLanguage,
  pickLevel,
  setTitle,
  setLevel,
}: {
  entry: Entry
  locale: Locale
  lang: Locale
  /** Fills the language name in every resume version. */
  pickLanguage: (code: string) => void
  /** Fills the level wording in every resume version. */
  pickLevel: (index: number) => void
  setTitle: (text: string) => void
  setLevel: (text: string) => void
}) {
  const t = translator(locale),
    levelsId = useId(),
    options = useMemo(
      () =>
        languageCodes
          .map((code) => ({ code, name: languageName(code, lang) }))
          .sort((a, b) => a.name.localeCompare(b.name, lang)),
      [lang],
    ),
    title = entry.title.trim(),
    match = options.find(
      (o) => o.name.toLocaleLowerCase(lang) === title.toLocaleLowerCase(lang),
    ),
    [otherChosen, setOtherChosen] = useState(false),
    other = otherChosen || (Boolean(title) && !match),
    levels = proficiency[lang],
    level = levels.indexOf(entry.subtitle.trim())
  return (
    <>
      <Field label={t('Язык', 'Language')} className="field">
        <Select
          className="ui-select"
          value={other ? OTHER : (match?.code ?? '')}
          onChange={(e) => {
            const value = e.target.value
            if (value === OTHER) {
              setOtherChosen(true)
              if (match) setTitle('')
            } else if (value) {
              setOtherChosen(false)
              pickLanguage(value)
            }
          }}
        >
          <option value="" disabled>
            {t('Выберите язык', 'Choose a language')}
          </option>
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.name}
            </option>
          ))}
          <option value={OTHER}>{t('Другой…', 'Other…')}</option>
        </Select>
      </Field>
      {other && (
        <FormField
          label={t('Название языка', 'Language name')}
          value={entry.title}
          onChange={setTitle}
        />
      )}
      <div className="field">
        <span className="field-label" id={levelsId}>
          {t('Уровень владения', 'Proficiency')}
        </span>
        <div
          className="chip-row level-chips"
          role="group"
          aria-labelledby={levelsId}
        >
          {levels.map((text, i) => (
            <button
              key={text}
              type="button"
              className="chip"
              aria-pressed={level === i}
              title={text}
              onClick={() => pickLevel(i)}
            >
              {proficiencyShort(text)}
            </button>
          ))}
        </div>
      </div>
      <FormField
        label={t('Уровень своими словами', 'Level in your own words')}
        value={entry.subtitle}
        onChange={setLevel}
        placeholder={levels[2]}
        hint={t(
          'Можно дописать сертификат: «C1 (IELTS 7.5)».',
          'You can add a certificate: “C1 (IELTS 7.5)”.',
        )}
      />
    </>
  )
}
