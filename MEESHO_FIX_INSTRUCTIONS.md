# Meesho Source Fix - Test Instructions

## Issue Found
The issue was that **Meesho** was missing from the default sources in `sourceService.ts` while being present in the analytics dashboard. This created an inconsistency where:

1. ✅ **Meesho appears in dashboard analytics** (because it's hardcoded in `firebaseService.ts`)
2. ❌ **Meesho does NOT appear in inward/outward dropdowns** (because it's missing from `sourceService.ts`)

## Fix Applied
Added the missing Meesho sources to the default sources in `services/sourceService.ts`:

### Added for Inward Sources:
- **Meesho Return** (for returning items from Meesho)

### Added for Outward Destinations:
- **Meesho** (for shipping to Meesho)

## How to Test the Fix

### Step 1: Clear Existing Sources
If you've used the application before, old sources might be cached in localStorage. To reset:

1. Open your browser console (F12)
2. Run: `localStorage.removeItem('aura_inventory_sources')`
3. OR use the debug page: http://localhost:3000/debug-sources.html
4. Refresh the page

### Step 2: Verify Sources
1. Go to **Inward** page (/inward)
   - Check the "Source" dropdown
   - Should now include: Factory, Amazon Return, Flipkart Return, **Meesho Return**

2. Go to **Outward** page (/outward)  
   - Check the "Destination / Channel" dropdown
   - Should now include: Amazon FBA, Flipkart, Myntra, **Meesho**

3. Go to **Dashboard** (/dashboard)
   - Check the "Channel-wise Outward" pie chart
   - Should still show Meesho (this was already working)

### Step 3: Test Creating Transactions
1. Create an inward transaction with "Meesho Return" source
2. Create an outward transaction with "Meesho" destination
3. Verify they appear correctly in the system

## Debug Tools
- **Debug Sources Page**: http://localhost:3000/debug-sources.html
  - Shows current sources in localStorage
  - Provides reset button

- **Browser Console**: 
  - Use `window.resetSources()` to reset to defaults
  - Check console logs for source initialization details

## Technical Details
- **File Modified**: `services/sourceService.ts`
- **Method**: Added Meesho entries to `getDefaultSources()` function
- **Storage**: Sources are cached in localStorage with key `aura_inventory_sources`
- **Compatibility**: Fix is backward compatible, only adds missing entries

## Summary
The fix ensures that Meesho is consistently available across:
✅ Inward source dropdown (Meesho Return)
✅ Outward destination dropdown (Meesho) 
✅ Dashboard analytics (already working)