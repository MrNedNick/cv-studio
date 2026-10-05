import '@testing-library/jest-dom/vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { placeGuide, useOnboarding } from './Onboarding'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('remembers a dismissed topic across editor visits without hiding other topics', () => {
  const first = renderHook(useOnboarding)
  act(() => first.result.current.dismiss('design'))
  expect(first.result.current.show('design')).toBe(false)
  expect(first.result.current.show('basics')).toBe(true)
  first.unmount()
  const second = renderHook(useOnboarding)
  expect(second.result.current.show('design')).toBe(false)
  expect(second.result.current.show('review')).toBe(true)
})
it('lets an explicit help request work while automatic tips remain off, then restores all topics', () => {
  const first = renderHook(useOnboarding)
  act(() => first.result.current.setEnabled(false))
  first.unmount()
  const { result } = renderHook(useOnboarding)
  expect(result.current.enabled).toBe(false)
  expect(result.current.show('skills')).toBe(false)
  act(() => result.current.request('skills'))
  expect(result.current.show('skills')).toBe(true)
  expect(result.current.show('review')).toBe(false)
  expect(result.current.enabled).toBe(false)
  act(() => result.current.dismiss('skills'))
  expect(result.current.show('skills')).toBe(false)
  act(() => result.current.reset())
  expect(result.current.enabled).toBe(true)
  expect(result.current.show('skills')).toBe(true)
})
it('continues to offer working controls when reading and writing preferences are blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  const { result } = renderHook(useOnboarding)
  act(() => result.current.dismiss('basics'))
  expect(result.current.show('basics')).toBe(false)
  act(() => result.current.setEnabled(false))
  expect(result.current.show('review')).toBe(false)
  act(() => result.current.reset())
  expect(result.current.show('review')).toBe(true)
})
it('recovers from malformed preferences without suppressing help', () => {
  localStorage.setItem('neatcv-guide-v1', '{broken')
  const first = renderHook(useOnboarding)
  expect(first.result.current.show('design')).toBe(true)
  first.unmount()
  localStorage.setItem(
    'neatcv-guide-v1',
    JSON.stringify({ disabled: 'yes', dismissed: ['basics', null, 'unknown'] }),
  )
  const second = renderHook(useOnboarding)
  expect(second.result.current.enabled).toBe(true)
  expect(second.result.current.show('basics')).toBe(false)
  expect(second.result.current.show('design')).toBe(true)
})
it('places the coach mark without covering its target and keeps it in the viewport', () => {
  for (const width of [320, 360, 430, 1440]) {
    const target = {
      left: 24,
      top: 280,
      right: 220,
      bottom: 340,
      width: 196,
      height: 60,
    }
    const position = placeGuide(target, Math.min(332, width - 24), 230, {
      width,
      height: 780,
      top: 0,
      left: 0,
    })
    expect(position.x).toBeGreaterThanOrEqual(12)
    expect(position.x + Math.min(332, width - 24)).toBeLessThanOrEqual(
      width - 12,
    )
    expect(position.y).toBeGreaterThanOrEqual(12)
    if (position.side === 'bottom')
      expect(position.y).toBeGreaterThan(target.bottom)
    if (position.side === 'right')
      expect(position.x).toBeGreaterThan(target.right)
  }
})
it('respects the visible viewport when the keyboard shrinks or offsets it', () => {
  const target = {
    left: 20,
    top: 170,
    right: 280,
    bottom: 214,
    width: 260,
    height: 44,
  }
  const p = placeGuide(target, 296, 260, {
    width: 320,
    height: 300,
    top: 100,
    left: 0,
  })
  expect(p.y).toBeGreaterThanOrEqual(112)
  expect(p.y + Math.min(260, p.maxHeight)).toBeLessThanOrEqual(388)
  expect(p.y).toBeGreaterThan(target.bottom)
})
