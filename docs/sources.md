# Source links

Add `?ref=…` when sharing NeatCV. The app remembers the first and most recent tagged visits in this browser for 30 days. Untagged returns and invalid labels preserve the remembered source without extending its lifetime. When the first source expires but a newer source remains, that newer source becomes the remembered first source. Visits without a remembered label are `unattributed`, rather than assumed to be direct traffic.

This works without Umami, cookies or an account. Only the label, platform and timestamp are stored under `neatcv-attribution` in localStorage. Resume data, JSON backups and editable PDFs do not contain attribution. Clearing browser data clears the stored labels. If storage is blocked, the source remains available in memory for the current page.

## Ready-to-use labels

| Platform     | Label         | Share link                         |
| ------------ | ------------- | ---------------------------------- |
| Reddit       | `reddit`      | https://neatcv.cc/?ref=reddit      |
| Telegram     | `telegram`    | https://neatcv.cc/?ref=telegram    |
| LinkedIn     | `linkedin`    | https://neatcv.cc/?ref=linkedin    |
| X / Twitter  | `x`           | https://neatcv.cc/?ref=x           |
| GitHub       | `github`      | https://neatcv.cc/?ref=github      |
| Portfolio    | `portfolio`   | https://neatcv.cc/?ref=portfolio   |
| Product Hunt | `producthunt` | https://neatcv.cc/?ref=producthunt |
| Hacker News  | `hackernews`  | https://neatcv.cc/?ref=hackernews  |
| Discord      | `discord`     | https://neatcv.cc/?ref=discord     |
| YouTube      | `youtube`     | https://neatcv.cc/?ref=youtube     |
| Instagram    | `instagram`   | https://neatcv.cc/?ref=instagram   |
| Facebook     | `facebook`    | https://neatcv.cc/?ref=facebook    |
| Mastodon     | `mastodon`    | https://neatcv.cc/?ref=mastodon    |
| Email        | `email`       | https://neatcv.cc/?ref=email       |

Use suffixes to distinguish placements: `reddit-resumes`, `telegram-launch`, `linkedin-profile`, `github-readme`, `email-october-2026`. Platforms are defined in `src/attribution.ts`. Labels are case-insensitive, limited to 64 characters and use letters, digits and single hyphens; the platform must come first. Unknown platforms, duplicate `ref` parameters, URLs, markup and email addresses are ignored. Use campaign labels, never personal information.

For editor links, put the query before the hash: `https://neatcv.cc/?ref=telegram-launch#/edit`. The alternate `https://neatcv.cc/#/edit?ref=telegram-launch` also works, including navigation inside the app. The outer query takes priority if both positions contain a label. The original URL stays intact for copying and sharing.

## Connect Umami later

Copy `.env.example` to `.env.local`, set `VITE_UMAMI_WEBSITE_ID` to the website UUID and rebuild. Umami Cloud uses `https://cloud.umami.is/script.js` by default; `VITE_UMAMI_SCRIPT_URL` selects an HTTPS self-hosted tracker. For Pages, set repository variables `UMAMI_WEBSITE_ID` and optionally `UMAMI_SCRIPT_URL`, then run **Verify and deploy**. The ID is public configuration, not a credential. Blank or invalid IDs leave analytics disabled and make no tracker requests.

New events include `source`, `ref`, `first_source` and `first_ref`. Sources remembered before connecting are available on a later visit while still valid. Past events are not stored or replayed.

| Event             | Trigger                                     | Additional properties                                     |
| ----------------- | ------------------------------------------- | --------------------------------------------------------- |
| `site_visit`      | App opens                                   | —                                                         |
| `resume_created`  | New blank resume is actually created        | `language`                                                |
| `example_opened`  | Fresh example is actually opened            | `language`                                                |
| `resume_imported` | File import is confirmed                    | `language`, `format` (`pdf` / `json`)                     |
| `pdf_downloaded`  | PDF generation succeeds and download starts | `language`, `template`, `format` (`sharing` / `editable`) |
| `json_downloaded` | JSON backup download starts                 | `format` (`json`)                                         |
| `text_downloaded` | Plain-text download starts                  | `language`, `format` (`text`)                             |

Cancelled replacements, imports and downloads do not count. Typing is not tracked. Events contain no names, contacts, resume text, file names, full query strings or referring URLs. Automatic Umami tracking is disabled; only the listed events with a fixed title and `/` or `/edit` route are sent. Do Not Track and Global Privacy Control prevent tracker loading and event transmission. Tracker delays, failures and blockers do not stop the editor; pending events are bounded and kept only in memory.

In Umami, use **Events → Event data** to compare `source` or `ref`, then filter `pdf_downloaded` by `format=sharing` for the main conversion. First-source fields measure discovery rather than the last tagged visit. See the official [tracker functions](https://docs.umami.is/docs/tracker-functions), [tracker configuration](https://docs.umami.is/docs/tracker-configuration) and [event data](https://docs.umami.is/docs/event-data).

Checks cover expiry/corruption, invalid and duplicate labels, both query positions, return visits, blocked storage, tracker loading/queueing/errors, opt-out and sanitized payloads. Browser scenarios cover both themes in desktop Chromium, phone Chromium and iPhone WebKit. The configured-tracker scenario uses an intercepted fixture and creates no real analytics traffic. CI runs the full suite with analytics disabled, then rebuilds with the configured ID and checks the source scenarios before publishing. An additional local check of the official Umami Cloud script intercepted its outgoing requests in desktop Chromium and phone WebKit and confirmed the event payloads.
