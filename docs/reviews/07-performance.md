# Review 7: Performance Analysis

## CRITICAL Issues

1. **localStorage operations not batched** - `src/app/(main)/entry/page.tsx:173-180`
   - Calls localStorage.setItem for every save without checking if changed
   - Dashboard loads entries in loop: 7 separate lookups (lines 66-76)

2. **useMemo dependency issues** - `src/app/(main)/dashboard/page.tsx:36-40`
   - Memoizes date calculations that rarely change
   - weeklyStats useMemo recalculates on every entry change
   - Entry page totals updates on every keystroke (line 141)

3. **useEffect without cleanup** - `src/hooks/use-onboarding.ts:15-30`
   - Doesn't cleanup onboarding data
   - entry/page.tsx loads daily entry but doesn't unsubscribe if Firebase uses listeners

4. **Redundant JSON parsing** - `src/app/(main)/dashboard/page.tsx:73-74`
   - Checks two localStorage formats for EVERY day
   - 14 parse operations weekly
   - trends/page.tsx does similar across all keys

5. **Dynamic grid string breaks Tailwind** - `src/components/shared/bottom-nav.tsx:110`
   - Uses `` `grid-cols-${navItems.length}` ``
   - Breaks Tailwind static analysis
   - Then manually sets gridTemplateColumns anyway

## HIGH Issues

1. **No code splitting** - next.config.ts
   - All UI components imported statically
   - TrendsPage imports Recharts statically even when not needed

2. **Firebase promises not handled** - `src/app/(main)/entry/page.tsx:187`
   - No timeout on saveDailyEntry/getDailyEntry
   - If Firestore slow/offline, UI could hang
   - No AbortController

3. **Large dependency list** - package.json
   - 55 dependencies including full Radix UI suite
   - All genkit dependencies, recharts, firebase
   - No tree-shaking evident

4. **useCallback missing** - `src/app/(main)/entry/page.tsx`
   - handleKgFlourChange, handleSalesChange, handleSave recreated every render
   - Causes child component re-renders

5. **useMemo chains** - `src/app/(main)/trends/page.tsx`
   - Lines 103-122, 137-156, 162-192 chain useMemo
   - Single data update cascades through all calculations

6. **Inefficient array operations** - `src/app/(main)/history/page.tsx:85-99`
   - Creates entriesWithTotals by mapping then sorts
   - Uses .slice().reverse() at line 149 unnecessarily

## MEDIUM Issues

1. **localStorage fallback inefficient**
   - Checks localStorage twice (new + legacy format)
   - Dashboard: 69-75, Entry: 103-110, Trends: 66-85
   - Should migrate to single format

2. **Inline calculations in render** - `src/app/(main)/summary/page.tsx:69-78`
   - Some in useMemo, some inline
   - Inconsistent pattern

3. **Objects created in render** - `src/app/(main)/supervisor/page.tsx:82-90`
   - Chart data objects created inside map
   - Not memoized, recreated every render

4. **Unoptimized Select components** - `src/app/(main)/settings/page.tsx`
   - BAKERIES and ROLES mapped every render
   - Options not wrapped in useMemo

5. **Recharts not optimized** - trends/page.tsx, strategic/page.tsx
   - Charts re-render even when data unchanged
   - No memoization on chart components

## LOW Issues

1. **Unnecessary state** - `src/app/(main)/entry/page.tsx:85-86`
   - `const [date] = useState(new Date())` but never updated
   - Should be `const date = new Date()`

2. **Missing useEffect dependency** - `src/app/(main)/summary/page.tsx:45`
   - Uses `today` without tracking it
   - Component could be stale after midnight

3. **No React.memo on child components**
   - ProductionInput and SalesInput are heavy
   - Re-render when siblings change

4. **Toast not debounced**
   - Rapid clicks could queue multiple toasts

5. **Hardcoded magic numbers**
   - COST_PER_SCHOOL_DAY = 20000 in summary page
   - Should be in data.ts

6. **No pagination** - history page
   - Loads last 30 days from all localStorage keys
   - Expensive if app used for years
