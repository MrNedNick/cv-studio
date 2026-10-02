import { ArrowRight } from 'lucide-react'
import { Field } from './ui/components/field/field'
import { createDocument, type Locale, type Template } from './model'
export const templates: {
  id: Template
  name: string
  ru: string
  en: string
}[] = [
  {
    id: 'modern',
    name: 'Modern',
    ru: 'Выразительно и по делу',
    en: 'A considered first impression',
  },
  {
    id: 'classic',
    name: 'Classic',
    ru: 'Вневременная классика',
    en: 'Timeless and professional',
  },
  {
    id: 'compact',
    name: 'Compact',
    ru: 'Больше опыта на странице',
    en: 'More room for your experience',
  },
  {
    id: 'technical',
    name: 'Technical',
    ru: 'Навыки на первом плане · одна колонка',
    en: 'Skills first · a clear single column',
  },
  {
    id: 'executive',
    name: 'Executive',
    ru: 'Сдержанно, по центру, для senior-ролей',
    en: 'Centered and composed for senior roles',
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    ru: 'Яркая шапка, спокойный текст',
    en: 'A bold header over calm, clear text',
  },
  {
    id: 'swiss',
    name: 'Swiss',
    ru: 'Заголовки на полях, много воздуха',
    en: 'Margin headings and generous whitespace',
  },
  {
    id: 'sidebar',
    name: 'Editorial',
    ru: 'Аккуратные две колонки',
    en: 'A distinctive two-column layout',
  },
]
export function MiniResume({
  template = 'modern',
  locale = 'ru',
  large = false,
}: {
  template?: Template
  locale?: Locale
  large?: boolean
}) {
  const r = createDocument(true).versions[locale],
    ru = locale === 'ru'
  return (
    <div
      className={`mini-resume mini-${template} ${large ? 'large' : ''}`}
      aria-hidden="true"
    >
      <div className="mini-top">
        <span className="mini-monogram">am.</span>
        <span>CURRICULUM VITAE</span>
      </div>
      <h3>{r.basics.name}</h3>
      <p className="mini-role">{r.basics.label}</p>
      <p className="mini-contact">
        {r.basics.location} &nbsp; · &nbsp; alex@example.com
      </p>
      <div className="mini-rule" />
      <div className="mini-body">
        <div>
          <h4>{ru ? 'ПРОФИЛЬ' : 'PROFILE'}</h4>
          <p>{r.basics.summary}</p>
          {template === 'technical' && (
            <>
              <h4>{ru ? 'НАВЫКИ' : 'SKILLS'}</h4>
              <p>{r.skills}</p>
            </>
          )}
          <h4>{ru ? 'ОПЫТ РАБОТЫ' : 'EXPERIENCE'}</h4>
          {r.work.map((e, i) => (
            <div className="mini-job" key={e.id}>
              <span className="mini-date">
                {i === 0
                  ? '2022 — ' + (ru ? 'сейчас' : 'present')
                  : '2020 — 2022'}
              </span>
              <strong>{e.title}</strong>
              <span>{e.subtitle}</span>
              {e.description
                .split('\n')
                .slice(0, 2)
                .map((line) => (
                  <p key={line}>• {line}</p>
                ))}
            </div>
          ))}
        </div>
        <div className="mini-secondary">
          <h4>{ru ? 'ОБРАЗОВАНИЕ' : 'EDUCATION'}</h4>
          <strong>{r.education[0].title}</strong>
          <p>{r.education[0].subtitle} · 2020</p>
          {template !== 'technical' && (
            <>
              <h4>{ru ? 'НАВЫКИ' : 'SKILLS'}</h4>
              <p>{r.skills}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export function FormField({
  label,
  value,
  onChange,
  multiline = false,
  hint,
  type = 'text',
  placeholder,
  onFocus,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  multiline?: boolean
  hint?: string
  type?: string
  placeholder?: string
}) {
  return (
    <Field label={label} hint={hint} className="field">
      {multiline ? (
        <textarea
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          maxLength={30000}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={1000}
        />
      )}
    </Field>
  )
}
export function TemplateCards({
  disabled = false,
  locale,
  onPick,
}: {
  locale: Locale
  onPick: (template: Template) => void
  disabled?: boolean
}) {
  return (
    <div className="template-grid">
      {templates.map((template, index) => (
        <button
          key={template.id}
          disabled={disabled}
          className={`template-card template-card-${template.id}`}
          onClick={() => onPick(template.id)}
        >
          <div className="template-image">
            <span className="template-number">0{index + 1}</span>
            <MiniResume template={template.id} locale={locale} />
            <span className="template-use">
              {locale === 'ru' ? 'Выбрать шаблон' : 'Use template'}
              <ArrowRight size={16} />
            </span>
          </div>
          <div className="template-caption">
            <div>
              <h3>{template.name}</h3>
              <p>{template[locale]}</p>
            </div>
            <span>↗</span>
          </div>
        </button>
      ))}
    </div>
  )
}
