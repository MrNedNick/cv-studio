import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ChevronDown } from 'lucide-react'

export const EXIT_MS = 180

export const reducedMotion = () =>
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
/** Movement and size changes; skipped when the system asks for less motion. */
export function canAnimate(element?: Element | null) {
  return typeof element?.animate === 'function' && !reducedMotion()
}
/** Fades are kept even with reduced motion: they do not move anything. */
export const canFade = (element?: Element | null) =>
  typeof element?.animate === 'function'

/** Tracks a media query, e.g. the desktop breakpoint. */
export function useMediaQuery(query: string) {
  const read = () => Boolean(window.matchMedia?.(query).matches),
    [matches, setMatches] = useState(read)
  useEffect(() => {
    const list = window.matchMedia?.(query)
    if (!list) return
    const change = () => setMatches(list.matches)
    change()
    list.addEventListener('change', change)
    return () => list.removeEventListener('change', change)
  }, [query])
  return matches
}

/**
 * Keeps the last open value around for a short exit animation.
 * Returns the value to render and whether it is on its way out.
 */
export function useLingering<T>(value: T, open: boolean) {
  const [state, setState] = useState({ value, open, closing: false })
  if (open && (!state.open || state.value !== value))
    setState({ value, open: true, closing: false })
  else if (!open && state.open)
    setState({ ...state, open: false, closing: canFade(document.body) })
  useEffect(() => {
    if (!state.closing) return
    const timer = setTimeout(
      () => setState((current) => ({ ...current, closing: false })),
      EXIT_MS,
    )
    return () => clearTimeout(timer)
  }, [state.closing])
  return {
    value: state.open || state.closing ? state.value : value,
    shown: state.open || state.closing,
    closing: state.closing,
  }
}

/** Animates its height when `open` changes; children unmount once closed. */
export function Collapse({
  open,
  children,
  id,
  className,
}: {
  open: boolean
  children: ReactNode
  id?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null),
    [shown, setShown] = useState(open),
    previous = useRef(open)
  if (open && !shown) setShown(true)
  useLayoutEffect(() => {
    const element = ref.current
    if (previous.current === open) return
    previous.current = open
    if (!element) return
    if (!canAnimate(element)) {
      if (!open) setShown(false)
      else if (canFade(element))
        element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 })
      return
    }
    element.getAnimations().forEach((animation) => animation.cancel())
    const height = element.scrollHeight
    element.style.overflow = 'hidden'
    const animation = element.animate(
      open
        ? [
            { height: '0px', opacity: 0 },
            { height: `${height}px`, opacity: 1 },
          ]
        : [
            { height: `${height}px`, opacity: 1 },
            { height: '0px', opacity: 0 },
          ],
      {
        duration: open ? 240 : EXIT_MS,
        easing: open ? 'cubic-bezier(.2,.8,.2,1)' : 'ease-in',
      },
    )
    animation.onfinish = () => {
      element.style.overflow = ''
      if (open) return
      // Hide before React unmounts the content so the full height never flashes.
      element.hidden = true
      setShown(false)
    }
  }, [open])
  return (
    <div
      ref={ref}
      id={id}
      className={`collapse ${className || ''}`}
      hidden={!shown}
    >
      {shown ? children : null}
    </div>
  )
}

/** A disclosure with an animated body, used instead of <details>. */
export function Disclosure({
  summary,
  children,
  className,
  open: controlled,
  defaultOpen = false,
  onToggle,
}: {
  summary: ReactNode
  children: ReactNode
  className?: string
  open?: boolean
  defaultOpen?: boolean
  onToggle?: (open: boolean) => void
}) {
  const id = useId(),
    [own, setOwn] = useState(defaultOpen),
    open = controlled ?? own
  return (
    <div className={`disclosure ${className || ''} ${open ? 'is-open' : ''}`}>
      <button
        className="disclosure-summary"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOwn(!open)
          onToggle?.(!open)
        }}
      >
        <ChevronDown size={16} aria-hidden="true" />
        {summary}
      </button>
      <Collapse open={open} id={id} className="disclosure-body">
        {children}
      </Collapse>
    </div>
  )
}
