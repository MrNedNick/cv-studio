import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

afterEach(cleanup)

function Broken(): never {
  throw new Error('render failed')
}

it('shows a calm recovery screen instead of a blank page when rendering fails', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  localStorage.setItem('neatcv-locale', 'ru')
  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>,
  )
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Ваше резюме сохранено в этом браузере',
  )
  expect(screen.getByRole('button', { name: 'Перезагрузить' })).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Скачать копию (JSON)' }),
  ).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Сообщить о проблеме' }),
  ).toHaveAttribute('href', expect.stringContaining('/issues/new'))
})
