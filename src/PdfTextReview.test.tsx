import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import PdfTextReview from './PdfTextReview'
import { createDocument } from './model'
const { renderResume, getDocument } = vi.hoisted(() => ({
  renderResume: vi.fn(),
  getDocument: vi.fn(),
}))
vi.mock('./pdf', () => ({ renderResume }))
vi.mock('./pdf-reader', () => ({ getDocument }))
const destroy = vi.fn(async () => {})
const pdf = {
  numPages: 2,
  getPage: async (page: number) => ({
    getTextContent: async () => ({
      items:
        page === 1
          ? [
              { str: 'Александра Морозова', hasEOL: true },
              { str: 'Product designer', hasEOL: false },
            ]
          : [],
    }),
    getAnnotations: async () =>
      page === 1
        ? [
            { subtype: 'Link', url: 'https://example.com/' },
            { subtype: 'Link', url: 'https://example.com/' },
            { subtype: 'Link', url: 'mailto:alex@example.com' },
            { subtype: 'Link', url: 'javascript:alert(1)' },
          ]
        : [],
  }),
}
beforeEach(() => {
  renderResume
    .mockReset()
    .mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(8) })
  getDocument
    .mockReset()
    .mockImplementation(() => ({ promise: Promise.resolve(pdf), destroy }))
  destroy.mockClear()
})
afterEach(cleanup)
it('shows real per-page text, safe links and an empty-page warning', async () => {
  render(<PdfTextReview doc={createDocument(true, 'ru')} locale="en" />)
  await screen.findByText(/Александра Морозова/)
  expect(screen.getByText('Pages: 2 · A4')).toBeVisible()
  expect(screen.getAllByRole('link')).toHaveLength(2)
  expect(
    screen.getByRole('link', { name: 'mailto:alex@example.com' }),
  ).toHaveAttribute('href', 'mailto:alex@example.com')
  expect(
    screen.getByText(
      'This page has no extractable text. Check it in the PDF tab.',
    ),
  ).toBeVisible()
  expect(destroy).toHaveBeenCalled()
})
it('recovers an extraction failure without replacing the resume', async () => {
  renderResume.mockRejectedValueOnce(new Error('Unavailable'))
  const doc = createDocument(true)
  render(<PdfTextReview doc={doc} locale="en" />)
  fireEvent.click(await screen.findByRole('button', { name: 'Retry preview' }))
  await screen.findByText(/Александра Морозова/)
  expect(doc).toEqual(createDocument(true))
  expect(renderResume).toHaveBeenCalledTimes(2)
})
it('discards a late result after the document changes', async () => {
  let resolveOld: (value: unknown) => void = () => {}
  renderResume.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve
      }),
  )
  const doc = createDocument(true)
  const view = render(<PdfTextReview doc={doc} locale="en" />)
  await waitFor(() => expect(renderResume).toHaveBeenCalledTimes(1))
  view.rerender(
    <PdfTextReview doc={{ ...doc, accent: '#284c78' }} locale="en" />,
  )
  await screen.findByText(/Александра Морозова/)
  await act(async () =>
    resolveOld({ arrayBuffer: async () => new ArrayBuffer(4) }),
  )
  await waitFor(() => expect(getDocument).toHaveBeenCalledTimes(1))
})
