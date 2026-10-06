# Privacy notice and optional services

The public notice is at [neatcv.cc/privacy.html](https://neatcv.cc/privacy.html). The independent Vite entry `src/privacy-main.tsx` does not import the editor, storage or PDF modules. It reads language and theme preferences and can remember a source label, but never opens the resume database. Navigation from the editor opens a separate tab to preserve unsaved input, the current step and scroll position.

The notice covers local resumes, files and photo processing, sharing versus editable exports, browser preferences, source-label retention, hosting logs, external links, clearing site data, contact and service status. English and Russian copy lives in `src/privacy-copy.ts`; other languages use the existing interface dictionaries. Update all six languages and the notice date together when behavior changes. The no-JavaScript fallback in `privacy.html` must remain accurate too.

Umami is prepared but disabled when no valid website ID and HTTPS tracker URL are configured. The page uses the same configuration validation as the tracker, so a later configured build does not continue claiming analytics is disabled. Do Not Track and Global Privacy Control can still prevent tracker loading in a configured build. Privacy-page events use `/privacy.html`, never a query or fragment.

Sentry is not installed or configured. Naming it as a future service does not enable error reporting or authorize sending resume data.

Browser checks in `e2e/privacy.e2e.ts` cover all six languages, both themes, desktop and 360 px phone profiles, accessibility, reload, opening from home and the editor, unavailable storage and a no-JavaScript fallback. Configured-service checks intercept tracker requests instead of sending real analytics. `src/analytics.test.ts` verifies that privacy events omit query strings and fragments.

## Before activating a service

- Confirm the provider, deployment region, data collected, retention and deletion settings. Update the public notice with actual choices, processing purpose and applicable disclosures before activation; do not invent a retention period or claim blanket legal compliance.
- Keep resume fields, pasted vacancies, photos, imported files, file names, full query strings and referring URLs out of telemetry. Disable session replay, user identity and automatic capture that could expose them. For Sentry, inspect the current SDK’s collection defaults, configure explicit exclusions and scrub errors, breadcrumbs and URLs before sending.
- Verify browser privacy controls and the required consent/opt-out behavior for the chosen deployment. Cookie-free operation alone is not a legal compliance guarantee.
- Intercept outgoing requests in browser tests and inspect real provider SDK payloads with fictional content before release. Check tracker failures do not block editing, importing or exporting.
- The existing Pages variables and rebuild instructions are in [sources.md](sources.md). Setting an ID alone does not replace the disclosure and configuration review above.

References: [Umami tracker configuration](https://docs.umami.is/docs/tracker-configuration), [Umami privacy notice](https://umami.is/privacy), [Sentry browser data collection](https://docs.sentry.io/platforms/javascript/data-management/data-collected/), and [GitHub Pages data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection).
