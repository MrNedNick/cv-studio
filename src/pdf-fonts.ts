import { plainText, type ResumeDocument } from './model'
import { pdfCoreCoverage } from './pdf-font-coverage'

/** Use complete fonts whenever any rendered text falls outside the shared core. */
export function pdfFontSuffix(doc: ResumeDocument) {
  const text = plainText(doc)
  return Array.from(text).every((character) => {
    const point = character.codePointAt(0)!
    return pdfCoreCoverage.some(
      ([start, end]) => point >= start && point <= end,
    )
  })
    ? '-core'
    : ''
}
