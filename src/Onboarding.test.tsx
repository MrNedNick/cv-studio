import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useRef, useState } from 'react'
import { GuideTip, useOnboarding } from './Onboarding'

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
it('dismisses inline help without taking away the keyboard or changing the writing', () => {
  function Example() {
    const [visible, setVisible] = useState(true),
      opener = useRef<HTMLButtonElement>(null)
    return (
      <>
        <button ref={opener}>Help</button>
        <input aria-label="Resume name" defaultValue="Ada" />
        {visible && (
          <GuideTip
            topic="basics"
            locale="en"
            dismiss={() => setVisible(false)}
            help={() => {}}
            focusAfterDismiss={opener}
          />
        )}
      </>
    )
  }
  render(<Example />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(
    screen.getByRole('button', { name: 'Dismiss this editor tip' }),
  )
  expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus()
  expect(screen.getByLabelText('Resume name')).toHaveValue('Ada')
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
})
