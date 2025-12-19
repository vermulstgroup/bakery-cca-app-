# Review 1: Ugandan Baker (Flavia) Perspective

**Persona:** Low-literacy user, Tecno phone, flour on hands, power cuts common.

## CRITICAL Issues

1. **Confusion on /entry without bakery selection** - `src/app/(main)/entry/page.tsx`
   - If Flavia deep links to /entry before selecting a bakery, page displays "No bakery" but allows data entry
   - Data saved won't be retrievable since bakeryId will be missing

2. **Product ID mismatch in select-products** - `src/app/(onboarding)/select-products/page.tsx:15`
   - defaultSelected uses: 'yeast_mandazi', 'doughnuts', 'loaf_1kg', 'loaf_500g', 'chapati'
   - Actual IDs: 'yeast-mandazi', 'daddies', 'italian-cookies'
   - Default selections silently fail

3. **No save confirmation before leaving /entry** - `src/app/(main)/entry/page.tsx`
   - If power cuts or user navigates away before saving, all data lost
   - No unsaved changes indicator

## HIGH Issues

1. **Entry page doesn't redirect without bakery** - `src/app/(main)/entry/page.tsx:289`
   - Checks `if (!isLoaded)` but never validates `onboardingData.bakery` exists
   - User can navigate here and be confused

2. **Small text on entry cards** - `src/app/(main)/entry/page.tsx:38,46,80-90`
   - Uses text-xs (12px) for margin info, flour label, production values
   - Hard to read with flour on fingers

3. **No visual confirmation of save success duration** - `src/app/(main)/entry/page.tsx:319-322`
   - Toast appears briefly
   - If power cuts immediately, user unsure if data saved

4. **Power cut recovery unclear** - `src/app/(main)/entry/page.tsx`
   - Data saves to localStorage but no indicator shows sync status to Firestore

## MEDIUM Issues

1. **Quick add buttons too small** - `src/app/(main)/entry/page.tsx:69`
   - +1, +2, +5, +10 buttons are small targets
   - Hard to tap with floury fingers

2. **Dark theme contrast issues** - `src/app/(main)/entry/page.tsx`
   - Save button color change (emerald-500) hard to see in low light
   - text-slate-400 on slate-800/50 may not meet contrast requirements

3. **No haptic feedback indication** - `src/app/(main)/entry/page.tsx:310`
   - Vibration sent but if device is silent, no feedback

## LOW Issues

1. **Tab navigation could be clearer** - `src/app/(main)/entry/page.tsx:396-400`
   - Emoji tabs help but labels need larger text

2. **Back button offset** - `src/app/(main)/entry/page.tsx:349`
   - `-ml-2` might offset strangely on different screens
