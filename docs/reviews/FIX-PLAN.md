# FIX PLAN - BISS Bakery App

Ordered sequence of fixes for pre-demo release.

---

## Phase A: Critical Fixes (Must complete)

### Fix 1: Add bakery guard to entry page
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Add useEffect to redirect to /select-bakery if no bakery selected
```tsx
useEffect(() => {
  if (isLoaded && !onboardingData.bakery) {
    router.replace('/select-bakery');
  }
}, [isLoaded, onboardingData.bakery, router]);
```
**Priority:** CRITICAL | **Time:** 15 min

---

### Fix 2: Add empty entry validation
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Disable save button if all production values are 0
```tsx
const hasData = Object.values(production).some(p => p.kgFlour > 0) ||
                Object.values(sales).some(s => s > 0);
// Then in button: disabled={saveStatus === 'saving' || !hasData}
```
**Priority:** CRITICAL | **Time:** 15 min

---

### Fix 3: Add icons to profit/loss indicators
**File:** `src/app/(main)/entry/page.tsx`, `src/app/(main)/summary/page.tsx`
**Change:** Add TrendingUp/TrendingDown icons next to green/red values
```tsx
import { TrendingUp, TrendingDown } from 'lucide-react';
// Before green amounts: <TrendingUp className="h-4 w-4 inline mr-1" />
// Before red amounts: <TrendingDown className="h-4 w-4 inline mr-1" />
```
**Priority:** CRITICAL | **Time:** 20 min

---

### Fix 4: Fix contrast on slate-400 text
**File:** Multiple files
**Change:** Replace text-slate-400 with text-slate-300 for better contrast
```tsx
// Find: text-slate-400
// Replace: text-slate-300 (for important labels)
// Or: text-slate-200 (for very important text)
```
**Priority:** CRITICAL | **Time:** 30 min

---

### Fix 5: Increase quick-add button sizes
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Update quick-add buttons to 48px height
```tsx
// Line 69 and 151:
className="flex-1 h-12 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
```
**Priority:** HIGH | **Time:** 10 min

---

### Fix 6: Add loading state to bakery selection
**File:** `src/app/(onboarding)/select-bakery/page.tsx`
**Change:** Add isNavigating state with spinner
```tsx
const [isNavigating, setIsNavigating] = useState(false);

const handleBakerySelect = (bakeryId: string) => {
  setIsNavigating(true);
  setSelectedBakery(bakeryId);
  // ... rest of logic
};
// Add spinner overlay when isNavigating
```
**Priority:** HIGH | **Time:** 10 min

---

### Fix 7: Add negative number validation
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Validate and clamp values to >= 0
```tsx
const handleKgFlourChange = (productId: string, kgFlour: number) => {
  const safeValue = Math.max(0, kgFlour); // Clamp to 0 minimum
  // ... rest of logic
};
```
**Priority:** HIGH | **Time:** 10 min

---

### Fix 8: Add useCallback to handlers
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Wrap handlers in useCallback
```tsx
const handleKgFlourChange = useCallback((productId: string, kgFlour: number) => {
  // ... existing logic
}, []);

const handleSalesChange = useCallback((productId: string, amount: number) => {
  // ... existing logic
}, []);
```
**Priority:** HIGH | **Time:** 15 min

---

## Phase B: High-Impact UX Fixes

### Fix 9: Increase text-xs to text-sm
**Files:** entry/page.tsx, summary/page.tsx, history/page.tsx
**Change:** Replace text-xs with text-sm for important labels
**Priority:** HIGH | **Time:** 20 min

---

### Fix 10: Standardize card borders
**Files:** All page files using Card component
**Change:** Ensure all cards have `border border-slate-700 rounded-xl`
**Priority:** HIGH | **Time:** 15 min

---

### Fix 11: Add Firebase timeout
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Add Promise.race with timeout
```tsx
const saveWithTimeout = Promise.race([
  saveDailyEntry(bakeryId, dataToSave),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
]);
```
**Priority:** HIGH | **Time:** 15 min

---

## Phase C: Medium Fixes (If time permits)

### Fix 12: Disable form during save
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Add disabled prop to inputs when saveStatus === 'saving'
**Priority:** MEDIUM | **Time:** 10 min

---

### Fix 13: Move COST_PER_SCHOOL_DAY to data.ts
**File:** `src/lib/data.ts`, `src/app/(main)/summary/page.tsx`
**Change:** Export constant from data.ts
**Priority:** LOW | **Time:** 5 min

---

## Dependency Order

```
Fix 1 (bakery guard)
    ↓
Fix 2 (empty validation)
    ↓
Fix 7 (negative numbers)
    ↓
Fix 8 (useCallback) ← depends on handlers existing
    ↓
Fix 3 (icons) ← can be parallel
Fix 4 (contrast) ← can be parallel
Fix 5 (button sizes) ← can be parallel
```

---

## Execution Checklist

- [x] Fix 1: Bakery guard ✓
- [x] Fix 2: Empty validation ✓
- [x] Fix 3: Add icons to profit/loss ✓
- [x] Fix 4: Fix contrast ✓
- [x] Fix 5: Button sizes ✓
- [x] Fix 6: Loading state ✓
- [x] Fix 7: Negative validation ✓
- [x] Fix 8: useCallback ✓
- [x] Fix 9: Text sizes ✓
- [x] Fix 10: Card borders ✓
- [x] Fix 11: Firebase timeout ✓
- [x] Fix 12: Form disabled state ✓
- [x] Fix 13: Move constant (N/A - constant not in codebase)

---

## Estimated Total Time

| Phase | Fixes | Time |
|-------|-------|------|
| Phase A | 1-8 | ~2 hours |
| Phase B | 9-11 | ~50 min |
| Phase C | 12-13 | ~15 min |
| **Total** | 13 fixes | **~3 hours** |

---

## Execution Summary (Completed 2025-12-19)

All 12 applicable fixes have been successfully implemented:

### Files Modified:
- `src/app/(main)/entry/page.tsx` - Fixes 1,2,3,4,5,7,8,11,12
- `src/app/(onboarding)/select-bakery/page.tsx` - Fix 6
- `src/app/(main)/summary/page.tsx` - Fixes 4,9
- `src/app/(main)/history/page.tsx` - Fixes 4,9
- `src/hooks/useFirestore.ts` - Syntax error fix (pre-existing)

### Key Improvements:
1. **Data Integrity**: Bakery guard, empty validation, negative number validation
2. **Accessibility**: TrendingUp/TrendingDown icons, improved contrast, larger buttons
3. **Performance**: useCallback for handlers, Firebase timeout
4. **UX**: Loading states, form disabled during save

### Build Status: ✓ Successful
