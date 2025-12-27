# CCA Bakery App - Automated Testing Setup

## Setup Playwright
```bash
npm install -D @playwright/test
npx playwright install chromium
```

Add to package.json scripts:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

## Create playwright.config.ts

- baseURL: http://localhost:9002
- webServer: npm run dev on port 9002
- Projects: Mobile Chrome (390x844) - primary target
- Timeout: 30 seconds per test

## Critical Test Flows to Write

### 1. tests/e2e/onboarding.spec.ts
- Visit / → see welcome page
- Select "Bakery Manager" role
- Select bakery "Morulem"
- Select 2 products
- Confirm prices
- Arrive at dashboard

### 2. tests/e2e/daily-entry.spec.ts
- From dashboard, tap "Enter Today's Data"
- Verify only selected products appear
- Enter production: 10 kg flour for first product
- Verify production value calculated
- Switch to Sales tab
- Enter sales amount: 50000 UGX
- Switch to Others tab
- Enter bonus: 5000 UGX
- Switch to Summary tab
- Verify profit = sales - costs - bonus
- Save entry
- Verify success toast

### 3. tests/e2e/date-navigation.spec.ts
- Open entry page (must complete onboarding first)
- Verify shows today's date
- Tap previous day arrow
- Verify date changed to yesterday
- Verify "Today" button appears
- Tap "Today" button
- Verify back to today
- Try to tap next day arrow
- Verify cannot go to future

### 4. tests/e2e/offline.spec.ts
- Complete onboarding
- Enter data
- Simulate offline (context.setOffline(true))
- Save entry
- Verify "saved locally" toast appears
- Verify data persists on reload

## Implementation Notes

- Use data-testid attributes where needed
- Each test should be independent (clear localStorage in beforeEach)
- Use page.waitForLoadState('networkidle') after navigations
- Mobile viewport: 390x844 (iPhone 14 Pro)

## Run After Setup
```bash
npm run test:e2e
```

All tests must pass. Add to CI/CD later.
