import { type Page, expect } from '@playwright/test';

export const ACCOUNTS = {
  eltern: {
    email:    'elternteil@froebel-muenster.de',
    password: 'Test1234!',
    portal:   /\/eltern\/dashboard/,
  },
  fachkraft: {
    email:    'fachkraft@froebel-muenster.de',
    password: 'Test1234!',
    portal:   /\/team\/dashboard/,
  },
  leitung: {
    email:    'leitung@froebel-muenster.de',
    password: 'Test1234!',
    // leitung has role=fachkraft + is_leitung=true; the app may redirect
    // to /team/dashboard or /leitung/dashboard — both are valid
    portal:   /\/(team|leitung)\/dashboard/,
  },
} as const;

export type AccountRole = keyof typeof ACCOUNTS;

/** Logs in and waits until the correct portal dashboard is visible. */
export async function login(page: Page, role: AccountRole) {
  const { email, password, portal } = ACCOUNTS[role];

  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/passwort/i).fill(password);
  await page.getByRole('button', { name: /anmelden/i }).click();

  await page.waitForURL(portal, { timeout: 15_000 });
  await expect(page).toHaveURL(portal);
}

/**
 * Logs out from any portal.
 * Scoped to #main-content to avoid strict-mode violations with the
 * sidebar "Abmelden" button and other "melden" list items.
 */
export async function logout(page: Page) {
  const currentUrl = page.url();
  const isEltern = currentUrl.includes('/eltern');
  const isLeitung = currentUrl.includes('/leitung');

  if (isLeitung) {
    await page.goto('/team/mehr');
  } else {
    await page.goto(isEltern ? '/eltern/mehr' : '/team/mehr');
  }

  await page
    .locator('#main-content')
    .getByRole('button', { name: 'Abmelden', exact: true })
    .click();

  await page.waitForURL('**/login', { timeout: 8_000 });
}
