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
const textItem = (str: string, x = 42) => ({
  str,
  hasEOL: true,
  transform: [10, 0, 0, 10, x, 700],
  width: 120,
  height: 10,
  fontName: 'test',
  dir: 'ltr',
})
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
    view: [0, 0, 595, 842],
    cleanup: vi.fn(),
    getTextContent: async () => ({
      styles: { test: { ascent: 0.8, descent: -0.2 } },
      items:
        page === 1
          ? [textItem('Александра Морозова'), textItem('Product designer')]
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
it('shows missing writing, paper-edge warnings and an actionable section without changing data', async () => {
  const doc = createDocument(false)
  doc.versions.en.basics.name = 'Product designer'
  doc.versions.en.basics.summary = 'A unique achievement missing from the PDF'
  const original = structuredClone(doc)
  const goSection = vi.fn()
  getDocument.mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: async () => ({
        view: [0, 0, 595, 842],
        cleanup: vi.fn(),
        getTextContent: async () => ({
          items: [textItem('Product designer', 550)],
          styles: { test: { ascent: 0.8, descent: -0.2 } },
        }),
        getAnnotations: async () => [],
      }),
    }),
    destroy,
  })
  render(<PdfTextReview doc={doc} locale="en" goSection={goSection} />)
  await screen.findByText('Passages not found: 1')
  expect(screen.getByText(/Page 1: text may extend/)).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }))
  expect(goSection).toHaveBeenCalledWith('summary')
  expect(doc).toEqual(original)
})
