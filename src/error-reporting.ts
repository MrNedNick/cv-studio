import type { Event, StackFrame } from '@sentry/browser'

export type DiagnosticSource =
  'window_error' | 'unhandled_rejection' | 'react_boundary' | 'pdf_export'
const sources: DiagnosticSource[] = [
  'window_error',
  'unhandled_rejection',
  'react_boundary',
  'pdf_export',
]
const errorTypes = [
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'URIError',
  'EvalError',
  'AggregateError',
  'DOMException',
]
const message = 'Application error; private details omitted'
const queue: Event[] = []
let started = false
let active = false
let send: ((event: Event) => void) | undefined
let reported = 0

export function errorReportingConfiguration(
  dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined,
) {
  if (!dsn?.trim()) return null
  try {
    const url = new URL(dsn.trim())
    if (
      url.protocol !== 'https:' ||
      !/^[a-z\d]{1,128}$/i.test(url.username) ||
      url.password ||
      url.search ||
      url.hash ||
      !/^\/(?:[a-z\d_-]+\/)*[1-9]\d*$/.test(url.pathname)
    )
      return null
    return { dsn: url.href, host: url.host }
  } catch {
    return null
  }
}

export function reportingOptedOut() {
  return (
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  )
}

export function diagnosticRoute() {
  if (location.pathname === '/privacy.html') return '/privacy.html'
  const route = location.hash.split('?')[0]
  return route === '#/edit'
    ? '/edit'
    : route === '#/templates'
      ? '/templates'
      : '/'
}

function appAssets() {
  const urls = [
    ...performance
      .getEntriesByType('resource')
      .filter((r) =>
        ['script', 'link'].includes(
          (r as PerformanceResourceTiming).initiatorType,
        ),
      )
      .map((r) => r.name),
    ...Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[src]'),
      (s) => s.src,
    ),
    ...Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="modulepreload"]'),
      (l) => l.href,
    ),
  ]
  return new Set(
    urls.flatMap((value) => {
      try {
        const url = new URL(value, location.origin)
        return url.origin === location.origin &&
          /^\/assets\/[a-z\d_-]+\.js$/i.test(url.pathname) &&
          !url.search &&
          !url.hash
          ? [url.href]
          : []
      } catch {
        return []
      }
    }),
  )
}

function safeFrames(frames: StackFrame[], assets: Set<string>) {
  return frames
    .flatMap((frame) => {
      if (typeof frame.filename !== 'string') return []
      let filename: string
      try {
        const url = new URL(frame.filename, location.origin)
        url.search = ''
        url.hash = ''
        filename = url.href
      } catch {
        return []
      }
      if (!assets.has(filename)) return []
      const result: StackFrame = { filename, in_app: true }
      for (const field of ['lineno', 'colno'] as const) {
        const value = frame[field]
        if (
          typeof value === 'number' &&
          Number.isSafeInteger(value) &&
          value > 0 &&
          value <= 10000000
        )
          result[field] = value
      }
      return [result]
    })
    .slice(-24)
}

/** Rebuild the complete event; unknown fields never pass through. */
export function sanitizeErrorEvent(
  event: Event,
  assets = appAssets(),
): (Event & { type: undefined }) | null {
  const source = event.tags?.diagnostic_source
  if (event.type || !sources.includes(source as DiagnosticSource)) return null
  const raw = event.exception?.values?.at(-1)
  const type = raw?.type && errorTypes.includes(raw.type) ? raw.type : 'Error'
  const frames = safeFrames(raw?.stacktrace?.frames ?? [], assets)
  const route = ['/', '/edit', '/templates', '/privacy.html'].includes(
    event.tags?.route as string,
  )
    ? (event.tags!.route as string)
    : diagnosticRoute()
  return {
    type: undefined,
    ...(event.event_id && /^[a-f\d]{32}$/i.test(event.event_id)
      ? { event_id: event.event_id }
      : {}),
    timestamp: Date.now() / 1000,
    platform: 'javascript',
    level: 'error',
    environment: import.meta.env.PROD ? 'production' : 'development',
    exception: {
      values: [
        {
          type,
          value: message,
          ...(frames.length ? { stacktrace: { frames } } : {}),
        },
      ],
    },
    tags: { diagnostic_source: source, route },
    request: { url: location.origin + route },
    fingerprint: [
      source as string,
      type,
      frames.at(-1)?.filename ?? route,
      String(frames.at(-1)?.lineno ?? 0),
    ],
  }
}

function diagnosticFromError(
  error: unknown,
  source: DiagnosticSource,
): Event | null {
  let name = 'Error',
    stack = ''
  try {
    if (error instanceof Error) {
      name = error.name
      stack = error.stack ?? ''
    }
  } catch {
    /* A broken error object must not break editing. */
  }
  const frames: StackFrame[] = []
  for (const line of stack.slice(0, 32000).split('\n').slice(0, 40).reverse()) {
    const match = line.match(/(https?:\/\/[^\s)]+):(\d+):(\d+)\)?$/)
    if (match)
      frames.push({
        filename: match[1],
        lineno: Number(match[2]),
        colno: Number(match[3]),
      })
  }
  return sanitizeErrorEvent({
    exception: { values: [{ type: name, stacktrace: { frames } }] },
    tags: { diagnostic_source: source },
  })
}

export function reportError(error: unknown, source: DiagnosticSource) {
  if (!active || reportingOptedOut() || reported >= 20) return
  try {
    const event = diagnosticFromError(error, source)
    if (!event) return
    reported++
    if (send) send(event)
    else if (queue.length < 10) queue.push(event)
  } catch {
    /* Diagnostics are optional. */
  }
}

export async function initializeErrorReporting(dsn?: string) {
  if (started) return
  started = true
  const config = errorReportingConfiguration(dsn)
  if (!config || reportingOptedOut()) return
  active = true
  window.addEventListener('error', (e) => {
    if (e instanceof ErrorEvent) reportError(e.error, 'window_error')
  })
  window.addEventListener('unhandledrejection', (e) =>
    reportError(e.reason, 'unhandled_rejection'),
  )
  try {
    const { createErrorReporter } = await import('./sentry-client')
    if (reportingOptedOut()) {
      active = false
      queue.length = 0
      return
    }
    send = createErrorReporter(config)
    queue.splice(0).forEach((event) => send?.(event))
  } catch {
    active = false
    queue.length = 0
  }
}
