import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Preview from './Preview'
import { createDocument } from './model'
const { renderResume } = vi.hoisted(() => ({ renderResume: vi.fn() }))
vi.mock('./pdf', () => ({ renderResume }))
vi.mock('./pdf-reader', () => ({
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: async () => ({
        getViewport: () => ({ width: 595, height: 842 }),
        render: () => ({ promise: Promise.resolve() }),
      }),
    }),
    destroy: async () => {},
  }),
}))
beforeEach(() => {
  renderResume.mockReset()
  renderResume.mockResolvedValue({
    arrayBuffer: async () => new ArrayBuffer(8),
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('offers selectable, structured text without waiting for PDF generation', () => {
  const doc = createDocument(true)
  render(<Preview doc={doc} />)
  fireEvent.click(screen.getByRole('button', { name: 'Текст' }))
  const article = screen.getByRole('article', { name: 'Текст резюме' })
  expect(
    within(article).getByRole('heading', { name: 'Александра Морозова' }),
  ).toBeVisible()
  expect(within(article).getByText(/конверсию на 24%/)).toBeVisible()
  expect(
    within(article).getByRole('link', { name: 'alex@example.com' }),
  ).toHaveAttribute('href', 'mailto:alex@example.com')
  expect(
    within(article).queryByRole('heading', { name: 'Проекты' }),
  ).not.toBeInTheDocument()
  expect(renderResume).not.toHaveBeenCalled()
})
it('lets readers enlarge the PDF and return to fit width without changing the document', async () => {
  const doc = createDocument(true)
  render(<Preview doc={doc} />)
  await screen.findByRole('img', { name: 'Резюме, страница 1' })
  fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
  expect(
    screen.getByRole('button', { name: 'По ширине страницы' }),
  ).toHaveTextContent('125%')
  for (let i = 0; i < 3; i++)
    fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
  expect(screen.getByRole('button', { name: 'Увеличить' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'По ширине страницы' }))
  expect(
    screen.getByRole('button', { name: 'По ширине страницы' }),
  ).toHaveTextContent('100%')
  expect(renderResume).toHaveBeenCalledTimes(1)
  expect(doc).toEqual(createDocument(true))
})
it('recovers a failed preview without reloading or losing resume text', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  renderResume.mockRejectedValueOnce(new Error('Network error'))
  render(<Preview doc={createDocument(true)} />)
  fireEvent.click(
    await screen.findByRole('button', { name: 'Повторить загрузку' }),
  )
  await screen.findByRole('img', { name: 'Резюме, страница 1' })
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Повторить загрузку' }),
    ).not.toBeInTheDocument(),
  )
  expect(renderResume).toHaveBeenCalledTimes(2)
})
