import { useState, type RefObject } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { translator } from './i18n'
import { Dialog } from './components'
import { Switch } from './ui/components/switch/switch'
import type { Locale, Section } from './model'
import './Onboarding.css'

export type GuideTopic =
  | 'design'
  | 'basics'
  | 'versions'
  | 'structure'
  | 'skills'
  | 'languages'
  | 'review'
  | 'preview'
export const guideTopics: GuideTopic[] = [
  'design',
  'basics',
  'versions',
  'structure',
  'skills',
  'languages',
  'review',
  'preview',
]
export const guideStep: Record<
  Exclude<GuideTopic, 'preview'>,
  'design' | Section | 'review'
> = {
  design: 'design',
  basics: 'basics',
  versions: 'basics',
  structure: 'work',
  skills: 'skills',
  languages: 'languages',
  review: 'review',
}
export function guideText(locale: Locale, topic: GuideTopic) {
  const t = translator(locale)
  const text = {
    design: [
      t('Начните с внешнего вида', 'Start with the look'),
      t(
        'Выберите шаблон, затем переходите к личным данным. Пока резюме пустое, в просмотре показан пример — он не добавляется в ваше резюме. На телефоне откройте «Просмотр», чтобы увидеть оформление.',
        'Pick a template, then move to Personal details. While your resume is empty, the preview uses example text; it is not added to your resume. On a phone, open Preview to see the design.',
      ),
    ],
    basics: [
      t('Сохранено здесь, в этом браузере', 'Saved here, in this browser'),
      t(
        'Правки сохраняются автоматически. На другом устройстве они не появятся, а очистка данных браузера удалит эту копию. Когда закончите, сохраните редактируемый PDF или JSON через меню действий.',
        'Edits save automatically. They will not appear on another device, and clearing browser data removes this copy. When you finish, keep an editable PDF or use the actions menu to save JSON.',
      ),
    ],
    versions: [
      t(
        'Другой язык — отдельная версия',
        'Another language, a separate version',
      ),
      t(
        'Переключатель языка вверху меняет интерфейс и версию резюме. Текст не переводится автоматически: пустую версию можно заполнить копией другой. Контакты, даты и ссылки общие; PDF для отправки содержит выбранную версию.',
        'The language selector at the top changes the interface and resume version. Text is not translated automatically; an empty version can copy another as a starting point. Contacts, dates and links are shared. Sharing PDFs contain the selected version.',
      ),
    ],
    structure: [
      t('Оставьте только нужные разделы', 'Keep only the sections you need'),
      t(
        'Не нужен раздел? Выключите «В резюме»: текст сохранится, а «Далее» пропустит этот шаг. Для заполнения откройте «Как написать этот раздел» — там структура и примеры. Свёрнутая карточка остаётся в PDF.',
        'Do not need this section? Turn off In resume: your text is kept and Next skips this step. Open How to write this section for structure and examples. Collapsing an entry keeps it in the PDF.',
      ),
    ],
    skills: [
      t('Несколько навыков за один раз', 'Add several skills at once'),
      t(
        'Введите навык и нажмите Enter или запятую. Можно вставить список через запятые. Предложения ниже — на выбор: добавляйте только то, чем действительно владеете.',
        'Type a skill and press Enter or comma. You can paste a list separated by commas. Suggestions below are optional; add only skills you actually have.',
      ),
    ],
    languages: [
      t('Уровень, который вам подходит', 'Choose a level that fits'),
      t(
        'Выберите язык и уровень. A1–A2 — начальный, B1–B2 — самостоятельное владение, C1–C2 — продвинутое. Можно написать уровень своими словами. Это языки, которыми вы владеете; язык самого PDF меняется вверху.',
        'Choose a language and level. A1–A2 is basic, B1–B2 independent, C1–C2 proficient. You can describe the level in your own words. These are languages you speak; the PDF language is selected at the top.',
      ),
    ],
    review: [
      t('Проверьте и сохраните две копии', 'Review, then keep two copies'),
      t(
        'Проверки помогают заметить пропуски, но не оценивают ваши шансы на работу. Просмотрите PDF, скачайте «Для отправки» работодателю и сохраните «Редактируемую копию» для себя — её можно открыть здесь и продолжить правки.',
        'Checks help you spot gaps; they do not rate your chances of getting hired. Inspect the PDF, download For sharing for employers, and keep an Editable copy for yourself to reopen here and continue editing.',
      ),
    ],
    preview: [
      t('Посмотрите глазами читателя', 'See what the reader will see'),
      t(
        'Это настоящий PDF: проверьте все страницы и переносы. Режим «Текст» удобен для чтения и копирования. Масштаб меняет только просмотр, а не размер текста в файле. Чтобы изменить размер текста, вернитесь к шаблону.',
        'This is the actual PDF: check every page and line break. Text view is useful for reading and copying. Zoom changes only the preview, not the text size in the file. Change text size in the Template step.',
      ),
    ],
  }
  const summaries: Record<GuideTopic, string> = {
    design: t(
      'В просмотре пример текста, пока вы не напишете свой. Выберите оформление, затем переходите к личным данным.',
      'The preview shows example text until you write your own. Choose a look, then Personal details.',
    ),
    basics: t(
      'Правки сохраняются только в этом браузере. Перед очисткой его данных сохраните редактируемый PDF или JSON.',
      'Edits save only in this browser. Keep an editable PDF or JSON backup before clearing browser data.',
    ),
    versions: t(
      'У каждого языка свой текст; автоматического перевода нет. Контакты, даты и ссылки общие.',
      'Each language has its own text; nothing is translated automatically. Contacts, dates and links are shared.',
    ),
    structure: t(
      'Выключите «В резюме», чтобы пропустить раздел без удаления текста. Примеры для заполнения доступны ниже.',
      'Turn off In resume to skip a section without deleting it. Writing examples are available below.',
    ),
    skills: t(
      'Enter или запятая добавляют навык. Вставьте список через запятые, чтобы добавить сразу несколько.',
      'Enter or comma adds a skill. Paste a comma-separated list to add several at once.',
    ),
    languages: t(
      'Выберите уровень A1–C2 или опишите своими словами. Это языки, которыми вы владеете, а не язык PDF.',
      'Choose a level from A1–C2 or write your own. These are languages you speak, not the PDF language.',
    ),
    review: t(
      'Проверьте все страницы PDF. «Для отправки» — работодателю; «Редактируемая копия» — для будущих правок.',
      'Check every PDF page. Use For sharing for employers; keep an Editable copy to edit again.',
    ),
    preview: t(
      'Проверьте страницы и переносы в настоящем PDF. Масштаб влияет только на просмотр; «Текст» удобен для чтения.',
      'Check pages and line breaks in the actual PDF. Zoom affects the preview only; Text view helps with reading.',
    ),
  }
  return {
    title: text[topic][0],
    body: text[topic][1],
    summary: summaries[topic],
  }
}
const settingKey = 'neatcv-guide-v1'
type Preferences = { disabled: boolean; dismissed: GuideTopic[] }
function readPreferences(): Preferences {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(settingKey) ?? 'null',
    )
    if (value && typeof value === 'object') {
      const stored = value as Partial<Preferences>
      return {
        disabled: stored.disabled === true,
        dismissed: Array.isArray(stored.dismissed)
          ? stored.dismissed.filter((id) => guideTopics.includes(id))
          : [],
      }
    }
  } catch {
    /* Guidance still works when storage is unavailable. */
  }
  return { disabled: false, dismissed: [] }
}
export function useOnboarding() {
  const [preferences, setPreferences] = useState(readPreferences)
  const [requested, setRequested] = useState<GuideTopic | null>(null)
  function remember(next: Preferences) {
    setPreferences(next)
    try {
      localStorage.setItem(settingKey, JSON.stringify(next))
    } catch {
      /* Keep this visit's preference. */
    }
  }
  return {
    enabled: !preferences.disabled,
    requested,
    show: (id: GuideTopic) =>
      requested === id ||
      (!preferences.disabled && !preferences.dismissed.includes(id)),
    dismiss: (id: GuideTopic) => {
      setRequested(null)
      remember({
        ...preferences,
        dismissed: [...new Set([...preferences.dismissed, id])],
      })
    },
    setEnabled: (enabled: boolean) => {
      setRequested(null)
      remember({ ...preferences, disabled: !enabled })
    },
    reset: () => {
      setRequested(null)
      remember({ disabled: false, dismissed: [] })
    },
    request: setRequested,
  }
}
export function GuideTip({
  topic,
  locale,
  dismiss,
  help,
  focusAfterDismiss,
}: {
  topic: GuideTopic
  locale: Locale
  dismiss: () => void
  help: () => void
  focusAfterDismiss: RefObject<HTMLElement | null>
}) {
  const t = translator(locale),
    text = guideText(locale, topic)
  return (
    <aside
      className="guide-tip"
      data-guide-topic={topic}
      aria-label={t('Подсказка редактора', 'Editor tip')}
    >
      <Lightbulb size={17} aria-hidden="true" />
      <div>
        <strong>{text.title}</strong>
        <p>{text.summary}</p>
        <button
          className="text-button"
          onClick={(event) => {
            event.currentTarget.focus()
            help()
          }}
        >
          {t('Помощь по редактору', 'Editor guide')}
        </button>
      </div>
      <button
        className="icon-button"
        aria-label={t(
          'Больше не показывать эту подсказку',
          'Dismiss this editor tip',
        )}
        onClick={() => {
          dismiss()
          focusAfterDismiss.current?.focus({ preventScroll: true })
        }}
      >
        <X size={17} aria-hidden="true" />
      </button>
    </aside>
  )
}
export function EditorGuide({
  locale,
  close,
  enabled,
  setEnabled,
  reset,
  choose,
}: {
  locale: Locale
  close: () => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  reset: () => void
  choose: (topic: GuideTopic) => void
}) {
  const t = translator(locale)
  return (
    <Dialog
      title={t('Помощь по редактору', 'Editor guide')}
      closeLabel={t('Закрыть', 'Close')}
      close={close}
      className="editor-guide-dialog"
    >
      <p className="guide-intro">
        {t(
          'Выберите, с чем нужна помощь. Можно писать и скачивать PDF в любом порядке — все шаги проходить необязательно.',
          'Choose what you need help with. You can write and download in any order; completing every step is optional.',
        )}
      </p>
      <div className="guide-preferences">
        <div className="switch-row">
          <Switch
            className="ui-switch"
            label={t('Подсказки по ходу работы', 'Contextual editor tips')}
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
        </div>
        <button className="text-button" onClick={reset}>
          {t('Вернуть закрытые подсказки', 'Restore dismissed editor tips')}
        </button>
      </div>
      <div className="guide-topics">
        {guideTopics.map((topic) => {
          const text = guideText(locale, topic)
          return (
            <details key={topic}>
              <summary>{text.title}</summary>
              <p>{text.body}</p>
              <button className="text-button" onClick={() => choose(topic)}>
                {t('Показать в редакторе', 'Show in editor')}
              </button>
            </details>
          )
        })}
      </div>
    </Dialog>
  )
}
