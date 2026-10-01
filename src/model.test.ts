import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import {
  accents,
  createDocument,
  getTips,
  parseDocument,
  safeUrl,
  toJsonResume,
} from './model'
import { loadDocument, saveDocument } from './storage'
describe('resume data', () => {
  it('round trips both languages and design without loss', () => {
    const doc = createDocument(true)
    doc.template = 'sidebar'
    doc.accent = accents[2]
    expect(
      parseDocument(JSON.parse(JSON.stringify(toJsonResume(doc)))),
    ).toEqual(doc)
  })
  it('persists a document in IndexedDB', async () => {
    const doc = createDocument(true)
    await saveDocument(doc)
    expect(await loadDocument()).toEqual(doc)
  })
  it('imports standard JSON Resume', () => {
    const doc = parseDocument({
      basics: { name: 'Jane', location: { city: 'Prague' } },
      work: [
        {
          name: 'Example',
          position: 'Designer',
          highlights: ['Raised conversion 12%'],
        },
      ],
      skills: [{ name: 'Design', keywords: ['Figma'] }],
    })
    expect(doc.versions.en.basics.name).toBe('Jane')
    expect(doc.versions.en.work[0].description).toBe('Raised conversion 12%')
    expect(doc.versions.en.skills).toBe('Design, Figma')
  })
  it('rejects wrong files and unsupported versions', () => {
    expect(() => parseDocument({ anything: true })).toThrow()
    expect(() => parseDocument({ schemaVersion: 99, basics: {} })).toThrow()
  })
  it('normalizes malformed fields and untrusted design values', () => {
    const doc = createDocument()
    const source = {
      ...doc,
      accent: 'url(evil)',
      template: 'unknown',
      versions: { ru: { basics: { name: 35 }, work: [null] }, en: {} },
    }
    const parsed = parseDocument(source)
    expect(parsed.accent).toBe(accents[0])
    expect(parsed.template).toBe('modern')
    expect(parsed.versions.ru.basics.name).toBe('')
    expect(parsed.versions.ru.work).toHaveLength(1)
  })
  it('only accepts web links', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com/')
    expect(safeUrl('javascript://alert(1)')).toBeUndefined()
    expect(safeUrl('example.com')).toBe('https://example.com/')
  })
  it('gives useful tips for missing contacts and measurable achievements', () => {
    const doc = createDocument()
    expect(getTips(doc.versions.ru, 'ru')).toHaveLength(2)
    const example = createDocument(true).versions.ru
    expect(getTips(example, 'ru')).toHaveLength(0)
    example.work[0].description = 'Работала над продуктом'
    expect(getTips(example, 'ru')).toHaveLength(1)
  })
})
it('keeps imported project descriptions and shared fields for translation', () => {
  const doc = parseDocument({
    basics: { name: 'Jane', email: 'jane@example.com' },
    projects: [
      {
        name: 'Portfolio',
        description: 'Built a useful product',
        startDate: '2024-01-01',
        url: 'https://example.com',
      },
    ],
  })
  expect(doc.versions.en.projects[0].description).toBe('Built a useful product')
  expect(doc.versions.ru.projects[0].id).toBe(doc.versions.en.projects[0].id)
  expect(doc.versions.ru.projects[0].startDate).toBe('2024-01')
  expect(doc.versions.ru.basics.email).toBe('jane@example.com')
})
