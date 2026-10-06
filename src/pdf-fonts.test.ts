import { expect, it } from 'vitest'
import { createDocument, emptyEntry, locales } from './model'
import { pdfFontSuffix } from './pdf-fonts'

it.each(locales)('the %s example uses smaller fonts', (locale) => {
  expect(pdfFontSuffix(createDocument(true, locale))).toBe('-core')
})
it('selects complete fonts for wider visible text but ignores hidden sections and other language versions', () => {
  const doc = createDocument(false)
  doc.versions.en.basics.name = 'ÄĆŁŠ Жї Ελένη'
  doc.versions.ru.basics.name = 'Hồng'
  expect(pdfFontSuffix(doc)).toBe('-core')
  doc.versions.en.basics.name = 'Hồng'
  expect(pdfFontSuffix(doc)).toBe('')
  doc.versions.en.basics.name = 'Alex'
  doc.versions.en.projects.push({ ...emptyEntry(), title: 'Hồng' })
  doc.hiddenSections = ['projects']
  expect(pdfFontSuffix(doc)).toBe('-core')
  doc.hiddenSections = []
  expect(pdfFontSuffix(doc)).toBe('')
})
