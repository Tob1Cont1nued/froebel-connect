import { test, expect } from '@playwright/test';
import { login, ACCOUNTS } from './fixtures/auth';

test.describe('Login', () => {
  test('zeigt das Login-Formular', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/passwort/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /anmelden/i })).toBeEnabled();
  });

  test('zeigt Fehlermeldung bei falschem Passwort', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-mail/i).fill(ACCOUNTS.eltern.email);
    await page.getByLabel(/passwort/i).fill('FalschesPasswort!');
    await page.getByRole('button', { name: /anmelden/i }).click();
    // Any visible text indicating failure; must stay on /login
    await expect(page.locator('body')).toContainText(
      /ungültig|falsch|invalid|fehlgeschlagen|credentials|wrong/i,
      { timeout: 8_000 },
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test('Elternteil-Account landet im Eltern-Portal', async ({ page }) => {
    await login(page, 'eltern');
    await expect(page).toHaveURL(/\/eltern\/dashboard/);
  });

  test('Fachkraft-Account landet im Team-Portal', async ({ page }) => {
    await login(page, 'fachkraft');
    await expect(page).toHaveURL(/\/team\/dashboard/);
  });

  test('Leitungs-Account landet im Team- oder Leitungs-Portal', async ({ page }) => {
    await login(page, 'leitung');
    await expect(page).toHaveURL(/\/(team|leitung)\/dashboard/);
  });

  test('Nicht-eingeloggte Nutzer werden zu /login umgeleitet', async ({ page }) => {
    await page.goto('/eltern/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
