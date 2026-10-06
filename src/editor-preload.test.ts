import { afterEach, describe, expect, it, vi } from 'vitest'
import { scheduleEditorPreload } from './editor-preload'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})
function connection(value: { saveData?: boolean; effectiveType?: string }) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    get: () => value,
  })
}
describe('optional editor loading', () => {
  it.each([
    { saveData: true },
    { effectiveType: '2g' },
    { effectiveType: 'slow-2g' },
  ])('does not request the editor on %o', async (settings) => {
    connection(settings)
    vi.useFakeTimers()
    const load = vi.fn().mockResolvedValue(undefined)
    scheduleEditorPreload(load)
    await vi.runAllTimersAsync()
    expect(load).not.toHaveBeenCalled()
  })
  it('cancels when unmounted and rechecks visibility and connectivity at execution time', async () => {
    connection({})
    vi.useFakeTimers()
    const load = vi.fn().mockResolvedValue(undefined)
    const cancel = scheduleEditorPreload(load)
    cancel()
    await vi.runAllTimersAsync()
    scheduleEditorPreload(load)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    await vi.runAllTimersAsync()
    expect(load).not.toHaveBeenCalled()
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    scheduleEditorPreload(load)
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    await vi.runAllTimersAsync()
    expect(load).not.toHaveBeenCalled()
  })
  it('loads on a normal connection and handles background failures', async () => {
    connection({ effectiveType: '4g' })
    vi.useFakeTimers()
    const load = vi.fn().mockRejectedValue(new Error('Network unavailable'))
    scheduleEditorPreload(load)
    await vi.runAllTimersAsync()
    expect(load).toHaveBeenCalledOnce()
  })
})
