import { afterEach, expect, it, vi } from 'vitest'
import { sanitizeErrorEnvelope } from './sentry-client'

afterEach(() => vi.unstubAllGlobals())
it('transport rejects attachments, recordings, sessions and arbitrary envelope headers', () => {
  vi.stubGlobal('performance', { getEntriesByType: () => [] })
  const id = 'a'.repeat(32)
  const event = {
    event_id: id,
    tags: { diagnostic_source: 'react_boundary' },
    message: 'Private Person',
    extra: { resume: 'Private' },
  }
  const raw = [
    {
      event_id: id,
      trace: { user: 'Private' },
      sdk: { name: 'Private', version: 'Private' },
      dsn: 'Private',
    },
    [
      [{ type: 'attachment', filename: 'Private.pdf' }, new Uint8Array([1, 2])],
      [{ type: 'replay_recording' }, 'Private recording'],
      [{ type: 'session' }, { user: 'Private' }],
      [{ type: 'event', private: 'Private' }, event],
    ],
  ] as unknown as Parameters<typeof sanitizeErrorEnvelope>[0]
  const safe = sanitizeErrorEnvelope(raw)!
  expect(safe[1]).toHaveLength(1)
  expect(Object.keys(safe[0]).sort()).toEqual(['event_id', 'sent_at'])
  expect(safe[1][0][0]).toEqual({ type: 'event' })
  expect(JSON.stringify(safe)).not.toMatch(
    /Private|attachment|recording|session|trace|sdk|dsn|extra/,
  )
  expect(
    sanitizeErrorEnvelope([
      {},
      [
        [
          { type: 'attachment', length: 1, filename: 'Private' },
          new Uint8Array([1]),
        ],
      ],
    ] as unknown as Parameters<typeof sanitizeErrorEnvelope>[0]),
  ).toBeNull()
  vi.stubGlobal('navigator', { doNotTrack: '1' })
  expect(sanitizeErrorEnvelope(raw)).toBeNull()
})
