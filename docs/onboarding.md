# Help while writing

The editor offers short, inline guidance for the current task. It never opens a tour or modal automatically, puts a spotlight over controls, advances steps, imposes completion, or starts a timer. People can write, navigate and download immediately.

A consistent **Editor guide** button sits beside the step number, with the same action in **Resume actions** when the form is hidden or the phone shows the preview. The guide opens only by request. Each topic expands independently and can navigate to its relevant step or the PDF preview.

| Topic | When inline guidance appears | What it clarifies |
| --- | --- | --- |
| Template | Own resume, Template step | Empty previews use sample text without adding it to the document |
| Personal details | Personal details | Autosave is local to this browser; portable backups matter |
| Language versions | Requested from the guide | The top language control changes the interface and resume version; text is not automatically translated |
| Optional sections | Visible Profile, Experience, Education or Projects | Hiding retains text, Next skips hidden steps, writing examples are available |
| Skills | Skills | Enter/comma and pasting several comma-separated skills |
| Languages | Languages | CEFR or custom levels, distinct from the PDF language |
| Review | Review | Checks are suggestions; sharing and editable PDF serve different purposes |
| Preview | Phone preview or hidden desktop form with enough viewport height; always available by request | Real PDF pages and line breaks, text alternative, preview zoom vs exported text size |

The example already has a banner, so its Template step avoids an additional automatic introduction. Hidden sections keep their existing recovery message instead of repeating general guidance. Automatic preview tips defer on short screens to preserve PDF space; requested preview help becomes a compact card. Only one onboarding tip is visible in the workspace at a time; existing field validation and writing checks remain available.

Close a tip to remember its dismissal for that topic across visits and resumes. **Contextual editor tips** disables automatic onboarding cards. **Show in editor** requests a single topic even when automatic tips are off, without changing that preference. **Restore dismissed editor tips** restores all topics and enables guidance. Preferences use a separate, versioned localStorage key; they do not enter the resume, undo history or downloaded backups. When storage is blocked, controls still work for the current visit. Malformed stored preferences recover safely.

Native disclosure controls and the existing Dialog/Switch provide keyboard interaction and focus handling. Opening a topic focuses its destination; closing a tip returns focus to the nearby help control; Escape closes the guide and restores its opener. Inline cards are labelled complementary regions, not alerts or live announcements. Help never moves focus while someone is writing. The interface supports all six languages, both themes, reduced motion and phone-sized controls.

The design follows [NN/g's contextual-help guidance](https://www.nngroup.com/articles/onboarding-tutorials/) and [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/). Consistent placement is informed by [WCAG 2.2's Consistent Help criterion](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html). These references explain the design choices; they are not a claim of complete WCAG certification.

## Verification

Unit coverage checks topic-specific dismissal across mounts, persistent disable/enable, explicitly requested help, reset, blocked storage, malformed preferences and keyboard focus without changing writing. Translation checks require every English key in the four additional dictionaries.

Browser coverage uses desktop Chromium, phone Chromium and iPhone WebKit: fresh start with no automatic dialog; writing with focus intact; dismissal, disable, reload and restore; manual help with automatic tips off; hidden-section recovery; example documents; language-version guidance; preview, review and PDF selection. Both themes, 320/360/430 px, six languages, Escape/focus restoration, axe, console errors and failed requests are covered. The existing suite verifies editing, persistence and sharing/editable PDF/JSON round trips. Physical iPhone keyboard and screen-reader use still need a real-device check.
