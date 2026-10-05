import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { ChevronDown } from 'lucide-react'

export const EXIT_MS = 180

export const reducedMotion = () =>
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
/**
 * Panels and lists animate on every user action; with the system's
 * reduced-motion setting the same transitions run shorter and calmer.
 */
export function canAnimate(element?: Element | null) {
  return typeof element?.animate === 'function'
}

/** Shrinks a dismissed item in the document flow before it unmounts. */
export function useExitCollapse(
  ref: RefObject<HTMLElement | null>,
  closing: boolean,
) {
  useLayoutEffect(() => {
    const element = ref.current
    if (!closing || !element || !canAnimate(element)) return
    const animation = element.animate(
      reducedMotion()
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            {
              height: `${element.getBoundingClientRect().height}px`,
              opacity: 1,
            },
            {
              height: '0px',
              opacity: 0,
              paddingTop: '0px',
              paddingBottom: '0px',
              marginTop: '0px',
              marginBottom: '0px',
            },
          ],
      { duration: EXIT_MS, easing: 'ease-in', fill: 'forwards' },
    )
    return () => animation.cancel()
  }, [closing, ref])
}
export const motionMs = (ms: number) =>
  reducedMotion() ? Math.round(ms * 0.6) : ms
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
  const last = useRef(value)
  const [state, setState] = useState({ open, closing: false })
  if (open) last.current = value
  if (open && !state.open) setState({ open: true, closing: false })
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
    value: state.open || state.closing ? last.current : value,
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
    previous = useRef(open),
    active = useRef<Animation | null>(null),
    currentOpen = useRef(open)
  currentOpen.current = open
  if (open && !shown) setShown(true)
  useLayoutEffect(() => {
    const element = ref.current
    if (previous.current === open) return
    previous.current = open
    if (!element) return
    if (open) element.hidden = false
    if (!canAnimate(element)) {
      if (!open) setShown(false)
      return
    }
    const reversing = active.current?.playState === 'running'
    const start = reversing
      ? element.getBoundingClientRect().height
      : open
        ? 0
        : element.getBoundingClientRect().height
    const opacity = reversing
      ? Number(getComputedStyle(element).opacity)
      : open
        ? 0
        : 1
    active.current?.cancel()
    const height = element.scrollHeight
    element.style.overflow = 'hidden'
    const animation = element.animate(
      reducedMotion()
        ? [{ opacity }, { opacity: open ? 1 : 0 }]
        : open
          ? [
              { height: `${start}px`, opacity },
              { height: `${height}px`, opacity: 1 },
            ]
          : [
              { height: `${start}px`, opacity },
              { height: '0px', opacity: 0 },
            ],
      {
        duration: motionMs(open ? 240 : EXIT_MS),
        easing: open ? 'cubic-bezier(.2,.8,.2,1)' : 'ease-in',
        fill: 'forwards',
      },
    )
    active.current = animation
    animation.onfinish = () => {
      if (active.current !== animation || currentOpen.current !== open) return
      element.style.overflow = ''
      if (open) {
        animation.cancel()
        return
      }
      // Hide before React unmounts the content so the full height never flashes.
      element.hidden = true
      setShown(false)
      animation.cancel()
    }
  }, [open])
  useEffect(() => () => active.current?.cancel(), [])
  return (
    <div
      ref={ref}
      id={id}
      className={`collapse ${className || ''}`}
      hidden={!shown}
      inert={!open}
      aria-hidden={!open}
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
