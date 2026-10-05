import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { EXIT_MS, useLingering } from './motion'

beforeEach(() => {
  vi.useFakeTimers()
  Object.defineProperty(document.body, 'animate', {
    configurable: true,
    value: vi.fn(),
  })
})
afterEach(() => {
  cleanup()
  delete (document.body as unknown as { animate?: unknown }).animate
  vi.useRealTimers()
})
it('keeps the latest content through exit even when each render creates a new object', () => {
  const { result, rerender } = renderHook(
    ({ open, text }) => useLingering({ text }, open),
    {
      initialProps: { open: true, text: 'First' },
    },
  )
  rerender({ open: true, text: 'Latest' })
  rerender({ open: false, text: '' })
  expect(result.current).toMatchObject({
    shown: true,
    closing: true,
    value: { text: 'Latest' },
  })
  act(() => vi.advanceTimersByTime(EXIT_MS))
  expect(result.current.shown).toBe(false)
})
it('cancels an earlier exit when the same surface is reopened', () => {
  const { result, rerender } = renderHook(
    ({ open }) => useLingering('Content', open),
    {
      initialProps: { open: true },
    },
  )
  rerender({ open: false })
  act(() => vi.advanceTimersByTime(80))
  rerender({ open: true })
  act(() => vi.advanceTimersByTime(EXIT_MS))
  expect(result.current).toMatchObject({ shown: true, closing: false })
})
it('removes a surface immediately when animation support is unavailable', () => {
  delete (document.body as unknown as { animate?: unknown }).animate
  const { result, rerender } = renderHook(
    ({ open }) => useLingering('Content', open),
    {
      initialProps: { open: true },
    },
  )
  rerender({ open: false })
  expect(result.current).toMatchObject({ shown: false, closing: false })
})
