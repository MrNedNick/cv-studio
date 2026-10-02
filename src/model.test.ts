import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import {
  accents,
  createDocument,
  getTips,
  parseDocument,
  plainText,
  safeUrl,
  toJsonResume,
  visibleSections,
} from './model'
import { loadDocument, saveDocument } from './storage'
describe('resume data', () => {
  it('round trips both languages and design without loss', () => {
    const doc = createDocument(true, 'ru')
    doc.template = 'sidebar'
    doc.accent = accents[2]
    expect(
      parseDocument(JSON.parse(JSON.stringify(toJsonResume(doc)))),
    ).toEqual(doc)
  })
  it('persists a document in IndexedDB', async () => {
    const doc = createDocument(true, 'ru')
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
    const doc = createDocument(false, 'ru')
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
    const doc = createDocument(false, 'ru')
    expect(getTips(doc.versions.ru, 'ru')).toHaveLength(2)
    const example = createDocument(true, 'ru').versions.ru
    expect(getTips(example, 'ru')).toHaveLength(0)
    example.work[0].description = 'Работала над продуктом'
    expect(getTips(example, 'ru').map((tip) => tip.id)).toEqual([
      'work-results',
      'work-verbs',
    ])
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
it('loads older backups with the original font and preserves new typography', () => {
  const old = createDocument(true, 'ru') as Partial<
    ReturnType<typeof createDocument>
  >
  delete old.typography
  expect(parseDocument(old).typography).toBe('sans')
  const doc = createDocument(true, 'ru')
  doc.typography = 'mixed'
  expect(parseDocument(toJsonResume(doc)).typography).toBe('mixed')
  expect(parseDocument({ ...doc, typography: 'unknown' }).typography).toBe(
    'sans',
  )
})

it('rejects disguised non-web schemes, credentials and recursive document wrappers', () => {
  for (const url of [
    'mailto:person@example.com',
    'javascript:alert(1)',
    'https://user:password@example.com',
    'data:text/html,hello',
    '',
  ])
    expect(safeUrl(url)).toBeUndefined()
  expect(safeUrl('  example.com/work  ')).toBe('https://example.com/work')
  const wrapper: Record<string, unknown> = {}
  wrapper.cvStudio = wrapper
  expect(() => parseDocument(wrapper)).toThrow('Nested resume source')
})
it('targets guidance to incomplete entries, invalid dates and long descriptions', () => {
  const resume = createDocument(true, 'ru').versions.en
  resume.basics.email = 'broken@'
  resume.education[0].startDate = '2025-01'
  resume.education[0].endDate = '2020-01'
  resume.education[0].description = 'A'.repeat(301)
  resume.work[0].description = 'Responsible for growing a team of 12'
  expect(getTips(resume, 'en')).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'email', section: 'basics' }),
      expect.objectContaining({ id: 'education-dates', section: 'education' }),
      expect.objectContaining({ id: 'education-length', section: 'education' }),
      expect.objectContaining({ id: 'work-verbs', section: 'work' }),
    ]),
  )
  expect(getTips(resume, 'en').some((tip) => tip.id === 'work-results')).toBe(
    false,
  )
})

it('repairs duplicate imported entry IDs without changing text or translation pairs', () => {
  const doc = createDocument(true, 'ru')
  for (const locale of ['ru', 'en'] as const) {
    doc.versions[locale].work[0].id = 'same'
    doc.versions[locale].work[1].id = 'same'
  }
  doc.versions.ru.work.push({
    ...doc.versions.ru.work[0],
    id: 'same~2',
    title: 'Third',
  })
  const parsed = parseDocument(doc)
  expect(parsed.versions.ru.work.map((e) => e.id)).toEqual([
    'same',
    'same~3',
    'same~2',
  ])
  expect(parsed.versions.en.work.map((e) => e.id)).toEqual(['same', 'same~3'])
  expect(parsed.versions.ru.work.map((e) => e.title)).toEqual(
    doc.versions.ru.work.map((e) => e.title),
  )
  expect(parseDocument(parsed)).toEqual(parsed)
})

it('starts new documents in English and preserves profile links through imports', () => {
  expect(createDocument().language).toBe('en')
  const imported = parseDocument({
    basics: {
      name: 'Alex Morgan',
      profiles: [
        { network: 'LinkedIn', url: 'https://linkedin.com/in/example' },
        { network: 'GitHub', url: 'https://github.com/example' },
      ],
    },
  })
  expect(imported.versions.en.basics.github).toBe('https://github.com/example')
  expect(imported.versions.ru.basics.linkedin).toBe(
    'https://linkedin.com/in/example',
  )
  expect(parseDocument(toJsonResume(imported))).toEqual(imported)
  expect(toJsonResume(imported).basics.profiles).toHaveLength(2)
})

it('keeps a custom section order and hidden sections through a round trip', () => {
  const doc = createDocument(true, 'en')
  doc.sectionOrder = [
    'skills',
    'summary',
    'work',
    'education',
    'projects',
    'languages',
  ]
  doc.hiddenSections = ['projects']
  const copy = parseDocument(JSON.parse(JSON.stringify(toJsonResume(doc))))
  expect(copy.sectionOrder).toEqual(doc.sectionOrder)
  expect(visibleSections(copy)).toEqual([
    'skills',
    'summary',
    'work',
    'education',
    'languages',
  ])
  expect(
    parseDocument({
      ...doc,
      sectionOrder: ['work', 'work', 'bogus'],
      hiddenSections: ['basics'],
    }).sectionOrder,
  ).toEqual(['work', 'summary', 'education', 'skills', 'projects', 'languages'])
  expect(
    parseDocument({ ...doc, sectionOrder: undefined }).hiddenSections,
  ).toEqual(['projects'])
})

it('exports readable plain text in the visible order', () => {
  const doc = createDocument(true, 'en')
  doc.hiddenSections = ['languages']
  const text = plainText(doc)
  expect(text.startsWith('Alex Morgan\nProduct designer')).toBe(true)
  expect(text).toContain('EXPERIENCE\n\nProduct designer — Forma Studio')
  expect(text).toContain('• Redesigned checkout')
  expect(text.indexOf('PROFILE')).toBeLessThan(text.indexOf('EXPERIENCE'))
  expect(text).not.toContain('LANGUAGES')
  doc.template = 'technical'
  expect(plainText(doc).indexOf('SKILLS')).toBeLessThan(
    plainText(doc).indexOf('EXPERIENCE'),
  )
})

it('accepts only small JPEG or PNG data URLs as a photo', () => {
  const doc = createDocument(false, 'en')
  const png = 'data:image/png;base64,iVBORw0KGgo='
  expect(parseDocument({ ...doc, photo: png }).photo).toBe(png)
  for (const photo of [
    'https://example.com/me.jpg',
    'data:image/svg+xml;base64,PHN2Zz4=',
    'data:image/png;base64,abc"onload',
    `data:image/jpeg;base64,${'A'.repeat(400_001)}`,
  ])
    expect(parseDocument({ ...doc, photo }).photo).toBe('')
})
