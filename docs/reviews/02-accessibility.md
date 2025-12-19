# Review 2: Accessibility Audit

## CRITICAL Issues

1. **Contrast on slate-800/50 backgrounds** - Multiple files
   - text-slate-400 (#94a3b8) on slate-800/50 background
   - Fails WCAG AA standards (requires 4.5:1, this is ~1.7:1)
   - Files: entry/page.tsx, dashboard/page.tsx, summary/page.tsx

2. **Color-only meaning for profit/loss** - `src/app/(main)/entry/page.tsx:82,86,90`
   - Production Value (green-400), Ingredient Cost (red-400), Expected Profit (amber-400)
   - No icons or text labels indicate meaning
   - Colorblind users cannot distinguish

3. **Product ID mismatch breaks defaults** - `src/app/(onboarding)/select-products/page.tsx:15`
   - defaultSelected references non-existent IDs
   - Silently breaks default selection logic

## HIGH Issues

1. **text-xs (12px) used for critical info** - 26 instances across src/app/
   - Entry page: lines 38, 46 (margin info, labels)
   - History page: line 72 (sales info)
   - WCAG recommends minimum 14px for body text

2. **Quick-add button targets too small** - `src/app/(main)/entry/page.tsx:65-73`
   - Four buttons (+1, +2, +5, +10) share row
   - Each ~60px wide but height py-2 (~32px)
   - Below 48x48px minimum touch target

3. **Button heights inconsistent** - `src/app/(onboarding)/select-products/page.tsx:72-73`
   - "Select All" and "Clear All" use size="sm"
   - Some areas have h-auto with py-2

4. **Cards use tight padding** - Most cards use p-4 (16px)
   - Input fields use h-14 (56px) which is good
   - But surrounding targets are smaller

## MEDIUM Issues

1. **Expense quick-amount buttons small** - `src/app/(main)/expenses/page.tsx:217`
   - In flex wrap, some may be <48px wide

2. **Profit/loss colors lack icons** - summary/page.tsx, dashboard/page.tsx
   - Need "+" icon for profit, "-" for loss
   - Currently color-only

3. **No visible focus indicators on cards** - select-bakery/page.tsx
   - Card onClick elements don't show clear focus outlines

## LOW Issues

1. **Emojis as primary icons** - entry/page.tsx
   - No alt text or aria labels for screen readers

2. **Switch component accessibility** - settings/page.tsx
   - Uses htmlFor correctly but focus styling unclear
