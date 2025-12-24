# ✅ TESTING CHECKLIST - User Operational Dashboard

## 🧪 TEST THE IMPLEMENTATION

Copy this checklist and mark items as you test them.

---

## PHASE 1: SETUP & BASIC TESTING

### Environment Setup
- [ ] Run `npm run dev`
- [ ] Application loads without errors
- [ ] Console shows no red errors
- [ ] Login page appears

### Login & Authentication
- [ ] Login as Admin user
- [ ] Login as Manager user
- [ ] Login as Employee user
- [ ] SuperAdmin redirects correctly
- [ ] User name shows in header

---

## PHASE 2: WAREHOUSE FUNCTIONALITY

### Warehouse Selector (Header)
- [ ] Warehouse dropdown visible in header
- [ ] Shows warehouse name
- [ ] Shows warehouse code (if any)
- [ ] Can switch between warehouses
- [ ] Selection persists on page reload
- [ ] Shows "No Warehouse" if empty
- [ ] Loading state displays correctly

### Warehouse Management Page
- [ ] Navigate to "Warehouses" from sidebar
- [ ] Click "Add Warehouse"
- [ ] Create warehouse with:
  - [ ] Name (required)
  - [ ] Code (optional)
  - [ ] Location (optional)
  - [ ] Address (optional)
  - [ ] Status (Active/Inactive)
- [ ] Warehouse appears in table
- [ ] Table shows:
  - [ ] Name
  - [ ] Code
  - [ ] Location
  - [ ] Status badge (colored)
  - [ ] Created date
  - [ ] Actions (Edit/Delete)
- [ ] Click Edit, modify warehouse
- [ ] Changes reflect in table
- [ ] Status badge color changes (Active=green, Inactive=gray)
- [ ] Delete warehouse (if no stock)
- [ ] Create at least 3 test warehouses

---

## PHASE 3: PRODUCT FUNCTIONALITY

### Product Creation with New Fields
- [ ] Navigate to "Products" from sidebar
- [ ] Click "Add Product"
- [ ] Fill all fields:
  - [ ] SKU (required)
  - [ ] Name (required)
  - [ ] **EAN (required)** - Enter test EAN: "1234567890123"
  - [ ] Category (required)
  - [ ] Unit (required)
  - [ ] MRP (required)
  - [ ] Cost Price (required)
  - [ ] **Selling Price** - Enter test value
  - [ ] **GST %** - Enter 18
  - [ ] **Min Stock Threshold** - Enter 10
- [ ] Click "Create Product"
- [ ] Product appears in table

### EAN Uniqueness Validation
- [ ] Try creating another product with same EAN
- [ ] Should show error (currently may not - needs backend)
- [ ] Create product with different EAN
- [ ] Success

### Product Table
- [ ] Table displays all products
- [ ] Can search products
- [ ] Can edit product
- [ ] Can delete product
- [ ] Create at least 5 test products with EANs

---

## PHASE 4: PARTY MANAGEMENT

### Party Page Navigation
- [ ] Navigate to "Parties" from sidebar
- [ ] Page loads with empty state or party list
- [ ] Click "Add Party" button

### Party Creation
- [ ] Fill party form:
  - [ ] Name (required) - "Test Customer 1"
  - [ ] Type - Select "Customer"
  - [ ] Contact Person - "John Doe"
  - [ ] Phone - "+91 9876543210"
  - [ ] Email - "test@example.com"
  - [ ] Address - "123 Test Street"
  - [ ] GST Number - "29ABCDE1234F1Z5"
- [ ] Click "Create Party"
- [ ] Party appears in table

### Party Features
- [ ] Search parties by name
- [ ] Search parties by phone
- [ ] Search parties by email
- [ ] Type badge shows correct color:
  - [ ] Customer = Blue
  - [ ] Supplier = Green
  - [ ] Both = Purple
- [ ] Click Edit, modify party
- [ ] Changes saved successfully
- [ ] Click Delete, party removed
- [ ] Create parties of all 3 types (Customer, Supplier, Both)
- [ ] Create at least 5 test parties

---

## PHASE 5: STOCK ADJUSTMENT

### Navigation
- [ ] Navigate to "Stock Adjustment" from sidebar
- [ ] Page loads with warehouse indicator
- [ ] Selected warehouse shown at top
- [ ] Click "New Adjustment" button

### Stock Adjustment Creation
- [ ] Modal opens with form
- [ ] Warehouse name displayed
- [ ] Click "Scan EAN" button
- [ ] EAN Scanner appears

### EAN Scanning (Manual Entry)
- [ ] Type EAN of created product
- [ ] Click "Scan" or press Enter
- [ ] Product auto-fills with:
  - [ ] Product name
  - [ ] SKU
  - [ ] EAN
- [ ] "Change Product" button appears

### Adjustment Form Completion
- [ ] Select "Increase" or "Decrease"
- [ ] Enter quantity (e.g., 50)
- [ ] **Enter reason** (required) - "Initial Stock"
- [ ] Enter optional notes
- [ ] Click "Save Adjustment"
- [ ] Success toast appears
- [ ] Modal closes
- [ ] Adjustment appears in table

### Adjustment Table
- [ ] Table shows:
  - [ ] Date
  - [ ] SKU
  - [ ] Product name
  - [ ] Type badge (Increase=green, Decrease=red)
  - [ ] Quantity
  - [ ] Reason
  - [ ] Warehouse
- [ ] Create both Increase and Decrease adjustments
- [ ] Create at least 5 test adjustments

---

## PHASE 6: EAN SCANNER COMPONENT

### EAN Scanner Modes
- [ ] Scanner shows "Keyboard" and "Camera" buttons
- [ ] Keyboard mode selected by default
- [ ] Input field visible
- [ ] Can type EAN manually
- [ ] Can paste EAN
- [ ] Press "Scan" button
- [ ] Product found and auto-filled

### Camera Mode (Placeholder)
- [ ] Click "Camera" button
- [ ] Alert/modal shows "Coming Soon"
- [ ] Can switch back to Keyboard mode

### Barcode Scanner (if available)
- [ ] Use physical barcode scanner
- [ ] Scanner input detected automatically
- [ ] Rapid key input recognized
- [ ] Product fetched on Enter key
- [ ] No manual clicking needed

---

## PHASE 7: INLINE PARTY MODAL

### Trigger Inline Party Creation
- [ ] This feature ready but not integrated yet
- [ ] Will be used in Inward/Outward (Phase 2)
- [ ] Test manually if needed:
  ```typescript
  <InlinePartyModal 
    isOpen={showModal} 
    onClose={() => setShowModal(false)}
    onPartyCreated={(party) => console.log(party)}
    defaultType="Customer"
  />
  ```

---

## PHASE 8: NAVIGATION & UI

### Sidebar Menu
- [ ] All menu items visible based on role
- [ ] New items present:
  - [ ] "Stock Adjustment" under Inventory section
  - [ ] "Parties" under Master Data section
- [ ] Menu items highlighted on active page
- [ ] Can navigate to all pages
- [ ] Sidebar collapsible on mobile

### Header
- [ ] Warehouse selector visible (left side)
- [ ] Search bar visible (center)
- [ ] User profile dropdown (right side)
- [ ] Logout works
- [ ] Responsive on mobile

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] All components responsive
- [ ] No horizontal scroll
- [ ] Touch-friendly buttons

---

## PHASE 9: DATA PERSISTENCE

### LocalStorage Data
- [ ] Create warehouse, reload page
- [ ] Warehouse still exists
- [ ] Create product, reload page
- [ ] Product still exists
- [ ] Create party, reload page
- [ ] Party still exists
- [ ] Create adjustment, reload page
- [ ] Adjustment still exists
- [ ] Warehouse selection persists

### Data Isolation
- [ ] Login as different company user (if multi-company)
- [ ] Data scoped to company
- [ ] Cannot see other company's data

---

## PHASE 10: ERROR HANDLING

### Form Validations
- [ ] Try creating product without EAN
- [ ] Should show error
- [ ] Try creating warehouse without name
- [ ] Should show error
- [ ] Try creating party without name
- [ ] Should show error
- [ ] Try creating adjustment without reason
- [ ] Should show error

### Error States
- [ ] Network error handling (if applicable)
- [ ] Empty state messages
- [ ] Loading states
- [ ] Error toasts display
- [ ] Success toasts display

---

## PHASE 11: ROLE-BASED ACCESS

### Admin Role
- [ ] Can access all pages
- [ ] Can see all menu items
- [ ] Can create/edit/delete everything

### Manager Role
- [ ] Can access most pages
- [ ] Cannot access User Management
- [ ] Cannot access some Settings

### Employee Role
- [ ] Cannot access Adjustments
- [ ] Cannot access Settings
- [ ] Can access basic operations

### Viewer Role
- [ ] Read-only access
- [ ] Cannot create/edit/delete
- [ ] Can view reports

---

## PHASE 12: EDGE CASES

### Empty States
- [ ] Warehouse selector with no warehouses
- [ ] Product list with no products
- [ ] Party list with no parties
- [ ] Adjustment list with no adjustments

### Search Functionality
- [ ] Search with no results
- [ ] Search with partial match
- [ ] Clear search
- [ ] Search case-insensitive

### Delete Operations
- [ ] Delete warehouse with stock (should block)
- [ ] Delete product (soft delete)
- [ ] Delete party (soft delete)
- [ ] Deleted items don't show in lists

---

## PHASE 13: PERFORMANCE

### Page Load Times
- [ ] Dashboard loads < 2 seconds
- [ ] Products page loads < 2 seconds
- [ ] Parties page loads < 2 seconds
- [ ] No lag when switching warehouses
- [ ] No lag when opening modals

### Large Data Sets
- [ ] Create 50+ products, test performance
- [ ] Create 50+ parties, test performance
- [ ] Create 50+ adjustments, test performance
- [ ] Search still fast with large data

---

## PHASE 14: BROWSER COMPATIBILITY

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works

---

## PHASE 15: INTEGRATION READINESS

### Pending Features (Not Yet Implemented)
- [ ] Enhanced Inward Module - Phase 2
- [ ] Enhanced Outward Module - Phase 2
- [ ] Dashboard Analytics - Phase 2
- [ ] Reports Module - Phase 2
- [ ] Password Reset - Phase 2
- [ ] Global Search - Phase 2
- [ ] Pagination - Phase 2
- [ ] Audit Logs - Phase 2

### Ready for Integration
- [x] Warehouse system ready
- [x] Party system ready
- [x] EAN scanner ready
- [x] Stock adjustment ready
- [x] Data models ready
- [x] UI components ready

---

## 📊 TESTING SUMMARY

### Total Tests: ~150+
- [ ] Phase 1: Setup (5 tests)
- [ ] Phase 2: Warehouse (15 tests)
- [ ] Phase 3: Product (12 tests)
- [ ] Phase 4: Party (15 tests)
- [ ] Phase 5: Adjustment (15 tests)
- [ ] Phase 6: EAN Scanner (10 tests)
- [ ] Phase 7: Inline Modal (5 tests)
- [ ] Phase 8: Navigation (10 tests)
- [ ] Phase 9: Persistence (10 tests)
- [ ] Phase 10: Errors (10 tests)
- [ ] Phase 11: Roles (10 tests)
- [ ] Phase 12: Edge Cases (8 tests)
- [ ] Phase 13: Performance (8 tests)
- [ ] Phase 14: Browsers (12 tests)
- [ ] Phase 15: Integration (15 tests)

### Pass Criteria
- **90%+ tests passing** = Ready for Phase 2
- **95%+ tests passing** = Excellent
- **100% tests passing** = Production Ready (after Phase 2)

---

## 🐛 BUG TRACKING

If you find bugs, document them here:

### Bug Template:
```
Bug #1:
- Feature: [Feature name]
- Issue: [Describe the issue]
- Steps to Reproduce:
  1. 
  2. 
  3. 
- Expected: [What should happen]
- Actual: [What actually happens]
- Severity: [High/Medium/Low]
- Status: [Open/Fixed]
```

---

## ✅ SIGN-OFF

### Testing Completed By:
- Name: ________________
- Date: ________________
- Tests Passed: ___ / 150+
- Status: ☐ Approved ☐ Needs Work

### Notes:
```


```

---

**Save this checklist and use it for comprehensive testing!** 📋✅
