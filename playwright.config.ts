import { defineConfig, devices } from '@playwright/test'

const port = 4173
// BASE_URL runs the suite against a deployed copy instead of a local preview.
const remote = process.env.BASE_URL

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: remote ?? `http://127.0.0.1:${port}/cv-studio/`,
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: remote
    ? undefined
    : {
        command: `npx vite preview --host 127.0.0.1 --port ${port} --strictPort`,
        url: `http://127.0.0.1:${port}/cv-studio/`,
        reuseExistingServer: !process.env.CI,
      },
})
