import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Event } from '@sentry/browser'

const sdk = vi.hoisted(() => ({ send: vi.fn(), create: vi.fn(), fail: false }))
vi.mock('./sentry-client', () => ({
  createErrorReporter: (...args: unknown[]) => {
    sdk.create(...args)
    if (sdk.fail) throw new Error('Unavailable')
    return sdk.send
  },
}))
const dsn = 'https://publickey@errors.example.test/123'
const asset = `${location.origin}/assets/Editor-AbCd1234.js`
let listeners: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  sdk.fail = false
  listeners = vi.spyOn(window, 'addEventListener')
  vi.stubGlobal('performance', { getEntriesByType: () => [] })
  window.history.replaceState(
    {},
    '',
    '/?name=Private#/edit?email=private@example.test',
  )
  document.head.innerHTML = `<script type="module" src="${asset}"></script>`
})
afterEach(() => {
  for (const [name, fn, options] of listeners.mock.calls)
    window.removeEventListener(
      name as string,
      fn as EventListener,
      options as boolean,
    )
  document.head.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it.each([
  '',
  'bad',
  'http://publickey@errors.example.test/123',
  'https://publickey:secret@errors.example.test/123',
  'https://errors.example.test/123',
  'https://publickey@errors.example.test/0',
  'https://publickey@errors.example.test/123?resume=private',
  'https://publickey@errors.example.test/123#private',
])('rejects unsafe or absent DSN %s without loading the SDK', async (value) => {
  const api = await import('./error-reporting')
  await api.initializeErrorReporting(value)
  api.reportError(new Error('Private resume'), 'react_boundary')
  expect(api.errorReportingConfiguration(value)).toBeNull()
  expect(sdk.create).not.toHaveBeenCalled()
  expect(sdk.send).not.toHaveBeenCalled()
  expect(listeners).not.toHaveBeenCalled()
})

it('accepts a public HTTPS DSN and self-hosted path prefixes', async () => {
  const { errorReportingConfiguration } = await import('./error-reporting')
  expect(errorReportingConfiguration(dsn)).toEqual({
    dsn,
    host: 'errors.example.test',
  })
  expect(
    errorReportingConfiguration(
      ' https://PUBLICkey@errors.example.test/sentry/456 ',
    ),
  ).not.toBeNull()
})

it('rebuilds polluted events and keeps only known application frames and fixed categories', async () => {
  const { sanitizeErrorEvent } = await import('./error-reporting')
  const raw: Event = {
    event_id: 'a'.repeat(32),
    message: 'Private Person',
    logentry: { message: 'Private role' },
    user: { email: 'private@example.test' },
    extra: { resume: 'Private resume', file: 'Private.pdf' },
    request: {
      url: 'https://private.example.test/?name=Private',
      headers: { Cookie: 'private' },
      data: 'Private text',
    },
    tags: {
      diagnostic_source: 'react_boundary',
      email: 'private@example.test',
    },
    breadcrumbs: [{ message: 'Private content' }],
    contexts: { resume: { name: 'Private' } },
    exception: {
      values: [
        {
          type: 'TypeError',
          value: 'Private name',
          stacktrace: {
            frames: [
              {
                filename: 'https://private.example.test/Private.pdf',
                function: 'Private',
              },
              {
                filename: `${location.origin}/assets/Private-Resume.js`,
                vars: { name: 'Private' },
              },
              {
                filename: `${asset}?email=private@example.test#Private`,
                function: 'Private function',
                lineno: 12,
                colno: 34,
                pre_context: ['Private'],
                context_line: 'Private',
              },
            ],
          },
        },
      ],
    },
  }
  const safe = sanitizeErrorEvent(raw, new Set([asset]))!
  expect(safe.exception!.values![0]).toEqual({
    type: 'TypeError',
    value: 'Application error; private details omitted',
    stacktrace: {
      frames: [{ filename: asset, in_app: true, lineno: 12, colno: 34 }],
    },
  })
  expect(safe.request).toEqual({ url: location.origin + '/edit' })
  expect(JSON.stringify(safe)).not.toMatch(
    /Private|private@example|Private.pdf|Cookie|breadcrumbs|contexts|extra|function|vars|context_line/,
  )
  expect(raw.exception!.values![0].value).toBe('Private name')
})

it('drops non-error events and unknown sources, clamps positions and ignores private error names', async () => {
  const { sanitizeErrorEvent } = await import('./error-reporting')
  expect(
    sanitizeErrorEvent(
      { type: 'transaction', tags: { diagnostic_source: 'window_error' } },
      new Set(),
    ),
  ).toBeNull()
  expect(
    sanitizeErrorEvent({ tags: { diagnostic_source: 'Private' } }, new Set()),
  ).toBeNull()
  const safe = sanitizeErrorEvent(
    {
      tags: { diagnostic_source: 'window_error' },
      exception: {
        values: [
          {
            type: 'Private Person',
            value: 'Private',
            stacktrace: {
              frames: [{ filename: asset, lineno: -1, colno: Infinity }],
            },
          },
        ],
      },
    },
    new Set([asset]),
  )!
  expect(safe.exception!.values![0]).toEqual({
    type: 'Error',
    value: 'Application error; private details omitted',
    stacktrace: { frames: [{ filename: asset, in_app: true }] },
  })
  expect(JSON.stringify(safe)).not.toContain('Private')
})

it.each([{ doNotTrack: '1' }, { globalPrivacyControl: true }])(
  'respects browser privacy controls before initialization',
  async (preference) => {
    vi.stubGlobal('navigator', preference)
    const { initializeErrorReporting } = await import('./error-reporting')
    await initializeErrorReporting(dsn)
    expect(sdk.create).not.toHaveBeenCalled()
    expect(listeners).not.toHaveBeenCalled()
  },
)

it('captures boundary, browser and rejection errors without their values; initializes once and stops after opt-out', async () => {
  const api = await import('./error-reporting')
  await api.initializeErrorReporting(dsn)
  await api.initializeErrorReporting(dsn)
  const error = new TypeError('Private resume')
  error.stack = `TypeError: Private\n  at Private (${asset}:3:4)`
  api.reportError(error, 'react_boundary')
  window.dispatchEvent(new ErrorEvent('error', { error }))
  window.dispatchEvent(new Event('error'))
  const rejection = new Event('unhandledrejection')
  Object.defineProperty(rejection, 'reason', {
    value: { resume: 'Private Person' },
  })
  window.dispatchEvent(rejection)
  expect(sdk.create).toHaveBeenCalledTimes(1)
  expect(sdk.send).toHaveBeenCalledTimes(3)
  expect(sdk.send.mock.calls.map(([e]) => e.tags.diagnostic_source)).toEqual([
    'react_boundary',
    'window_error',
    'unhandled_rejection',
  ])
  expect(JSON.stringify(sdk.send.mock.calls)).not.toMatch(/Private|resume"/)
  vi.stubGlobal('navigator', { globalPrivacyControl: true })
  api.reportError(error, 'pdf_export')
  expect(sdk.send).toHaveBeenCalledTimes(3)
})

it('bounds load queues and error storms and survives a failed SDK', async () => {
  const api = await import('./error-reporting')
  const loading = api.initializeErrorReporting(dsn)
  for (let i = 0; i < 100; i++)
    api.reportError(new Error('Private'), 'window_error')
  await loading
  expect(sdk.send.mock.calls.length).toBeLessThanOrEqual(20)
  expect(sdk.send.mock.calls.length).toBeGreaterThan(0)
  vi.resetModules()
  sdk.fail = true
  sdk.send.mockClear()
  const failed = await import('./error-reporting')
  await failed.initializeErrorReporting(dsn)
  expect(() =>
    failed.reportError(new Error('Private'), 'window_error'),
  ).not.toThrow()
  expect(sdk.send).not.toHaveBeenCalled()
})

it('keeps the error route when navigation happens before delivery', async () => {
  const { sanitizeErrorEvent } = await import('./error-reporting')
  window.history.replaceState({}, '', '/privacy.html?ref=reddit#Private')
  const event = sanitizeErrorEvent(
    { tags: { diagnostic_source: 'window_error' } },
    new Set(),
  )!
  window.history.replaceState({}, '', '/#/edit?email=Private')
  expect(sanitizeErrorEvent(event, new Set())!.request!.url).toBe(
    location.origin + '/privacy.html',
  )
})
