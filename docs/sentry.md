# Optional Sentry diagnostics

Sentry is disabled by default. Without a valid `VITE_SENTRY_DSN`, the browser does not download the Sentry client, register reporting listeners or send reports. A blocked SDK or endpoint never blocks editing. Do Not Track and Global Privacy Control are checked before loading and before every report, including the final transport.

## Activate or disable

1. Create a browser JavaScript project in Sentry and choose its processing region. In the project settings, review retention, access and scrubbing. Keep session replay, feedback capture and performance instrumentation disabled.
2. Copy the **public browser DSN** from project settings → Client Keys (DSN). This is an ingest address, not an API/auth token. Do not provide an auth token, private DSN password or source-map upload credential.
3. For local development, set `VITE_SENTRY_DSN` in `.env.local` and restart Vite. For the published site, set the GitHub repository **Actions variable** `SENTRY_DSN` in Settings → Secrets and variables → Actions → Variables. Use the complete HTTPS DSN, including its public key and numeric project ID. `VITE_SENTRY_DSN` is embedded into the browser build and is public.
4. Run [Verify and deploy](https://github.com/MrNedNick/cv-studio/actions) on `main`. Vite reads configuration at build time: adding a variable does not change an already published build. After successful deployment, `/privacy.html` shows “Configured in this build” and the reporting host. Browser opt-outs can still prevent requests.
5. To disable reporting, clear `SENTRY_DSN` and rebuild/deploy. Clear `VITE_SENTRY_DSN` locally and restart Vite.

The DSN validator accepts HTTPS public-key DSNs with a numeric project ID, including self-hosted path prefixes. Passwords, queries, fragments and malformed values disable reporting.

## What a report contains

| Sent                                                          | Excluded                                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Native error category from a fixed list                       | Arbitrary error names and messages, rejection values                                   |
| One of four page routes, without query/fragment               | Full navigation and referring URLs, source labels                                      |
| Names of application JS assets already loaded by this page    | User file names, external stack URLs, function names, code context and local variables |
| Valid line/column positions                                   | Resume fields, contacts, photos, pasted vacancies and imported files                   |
| Generated report ID, timestamp and fixed environment/category | User identity, cookies, custom headers, extras, contexts, breadcrumbs and attachments  |

The browser still supplies network connection information to the configured endpoint, including its IP address and normal browser headers. The request omits credentials and referrer. Region and retention are project settings, not assumptions made by the app.

`error-reporting.ts` captures unhandled browser errors, unhandled promise rejections, the React error boundary and caught PDF export failures. It discards arbitrary messages before the SDK receives the event. Stack locations are restricted to same-origin JS assets known to the page; asset URLs lose their query and fragment. The route is captured at the error and stays stable during asynchronous delivery.

`sentry-client.ts` uses an isolated `BrowserClient` and `Scope`, with no default or additional integrations. Automatic data collection is disabled explicitly. No tracing, replay, feedback, session or console integration is enabled. `beforeSend` rebuilds the event from the allowlist. The transport rebuilds the envelope again and drops non-error item types and attachments, including envelope trace metadata. This also prevents a later SDK default or accidental additional field from bypassing the event filter. The SDK's fetch transport retains bounded buffering and rate-limit handling; there is no offline storage or automatic resend after reload.

At most 20 errors are reported per page load; at most 10 sanitized reports wait while the SDK loads. Unsupported imports and ordinary form validation are not diagnostics. Removing error messages reduces debugging detail deliberately; category, route and bundle locations remain available.

## Verification

Unit tests cover polluted events/envelopes, unsafe DSNs, known asset filtering, privacy controls, initialization, queue limits and SDK failure. Browser tests inspect real SDK requests containing fictional private inputs, throw/reject errors, crash React, download the preserved JSON backup, exercise blocked endpoints and verify that no SDK loads with opt-outs or no DSN.

CI always builds a separate fixture with `https://publickey@errors.example.test/123`; every receiving request is intercepted. This build is never published. Production `dist` remains separate. If a real DSN is configured, CI also rebuilds and checks that configuration with intercepted requests before deployment. Tests never submit reports to a real project.

```sh
VITE_SENTRY_DSN=https://publickey@errors.example.test/123 npm run build -- --outDir dist-sentry-test
VITE_SENTRY_DSN=https://publickey@errors.example.test/123 SENTRY_FIXTURE_BUILD=1 npx playwright test e2e/sentry.e2e.ts e2e/privacy.e2e.ts
```

References: [Sentry SDK options](https://docs.sentry.io/platforms/javascript/configuration/options/), [filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/) and [isolated clients](https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/).
