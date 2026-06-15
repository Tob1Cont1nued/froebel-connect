import { test, expect } from '@playwright/test';
import { login, logout } from './fixtures/auth';

test.describe('Eltern-Portal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'eltern');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  // ── Dashboard ───────────────────────────────────────────────────────────────

  test('Dashboard zeigt Kinder der Testmama', async ({ page }) => {
    await expect(
      page.locator('#main-content').getByText(/Lena Müller|Max Müller/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Navigation enthält alle Hauptbereiche', async ({ page }) => {
    for (const label of ['Nachrichten', 'Termine', 'Portfolio', 'Essenplan', 'Mehr']) {
      await expect(
        page.getByRole('link', { name: new RegExp(`^${label}$`, 'i') })
          .or(page.locator('[class*="BottomNavigationAction"]').filter({ hasText: label }))
          .or(page.locator('li').filter({ hasText: label }).getByRole('button'))
          .first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  // ── Abwesenheit melden ─────────────────────────────────────────────────────

  test('Abwesenheit-Seite ist erreichbar', async ({ page }) => {
    await page.goto('/eltern/abwesenheit');
    await expect(page).toHaveURL(/\/eltern\/abwesenheit/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

  test('Abwesenheitsformular ist sichtbar', async ({ page }) => {
    await page.goto('/eltern/abwesenheit');
    // Form is always shown inline — check for date and reason fields
    await expect(page.getByLabel(/abwesend ab/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByLabel(/grund/i)).toBeVisible({ timeout: 5_000 });
    await expect(
      page.getByRole('button', { name: /abwesenheit melden/i })
    ).toBeVisible({ timeout: 5_000 });
  });

  // ── Essenplan ─────────────────────────────────────────────────────────────

  test('Essenplan zeigt immer Frühstücks-Buffet', async ({ page }) => {
    await page.goto('/eltern/essenplan');
    await expect(
      page.locator('#main-content').getByText(/frühstücks-buffet/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Essenplan zeigt Wochennavigation', async ({ page }) => {
    await page.goto('/eltern/essenplan');
    // Week header — KW or day names
    await expect(
      page.locator('#main-content').getByText(/KW\s*\d+|Mo\b|Di\b|Mi\b/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── Nachrichten ────────────────────────────────────────────────────────────

  test('Nachrichten-Seite ist erreichbar', async ({ page }) => {
    await page.goto('/eltern/nachrichten');
    await expect(page).toHaveURL(/\/eltern\/nachrichten/);
    // The page heading lives in the main content
    await expect(
      page.locator('#main-content').getByRole('heading').first()
        .or(page.locator('#main-content').locator('text=/nachrichten|keine/i').first())
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── Termine ────────────────────────────────────────────────────────────────

  test('Termine-Seite lädt ohne Fehler', async ({ page }) => {
    await page.goto('/eltern/termine');
    await expect(page).toHaveURL(/\/eltern\/termine/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });
});
