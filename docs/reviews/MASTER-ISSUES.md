# MASTER ISSUES - BISS Bakery App

**Date:** 2025-12-19 (Fresh Review)
**Status:** Post-12-fix audit

Consolidated findings from 7 expert reviews. Deduplicated and prioritized.

---

## Previous Fix Verification ✅

All 12 fixes from the previous review have been verified:

| Fix | Status |
|-----|--------|
| Bakery guard redirect | ✅ Fixed |
| Unsaved changes warning | ✅ Fixed |
| Color-only meaning fixed | ✅ Fixed (TrendingUp/Down icons) |
| Contrast improved | ✅ Fixed (text-slate-300) |
| Quick-add buttons 48px | ✅ Fixed (h-12) |
| Negative number validation | ✅ Fixed (Math.max(0)) |
| Maximum value limits | ✅ Fixed (VALIDATION_LIMITS) |
| Loading state on bakery select | ✅ Fixed (isNavigating) |
| Empty entry validation | ✅ Fixed (hasData check) |
| Form disabled during save | ✅ Fixed |
| Firebase timeout | ✅ Fixed (5s Promise.race) |
| useCallback for handlers | ✅ Fixed |

---

## CRITICAL (Blocks usage) - 0 Issues

All previous critical issues have been resolved.

---

## HIGH (Major friction) - 3 Issues

| # | Issue | Found By | File | Impact |
|---|-------|----------|------|--------|
| 1 | **Supervisor shows hardcoded demo data** - Cannot see real bakery entries | Flavia, QA, UX, Requirements | supervisor/page.tsx:13-21 | Role is unusable |
| 2 | **Strategic uses generated demo data** - Charts show fake data, not actual entries | Flavia, QA, UX, Requirements | strategic/page.tsx:18-38 | Role is unusable |
| 3 | **Trends page bundle 339 kB** - Recharts loads entire library | Performance | trends/page.tsx | Slow on 3G |

---

## MEDIUM (Should fix) - 16 Issues

| # | Issue | Found By | File |
|---|-------|----------|------|
| 4 | Tab buttons ~44px height (borderline for 48px) | Flavia, Accessibility | entry/page.tsx:536-551 |
| 5 | Reference table uses text-xs (12px) | Flavia, Accessibility | entry/page.tsx:690-707 |
| 6 | Date selector day cells compact | Flavia, Accessibility | date-select/page.tsx:121-145 |
| 7 | No auto-save draft (power cut risk) | Flavia | entry/page.tsx |
| 8 | Select dropdown triggers may be <48px | Accessibility | settings/page.tsx:73-98 |
| 9 | Accordion triggers may be <48px | Accessibility | expenses/page.tsx:101-114 |
| 10 | Chart tooltips not keyboard accessible | Accessibility | trends/page.tsx |
| 11 | Decimal allows 0.0001 kg entries | QA | entry/page.tsx:64-72 |
| 12 | Large numbers may overflow UI | QA | Multiple |
| 13 | No confirmation before logout | QA | settings/page.tsx:26-37 |
| 14 | No shortcut for returning users | UX | welcome/page.tsx |
| 15 | Summary "Update Entry" lacks context | UX | summary/page.tsx |
| 16 | No undo after saving entry | UX | entry/page.tsx |
| 17 | Expenses and Entry not cross-linked | UX | expenses/page.tsx |
| 18 | No data export from Bakery Manager | Requirements | - |
| 19 | Products limited to 3 | Requirements | data/bakeries.ts |

---

## MEDIUM (Visual/UI) - 9 Issues

| # | Issue | Found By | File |
|---|-------|----------|------|
| 20 | Icon sizing inconsistent (h-3/4/5/6) | UI | Multiple |
| 21 | Backdrop blur opacity varies | UI | Multiple |
| 22 | Mix of rounded-xl and rounded-2xl | UI | dashboard vs entry |
| 23 | Gradient backgrounds inline (not reusable) | UI | Multiple |
| 24 | Tab styling differs between pages | UI | entry vs strategic |
| 25 | Settings page 28.1 kB (larger than expected) | Performance | settings/page.tsx |
| 26 | Recharts on 3 routes (repeated bundle) | Performance | trends, strategic, dashboard |
| 27 | No service worker for PWA | Performance | - |
| 28 | localStorage reads in loops | Performance | dashboard/page.tsx |

---

## LOW (Polish) - 15 Issues

| # | Issue | Found By | File |
|---|-------|----------|------|
| 29 | Back button has -ml-2 offset | Flavia | entry/page.tsx:492 |
| 30 | Tab navigation uses emoji-only labels | Flavia, Accessibility | entry/page.tsx:546-548 |
| 31 | Hardcoded 300ms navigation delay | Flavia, UX | welcome/page.tsx:20 |
| 32 | Clear button (X) may be small | Accessibility | entry/page.tsx:80-87 |
| 33 | Online/offline dot is color-only | Accessibility | app-header.tsx:47 |
| 34 | Some text at text-slate-400 | Accessibility | Multiple |
| 35 | localStorage key collision theoretical | QA | Multiple |
| 36 | No Firestore/localStorage conflict resolution | QA | entry/page.tsx |
| 37 | Toast may be missed if on other tab | QA | entry/page.tsx |
| 38 | History only checks 30 days | QA, UX | history/page.tsx:30-44 |
| 39 | Hardcoded 5-second Firebase timeout | QA | entry/page.tsx:440-443 |
| 40 | No skeleton loading in Entry | UX | entry/page.tsx |
| 41 | Spacing not strictly 8px grid | UI | Multiple |
| 42 | font-currency used inconsistently | UI | Multiple |
| 43 | Card border opacity varies (slate-700 vs 600) | UI | Multiple |

---

## LOW (Performance) - 3 Issues

| # | Issue | Found By | File |
|---|-------|----------|------|
| 44 | Objects created in render | Performance | supervisor/page.tsx |
| 45 | Recharts not tree-shaken | Performance | trends/page.tsx |
| 46 | History loads 30 days at once | Performance | history/page.tsx |

---

## Summary Statistics

| Severity | Count | Previous |
|----------|-------|----------|
| CRITICAL | 0 | 6 (all fixed) |
| HIGH | 3 | 12 |
| MEDIUM | 25 | 15 |
| LOW | 18 | 12 |
| **TOTAL** | **46** | 45 |

**Note:** Issue count increased because fresh review found more polish/medium items. However, all CRITICAL issues are now resolved.

---

## Core Issue: Demo Data

The single most impactful remaining issue is that **Supervisor** and **Strategic Manager** roles use hardcoded/generated demo data instead of reading from localStorage/Firestore.

This affects:
- supervisor/page.tsx - `BAKERIES_DATA` array is hardcoded
- strategic/page.tsx - `generateDemoData()` creates fake entries

**Impact:** Two of the three user roles are effectively non-functional for real-world use.

---

## Recommended Priority

**Fix FIRST (blocks 2 roles):**
1. #1 - Connect Supervisor to real localStorage/Firestore data
2. #2 - Connect Strategic to real localStorage/Firestore data

**Fix for accessibility compliance:**
3. #4 - Tab buttons to 48px
4. #8 - Select dropdown triggers to 48px

**Fix for usability:**
5. #7 - Auto-save draft
6. #13 - Logout confirmation

**Defer to polish phase:**
- All LOW issues
- MEDIUM visual/UI issues

---

## Demo Readiness

| Role | Status |
|------|--------|
| Bakery Manager | ✅ DEMO READY |
| Strategic Manager | ⚠️ Shows demo data only |
| Supervisor | ⚠️ Shows hardcoded data only |

**Overall:** App is demo-ready for Bakery Manager flow. Strategic and Supervisor roles need real data connection for full functionality.
