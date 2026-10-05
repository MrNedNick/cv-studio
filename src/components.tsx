import { ArrowRight, X } from 'lucide-react'
import { Field } from './ui/components/field/field'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useId,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
} from 'react'
import { Textarea } from './ui/components/textarea/textarea'
import {
  createDocument,
  dateRange,
  sectionLabels,
  type Locale,
  type Section,
  type Template,
} from './model'
import { translate } from './i18n'

/** Language of the resume version being edited; inputs use it for spelling. */
export const ContentLang = createContext<Locale | undefined>(undefined)
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
    id: 'timeline',
    name: 'Timeline',
    ru: 'Даты слева — карьера читается как линия',
    en: 'Dates in the margin, career at a glance',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    ru: 'Только текст и воздух',
    en: 'Nothing but text and whitespace',
  },
  {
    id: 'bold',
    name: 'Bold',
    ru: 'Крупное имя и яркие заголовки',
    en: 'A big name and confident headings',
  },
  {
    id: 'ivy',
    name: 'Ivy',
    ru: 'Классическая типографика с засечками',
    en: 'Classic serif typography, centered',
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
    heading = (section: Section) =>
      sectionLabels[locale][section].toLocaleUpperCase(locale)
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
          <h4>{heading('summary')}</h4>
          <p>{r.basics.summary}</p>
          {template === 'technical' && (
            <>
              <h4>{heading('skills')}</h4>
              <p>{r.skills}</p>
            </>
          )}
          <h4>{heading('work')}</h4>
          {r.work.map((e, i) => (
            <div className="mini-job" key={e.id}>
              <span className="mini-date">
                {i === 0
                  ? dateRange(r.work[0], locale).replace(/^[^—]+/, '2022 ')
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
          <h4>{heading('education')}</h4>
          <strong>{r.education[0].title}</strong>
          <p>{r.education[0].subtitle} · 2020</p>
          {template !== 'technical' && (
            <>
              <h4>{heading('skills')}</h4>
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
  validate,
  ...inputProps
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  multiline?: boolean
  hint?: string
  type?: string
  placeholder?: string
  /** Returns a message when the value needs fixing; shown once the field was left. */
  validate?: (value: string) => string | undefined
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'name'
  | 'autoComplete'
  | 'inputMode'
  | 'autoCapitalize'
  | 'spellCheck'
  | 'enterKeyHint'
  | 'onKeyDown'
>) {
  const lang = useContext(ContentLang),
    [touched, setTouched] = useState(false),
    error = touched && value.trim() ? validate?.(value) : undefined
  return (
    <Field label={label} hint={hint} error={error} className="field">
      {multiline ? (
        <Textarea
          className="ui-textarea"
          autoGrow
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          maxLength={30000}
          lang={lang}
        />
      ) : (
        <input
          {...inputProps}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          maxLength={1000}
          lang={lang}
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
            <span className="template-number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <MiniResume template={template.id} locale={locale} />
            <span className="template-use">
              {translate(locale, 'Выбрать шаблон', 'Use template')}
              <ArrowRight size={16} />
            </span>
          </div>
          <div className="template-caption">
            <div>
              <h3>{template.name}</h3>
              <p>{translate(locale, template.ru, template.en)}</p>
            </div>
            <span>↗</span>
          </div>
        </button>
      ))}
    </div>
  )
}
/** A modal dialog that returns focus to its opener and closes on Escape or a backdrop click. */
export function Dialog({
  title,
  children,
  close,
  closeLabel,
  closing = false,
  className,
}: {
  title: string
  children: ReactNode
  close: () => void
  closeLabel: string
  closing?: boolean
  className?: string
}) {
  const titleId = useId(),
    ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!,
      opener = document.activeElement as HTMLElement | null
    dialog.showModal()
    return () => {
      dialog.close()
      // The closing animation makes the dialog inert, which drops focus;
      // hand it back to whatever opened the dialog.
      if (
        opener?.isConnected &&
        (!document.activeElement || document.activeElement === document.body)
      )
        opener.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={
        [className, closing && 'is-closing'].filter(Boolean).join(' ') ||
        undefined
      }
      inert={closing}
      aria-hidden={closing}
      onCancel={(e) => {
        e.preventDefault()
        if (!closing) close()
      }}
      onClick={(e) => {
        if (e.target === ref.current) close()
      }}
      aria-labelledby={titleId}
    >
      <div className="dialog-head">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" onClick={close} aria-label={closeLabel}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
