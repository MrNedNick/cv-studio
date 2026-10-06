import {
  BrowserClient,
  Scope,
  defaultStackParser,
  makeFetchTransport,
  type Event,
} from '@sentry/browser'
import {
  reportingOptedOut,
  sanitizeErrorEvent,
  type errorReportingConfiguration,
} from './error-reporting'

type Envelope = Parameters<ReturnType<typeof makeFetchTransport>['send']>[0]
type SafeEnvelope = [
  { event_id: string; sent_at: string },
  [{ type: 'event' }, Event][],
]

/** The transport also rejects non-error payloads, including attachments. */
export function sanitizeErrorEnvelope(envelope: Envelope): SafeEnvelope | null {
  if (reportingOptedOut()) return null
  for (const [header, payload] of envelope[1]) {
    if (
      header.type !== 'event' ||
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload)
    )
      continue
    const event = sanitizeErrorEvent(payload as Event)
    if (event?.event_id)
      return [
        { event_id: event.event_id, sent_at: new Date().toISOString() },
        [[{ type: 'event' }, event]],
      ]
  }
  return null
}

export function createErrorReporter(
  config: NonNullable<ReturnType<typeof errorReportingConfiguration>>,
) {
  const client = new BrowserClient({
    dsn: config.dsn,
    stackParser: defaultStackParser,
    integrations: [],
    sendClientReports: false,
    maxBreadcrumbs: 0,
    sampleRate: 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    beforeBreadcrumb: () => null,
    beforeSend: (event) =>
      reportingOptedOut() ? null : sanitizeErrorEvent(event),
    transport(options) {
      const transport = makeFetchTransport({
        ...options,
        fetchOptions: { credentials: 'omit', referrerPolicy: 'no-referrer' },
      })
      return {
        send(envelope) {
          const safe = sanitizeErrorEnvelope(envelope)
          return safe ? transport.send(safe) : Promise.resolve({})
        },
        flush: (timeout) => transport.flush(timeout),
      }
    },
  })
  const scope = new Scope()
  scope.setClient(client)
  client.init()
  return (event: Event) => {
    if (!reportingOptedOut()) scope.captureEvent(event)
  }
}
