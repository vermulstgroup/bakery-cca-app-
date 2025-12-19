# Review 5: Product Manager Requirements Check

## Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Offline-first (localStorage) | PARTIAL | Works but no sync queue |
| 5 bakeries | PASS | All in data.ts |
| 3 roles | PARTIAL | Supervisor uses demo data |
| Daily production (kg) | PASS | Entry form has kg input |
| Sales tracking (UGX) | PASS | Entry form has UGX input |
| Auto P&L calculation | PASS | Math correct |
| Data persistence | PASS | localStorage works |
| 48px touch targets | PARTIAL | Buttons good, quick-add bad |

## CRITICAL Issues

1. **Offline-first not fully implemented** - `src/lib/firebase/firestore.ts`
   - App uses localStorage first
   - No Service Worker for offline detection
   - No sync queue if Firestore write fails
   - Catch block only logs, doesn't guarantee local save

2. **5 bakeries - Supervisor can't see real data**
   - BAKERIES array has all 5
   - BUT supervisor dashboard hardcodes demo data
   - Demo data doesn't sync with actual entries

3. **3 roles not fully functional** - `src/lib/data.ts:47-74`
   - Bakery Manager: WORKS
   - Strategic Manager: PARTIAL (demo data only)
   - Supervisor: BROKEN (demo data, no real entries)

## HIGH Issues

1. **Daily production validation weak** - `src/app/(main)/entry/page.tsx:79-115`
   - Accepts step="0.5"
   - No minimum check (0kg = 0 cost but UI suggests valid)
   - No maximum check (could enter 999kg)

2. **Sales input no validation** - `src/app/(main)/entry/page.tsx:130-153`
   - Allows 0 sales (edge case not handled)
   - No maximum check
   - Invalid input silently becomes 0

3. **P&L calculation has rounding issues** - `src/app/(main)/entry/page.tsx:179-200`
   - Formula correct: grossProfit = salesTotal - ingredientCost
   - But .toFixed(1) may hide true margins
   - Inconsistent types (string vs number)

4. **Data persistence inconsistent** - `src/app/(main)/dashboard/page.tsx:100-120`
   - Checks BOTH new and legacy localStorage formats
   - But other pages only check new format
   - History only reads localStorage, not Firestore

## MEDIUM Issues

1. **48px touch targets not consistent**
   - Button component: h-14 = 56px (PASS)
   - Quick-add buttons: py-2 = ~32px (FAIL)
   - Tab buttons: py-3 = ~44px (BORDERLINE)

2. **Data model has three formats** - `src/lib/types.ts`
   - New: production + sales
   - New: totals (pre-calculated)
   - Legacy: quantities
   - Creates confusion in calculation logic

3. **Margin calculations inconsistent**
   - Entry: (grossProfit / salesTotal) * 100
   - Dashboard: Same with .toFixed(1)
   - Supervisor: Hardcoded percentages

## LOW Issues

1. **Product reference tables redundant**
   - Dashboard, Entry summary, Strategic all have copies
   - 4 copies of same data creates maintenance burden

2. **Prices not used in calculation** - `src/lib/data.ts`
   - Products have defaultPrice field never read
   - Entry calculates from revenuePerKgFlour

3. **Bakery Manager can't compare performance**
   - Dashboard shows only current week
   - No way to compare against other bakeries
