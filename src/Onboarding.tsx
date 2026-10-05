import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Check, X } from 'lucide-react'
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
      t('Добавьте имя и должность', 'Add your name and role'),
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
      'Нажмите на поле имени и добавьте свою должность ниже. Правки сохраняются автоматически в этом браузере.',
      'Click the name field, then add your role below. Edits save automatically in this browser.',
    ),
    versions: t(
      'У каждого языка свой текст; автоматического перевода нет. Контакты, даты и ссылки общие.',
      'Each language has its own text; nothing is translated automatically. Contacts, dates and links are shared.',
    ),
    structure: t(
      'Откройте примеры написания: они помогут описать опыт и результаты. Ненужный раздел можно выключить без удаления текста.',
      'Open the writing examples for help describing your experience and results. Hide an unneeded section without deleting its text.',
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
      'Проверьте пропуски выше. При желании вставьте вакансию сюда и сравните навыки. Затем посмотрите PDF и сохраните обе копии.',
      'Check the gaps above. Optionally paste a vacancy here to compare skills. Then inspect the PDF and keep both copies.',
    ),
    preview: t(
      'Проверьте страницы настоящего PDF. Нажмите «Текст» для чтения и копирования. Скачайте копию для отправки и редактируемую копию для себя.',
      'Check the actual PDF pages. Click Text for reading and copying. Download a sharing copy and keep an editable copy for yourself.',
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
export const tourTopics: GuideTopic[] = [
  'design',
  'basics',
  'structure',
  'skills',
  'languages',
  'versions',
  'review',
  'preview',
]

type Rect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}
export function placeGuide(
  target: Rect,
  width: number,
  height: number,
  viewport: { width: number; height: number; top: number; left: number },
) {
  const gap = 14,
    edge = 12
  const minX = viewport.left + edge,
    maxX = viewport.left + viewport.width - edge
  const minY = viewport.top + edge,
    maxY = viewport.top + viewport.height - edge
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(n, max))
  const right = maxX - target.right - gap,
    left = target.left - minX - gap
  const below = maxY - target.bottom - gap,
    above = target.top - minY - gap
  const side =
    right >= width
      ? 'right'
      : left >= width
        ? 'left'
        : below >= height
          ? 'bottom'
          : above >= height
            ? 'top'
            : below >= above
              ? 'bottom'
              : 'top'
  const availableHeight =
    side === 'bottom' ? below : side === 'top' ? above : maxY - minY
  const actualHeight = Math.min(height, Math.max(0, availableHeight))
  const x =
    side === 'right'
      ? target.right + gap
      : side === 'left'
        ? target.left - width - gap
        : clamp(target.left + target.width / 2 - width / 2, minX, maxX - width)
  const y =
    side === 'bottom'
      ? target.bottom + gap
      : side === 'top'
        ? target.top - actualHeight - gap
        : clamp(target.top, minY, maxY - actualHeight)
  return {
    x,
    y,
    side,
    maxHeight: Math.max(0, availableHeight),
    arrow:
      side === 'top' || side === 'bottom'
        ? clamp(target.left + target.width / 2 - x, 22, width - 22)
        : clamp(target.top + target.height / 2 - y, 22, actualHeight - 22),
  }
}
export function GuideTip({
  topic,
  locale,
  dismiss,
  help,
  focusAfterDismiss,
  anchor,
  primary,
  primaryLabel,
  index,
  back,
  explicit = false,
}: {
  topic: GuideTopic
  locale: Locale
  dismiss: () => void
  help: () => void
  focusAfterDismiss: RefObject<HTMLElement | null>
  anchor: string
  primary: () => void
  primaryLabel: string
  index?: number
  back?: () => void
  explicit?: boolean
}) {
  const t = translator(locale),
    text = guideText(locale, topic)
  const card = useRef<HTMLDivElement>(null),
    action = useRef<HTMLButtonElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const focused = useRef(false)
  const [layout, setLayout] = useState<{
    target: Rect
    position: ReturnType<typeof placeGuide>
  } | null>(null)
  const [suspended, setSuspended] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const callbacks = useRef({ dismiss, focusAfterDismiss })
  callbacks.current = { dismiss, focusAfterDismiss }
  useLayoutEffect(() => {
    let frame = 0,
      previous = '',
      described: HTMLElement | null = null
    const resize =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(schedule)
    const viewport = window.visualViewport
    function measure() {
      const modal = Boolean(document.querySelector('dialog[open]'))
      setModalOpen(modal)
      const target = [...document.querySelectorAll<HTMLElement>(anchor)].find(
        (el) => el.getClientRects().length && !el.closest('[inert]'),
      )
      targetRef.current = target ?? null
      if (!target || !card.current) {
        setLayout(null)
        return
      }
      const control = target.closest<HTMLElement>('button') ?? target
      if (described !== control) {
        if (described)
          described.setAttribute(
            'aria-describedby',
            (described.getAttribute('aria-describedby') || '')
              .split(' ')
              .filter((id) => id && id !== 'editor-coach-description')
              .join(' '),
          )
        described = control
        control.setAttribute(
          'aria-describedby',
          [control.getAttribute('aria-describedby'), 'editor-coach-description']
            .filter(Boolean)
            .join(' '),
        )
        resize?.observe(target)
      }
      const rect = target.getBoundingClientRect()
      const screen = {
        width: viewport?.width ?? innerWidth,
        height: viewport?.height ?? innerHeight,
        top: viewport?.offsetTop ?? 0,
        left: viewport?.offsetLeft ?? 0,
      }
      const targetRect = {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      }
      const container = target.closest('.editor-form, .preview-panel')
      const bounds = container?.getBoundingClientRect()
      const visible =
        rect.top >= Math.max(screen.top, bounds?.top ?? screen.top) &&
        rect.bottom <=
          Math.min(screen.top + screen.height, bounds?.bottom ?? Infinity) &&
        rect.left >= screen.left &&
        rect.right <= screen.left + screen.width
      const position = placeGuide(
        bounds && innerWidth >= 1050
          ? {
              ...targetRect,
              left: bounds.left,
              right: bounds.right,
              width: bounds.width,
            }
          : targetRect,
        card.current.offsetWidth,
        card.current.scrollHeight,
        screen,
      )
      // On a very short viewport, leave the task unobstructed and offer a compact resume control.
      const next =
        visible && !modal && position.maxHeight >= card.current.scrollHeight
          ? { target: targetRect, position }
          : null
      const serialized = JSON.stringify(next)
      if (serialized !== previous) {
        previous = serialized
        setLayout(next)
      }
    }
    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = new MutationObserver(schedule)
    const root = document.getElementById('root')
    if (root)
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'aria-pressed', 'inert', 'open'],
      })
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    viewport?.addEventListener('resize', schedule)
    viewport?.addEventListener('scroll', schedule)
    if (card.current) resize?.observe(card.current)
    measure()
    return () => {
      cancelAnimationFrame(frame)
      resize?.disconnect()
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, true)
      viewport?.removeEventListener('resize', schedule)
      viewport?.removeEventListener('scroll', schedule)
      if (described) {
        const ids = (described.getAttribute('aria-describedby') || '')
          .split(' ')
          .filter((id) => id && id !== 'editor-coach-description')
          .join(' ')
        if (ids) described.setAttribute('aria-describedby', ids)
        else described.removeAttribute('aria-describedby')
      }
    }
  }, [anchor, topic, locale, suspended])
  useEffect(() => {
    if (explicit && layout && !focused.current) {
      action.current?.focus({ preventScroll: true })
      focused.current = true
    }
  }, [explicit, layout])
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]'))
        return
      const inCard = card.current?.contains(document.activeElement)
      event.preventDefault()
      callbacks.current.dismiss()
      if (inCard)
        (
          targetRef.current?.closest<HTMLElement>('button') ??
          targetRef.current?.querySelector<HTMLElement>('button') ??
          targetRef.current ??
          callbacks.current.focusAfterDismiss.current
        )?.focus({ preventScroll: true })
    }
    function focusin(event: FocusEvent) {
      if (
        event.target instanceof HTMLElement &&
        (event.target.matches('input, textarea, select') ||
          event.target.closest('.design-options button'))
      ) {
        // Keep the form available while writing; a requested tour can be resumed.
        setSuspended(true)
      }
    }
    function pointerdown(event: PointerEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest('.design-options button')
      )
        setSuspended(true)
    }
    window.addEventListener('keydown', keydown)
    document.addEventListener('focusin', focusin)
    document.addEventListener('pointerdown', pointerdown)
    return () => {
      window.removeEventListener('keydown', keydown)
      document.removeEventListener('focusin', focusin)
      document.removeEventListener('pointerdown', pointerdown)
    }
  }, [explicit])
  function close() {
    dismiss()
    focusAfterDismiss.current?.focus({ preventScroll: true })
  }
  const position = layout?.position
  const hidden = !layout || suspended
  return createPortal(
    <>
      {!hidden && (
        <div
          className="guide-spotlight"
          aria-hidden="true"
          style={{
            left: layout.target.left - 4,
            top: layout.target.top - 4,
            width: layout.target.width + 8,
            height: layout.target.height + 8,
          }}
        />
      )}
      {!hidden && position && (
        <>
          {position.side === 'right' &&
            position.x - layout.target.right > 20 && (
              <span
                className="guide-connector"
                aria-hidden="true"
                style={{
                  left: layout.target.right + 4,
                  top: position.y + position.arrow,
                  width: position.x - layout.target.right - 10,
                }}
              />
            )}
          <span
            className={`guide-pointer guide-pointer-${position.side}`}
            aria-hidden="true"
            style={{
              left:
                position.side === 'right'
                  ? position.x - 6
                  : position.side === 'left'
                    ? position.x + (card.current?.offsetWidth ?? 332) - 6
                    : position.x + position.arrow - 6,
              top:
                position.side === 'bottom'
                  ? position.y - 6
                  : position.side === 'top'
                    ? position.y + (card.current?.offsetHeight ?? 0) - 6
                    : position.y + position.arrow - 6,
            }}
          />
        </>
      )}
      <div
        ref={card}
        className="guide-tip guide-floating"
        data-guide-topic={topic}
        data-placement={position?.side}
        role="dialog"
        aria-modal="false"
        aria-label={t('Подсказка редактора', 'Editor tip')}
        style={
          {
            left: position?.x ?? 12,
            top: position?.y ?? 12,
            maxHeight: position?.maxHeight,
            visibility: hidden ? 'hidden' : 'visible',
            '--guide-arrow': `${position?.arrow ?? 24}px`,
          } as CSSProperties
        }
      >
        <div className="guide-tip-head">
          <span className="guide-count">
            {t('ШАГ', 'STEP')} {(index ?? tourTopics.indexOf(topic)) + 1} /{' '}
            {tourTopics.length}
          </span>
          <button
            className="icon-button"
            aria-label={t(
              'Больше не показывать эту подсказку',
              'Dismiss this editor tip',
            )}
            onClick={close}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <strong>{text.title}</strong>
        <p id="editor-coach-description">{text.summary}</p>
        <div className="guide-actions">
          {index !== undefined ? (
            <button className="text-button" onClick={close}>
              {t('Пропустить знакомство', 'Skip walkthrough')}
            </button>
          ) : (
            <button className="text-button" onClick={help}>
              {t('Помощь по редактору', 'Editor guide')}
            </button>
          )}
          <div className="guide-navigation">
            {back && (
              <button className="text-button" onClick={back}>
                {t('Назад', 'Back')}
              </button>
            )}
            <button ref={action} className="button primary" onClick={primary}>
              {primaryLabel}
              {index === tourTopics.length - 1 ? (
                <Check size={15} aria-hidden="true" />
              ) : (
                <ArrowRight size={15} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      {hidden && explicit && !modalOpen && (
        <div className="guide-resume">
          <button
            className="button primary"
            onClick={() => {
              setSuspended(false)
              focused.current = false
              targetRef.current?.scrollIntoView?.({
                block: 'center',
                behavior: 'instant',
              })
            }}
          >
            {t('Продолжить знакомство', 'Continue walkthrough')}
          </button>
          <button
            className="icon-button"
            aria-label={t(
              'Больше не показывать эту подсказку',
              'Dismiss this editor tip',
            )}
            onClick={close}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </>,
    document.body,
  )
}
export function EditorGuide({
  locale,
  close,
  enabled,
  setEnabled,
  reset,
  choose,
  begin,
}: {
  locale: Locale
  close: () => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  reset: () => void
  choose: (topic: GuideTopic) => void
  begin: () => void
}) {
  const t = translator(locale)
  return (
    <Dialog
      title={t('Помощь по редактору', 'Editor guide')}
      closeLabel={t('Закрыть', 'Close')}
      close={close}
      className="editor-guide-dialog"
    >
      <button className="button primary guide-start" onClick={begin}>
        {t('Показать редактор шаг за шагом', 'Walk me through the editor')}{' '}
        <ArrowRight size={16} aria-hidden="true" />
      </button>
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
