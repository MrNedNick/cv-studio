# Public pages and loading

The normal Vite build renders twenty public pages to HTML using the real React components. It needs no browser, database or user data. The static privacy notice is a separate entry; the editor and component gallery remain client applications.

The development server opens the same physical public routes with client rendering. Prerendered HTML and the generated sitemap are checked with a fresh `npm run build` and `npm run preview`.

| Address                                | Content                                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/`                                    | English home and default language alternative                                             |
| `/de/`, `/es/`, `/bg/`, `/uk/`, `/ru/` | Translated homes, titles and descriptions                                                 |
| `/templates/`                          | All twelve designs and links to their descriptions                                        |
| `/templates/{id}/`                     | A design description, illustrative preview, PDF guidance and editor action                |
| `/help/`                               | How editing, local storage, languages, export and reopening work; six visible FAQ answers |
| `/privacy.html`                        | Service status and local-data privacy notice                                              |

The template IDs come from `src/template-data.ts`; Editorial uses `sidebar`. Illustrative previews are labelled as such. The editor still renders and checks the actual PDF. Choosing a template from a public page preserves the current resume; it does not replace text with an example.

`src/public-pages.ts` owns the public address list and metadata. `scripts/prerender.mjs` writes self-referencing canonical URLs and a sitemap with 21 entries. Language homes link to all six alternatives and `x-default`; gallery, help and template pages have English source HTML and can use all interface languages after loading. They do not advertise nonexistent translated public addresses. The FAQ schema on `/help/` uses the same questions and answers as its visible content. Structured data is not a promise of rich search results or indexing.

React hydrates the saved HTML with the same initial language and route. A dictionary loads before hydration of a translated home. An explicit translated home address takes precedence over device or saved preferences. Manual home language choices update the address without reloading, preserving query parameters and hash navigation. Saved resumes remain in IndexedDB. Editor links and existing `#/edit` bookmarks continue to work, including from a public subdirectory.

The editor preloads during idle time when the page is visible, online and without data saver or a 2G connection. Unmounting cancels the pending callback; conditions are checked again when it runs. Optional loading errors are handled. A direct editor action remains available on restricted connections.

The saved or system palette applies in the head before static content paints. It does not enable theme animation; explicit toggles keep their existing smooth transitions. Browser checks hold the application module back to confirm that saved dark/light colors are already applied to the readable page.

## PDF font size

The four full Noto TTFs remain available for wider text. Core TTFs retain Latin, basic Greek, Cyrillic, combining marks, punctuation and common currencies. Selection checks visible plain text in the active resume language against the intersection of the four fonts' actual Unicode maps. Hidden sections and other language versions do not force larger downloads. Unsupported characters continue through the existing complete-font and PDF text checks.

| Files              | Total bytes |
| ------------------ | ----------: |
| Four original TTFs |   2,399,308 |
| Four core TTFs     |   1,052,228 |
| Reduction          |       56.1% |

Only the font faces used by a PDF are fetched. These figures describe source downloads, not PDF file size; PDF creation already embeds document-specific glyph subsets. Core font glyph widths match the originals, and successive core → full → core exports retain text. The OFL license stays beside the files.

To rebuild the saved core files, use Python with `fontTools==4.60.2`, run `python3 scripts/subset-pdf-fonts.py`, then `npx prettier --write src/pdf-font-coverage.ts`. The script verifies character maps and horizontal metrics before saving shared coverage. Normal builds use the checked-in output and do not require Python.

## Verification

Unit checks cover connection constraints, cancellation, background errors, font selection, all six language examples and real PDF extraction with both typefaces. Browser checks exercise all twelve template pages, no-JavaScript navigation, metadata and sitemap URLs, language preference conflicts, query preservation, template selection without text loss, reload, data saver and actual PDF downloads. Public-page accessibility checks use axe in both themes, desktop Chromium, phone Chromium and the iPhone WebKit profile, including 360 px overflow and console errors.

Sources: [Vite SSR and prerendering](https://vite.dev/guide/ssr), [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot), [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Google FAQ result restrictions](https://developers.google.com/search/blog/2023/08/howto-faq-changes), [fontTools subsetting](https://fonttools.readthedocs.io/en/stable/subset/index.html).
