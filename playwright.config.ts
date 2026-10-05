import { defineConfig, devices } from '@playwright/test'

const port = 4279
// BASE_URL runs the suite against a deployed copy instead of a local preview.
const remote = process.env.BASE_URL

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: remote ?? `http://127.0.0.1:${port}/`,
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: 'mobile.e2e.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'iphone-safari',
      testMatch: [
        'mobile.e2e.ts',
        'a11y.e2e.ts',
        'locales.e2e.ts',
        'contacts.e2e.ts',
        'backup.e2e.ts',
        'gallery.e2e.ts',
        'skills.e2e.ts',
        'onboarding.e2e.ts',
        'pdf-text.e2e.ts',
        'motion.e2e.ts',
        'sources.e2e.ts',
      ],
      use: { ...devices['iPhone 15 Pro Max'], browserName: 'webkit' },
    },
    {
      name: 'phone-chromium',
      testMatch: [
        'mobile.e2e.ts',
        'a11y.e2e.ts',
        'locales.e2e.ts',
        'contacts.e2e.ts',
        'backup.e2e.ts',
        'gallery.e2e.ts',
        'skills.e2e.ts',
        'onboarding.e2e.ts',
        'pdf-text.e2e.ts',
        'motion.e2e.ts',
        'sources.e2e.ts',
      ],
      use: { ...devices['iPhone 15 Pro Max'], browserName: 'chromium' },
    },
  ],
  webServer: remote
    ? undefined
    : {
        command: `npx vite preview --host 127.0.0.1 --port ${port} --strictPort`,
        url: `http://127.0.0.1:${port}/`,
        reuseExistingServer: false,
      },
})
