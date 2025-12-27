import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('complete onboarding as bakery manager', async ({ page }) => {
    // Step 1: Visit welcome page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify welcome page loads
    await expect(page.getByTestId('welcome-page')).toBeVisible();
    await expect(page.getByTestId('welcome-title')).toContainText('Bakery CCA');

    // Step 2: Select Bakery Manager role
    await page.getByTestId('role-card-bakery-manager').click();
    await page.waitForLoadState('networkidle');

    // Step 3: Verify bakery selection page and select Morulem
    await expect(page.getByTestId('select-bakery-page')).toBeVisible();
    await expect(page.getByTestId('select-bakery-title')).toContainText('Select Your Bakery');

    // Click on Morulem bakery (first in list)
    await page.locator('text=Morulem').click();
    await page.waitForLoadState('networkidle');

    // App routes bakery-manager directly to dashboard after bakery selection
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('bakery-name')).toContainText('Morulem');
  });

  test('supervisor skips product selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select Supervisor role
    await page.getByTestId('role-card-supervisor').click();
    await page.waitForLoadState('networkidle');

    // Supervisor goes straight to dashboard (no bakery/product selection needed)
    // They should see supervisor dashboard
    await expect(page.locator('text=Supervisor')).toBeVisible({ timeout: 10000 });
  });

  test('strategic manager goes to strategic dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select Strategic Manager role
    await page.getByTestId('role-card-strategic-manager').click();
    await page.waitForLoadState('networkidle');

    // Should see bakery selection
    await expect(page.getByTestId('select-bakery-page')).toBeVisible();

    // Select a bakery
    await page.locator('text=Morulem').click();
    await page.waitForLoadState('networkidle');

    // Strategic manager goes to strategic dashboard (skips product selection)
    await expect(page.locator('text=Strategic')).toBeVisible({ timeout: 10000 });
  });
});
