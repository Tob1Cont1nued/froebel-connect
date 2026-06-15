import { test, expect } from '@playwright/test';
import { login, logout } from './fixtures/auth';

test.describe('Team-Portal (Fachkraft)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'fachkraft');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  // ── Dashboard ───────────────────────────────────────────────────────────────

  test('Dashboard lädt ohne Fehler', async ({ page }) => {
    await expect(page).toHaveURL(/\/team\/dashboard/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

  // ── Dienstplan ─────────────────────────────────────────────────────────────

  test('Dienstplan zeigt Wochenansicht', async ({ page }) => {
    await page.goto('/team/dienstplan');
    await expect(page).toHaveURL(/\/team\/dienstplan/);
    await expect(
      page.locator('#main-content').getByText(/KW\s*\d+|Mo\b|Di\b|Mi\b/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Dienstplan hat Vor/Zurück-Navigation', async ({ page }) => {
    await page.goto('/team/dienstplan');
    // The week navigator has ChevronLeft and ChevronRight icon buttons
    const buttons = page.locator('header button, [class*="MuiIconButton"]');
    await expect(buttons.first()).toBeVisible({ timeout: 5_000 });
    await expect(await buttons.count()).toBeGreaterThanOrEqual(2);
  });

  // ── Krankmeldung ───────────────────────────────────────────────────────────

  test('Dashboard zeigt Krankmeldungs-Bereich', async ({ page }) => {
    await expect(
      page.locator('#main-content').getByText(/krank/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── Nachrichten ────────────────────────────────────────────────────────────

  test('Team-Nachrichten-Seite ist erreichbar', async ({ page }) => {
    await page.goto('/team/nachrichten');
    await expect(page).toHaveURL(/\/team\/nachrichten/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

  test('Team-Kanal ist sichtbar', async ({ page }) => {
    await page.goto('/team/nachrichten');
    await expect(
      page.locator('#main-content').getByText(/team-kanal|teamkanal|alle/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── Todos ──────────────────────────────────────────────────────────────────

  test('Todo-Seite lädt ohne Fehler', async ({ page }) => {
    await page.goto('/team/todos');
    await expect(page).toHaveURL(/\/team\/todos/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

  // ── Speiseplan ─────────────────────────────────────────────────────────────

  test('Speiseplan-Seite zeigt Frühstück als fest', async ({ page }) => {
    await page.goto('/team/essenplan');
    await expect(page).toHaveURL(/\/team\/essenplan/);
    await expect(
      page.locator('#main-content').getByText(/frühstücks-buffet/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Team-Portal (Leitung)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'leitung');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('Portal lädt ohne Fehler nach Login', async ({ page }) => {
    await expect(page).toHaveURL(/\/(team|leitung)\/dashboard/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

  test('Leitungs-Eintrag ist im Mehr-Bereich sichtbar', async ({ page }) => {
    await page.goto('/team/mehr');
    await expect(
      page.locator('#main-content').getByText(/leitung|verwaltung/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('Leitungs-Dashboard ist direkt erreichbar', async ({ page }) => {
    await page.goto('/leitung/dashboard');
    await expect(page).toHaveURL(/\/leitung\/dashboard/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

  test('Leitung sieht Kinder-Verwaltung', async ({ page }) => {
    await page.goto('/leitung/kinder');
    await expect(page).toHaveURL(/\/leitung\/kinder/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
  });

  test('Leitung sieht Fachkräfte-Verwaltung', async ({ page }) => {
    await page.goto('/leitung/fachkraefte');
    await expect(page).toHaveURL(/\/leitung\/fachkraefte/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 8_000 });
  });
});
