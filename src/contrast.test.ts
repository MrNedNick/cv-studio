import { expect, it } from 'vitest'
import { accents } from './model'
import { pdfColors } from './pdf'

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

it('keeps every PDF text colour at 4.5:1 or more on white paper', () => {
  for (const color of [
    ...accents,
    pdfColors.text,
    pdfColors.ink,
    pdfColors.muted,
    pdfColors.quiet,
    pdfColors.pageNumber,
  ])
    expect(contrast(color, '#ffffff'), color).toBeGreaterThanOrEqual(4.5)
})

it('keeps text on the accent band readable with every accent', () => {
  for (const accent of accents) {
    expect(contrast(pdfColors.onAccent, accent), accent).toBeGreaterThanOrEqual(
      4.5,
    )
    expect(
      contrast(pdfColors.onAccentMuted, accent),
      accent,
    ).toBeGreaterThanOrEqual(4.5)
  }
})
