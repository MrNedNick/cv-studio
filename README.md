# CV Studio

A free resume editor with thoughtful templates, a live PDF preview, and no account or download paywall.

**[Open CV Studio](https://mrnednick.github.io/cv-studio/)** · [Open the editor](https://mrnednick.github.io/cv-studio/#/edit)

![CV Studio interface](docs/preview.png)

## What you can do

- Start with a blank resume or a fictional example.
- Edit contact details, profile, experience, education, skills, projects, and languages.
- Collapse experience, education, projects, and language entries into compact summaries, or expand them all. New entries receive keyboard focus; collapsed text remains in your PDF.
- Add, remove, and reorder entries, with undo and redo. Fast edits in different fields remain separate undo steps.
- Follow dismissible guidance for contact details, dates, empty entries, long paragraphs, and concrete achievements. Each tip opens its relevant section.
- Choose Modern, Classic, Compact, or Editorial, plus accent colors, text density, and Sans, Serif, or mixed typography.
- Keep Russian and English versions together. Translations are entered manually; contact details, dates, and links are shared.
- Preview the actual paginated A4 document at 75–200% zoom, or switch to an accessible text view for reading and copying. Retry a failed preview without reloading.
- Download a PDF with selectable text, embedded Cyrillic/Latin fonts, and clickable links.
- Reopen a PDF made here and continue editing. Each PDF includes a `cv-studio.json` attachment containing both language versions and the design settings.
- Review the name and file before importing; save a backup or cancel before replacing the current resume. Undo can restore the previous document.
- Import and export JSON Resume. The `cvStudio` extension preserves both language versions and presentation settings.

All templates and downloads are free. There are no watermarks, accounts, analytics, or resume uploads. Data is saved in IndexedDB on the current browser. Clearing browser data removes that local copy: keep a PDF or JSON backup. Shared PDF files contain both language versions in their editable attachment.

## Design and implementation

React 19, TypeScript, and Vite. The renderer uses `@react-pdf/renderer` for layout, `pdf-lib` to attach editable source, and PDF.js to display the same PDF in the live preview. Fonts are hosted with the app and licensed under OFL (see `public/fonts/LICENSE`). The accessible form-field primitive comes from a shared component library. Hash routes support direct editor links on GitHub Pages.

PDF code loads only when needed. The interface uses compressed WOFF2 fonts; PDF exports keep the original embedded fonts. Failed storage reads preserve the existing data and offer a retry; failed writes offer retry and JSON backup. The document supports multiple pages; empty sections stay out of the export. Single-column templates are recommended for automated screening. Editorial offers a two-column alternative. Mobile layouts switch between editing and preview; both light and dark themes keep the exported paper white.

## Keyboard shortcuts

In the editor, use Ctrl/⌘ Z to undo, Ctrl/⌘ Shift Z to redo, and Ctrl/⌘ S to save a JSON backup. Escape closes the document actions menu. Native dialogs support Escape to cancel.

## Development

Use Node.js 22 or later.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
```

The development URL is `http://localhost:5173/cv-studio/`. Tests cover entry collapse/reordering/focus, duplicate imported IDs, sidebar PDF text positioning, import confirmation/cancellation and edits during file reads, storage recovery, keyboard navigation, targeted guidance, model validation, IndexedDB persistence, JSON round trips, shared contacts, undo/redo, and PDF text, links, attachments, templates, long-document pagination, typography compatibility, preview recovery, and text-view access. GitHub Actions runs lint, tests, and a production build before publishing `main` to Pages.

## Boundaries

PDF import supports files exported by CV Studio, not arbitrary PDFs or scanned documents. JSON Resume imports use the supported sections listed above; unsupported fields are not imported. Files are limited to 10 MB, entries to 100 per section, and individual imported text values to 30,000 characters. Each browser stores one active resume; use backups for multiple documents. There is no automatic translation or cloud sync.
