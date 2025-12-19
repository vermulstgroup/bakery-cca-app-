# FIX PLAN - BISS Bakery App

**Date:** 2025-12-19 (Fresh Review)
**Status:** Post-12-fix audit - New issues identified

---

## Previous Fixes - ALL VERIFIED ✅

All 12 fixes from the previous audit have been implemented and verified:

| # | Fix | Status |
|---|-----|--------|
| 1 | Bakery guard | ✅ Complete |
| 2 | Empty validation | ✅ Complete |
| 3 | Profit/loss icons | ✅ Complete |
| 4 | Contrast fixes | ✅ Complete |
| 5 | Button sizes 48px | ✅ Complete |
| 6 | Loading state | ✅ Complete |
| 7 | Negative validation | ✅ Complete |
| 8 | useCallback handlers | ✅ Complete |
| 9 | Text size increases | ✅ Complete |
| 10 | Card borders | ✅ Complete |
| 11 | Firebase timeout | ✅ Complete |
| 12 | Form disabled state | ✅ Complete |

---

## New Fix Plan

### Phase A: HIGH Priority (Blocks 2 roles)

#### Fix A1: Connect Supervisor to Real Data
**Issue:** #1 - Supervisor shows hardcoded demo data
**File:** `src/app/(main)/supervisor/page.tsx`
**Current:** Lines 13-21 have hardcoded `BAKERIES_DATA` array
**Change:** Read from localStorage entries for all 5 bakeries

```tsx
// Replace hardcoded BAKERIES_DATA with:
const loadAllBakeryData = () => {
  const bakeries = ['kampala-central', 'jinja-main', 'mbale-town', 'gulu-central', 'mbarara-west'];
  return bakeries.map(bakeryId => {
    // Load last 7 days of entries from localStorage
    const entries = loadEntriesForBakery(bakeryId, 7);
    const todayEntry = entries[0] || null;
    return {
      id: bakeryId,
      name: getBakeryName(bakeryId),
      todayEntry,
      weeklyProfit: calculateWeeklyProfit(entries),
      status: todayEntry ? 'entered' : 'pending'
    };
  });
};
```

**Priority:** HIGH | **Impact:** Makes Supervisor role functional

---

#### Fix A2: Connect Strategic to Real Data
**Issue:** #2 - Strategic uses generated demo data
**File:** `src/app/(main)/strategic/page.tsx`
**Current:** Lines 18-38 call `generateDemoData()`
**Change:** Read 12 weeks of actual entries from localStorage

```tsx
// Replace generateDemoData() with:
const loadStrategicData = (bakeryId: string) => {
  const weeks: WeekData[] = [];
  for (let w = 0; w < 12; w++) {
    const weekStart = getWeekStart(subWeeks(new Date(), w));
    const entries = loadWeekEntries(bakeryId, weekStart);
    weeks.push({
      weekOf: weekStart,
      entries,
      profit: sumProfit(entries),
      flour: sumFlour(entries)
    });
  }
  return weeks.reverse();
};
```

**Priority:** HIGH | **Impact:** Makes Strategic role functional

---

### Phase B: MEDIUM Accessibility Fixes

#### Fix B1: Tab Buttons to 48px
**Issue:** #4 - Tab buttons ~44px (borderline)
**File:** `src/app/(main)/entry/page.tsx:536-551`
**Change:** Increase `py-3` to `py-3.5` or use `min-h-[48px]`

```tsx
// Change tab button classes from:
className="py-3 px-4 text-sm font-medium rounded-full..."
// To:
className="py-3.5 px-4 text-sm font-medium rounded-full min-h-[48px]..."
```

**Priority:** MEDIUM | **Impact:** WCAG 2.1 AA compliance

---

#### Fix B2: Increase Reference Table Text
**Issue:** #5 - Reference table uses text-xs (12px)
**File:** `src/app/(main)/entry/page.tsx:690-707`
**Change:** Replace `text-xs` with `text-sm`

**Priority:** MEDIUM | **Impact:** Readability for low-vision users

---

#### Fix B3: Date Selector Cell Padding
**Issue:** #6 - Date selector day cells compact
**File:** `src/app/(onboarding)/date-select/page.tsx:121-145`
**Change:** Increase cell size/padding for 48px touch targets

**Priority:** MEDIUM | **Impact:** Touch accuracy on mobile

---

#### Fix B4: Select Dropdown Heights
**Issue:** #8 - Select dropdown triggers may be <48px
**File:** `src/app/(main)/settings/page.tsx:73-98`
**Change:** Add `min-h-[48px]` to Select triggers

**Priority:** MEDIUM | **Impact:** WCAG 2.1 AA compliance

---

### Phase C: MEDIUM UX Fixes

#### Fix C1: Auto-save Draft
**Issue:** #7 - No auto-save draft (power cut risk)
**File:** `src/app/(main)/entry/page.tsx`
**Change:** Add useEffect to save draft to localStorage every 30s

```tsx
// Add auto-save draft
useEffect(() => {
  const timer = setInterval(() => {
    if (hasChanges && !saveStatus) {
      localStorage.setItem(`draft-${bakeryId}-${selectedDate}`, JSON.stringify({
        production, sales, timestamp: Date.now()
      }));
    }
  }, 30000);
  return () => clearInterval(timer);
}, [production, sales, hasChanges, bakeryId, selectedDate, saveStatus]);
```

**Priority:** MEDIUM | **Impact:** Data protection during power cuts

---

#### Fix C2: Logout Confirmation
**Issue:** #13 - No confirmation before logout
**File:** `src/app/(main)/settings/page.tsx:26-37`
**Change:** Add AlertDialog before clearing data

**Priority:** MEDIUM | **Impact:** Prevent accidental data loss

---

### Phase D: Performance (Optional)

#### Fix D1: Dynamic Import Recharts
**Issue:** #3 - Trends page 339 kB bundle
**File:** `src/app/(main)/trends/page.tsx`
**Change:** Use `next/dynamic` for Recharts components

```tsx
import dynamic from 'next/dynamic';

const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { loading: () => <Skeleton className="h-64" />, ssr: false }
);
```

**Priority:** LOW | **Impact:** 3G load time improvement

---

## Dependency Order

```
Fix A1 (Supervisor real data)
Fix A2 (Strategic real data)
    ↓ (both can run in parallel)
Fix B1-B4 (Accessibility)
    ↓ (all can run in parallel)
Fix C1-C2 (UX)
    ↓
Fix D1 (Performance - optional)
```

---

## Execution Checklist

### Phase A - HIGH
- [ ] Fix A1: Connect Supervisor to real data
- [ ] Fix A2: Connect Strategic to real data

### Phase B - MEDIUM (Accessibility)
- [ ] Fix B1: Tab buttons to 48px
- [ ] Fix B2: Reference table text-sm
- [ ] Fix B3: Date selector padding
- [ ] Fix B4: Select dropdown heights

### Phase C - MEDIUM (UX)
- [ ] Fix C1: Auto-save draft
- [ ] Fix C2: Logout confirmation

### Phase D - Performance (Optional)
- [ ] Fix D1: Dynamic import Recharts

---

## Estimated Time

| Phase | Fixes | Est. Time |
|-------|-------|-----------|
| Phase A | A1-A2 | 2-3 hours |
| Phase B | B1-B4 | 30 min |
| Phase C | C1-C2 | 45 min |
| Phase D | D1 | 30 min |
| **Total** | 9 fixes | **~4-5 hours** |

---

## Recommendation

**For demo:** The app is already demo-ready for the **Bakery Manager** flow. All critical issues are resolved.

**For production:**
- Fixes A1 and A2 are essential to make Strategic and Supervisor roles functional
- Phase B fixes bring app to WCAG 2.1 AA compliance
- Phase C improves data safety

**Defer:** Phase D (performance) can be done post-launch since 4G performance is already good.

---

## Questions for User

Before executing:
1. **Should Strategic/Supervisor show aggregated data from ALL bakeries, or just the user's selected bakery?**
2. **Is the current demo data acceptable for now, or is real data connection required before demo?**
