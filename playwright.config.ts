import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the Vercel staging deployment by default.
 * Override with BASE_URL env var to test locally: BASE_URL=http://localhost:5173 npx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,   // Supabase rate-limits; keep sequential
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://froebel-connect-1tq4.vercel.app',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
