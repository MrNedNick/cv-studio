import { beforeEach, expect, it, vi } from 'vitest'
import {
  attributionData,
  attributionKey,
  attributionLifetime,
  captureAttribution,
  parseRef,
  readAttribution,
  sourceFromUrl,
  sourceTags,
} from './attribution'

const now = Date.UTC(2026, 9, 5)
beforeEach(() => localStorage.clear())

it('accepts platform and campaign labels, normalizes case and rejects arbitrary data', () => {
  for (const source of Object.keys(sourceTags)) {
    expect(parseRef(source)?.source).toBe(source)
    expect(parseRef(`${source}-launch-2026`)?.source).toBe(source)
  }
  expect(parseRef(' LinkedIn-Launch ')).toEqual({
    ref: 'linkedin-launch',
    source: 'linkedin',
  })
  for (const value of [
    null,
    '',
    'unknown',
    'reddit--launch',
    'reddit_',
    'reddit-<script>',
    'reddit-jane@example.com',
    'https://reddit.com',
    'reddit-' + 'a'.repeat(60),
  ])
    expect(parseRef(value)).toBeNull()
})

it('reads both URL positions, gives outer query priority and rejects duplicates', () => {
  for (const href of [
    'https://neatcv.cc/?ref=reddit-resumes#/edit',
    'https://neatcv.cc/#/edit?ref=reddit-resumes',
  ])
    expect(sourceFromUrl(href)?.ref).toBe('reddit-resumes')
  expect(
    sourceFromUrl('https://neatcv.cc/?ref=telegram#/edit?ref=reddit')?.source,
  ).toBe('telegram')
  for (const href of [
    'not a URL',
    'https://neatcv.cc/?ref=reddit&ref=telegram',
    'https://neatcv.cc/#/edit?ref=reddit&ref=telegram',
    'https://neatcv.cc/#/edit?ref=reddit?ref=telegram',
    'https://neatcv.cc/?ref=%3Cscript%3E',
    'https://neatcv.cc/?ref=#/edit?ref=reddit',
  ])
    expect(sourceFromUrl(href)).toBeNull()
})

it('retains first and most recent tagged visits without refreshing them on untagged or invalid visits', () => {
  const first = captureAttribution(
    'https://neatcv.cc/?ref=reddit-resumes',
    localStorage,
    now,
  )!
  const second = captureAttribution(
    'https://neatcv.cc/?ref=telegram-launch',
    localStorage,
    now + 1000,
  )!
  expect(second.first).toEqual(first.first)
  expect(second.last).toEqual({
    ref: 'telegram-launch',
    source: 'telegram',
    at: now + 1000,
  })
  for (const href of [
    'https://neatcv.cc/#/edit',
    'https://neatcv.cc/?ref=invalid',
  ])
    expect(captureAttribution(href, localStorage, now + 2000)).toEqual(second)
  expect(attributionData(readAttribution(localStorage, now + 2000))).toEqual({
    source: 'telegram',
    ref: 'telegram-launch',
    first_source: 'reddit',
    first_ref: 'reddit-resumes',
  })
})

it('expires sources after 30 days and starts fresh on the next tagged visit', () => {
  captureAttribution('https://neatcv.cc/?ref=reddit', localStorage, now)
  expect(
    readAttribution(localStorage, now + attributionLifetime - 1),
  ).not.toBeNull()
  expect(readAttribution(localStorage, now + attributionLifetime)).toBeNull()
  expect(localStorage.getItem(attributionKey)).toBeNull()
  const next = captureAttribution(
    'https://neatcv.cc/?ref=linkedin',
    localStorage,
    now + attributionLifetime,
  )!
  expect(next.first).toEqual(next.last)
  expect(attributionData(null).source).toBe('unattributed')
})

it('drops an expired first touch while retaining a recent tagged source', () => {
  captureAttribution('https://neatcv.cc/?ref=reddit', localStorage, now)
  captureAttribution(
    'https://neatcv.cc/?ref=telegram',
    localStorage,
    now + attributionLifetime / 2,
  )
  const retained = readAttribution(localStorage, now + attributionLifetime)!
  expect(retained.first).toEqual(retained.last)
  expect(retained.last.source).toBe('telegram')
})

it('recovers from malformed, future-dated and unsupported stored records', () => {
  const touch = { ref: 'reddit', source: 'fake', at: now }
  for (const value of [
    'broken',
    'null',
    '[]',
    JSON.stringify({ version: 2, first: touch, last: touch }),
    JSON.stringify({
      version: 1,
      first: touch,
      last: { ...touch, at: now + 1 },
    }),
    JSON.stringify({
      version: 1,
      first: touch,
      last: { ...touch, ref: 'unknown' },
    }),
  ]) {
    localStorage.setItem(attributionKey, value)
    expect(readAttribution(localStorage, now)).toBeNull()
    expect(localStorage.getItem(attributionKey)).toBeNull()
  }
  localStorage.setItem(
    attributionKey,
    JSON.stringify({ version: 1, first: touch, last: touch }),
  )
  expect(readAttribution(localStorage, now)?.last.source).toBe('reddit')
})

it('keeps the current tagged visit usable when storage access or quota fails', () => {
  const blocked = {
    getItem: vi.fn(() => {
      throw new Error('blocked')
    }),
    setItem: vi.fn(() => {
      throw new Error('quota')
    }),
    removeItem: vi.fn(() => {
      throw new Error('blocked')
    }),
  }
  expect(
    captureAttribution('https://neatcv.cc/?ref=telegram', blocked, now)?.last
      .ref,
  ).toBe('telegram')
  expect(captureAttribution('https://neatcv.cc/', blocked, now)).toBeNull()
})
