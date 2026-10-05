import {
  attributionData,
  attributionLifetime,
  captureAttribution,
  sourceFromUrl,
  type Attribution,
} from './attribution'
import { locales, templateIds } from './model'

export type AnalyticsEvent =
  | 'site_visit'
  | 'resume_created'
  | 'example_opened'
  | 'resume_imported'
  | 'pdf_downloaded'
  | 'json_downloaded'
  | 'text_downloaded'

type EventData = Partial<Record<'language' | 'template' | 'format', string>>
type Payload = {
  website: string
  hostname: string
  url: '/' | '/edit'
  title: 'NeatCV'
  referrer: ''
  name: AnalyticsEvent
  data: Record<string, string>
}
type Tracker = { track: (payload: Payload) => unknown }
declare global {
  interface Window {
    umami?: Tracker
  }
}

const queue: Payload[] = []
let attribution: Attribution | null = null
let website = ''
let started = false
let loaded = false
let failed = false
let memorySource: string | null = null
let seenRef: string | null = null
const sourceStorage = {
  getItem: (key: string) => {
    try {
      memorySource = localStorage.getItem(key) ?? memorySource
    } catch {
      /* Use this visit's source. */
    }
    return memorySource
  },
  setItem: (key: string, value: string) => {
    memorySource = value
    try {
      localStorage.setItem(key, value)
    } catch {
      /* Keep the source in memory. */
    }
  },
  removeItem: (key: string) => {
    memorySource = null
    try {
      localStorage.removeItem(key)
    } catch {
      /* Storage is unavailable. */
    }
  },
}

function optedOut() {
  return (
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  )
}

function send(payload: Payload) {
  if (optedOut()) return
  try {
    // Tracking must never block editing, file import or a download.
    void Promise.resolve(window.umami?.track(payload)).catch(() => {})
  } catch {
    // A blocked or unavailable tracker has no effect on the editor.
  }
}

export function trackEvent(name: AnalyticsEvent, details: EventData = {}) {
  if (!website || optedOut() || failed) return
  const now = Date.now()
  const current =
    attribution && now - attribution.last.at < attributionLifetime
      ? {
          first:
            now - attribution.first.at < attributionLifetime
              ? attribution.first
              : attribution.last,
          last: attribution.last,
        }
      : null
  const data: Record<string, string> = attributionData(current)
  if (locales.includes(details.language as (typeof locales)[number]))
    data.language = details.language!
  if (templateIds.includes(details.template as (typeof templateIds)[number]))
    data.template = details.template!
  if (
    ['sharing', 'editable', 'json', 'text', 'pdf'].includes(
      details.format ?? '',
    )
  )
    data.format = details.format!
  const payload: Payload = {
    website,
    hostname: window.location.hostname,
    url: window.location.hash.split('?')[0] === '#/edit' ? '/edit' : '/',
    title: 'NeatCV',
    referrer: '',
    name,
    data,
  }
  if (loaded && window.umami) send(payload)
  else if (queue.length < 30) queue.push(payload)
}

export function initializeAnalytics(
  config = {
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined,
    scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL as string | undefined,
  },
) {
  if (started) return
  started = true
  attribution = captureAttribution(window.location.href, sourceStorage)
  seenRef = sourceFromUrl(window.location.href)?.ref ?? null
  const captureNavigation = () => {
    const ref = sourceFromUrl(window.location.href)?.ref ?? null
    if (ref && ref !== seenRef)
      attribution = captureAttribution(window.location.href, sourceStorage)
    seenRef = ref
  }
  window.addEventListener('hashchange', captureNavigation)
  window.addEventListener('popstate', captureNavigation)
  const id = config.websiteId?.trim()
  if (
    !id ||
    !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id) ||
    optedOut()
  )
    return
  let scriptUrl: URL
  try {
    scriptUrl = new URL(config.scriptUrl || 'https://cloud.umami.is/script.js')
    if (
      scriptUrl.protocol !== 'https:' ||
      scriptUrl.username ||
      scriptUrl.password
    )
      return
  } catch {
    return
  }
  website = id
  const script = document.createElement('script')
  script.id = 'neatcv-analytics'
  script.async = true
  script.src = scriptUrl.href
  script.dataset.websiteId = website
  script.dataset.autoTrack = 'false'
  script.dataset.excludeSearch = 'true'
  script.dataset.excludeHash = 'true'
  script.dataset.doNotTrack = 'true'
  script.addEventListener(
    'load',
    () => {
      loaded = true
      if (!optedOut() && window.umami) queue.splice(0).forEach(send)
      else queue.length = 0
    },
    { once: true },
  )
  script.addEventListener(
    'error',
    () => {
      failed = true
      queue.length = 0
    },
    { once: true },
  )
  trackEvent('site_visit')
  document.head.appendChild(script)
}
