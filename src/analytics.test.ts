import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { attributionKey, attributionLifetime } from './attribution'

const id = 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2'
let listeners: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  window.history.replaceState(
    {},
    '',
    '/?ref=reddit-resumes&email=private@example.com#/edit?name=Private',
  )
  delete window.umami
  listeners = vi.spyOn(window, 'addEventListener')
})
afterEach(() => {
  for (const [name, fn, options] of listeners.mock.calls)
    window.removeEventListener(
      name as string,
      fn as EventListener,
      options as boolean | EventListenerOptions | undefined,
    )
  document.getElementById('neatcv-analytics')?.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function init(
  config = { websiteId: id, scriptUrl: undefined as string | undefined },
) {
  const api = await import('./analytics')
  api.initializeAnalytics(config)
  return api
}
function tracker() {
  const track = vi.fn()
  window.umami = { track }
  document.getElementById('neatcv-analytics')!.dispatchEvent(new Event('load'))
  return track
}

it('records source locally without loading or calling analytics when no ID exists', async () => {
  const { trackEvent } = await init({ websiteId: '', scriptUrl: undefined })
  const track = vi.fn()
  window.umami = { track }
  trackEvent('resume_created')
  expect(document.getElementById('neatcv-analytics')).toBeNull()
  expect(track).not.toHaveBeenCalled()
  expect(JSON.parse(localStorage.getItem(attributionKey)!).last.ref).toBe(
    'reddit-resumes',
  )
})

it('sends the privacy route without its query or section fragment', async () => {
  window.history.replaceState(
    {},
    '',
    '/privacy.html?ref=telegram&email=private@example.com#sentry',
  )
  await init()
  const track = tracker()
  expect(track).toHaveBeenCalledTimes(1)
  const payload = track.mock.calls[0][0]
  expect(payload.url).toBe('/privacy.html')
  expect(payload.data.ref).toBe('telegram')
  expect(JSON.stringify(payload)).not.toMatch(/private@example|email=|#sentry/)
})

it('queues a visit and actions once, flushes on load and sends only safe event fields', async () => {
  const { initializeAnalytics, trackEvent } = await init()
  initializeAnalytics({ websiteId: id, scriptUrl: undefined })
  const script = document.getElementById('neatcv-analytics')!
  expect(document.querySelectorAll('#neatcv-analytics')).toHaveLength(1)
  expect(script.getAttribute('src')).toBe('https://cloud.umami.is/script.js')
  expect(script.getAttribute('data-auto-track')).toBe('false')
  trackEvent('pdf_downloaded', {
    language: 'de',
    template: 'modern',
    format: 'sharing',
    email: 'private@example.com',
  } as Parameters<typeof trackEvent>[1])
  const track = tracker()
  expect(track).toHaveBeenCalledTimes(2)
  expect(track.mock.calls[1][0]).toEqual({
    website: id,
    hostname: 'localhost',
    url: '/edit',
    title: 'NeatCV',
    referrer: '',
    name: 'pdf_downloaded',
    data: {
      source: 'reddit',
      ref: 'reddit-resumes',
      first_source: 'reddit',
      first_ref: 'reddit-resumes',
      language: 'de',
      template: 'modern',
      format: 'sharing',
    },
  })
  expect(JSON.stringify(track.mock.calls)).not.toMatch(
    /private|Private|email|name=/,
  )
  trackEvent('resume_created', {
    language: 'invalid',
    template: 'unknown',
    format: 'bad',
  })
  expect(Object.keys(track.mock.calls.at(-1)![0].data)).toHaveLength(4)
})

it('updates attribution on tagged hash links and preserves the first source and subsequent untagged visits', async () => {
  const { trackEvent } = await init()
  const track = tracker()
  window.history.replaceState({}, '', '/#/edit?ref=telegram-launch')
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  trackEvent('resume_created')
  expect(track.mock.calls.at(-1)![0].data).toMatchObject({
    ref: 'telegram-launch',
    first_ref: 'reddit-resumes',
  })
  window.history.replaceState({}, '', '/#/edit')
  window.dispatchEvent(new PopStateEvent('popstate'))
  trackEvent('json_downloaded', { format: 'json' })
  expect(track.mock.calls.at(-1)![0].data.ref).toBe('telegram-launch')
})

it('stops using expired sources and sending events after tracker failure', async () => {
  vi.useFakeTimers()
  const { trackEvent } = await init()
  const track = tracker()
  vi.advanceTimersByTime(attributionLifetime)
  trackEvent('pdf_downloaded')
  expect(track.mock.calls.at(-1)![0].data.source).toBe('unattributed')
  document.getElementById('neatcv-analytics')!.dispatchEvent(new Event('error'))
  trackEvent('resume_created')
  expect(track).toHaveBeenCalledTimes(2)
})

it('survives blocked storage, synchronous tracker failures and rejected requests', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota')
  })
  const { trackEvent } = await init()
  const track = tracker()
  window.history.replaceState({}, '', '/#/edit?ref=linkedin-launch')
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  trackEvent('resume_created')
  expect(track.mock.calls.at(-1)![0].data).toMatchObject({
    source: 'linkedin',
    first_source: 'reddit',
  })
  track.mockImplementationOnce(() => {
    throw new Error('offline')
  })
  expect(() => trackEvent('json_downloaded')).not.toThrow()
  track.mockImplementationOnce(() => Promise.reject(new Error('offline')))
  trackEvent('json_downloaded')
  await Promise.resolve()
})

it('respects browser opt-out before loading and after initialization', async () => {
  vi.stubGlobal('navigator', { doNotTrack: '1' })
  await init()
  expect(document.getElementById('neatcv-analytics')).toBeNull()
})

it('respects Global Privacy Control and opt-out changes after initialization', async () => {
  const { trackEvent } = await init()
  const track = tracker()
  vi.stubGlobal('navigator', { globalPrivacyControl: true })
  trackEvent('pdf_downloaded')
  expect(track).toHaveBeenCalledTimes(1)
})

it('bounds the pending queue so a slow or blocked script cannot accumulate actions', async () => {
  const { trackEvent } = await init()
  for (let i = 0; i < 100; i++) trackEvent('resume_created')
  const track = tracker()
  expect(track).toHaveBeenCalledTimes(30)
})

it.each([
  '',
  'invalid',
  'http://stats.example.com/script.js',
  'https://user:password@stats.example.com/script.js',
  'javascript:alert(1)',
])('rejects invalid configuration %s', async (value) => {
  await init(
    value === 'invalid' || value === ''
      ? { websiteId: value, scriptUrl: undefined }
      : { websiteId: id, scriptUrl: value },
  )
  expect(document.getElementById('neatcv-analytics')).toBeNull()
})
