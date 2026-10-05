# Component quality plan

NeatCV has four shared primitives under `src/ui/components/` (Field, Select, Switch and Textarea). They are copied from the portfolio's `ui-registry` and receive the product's CSS tokens and responsive styles. Product behavior belongs in the components beside the editor rather than in the shared primitives.

| Component | Existing behavior | Next review |
| --- | --- | --- |
| Field / FormField | Label, hint, error association; validation after blur; shared input/textarea styling; contact autocomplete and keyboard modes; Enter advances contacts and respects composition | Long labels; real-device autofill; interruption/recovery; error announcements |
| Select | Native selection; language-specific options; required and disabled state | Touch target, native picker and high contrast |
| Switch | Checkbox-based toggle; section inclusion and current employment | Pointer and keyboard behavior; disabled and error state |
| Textarea | Auto-grow, character limit, spelling language | Long pasted text, mobile keyboard, internal scrolling |
| Dialog | Native modal focus trap, Escape/backdrop close, focus restore, unique heading IDs | Nested transitions; long content; safe areas; reduced motion |
| Step navigation | Same step list in desktop sidebar and mobile dialog; progress and hidden sections | Keyboard focus after selecting the current step; hidden-step clarity |
| EntryCard | Collapse, reorder, delete, focus on new entry, undo | Long translated headings and 100-entry sections |
| Skills / LanguageFields | Chips, Enter/comma/paste, role suggestions, full-text wrapping, keyboard removal returns to writing, language picker, CEFR | Screen-reader announcements; real-device touch and keyboard |
| Preview | Actual PDF, fit/zoom, structured text, on-demand extracted text and link inspection, retry and page navigation | Touch panning, multi-page text, memory use on older phones |
| Import / export | Confirmation, editable vs sharing copy, persistent backup offer after sharing, JSON feedback and error/retry | iOS Files/share sheet and interruption during downloads |
| Onboarding / Editor guide | Anchored floating coach marks, eight-step optional tour, outline/arrow, viewport tracking, typing priority, persistent opt-out, topic navigation, reset and focus restore; six languages | Physical-device and screen-reader review |
| Buttons / notices | CSS tokens and explicit accessible names | Consolidate variants; disabled/loading layout; error vs saved status |

Use this matrix for every visual review: light/dark, 320/360/430 px, desktop, long German labels, Cyrillic, keyboard focus, disabled, loading, error, empty and selected states. Respect reduced motion and native browser zoom. Keep behavior tests close to the component and use end-to-end tests for persistence, imports and exports.

Review the actual components at [`components.html`](https://neatcv.cc/components.html) (locally, `/components.html`). It is a separate Vite entry with temporary state, the same component imports and the same product styles; it does not read or write stored resumes. It covers labelled hints, validation after blur, explicit errors, disabled controls, long German labels, native select/switch, multiline writing, loading actions, modal focus and skill/template choices.

Use this lightweight gallery for the current single-product state matrix. Storybook would add another build and configuration to maintain; adopt it when shared consumers need individual stories, visual snapshots and controls at a scale this page no longer covers. Keep its tooling separate from the product bundle. Avoid creating a second set of product components just for the gallery. Any shared improvement must be checked against the existing consumers before copying it back.

The mobile update reuses the existing Dialog and step navigation, gives dialogs unique heading IDs, enlarges primary touch controls and stops rendering a hidden PDF. The remaining component review is planned work; this document is not a claim that every component state has been verified.

Contact checks cover invalid email, phone and URL messages, linked error descriptions, correction, bare web addresses, Enter navigation, composition input, both themes, phone widths and persistence after a reload. URL fields keep a text input with `inputmode="url"` because a valid bare domain should not be rejected by native URL validation. Only the portfolio field requests URL autofill; LinkedIn/GitHub use separate names and disable shared URL autofill. The combined city/country field has no city-only autofill token. Real iOS keyboard suggestions and saved-contact autofill still need a physical device check.

Gallery browser checks cover both themes, 320/430 px, keyboard switch and modal focus, Escape/restore, disabled/loading actions, chips, twelve disabled template cards, error correction, axe and storage isolation. The gallery is a first review surface, not a complete audit of entry cards, PDF preview, all six translations or real iOS controls. Skills Enter/Backspace also respect composition input, with behavior tests.

Skill checks include a long uninterrupted word and Cyrillic text at 320/360/430 px in both themes. Chips wrap without truncating stored text and keep the removal target at least 44 px on phones. Enter/Space removal returns keyboard focus to the input; pointer removal does not force the software keyboard open. The workflow covers adding again, removing the final chip and keeping the resulting skills after a reload.
