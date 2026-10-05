# Help while writing

The editor uses floating coach marks next to the control that matters now. A fine outline and an arrow connect each explanation to its target. The rest of the editor remains usable: there is no backdrop, focus trap, timer or requirement to finish a tour.

A fresh blank resume starts with help choosing a template. **Start walkthrough** begins an optional eight-step route: template, name and role, writing examples, skills, language levels, language versions, review and PDF preview. **Back** revisits a step with the current writing intact; the final action opens the normal download dialog. **Skip walkthrough**, the close button or Escape ends the tour and remembers the opt-out. Completing the tour also turns off automatic onboarding.

The consistent **Editor guide** action remains beside the step number, or in **Resume actions** when the form is hidden. It opens an on-demand reference with eight independent disclosures, a tour starter, preferences and **Show in editor** for a specific topic. Opening this reference ends the active tour; closing it restores its opener. Normal section navigation or changing the phone's Editor/Preview view also exits the tour.

| Topic | Target | What it clarifies |
| --- | --- | --- |
| Template | Selected template's name | Empty previews use example text without adding it to the document |
| Personal details | Full name field | Where to begin writing and how automatic local saving works |
| Optional sections | Writing examples or hidden-section recovery | Examples explain structure and results; hiding retains text |
| Skills | Skill input or recovery | Enter/comma and pasting several comma-separated skills |
| Languages | Entire CEFR group or recovery | All levels remain clickable; custom levels differ from the PDF language |
| Language versions | Top language control | Each language keeps separate text; text is not translated automatically |
| Review | Vacancy field | Content checks and optional skill comparison before export |
| Preview | Text view control | Actual PDF pages, readable text, and sharing vs editable copies |

Automatic tips do not move focus. Focusing a text field or language selector hides the full card, including during a requested tour; a compact Continue walkthrough control keeps that tour available after writing. Desktop cards sit outside the form, with a fine connector to their target, so other form controls remain accessible. Cards reposition after scrolling, resizing, content changes and visual-viewport updates; they appear only when the whole target and card fit. A requested tip whose target is offscreen offers **Continue walkthrough** to bring it back, plus a close control. Native modals temporarily hide coach marks. The fictional example avoids an additional automatic Template introduction, and hidden sections retain their recovery message.

Section forms omit the former **A little guidance** block, including the empty-education reminder. Optional writing examples stay beside the heading; content checks remain in Review.

Dismissal is remembered per topic. **Contextual editor tips** disables automatic cards; requested help still works without changing that preference. **Restore dismissed editor tips** enables guidance and restores every topic. Preferences use a separate versioned localStorage key, stay outside the resume, undo history and backups, and continue working for the current visit if storage is blocked. Malformed preferences recover safely.

Interactive cards are labelled nonmodal dialogs, rather than tooltips with focusable content. The highlighted control receives an associated description. Requested steps focus their primary action; Escape restores the target, and closing by pointer returns to nearby help. All six interface languages, both themes, reduced motion and 44 px phone controls are supported.

Choosing a template or preview mode collapses the card so the next control remains available. Resume actions and the mobile section picker pause the card without restarting the tour or moving focus away from the menu when it closes.

Cards and their compact resume controls fade in and out. Topic disclosures and PDF inspection use the same reversible collapse as the editor. Closing help or the mobile step picker completes its exit before showing a requested step, and controls in an outgoing surface are inert.

These decisions follow [Adobe Spectrum's coach-mark guidance](https://spectrum.adobe.com/web/design-only/components/coach-mark), [NN/g's contextual onboarding guidance](https://www.nngroup.com/articles/onboarding-tutorials/) and the [WAI distinction between tooltips and interactive dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). They explain the design choices, not a claim of complete WCAG certification.

## Checking the exported text

In the Text preview, **Check PDF text** opens an optional inspection of the generated PDF itself. It shows text in the extraction order for each page and its actual web, email and phone links. Empty text pages and documents longer than two pages receive a warning. Processing happens locally, loads only on request and follows the latest document; late results from earlier edits are discarded. Failed checks offer retry while the structured text view stays available.

The check compares visible writing in the selected language with the extracted text and identifies passages that could not be matched, including unsupported font characters. It tolerates line breaks, tracking, ligatures, uppercase headings and fixed page numbers inside a continued paragraph. Hidden sections, empty entries and other language drafts are excluded. Each unmatched passage includes its section and a button that returns to editing with keyboard focus.

Font metrics and text coordinates also flag passages that may cross the physical paper edge. PDF.js can omit clipped characters during extraction, so source comparison complements the coordinate check. A missing glyph appears as a replacement character in the extracted text instead of an invisible null character. These are approximate checks: they do not detect clipping inside a column, overlaps between blocks, or a missing repetition when identical writing appears elsewhere. The PDF tab remains necessary for visual review.

Invalid web addresses receive an explanation in the inspection and a compact, expandable warning in the download dialog. They remain in the editable source but are omitted from the PDF. An invalid email stays readable as plain text without an email link; valid recipients are encoded so recipient characters do not become mailto options. Web addresses without a protocol and spaces in paths are supported; spaces or control characters in a hostname are rejected. Review only counts valid profile links.

This helps people inspect reading order and links. It does not rate hiring chances, certify compatibility with every applicant tracking system, or contact external sites to test links. Coordinate checks use PDF.js text items and font styles ([API reference](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html)).

On phones, the persistent backup reminder occupies its own space below the workspace after a sharing download, so it does not cover fields or preview controls.

## Verification

Unit coverage checks dismissal, persistent preferences, requested help, reset, blocked storage, malformed values, placement and visual viewport offsets; PDF inspection covers page text, safe links, empty pages, retry, stale results, missing passages, hidden language/section exclusion, crop boxes and paper edges. Real exports are checked for all twelve templates, all six languages, long documents, paragraphs continued across pages, unsupported characters and a partially clipped PDF fixture. Translation checks require every interface key in the additional dictionaries. Editing regressions check overlapping animation completions, navigation during deletion, independent undo, and replacing the document without applying an old pending change.

Browser coverage uses desktop Chromium, phone Chromium and iPhone WebKit: complete tour to a downloaded editable PDF; Back and data preservation; scrolling and resume; Escape, focus restore, typing and opt-out; reload and manual restart; example and hidden-section recovery; narrow, landscape and tablet screens; all six languages; axe, console errors and failed requests. PDF inspection is compared with real sharing downloads for both a single-column and two-column template. The correction workflow starts blank, reloads saved writing, identifies a missing glyph and invalid links, opens and closes the download warning, returns to the relevant section with focus, corrects the fields and verifies the resulting sharing PDF in both themes and at 360 px. Motion checks cover opening and closing heights, reversing an in-flight transition, inactive outgoing controls, overlapping entry deletions with independent undo, Escape and restored focus in both themes and reduced motion. Existing coverage checks editing, undo, persistence and PDF/JSON round trips. Physical iPhone keyboard and screen-reader use still need real-device checks.
