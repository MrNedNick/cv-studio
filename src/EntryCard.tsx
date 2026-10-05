import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Trash2 } from 'lucide-react'
import { dateRange, type Entry, type Locale } from './model'
import { Collapse, canFade, reducedMotion } from './motion'
import { translator } from './i18n'

export default function EntryCard({
  entry,
  title,
  locale,
  contentLocale,
  expanded,
  toggle,
  moveUp,
  moveDown,
  remove,
  fresh = false,
  children,
}: {
  entry: Entry
  title: string
  locale: Locale
  /** Language of the resume text; dates in the summary follow it. */
  contentLocale?: Locale
  expanded: boolean
  toggle: () => void
  moveUp?: () => void
  moveDown?: () => void
  remove: () => void
  /** Just added: grows into place instead of appearing at once. */
  fresh?: boolean
  children: ReactNode
}) {
  const id = useId(),
    t = translator(locale)
  const dates = dateRange(entry, contentLocale ?? locale),
    card = useRef<HTMLDivElement>(null),
    leaving = useRef(false),
    completed = useRef(false),
    [closing, setClosing] = useState(false),
    activeAnimation = useRef<Animation | null>(null),
    latestRemove = useRef(remove)
  latestRemove.current = remove
  useEffect(
    () => () => {
      activeAnimation.current?.cancel()
      if (leaving.current && !completed.current) {
        completed.current = true
        latestRemove.current()
      }
    },
    [],
  )
  useLayoutEffect(() => {
    const element = card.current
    if (!fresh || !element || !canFade(element)) return
    const height = element.offsetHeight
    activeAnimation.current = element.animate(
      reducedMotion()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, height: '0px', transform: 'translateY(-6px)' },
            { opacity: 1, height: `${height}px`, transform: 'none' },
          ],
      { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' },
    )
    // Only the first render of a new card animates.
  }, [])
  // Removing folds the card away first, so the list closes the gap smoothly.
  function removeSmoothly() {
    const element = card.current
    if (leaving.current) return
    if (!element || !canFade(element)) return remove()
    leaving.current = true
    setClosing(true)
    const height = element.getBoundingClientRect().height
    activeAnimation.current?.cancel()
    element.style.overflow = 'hidden'
    const animation = element.animate(
      reducedMotion()
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { opacity: 1, height: `${height}px` },
            {
              opacity: 0,
              height: '0px',
              marginBottom: '0px',
              paddingTop: '0px',
              paddingBottom: '0px',
            },
          ],
      { duration: 200, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' },
    )
    activeAnimation.current = animation
    animation.onfinish = () => {
      if (activeAnimation.current === animation && element.isConnected) {
        completed.current = true
        latestRemove.current()
      }
    }
  }
  return (
    <div
      ref={card}
      className={`entry-card ${expanded ? '' : 'collapsed'}`}
      data-entry-id={entry.id}
      inert={closing}
      aria-hidden={closing}
    >
      <div className="entry-header">
        <h2>
          <button
            className="entry-toggle"
            aria-expanded={expanded}
            aria-controls={`${id}-fields`}
            onClick={toggle}
          >
            <ChevronDown size={18} />
            <span>
              <strong id={`${id}-title`}>{title}</strong>
              {(entry.subtitle || dates) && (
                <small>
                  {[entry.subtitle, dates].filter(Boolean).join(' · ')}
                </small>
              )}
            </span>
          </button>
        </h2>
        <div className="entry-actions">
          <button
            className="icon-button"
            disabled={!moveUp}
            aria-label={t('Поднять', 'Move up')}
            title={t('Поднять запись', 'Move entry up')}
            aria-describedby={`${id}-title`}
            onClick={moveUp}
          >
            <ArrowUp size={15} />
          </button>
          <button
            className="icon-button"
            disabled={!moveDown}
            aria-label={t('Опустить', 'Move down')}
            title={t('Опустить запись', 'Move entry down')}
            aria-describedby={`${id}-title`}
            onClick={moveDown}
          >
            <ArrowDown size={15} />
          </button>
          <button
            className="icon-button delete"
            aria-label={t('Удалить запись', 'Remove entry')}
            title={t('Удалить запись', 'Remove entry')}
            aria-describedby={`${id}-title`}
            onClick={removeSmoothly}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <Collapse open={expanded} id={`${id}-fields`}>
        {children}
        <div className="entry-footer">
          <button className="text-button danger" onClick={removeSmoothly}>
            <Trash2 size={14} />
            {t('Удалить эту запись', 'Delete this entry')}
          </button>
        </div>
      </Collapse>
    </div>
  )
}
