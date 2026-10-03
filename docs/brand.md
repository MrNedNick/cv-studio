# NeatCV identity

The mark combines a folded resume page with a lowercase **n**. It stays recognizable without text at small sizes and uses the existing forest and lime palette. The wordmark remains **neatcv**; the symbol is shared by the header, footer and app/browser icons.

`public/brand.svg` is the source. Run `npm run brand` to rebuild the SVG favicon, 32 px favicon, 180 px Apple touch icon, 192/512 px app icons, maskable icon and 1200 by 630 link preview. The maskable icon keeps the mark inside the central safe area. `scripts/build-brand.mjs` defines the link preview as vector content and produces `public/og.svg` and its PNG derivative.

Do not put branding or a watermark on exported resumes. The icon shown on the promotional link card is part of the illustration only.
