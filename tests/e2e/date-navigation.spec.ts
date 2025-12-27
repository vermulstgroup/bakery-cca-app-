import { test, expect } from '@playwright/test';

test.describe('Date Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and set up completed onboarding state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      // Set up completed onboarding
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

  test('shows today by default', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Verify entry page loads
    await expect(page.getByTestId('entry-page')).toBeVisible();

    // Verify date navigation is visible
    await expect(page.getByTestId('date-navigation')).toBeVisible();

    // Verify "Today" button shows "Today" text
    await expect(page.getByTestId('today-btn')).toContainText('Today');

    // Today button should have amber highlight
    await expect(page.getByTestId('today-btn')).toHaveClass(/bg-amber-500/);
  });

  test('navigate to previous day', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Verify we start on today
    await expect(page.getByTestId('today-btn')).toContainText('Today');

    // Click previous day button
    await page.getByTestId('prev-day-btn').click();

    // Wait for date to update
    await page.waitForTimeout(500);

    // Today button should now show a date (not "Today")
    const todayBtnText = await page.getByTestId('today-btn').textContent();
    expect(todayBtnText).not.toContain('Today');

    // The button should show a formatted date like "Thu, Dec 26"
    expect(todayBtnText).toMatch(/[A-Z][a-z]{2},\s[A-Z][a-z]{2}\s\d+/);
  });

  test('today button returns to today', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Navigate to previous day
    await page.getByTestId('prev-day-btn').click();
    await page.waitForTimeout(500);

    // Verify we're not on today
    const dateBefore = await page.getByTestId('today-btn').textContent();
    expect(dateBefore).not.toContain('Today');

    // Click Today button to return to today
    await page.getByTestId('today-btn').click();
    await page.waitForTimeout(500);

    // Verify we're back on today
    await expect(page.getByTestId('today-btn')).toContainText('Today');
  });

  test('cannot navigate to future dates', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Verify we're on today
    await expect(page.getByTestId('today-btn')).toContainText('Today');

    // Next day button should be disabled (we're already on today)
    await expect(page.getByTestId('next-day-btn')).toBeDisabled();

    // Click should have no effect
    await page.getByTestId('next-day-btn').click({ force: true });
    await page.waitForTimeout(500);

    // Should still show today
    await expect(page.getByTestId('today-btn')).toContainText('Today');
  });

  test('navigation clears form data for new date', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Enter some data
    const productionInput = page.locator('input[type="number"]').first();
    await productionInput.fill('10');

    // Verify data is entered
    await expect(productionInput).toHaveValue('10');

    // Navigate to previous day (should show unsaved dialog or clear data)
    await page.getByTestId('prev-day-btn').click();
    await page.waitForTimeout(500);

    // Check if unsaved changes dialog appears
    const dialog = page.locator('[role="alertdialog"]');
    if (await dialog.isVisible()) {
      // Click "Leave" or "Discard" button
      await page.locator('button:has-text("Leave")').click();
      await page.waitForTimeout(500);
    }

    // Form should be cleared for the new date
    const newProductionInput = page.locator('input[type="number"]').first();
    await expect(newProductionInput).toHaveValue('0');
  });

  test('navigate back multiple days', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('networkidle');

    // Navigate back 3 days
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('prev-day-btn').click();
      await page.waitForTimeout(300);
    }

    // Verify we're not on today
    const dateText = await page.getByTestId('today-btn').textContent();
    expect(dateText).not.toContain('Today');

    // Next day button should now be enabled
    await expect(page.getByTestId('next-day-btn')).not.toBeDisabled();

    // Navigate forward one day
    await page.getByTestId('next-day-btn').click();
    await page.waitForTimeout(300);

    // Should still not be today (2 days back)
    const newDateText = await page.getByTestId('today-btn').textContent();
    expect(newDateText).not.toContain('Today');
  });
});
