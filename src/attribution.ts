export const sourceTags = {
  reddit: 'Reddit',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
  x: 'X / Twitter',
  github: 'GitHub',
  portfolio: 'Portfolio',
  producthunt: 'Product Hunt',
  hackernews: 'Hacker News',
  discord: 'Discord',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  mastodon: 'Mastodon',
  email: 'Email',
} as const

export type Source = keyof typeof sourceTags
export type SourceTouch = { ref: string; source: Source; at: number }
export type Attribution = { first: SourceTouch; last: SourceTouch }
export const attributionKey = 'neatcv-attribution'
export const attributionLifetime = 30 * 24 * 60 * 60 * 1000

export function parseRef(value: string | null) {
  const ref = value?.trim().toLowerCase()
  if (!ref || ref.length > 64 || !/^[a-z]+(?:-[a-z0-9]+)*$/.test(ref))
    return null
  const source = ref.split('-')[0]
  return Object.hasOwn(sourceTags, source)
    ? { ref, source: source as Source }
    : null
}

export function sourceFromUrl(href: string) {
  try {
    const url = new URL(href)
    const query = new URLSearchParams(url.search)
    const queryAt = url.hash.indexOf('?')
    const hashQuery = new URLSearchParams(
      queryAt < 0 ? '' : url.hash.slice(queryAt + 1),
    )
    const refs = (query.has('ref') ? query : hashQuery).getAll('ref')
    return refs.length === 1 ? parseRef(refs[0]) : null
  } catch {
    return null
  }
}

type AttributionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function validTouch(value: unknown, now: number): SourceTouch | null {
  if (!value || typeof value !== 'object') return null
  const { ref, at } = value as Record<string, unknown>
  const label = typeof ref === 'string' ? parseRef(ref) : null
  return label &&
    typeof at === 'number' &&
    Number.isFinite(at) &&
    at <= now &&
    now - at < attributionLifetime
    ? { ...label, at }
    : null
}

export function readAttribution(
  storage: AttributionStorage,
  now = Date.now(),
): Attribution | null {
  try {
    const raw = storage.getItem(attributionKey)
    if (!raw) return null
    const stored: unknown = JSON.parse(raw)
    if (!stored || typeof stored !== 'object') throw new Error('Invalid source')
    const record = stored as Record<string, unknown>
    const last = validTouch(record.last, now)
    if (record.version !== 1 || !last) throw new Error('Expired source')
    const first = validTouch(record.first, now) ?? last
    if (first.at > last.at) throw new Error('Invalid source order')
    return { first, last }
  } catch {
    try {
      storage.removeItem(attributionKey)
    } catch {
      // Browsing and attribution in memory still work with storage disabled.
    }
    return null
  }
}

export function captureAttribution(
  href: string,
  storage: AttributionStorage,
  now = Date.now(),
): Attribution | null {
  const previous = readAttribution(storage, now)
  const label = sourceFromUrl(href)
  if (!label) return previous
  const touch = { ...label, at: now }
  const next = { first: previous?.first ?? touch, last: touch }
  try {
    storage.setItem(attributionKey, JSON.stringify({ version: 1, ...next }))
  } catch {
    // A tagged visit remains attributable until this page is closed.
  }
  return next
}

export function attributionData(attribution: Attribution | null) {
  return {
    source: attribution?.last.source ?? 'unattributed',
    ref: attribution?.last.ref ?? 'unattributed',
    first_source: attribution?.first.source ?? 'unattributed',
    first_ref: attribution?.first.ref ?? 'unattributed',
  }
}
