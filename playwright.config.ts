import { defineConfig, devices } from '@playwright/test'

// E2E tests intentionally require a separately provisioned database. Keeping it
// distinct from DATABASE_URL makes it difficult to run a disposable journey
// against a developer or production database by accident.
const e2eDatabaseUrl = process.env.E2E_DATABASE_URL
process.env.NEXTAUTH_URL ??= 'http://127.0.0.1:3100'
process.env.NEXTAUTH_SECRET ??= 'levelup-e2e-local-secret-only'
if (e2eDatabaseUrl) {
  process.env.DATABASE_URL = e2eDatabaseUrl
  process.env.DIRECT_URL = process.env.E2E_DIRECT_URL ?? e2eDatabaseUrl
}

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices['iPhone 13'],
    baseURL: 'http://127.0.0.1:3100',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'next dev -p 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
