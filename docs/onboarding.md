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

Dismissal is remembered per topic. **Contextual editor tips** disables automatic cards; requested help still works without changing that preference. **Restore dismissed editor tips** enables guidance and restores every topic. Preferences use a separate versioned localStorage key, stay outside the resume, undo history and backups, and continue working for the current visit if storage is blocked. Malformed preferences recover safely.

Interactive cards are labelled nonmodal dialogs, rather than tooltips with focusable content. The highlighted control receives an associated description. Requested steps focus their primary action; Escape restores the target, and closing by pointer returns to nearby help. All six interface languages, both themes, reduced motion and 44 px phone controls are supported.

These decisions follow [Adobe Spectrum's coach-mark guidance](https://spectrum.adobe.com/web/design-only/components/coach-mark), [NN/g's contextual onboarding guidance](https://www.nngroup.com/articles/onboarding-tutorials/) and the [WAI distinction between tooltips and interactive dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). They explain the design choices, not a claim of complete WCAG certification.

## Checking the exported text

In the Text preview, **Check PDF text** opens an optional inspection of the generated PDF itself. It shows text in the extraction order for each page and its actual web, email and phone links. Empty text pages and documents longer than two pages receive a warning. Processing happens locally, loads only on request and follows the latest document; late results from earlier edits are discarded. Failed checks offer retry while the structured text view stays available.

This helps people inspect reading order and links. It does not rate hiring chances, certify compatibility with every applicant tracking system, or contact external sites to test links. Detecting partially missing text and geometric overflow remains future work.

On phones, the persistent backup reminder occupies its own space below the workspace after a sharing download, so it does not cover fields or preview controls.

## Verification

Unit coverage checks dismissal, persistent preferences, requested help, reset, blocked storage, malformed values, placement and visual viewport offsets; PDF inspection covers page text, safe links, empty pages, retry and stale results. Translation checks require every interface key in the additional dictionaries.

Browser coverage uses desktop Chromium, phone Chromium and iPhone WebKit: complete tour to a downloaded editable PDF; Back and data preservation; scrolling and resume; Escape, focus restore, typing and opt-out; reload and manual restart; example and hidden-section recovery; narrow, landscape and tablet screens; all six languages; axe, console errors and failed requests. PDF inspection is compared with real sharing downloads for both a single-column and two-column template. Existing coverage checks editing, undo, persistence and PDF/JSON round trips. Physical iPhone keyboard and screen-reader use still need real-device checks.
