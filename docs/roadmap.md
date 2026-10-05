# Next improvements

The editor is free, private, and usable without an account. Future work should keep the path from writing to a readable PDF short.

1. **Several resumes and tailored copies.** Keep named resumes locally, duplicate one for a vacancy, and keep the matched posting next to it.
2. **Review the actual exported text.** The Text preview now shows extracted reading order and embedded links by page, with empty-text and page-count warnings. Next, detect partially missing text and geometric overflow, and explain invalid link targets before download.
3. **Custom sections and certificates.** Add certificates, volunteering, and a free-form section, preserved in both languages and in backups.
4. **Cover letter.** A matching one-page letter in the same design, with structure guidance rather than generated text.
5. **Import with review.** Extract ordinary text PDFs into editable fields, with a clear comparison and review of uncertain dates and names.

Delivered recently: floating contextual coach marks and an optional eight-step walkthrough to PDF download, with persistent dismissal and opt-out; actual PDF text and link inspection; a mobile backup reminder that reserves its own space; the Review step with content checks, vacancy matching, writing guidance and an action-verb library, section order and visibility, plain-text export, twelve templates, ten colors, an optional photo, a collapsible section panel and a resizable form.

## Mobile quality

Keep the phone workflow focused on the current step. Writing, choosing any step, reading the actual PDF, and downloading must work with touch controls, in both themes, portrait and landscape. Maintain regression coverage for the iPhone 15 Pro Max Safari profile, a Chromium phone, 320/360 px widths and tablets. Real iPhone checks remain necessary for the software keyboard, Files/share sheet, safe areas and browser chrome; browser emulation complements those checks.

## Components that keep improving

1. Inventory the shared primitives and product components: Field, Select, Switch, Textarea, buttons, Dialog, navigation, entry cards, skill/language chips, preview controls, notices and import/export dialogs. Record ownership, keyboard interaction and every visible state.
2. Cover default, hover, focus, pressed/selected, disabled, loading, empty, error, long translated labels and reduced motion in both themes and at phone sizes. Check contrast and touch targets alongside behavior.
3. Keep common tokens and primitives consistent with the shared `ui-registry`; retain custom resume behavior in this product. Move a reusable improvement into the shared library when another product needs it, with checks for existing consumers.
4. Use an isolated component gallery for repeatable reviews. Evaluate Storybook when the state matrix and cross-product consumers justify it; it should serve visual and accessibility regression testing rather than duplicate the application or become another design system.
5. Simplify `Editor.tsx` incrementally into tested navigation, template/style, entry, review and preview components. Preserve data, focus, undo and responsive behavior throughout.

## Optional paid services, after core quality

The core editor stays free without registration: writing and editing, all current templates, readable PDF downloads without watermarks, editable backups and local storage. Paid features must add convenience without withholding an existing essential feature.

Start with product discovery, not a checkout: compare demand for a cloud resume library with tailored copies, cross-device sync, saved vacancy folders, version history and restore, and an optional larger storage allowance. Several local resumes and portable backups should remain available without an account. Paid accounts can offer a larger synchronized library and history; establish practical free-account limits only after measuring storage and support costs.

Before implementation, define an optional account flow, a local-to-cloud migration with explicit choice, conflict handling, export and deletion, downgrade behavior that preserves access to existing documents, pricing experiments and recurring costs. Design a cabinet with named resumes, last edit, language, vacancy, duplicate, archive and search. Separate authentication, billing, storage and permissions; test authorization and recovery before launch. Review privacy, service terms and the necessary business/legal disclosures before accepting payment. No paid account, cloud upload or payment collection is enabled by this roadmap.
