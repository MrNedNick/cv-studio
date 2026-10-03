import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

// The same source serves the UI, browser icon, app icons and link preview.
const mark = await readFile(
  new URL('../public/brand.svg', import.meta.url),
  'utf8',
)
const publicFile = (name) =>
  fileURLToPath(new URL(`../public/${name}`, import.meta.url))
await writeFile(publicFile('favicon.svg'), mark)
for (const [name, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await sharp(Buffer.from(mark))
    .resize(size, size)
    .png()
    .toFile(publicFile(name))
}
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#24594b' },
})
  .composite([
    {
      input: await sharp(Buffer.from(mark)).resize(320, 320).png().toBuffer(),
      left: 96,
      top: 96,
    },
  ])
  .png()
  .toFile(publicFile('icon-maskable-512.png'))
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#151f1b"/>
<circle cx="1110" cy="620" r="440" fill="#1d2a24"/>
<g transform="translate(72 60) scale(1.125)">${mark.replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
<g fill="#edf2e9" font-family="Arial, sans-serif">
<text x="166" y="109" font-size="48" font-weight="700" letter-spacing="-2">neat<tspan font-weight="400">cv</tspan></text>
<text x="72" y="247" font-size="66" font-weight="700" letter-spacing="-3">Your experience.</text>
<text x="72" y="325" font-size="66" font-weight="700" letter-spacing="-3" fill="#d8ef98">At its best.</text>
<text x="74" y="399" font-size="26" fill="#b1bdb3">A beautiful resume. A free PDF.</text>
<text x="74" y="439" font-size="26" fill="#b1bdb3">No sign-up. No watermarks.</text>
<rect x="72" y="500" width="218" height="58" rx="29" fill="#d8ef98"/>
<text x="107" y="538" font-size="28" font-weight="700" fill="#24594b">neatcv.cc</text>
</g>
<g transform="translate(794 55) rotate(5 155 250)">
<rect x="6" y="12" width="322" height="496" rx="12" fill="#0d1511"/>
<rect width="322" height="496" rx="12" fill="#fcfcf8"/>
<g transform="translate(26 28) scale(.46)">${mark.replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
<g font-family="Arial, sans-serif" fill="#263a32">
<text x="26" y="96" font-size="27" font-weight="700">Alex Morgan</text>
<text x="26" y="120" font-size="13">Product designer</text>
<path d="M26 140h270" stroke="#24594b" stroke-width="2"/>
<text x="26" y="172" font-size="10" font-weight="700" letter-spacing="2" fill="#24594b">PROFILE</text>
<text x="26" y="195" font-size="12">Thoughtful products. Clear experiences.</text>
<text x="26" y="215" font-size="12">A story worth sharing.</text>
<text x="26" y="257" font-size="10" font-weight="700" letter-spacing="2" fill="#24594b">EXPERIENCE</text>
<text x="26" y="282" font-size="14" font-weight="700">Senior product designer</text>
<text x="26" y="305" font-size="12">Example Studio · 2022 – Present</text>
<text x="26" y="368" font-size="10" font-weight="700" letter-spacing="2" fill="#24594b">SKILLS</text>
<text x="26" y="392" font-size="12">Design systems · Research · Accessibility</text>
</g>
<path d="M26 323h262M26 338h212M26 419h262M26 436h222" stroke="#b1bdb3" stroke-width="3"/>
</g></svg>`
await writeFile(publicFile('og.svg'), svg)
await sharp(Buffer.from(svg)).png().toFile(publicFile('og.png'))
