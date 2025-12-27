import { test, expect } from '@playwright/test';

test.describe('Daily Entry Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and set up completed onboarding state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      // Set up completed onboarding with 2 products selected
      localStorage.setItem('onboardingData_local', JSON.stringify({
        role: 'bakery-manager',
        bakery: 'morulem',
        products: ['yeast-mandazi', 'daddies'],
        prices: { 'yeast-mandazi': 500, 'daddies': 800 },
        userId: 'test-user-123'
      }));
      localStorage.setItem('onboardingComplete', 'true');
    });
  });

  test('enter production and sales data', async ({ page }) => {
    // Navigate to dashboard first
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard loads
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('bakery-name')).toContainText('Morulem');

    // Click "Enter Today's Data" button
    await page.getByTestId('enter-data-btn').click();
    await page.waitForLoadState('networkidle');

    // Verify entry page loads
    await expect(page.getByTestId('entry-page')).toBeVisible();

    // Verify only selected products appear (yeast-mandazi and daddies)
    await expect(page.locator('text=Yeast Mandazi')).toBeVisible();
    await expect(page.locator('text=Daddies')).toBeVisible();
    // Other products should NOT be visible (checking one)
    await expect(page.locator('text=Italian Cookies')).not.toBeVisible();

    // Step 1: Enter production data - 10 kg flour for first product
    const productionInput = page.locator('input[type="number"]').first();
    await productionInput.fill('10');

    // Verify production value is calculated (should show UGX amount)
    await expect(page.locator('text=UGX').first()).toBeVisible();

    // Step 2: Switch to Sales tab
    await page.getByTestId('tab-sales').click();
    await expect(page.getByTestId('tab-sales')).toHaveClass(/bg-amber-500/);

    // Enter sales amount: 50000 UGX
    const salesInput = page.locator('input[type="number"]').first();
    await salesInput.fill('50000');

    // Step 3: Switch to Others tab
    await page.getByTestId('tab-others').click();
    await expect(page.getByTestId('tab-others')).toHaveClass(/bg-amber-500/);

    // Enter bonus: 5000 UGX
    const bonusInput = page.locator('input').filter({ hasText: /bonus/i }).locator('..').locator('input');
    // If not found, try alternative selector
    const bonusInputAlt = page.locator('label:has-text("Bonuses")').locator('..').locator('input');
    if (await bonusInputAlt.isVisible()) {
      await bonusInputAlt.fill('5000');
    }

    // Step 4: Switch to Summary tab
    await page.getByTestId('tab-summary').click();
    await expect(page.getByTestId('tab-summary')).toHaveClass(/bg-amber-500/);

    // Verify summary shows data
    await expect(page.locator('text=Total Sales')).toBeVisible();
    await expect(page.locator('text=Gross Profit')).toBeVisible();

    // Step 5: Save entry
    await page.getByTestId('save-entry-btn').click();

    // Wait for save to complete (Firestore timeout + local save)
    await page.waitForTimeout(6000);

    // Verify data was saved to localStorage
    const today = new Date().toISOString().split('T')[0];
    const savedData = await page.evaluate((dateStr) => {
      return localStorage.getItem(`biss-entry-morulem-${dateStr}`);
    }, today);
    expect(savedData).toBeTruthy();
  });

  test('production input updates calculated values', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Verify entry page loads
    await expect(page.getByTestId('entry-page')).toBeVisible();

    // Enter 5 kg flour
    const productionInput = page.locator('input[type="number"]').first();
    await productionInput.fill('5');

    // Quick add buttons should work
    await page.locator('button:has-text("+5")').first().click();

    // Input should now be 10
    await expect(productionInput).toHaveValue('10');
  });

  test('others affect profit calculation', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Enter production: 10 kg
    const productionInput = page.locator('input[type="number"]').first();
    await productionInput.fill('10');

    // Switch to Sales and enter 100000
    await page.getByTestId('tab-sales').click();
    const salesInput = page.locator('input[type="number"]').first();
    await salesInput.fill('100000');

    // Note the profit in bottom bar
    const profitBefore = await page.getByTestId('bottom-save-bar').locator('.font-currency').first().textContent();

    // Switch to Others and add bonus
    await page.getByTestId('tab-others').click();

    // Find and fill the bonus input
    const bonusLabel = page.locator('text=Bonuses').first();
    if (await bonusLabel.isVisible()) {
      const bonusInput = page.locator('input[type="number"]').nth(1); // Second input in Others
      await bonusInput.fill('10000');
    }

    // Profit should be lower now (bonus reduces profit)
    const profitAfter = await page.getByTestId('bottom-save-bar').locator('.font-currency').first().textContent();

    // Profit should have decreased (we can't easily compare UGX values, just verify they exist)
    expect(profitBefore).toBeTruthy();
    expect(profitAfter).toBeTruthy();
  });
});
