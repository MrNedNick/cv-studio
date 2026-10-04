import { useId, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { roleFor, skillRoles, skillText } from './suggestions'
import { translator } from './i18n'
import type { Locale } from './model'

export const splitSkills = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/**
 * Skills as removable chips over the comma-separated text the resume stores.
 * Typing a comma or Enter adds a skill; suggestions follow the job title.
 */
export function SkillsField({
  value,
  onChange,
  locale,
  lang,
  jobTitle,
}: {
  value: string
  onChange: (value: string) => void
  locale: Locale
  /** Resume language: suggestions are written in it. */
  lang: Locale
  jobTitle: string
}) {
  const t = translator(locale),
    id = useId(),
    input = useRef<HTMLInputElement>(null),
    skills = splitSkills(value),
    [draft, setDraft] = useState(''),
    guessed = roleFor(jobTitle),
    [picked, setPicked] = useState<string | null>(null),
    role = skillRoles.find((r) => r.id === (picked ?? guessed?.id)),
    has = (skill: string) =>
      skills.some((s) => s.toLocaleLowerCase() === skill.toLocaleLowerCase()),
    suggestions = (role?.skills ?? [])
      .map((skill) => skillText(skill, lang))
      .filter((skill) => !has(skill))
  function commit(list: string[]) {
    onChange(list.join(', '))
  }
  function add(text: string) {
    const fresh = splitSkills(text).filter(
      (skill, i, all) =>
        !has(skill) &&
        all.findIndex((s) => s.toLowerCase() === skill.toLowerCase()) === i,
    )
    if (fresh.length) commit([...skills, ...fresh])
  }
  function type(text: string) {
    // A comma (typed or pasted) finishes every skill before it.
    const cut = text.lastIndexOf(',')
    if (cut === -1) {
      setDraft(text)
      return
    }
    add(text.slice(0, cut))
    setDraft(text.slice(cut + 1).trimStart())
  }
  return (
    <div className="skills-field">
      <label htmlFor={id} className="skills-label">
        {t('Ваши навыки', 'Your skills')}
      </label>
      <div className="skills-box">
        {skills.length > 0 && (
          <ul
            className="skill-tags"
            aria-label={t('Добавленные навыки', 'Added skills')}
          >
            {skills.map((skill, i) => (
              <li key={`${skill}-${i}`}>
                <span lang={lang}>{skill}</span>
                <button
                  type="button"
                  aria-label={t('Убрать «{skill}»', 'Remove “{skill}”', {
                    skill,
                  })}
                  onClick={(event) => {
                    commit(skills.filter((_, j) => j !== i))
                    if (event.detail === 0) input.current?.focus()
                  }}
                >
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          id={id}
          ref={input}
          value={draft}
          lang={lang}
          maxLength={1000}
          placeholder={
            skills.length
              ? t('Ещё навык…', 'Another skill…')
              : t('Например, Figma — и Enter', 'e.g. Figma, then Enter')
          }
          aria-describedby={`${id}-hint`}
          onChange={(e) => type(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
              setDraft('')
            } else if (e.key === 'Backspace' && !draft && skills.length) {
              commit(skills.slice(0, -1))
            }
          }}
          onBlur={() => {
            if (!draft.trim()) return
            add(draft)
            setDraft('')
          }}
        />
      </div>
      <p className="field-hint" id={`${id}-hint`}>
        {t(
          'Enter или запятая добавляют навык. Пишите так, как в вакансии, и только то, чем владеете.',
          'Enter or a comma adds a skill. Use the vacancy’s wording, and only skills you really have.',
        )}
      </p>
      <div className="skill-suggest">
        <p>
          {role
            ? t(
                'Часто указывают в сфере «{field}»:',
                'Often listed in {field}:',
                {
                  field: t(role.ru, role.en),
                },
              )
            : t('Подсказки по сфере:', 'Suggestions by field:')}
        </p>
        <div
          className="chip-row role-chips"
          role="group"
          aria-label={t('Сфера', 'Field')}
        >
          {skillRoles.map((r) => (
            <button
              key={r.id}
              type="button"
              className="chip"
              aria-pressed={role?.id === r.id}
              onClick={() => setPicked(r.id)}
            >
              {t(r.ru, r.en)}
            </button>
          ))}
        </div>
        {role && (
          <div
            className="chip-row skill-options"
            role="group"
            aria-label={t('Предложенные навыки', 'Suggested skills')}
            lang={lang}
          >
            {suggestions.length ? (
              suggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="chip chip-add"
                  onClick={() => add(skill)}
                >
                  <Plus size={13} />
                  {skill}
                </button>
              ))
            ) : (
              <span className="chip-done">
                {t('Все подсказки добавлены.', 'All suggestions added.')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
