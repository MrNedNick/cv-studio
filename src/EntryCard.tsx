import { useId, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Trash2 } from 'lucide-react'
import { dateRange, type Entry, type Locale } from './model'

export default function EntryCard({
  entry,
  title,
  locale,
  expanded,
  toggle,
  moveUp,
  moveDown,
  remove,
  children,
}: {
  entry: Entry
  title: string
  locale: Locale
  expanded: boolean
  toggle: () => void
  moveUp?: () => void
  moveDown?: () => void
  remove: () => void
  children: ReactNode
}) {
  const id = useId(),
    ru = locale === 'ru'
  const dates = dateRange(entry, locale)
  return (
    <div
      className={`entry-card ${expanded ? '' : 'collapsed'}`}
      data-entry-id={entry.id}
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
            aria-label={ru ? 'Поднять' : 'Move up'}
            title={ru ? 'Поднять запись' : 'Move entry up'}
            aria-describedby={`${id}-title`}
            onClick={moveUp}
          >
            <ArrowUp size={15} />
          </button>
          <button
            className="icon-button"
            disabled={!moveDown}
            aria-label={ru ? 'Опустить' : 'Move down'}
            title={ru ? 'Опустить запись' : 'Move entry down'}
            aria-describedby={`${id}-title`}
            onClick={moveDown}
          >
            <ArrowDown size={15} />
          </button>
          <button
            className="icon-button delete"
            aria-label={ru ? 'Удалить запись' : 'Remove entry'}
            title={ru ? 'Удалить запись' : 'Remove entry'}
            aria-describedby={`${id}-title`}
            onClick={remove}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div id={`${id}-fields`} hidden={!expanded}>
        {expanded ? children : null}
      </div>
    </div>
  )
}
