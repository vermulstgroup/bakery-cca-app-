# MASTER ISSUES - BISS Bakery App

Consolidated findings from 7 expert reviews. Deduplicated and prioritized.

---

## CRITICAL (Blocks usage) - 6 issues

| # | Issue | Found By | File | Fix Time |
|---|-------|----------|------|----------|
| 1 | **Entry page allows save without bakery selected** - User can enter data then see error on save | Flavia, QA | entry/page.tsx:289 | 15 min |
| 2 | **No unsaved changes warning** - Power cut or back button = silent data loss | Flavia, QA, UX | entry/page.tsx | 30 min |
| 3 | **Color-only meaning for profit/loss** - Colorblind users cannot distinguish green/red/amber values | Accessibility | entry/page.tsx, summary/page.tsx | 20 min |
| 4 | **Contrast fails WCAG AA** - text-slate-400 on slate-800/50 is ~1.7:1 (needs 4.5:1) | Accessibility | Multiple files | 30 min |
| 5 | **Supervisor sees only hardcoded demo data** - Cannot view actual bakery entries | Requirements, UX | supervisor/page.tsx | 45 min |
| 6 | **Empty/zero entries can be saved** - No validation prevents saving all zeros | QA | entry/page.tsx:250-280 | 15 min |

**Total Critical Fix Time: ~2.5 hours**

---

## HIGH (Major friction) - 12 issues

| # | Issue | Found By | File | Fix Time |
|---|-------|----------|------|----------|
| 7 | **Quick-add buttons too small** - +1, +2, +5, +10 are ~32px (need 48px) | Flavia, Accessibility | entry/page.tsx:65-73 | 10 min |
| 8 | **text-xs (12px) for critical info** - 26 instances, hard to read | Accessibility | Multiple files | 20 min |
| 9 | **Negative numbers can bypass min="0"** - Manual typing or paste allowed | QA | entry/page.tsx:52,135 | 10 min |
| 10 | **No loading state during bakery selection** - setTimeout without spinner | UX | select-bakery/page.tsx:31-33 | 10 min |
| 11 | **Flow A requires 5 taps to enter data** - No shortcut for returning users | UX | Multiple | 30 min |
| 12 | **localStorage double-format checking** - 14 parse operations per week load | Performance | dashboard/page.tsx:73-74 | 20 min |
| 13 | **Firebase promises no timeout** - UI could hang if Firestore slow | Performance | entry/page.tsx:187 | 15 min |
| 14 | **useCallback missing** - Handlers recreated every render | Performance | entry/page.tsx | 15 min |
| 15 | **Card border inconsistency** - Some have border-slate-700, some none | UI | Multiple | 15 min |
| 16 | **Typography hierarchy missing** - text-2xl, text-xl mixed without semantic meaning | UI | Multiple | 15 min |
| 17 | **Supervisor isolated from real data** - No link to actual bakery details | Requirements | supervisor/page.tsx | 30 min |
| 18 | **Strategic Manager sees demo data only** - Charts show generated, not real data | Requirements | strategic/page.tsx | 30 min |

**Total High Fix Time: ~3.5 hours**

---

## MEDIUM (Should fix) - 15 issues

| # | Issue | Found By | File | Fix Time |
|---|-------|----------|------|----------|
| 19 | Dark theme save button color hard to see in low light | Flavia | entry/page.tsx | 5 min |
| 20 | Tab buttons ~44px height (borderline) | Accessibility | entry/page.tsx | 10 min |
| 21 | Decimal allows 0.0001 kg entries | QA | entry/page.tsx:51 | 5 min |
| 22 | Large numbers may overflow UI (999M UGX) | QA | entry/page.tsx:139 | 10 min |
| 23 | Form fields not disabled during save | QA | entry/page.tsx:240 | 10 min |
| 24 | Summary doesn't link back to entry properly | UX | summary/page.tsx:359 | 10 min |
| 25 | Status color palette inconsistent | UI | supervisor/page.tsx:91-98 | 10 min |
| 26 | Empty states not designed consistently | UI | Multiple | 20 min |
| 27 | Skeleton loading UI missing | UI | Multiple | 15 min |
| 28 | Icon sizing inconsistent (h-4, h-5, h-6 mixed) | UI | Multiple | 10 min |
| 29 | useMemo chains cascade updates | Performance | trends/page.tsx | 15 min |
| 30 | Objects created in render | Performance | supervisor/page.tsx:82-90 | 10 min |
| 31 | Recharts not optimized | Performance | trends/page.tsx, strategic/page.tsx | 15 min |
| 32 | Data model has three formats | Requirements | types.ts | 30 min |
| 33 | Margin calculations inconsistent | Requirements | Multiple | 15 min |

**Total Medium Fix Time: ~3.5 hours**

---

## LOW (Polish) - 12 issues

| # | Issue | Found By | File |
|---|-------|----------|------|
| 34 | Tab navigation labels could be larger | Flavia | entry/page.tsx |
| 35 | Back button -ml-2 offset | Flavia | entry/page.tsx |
| 36 | Emojis lack aria labels | Accessibility | entry/page.tsx |
| 37 | localStorage key collision theoretical | QA | entry/page.tsx |
| 38 | No Firestore/localStorage conflict resolution | QA | entry/page.tsx |
| 39 | Toast may be missed if user on other tab | QA | entry/page.tsx |
| 40 | Hardcoded transition timeouts | UX | welcome/page.tsx |
| 41 | Backdrop blur opacity varies | UI | Multiple |
| 42 | Gradient backgrounds not reusable | UI | Multiple |
| 43 | Unnecessary useState for date | Performance | entry/page.tsx |
| 44 | No React.memo on ProductionInput/SalesInput | Performance | entry/page.tsx |
| 45 | COST_PER_SCHOOL_DAY hardcoded | Performance | summary/page.tsx |

---

## Summary Statistics

| Severity | Count | Est. Fix Time |
|----------|-------|---------------|
| CRITICAL | 6 | 2.5 hours |
| HIGH | 12 | 3.5 hours |
| MEDIUM | 15 | 3.5 hours |
| LOW | 12 | 1.5 hours |
| **TOTAL** | **45** | **~11 hours** |

---

## Recommended Priority

**Fix first (before client demo):**
1. #1 - Entry without bakery guard
2. #2 - Unsaved changes warning
3. #6 - Empty entry validation
4. #7 - Quick-add button sizes
5. #3 - Add icons to profit/loss (accessibility)
6. #4 - Fix contrast on critical text

**Fix for production:**
- All HIGH issues
- MEDIUM issues affecting data integrity

**Defer to polish phase:**
- LOW issues
- MEDIUM cosmetic issues
