# Platform Shipments - Stock Deduction Guide

## ✅ System Already Properly Implemented!

Amazon FBA, Flipkart FBF, Myntra SJIT, Zepto PO, और Nykaa PO - सभी platforms पहले से ही **outward entries** के रूप में काम कर रहे हैं। Stock automatically reduce होता है जब shipment को deduct करते हैं।

---

## 🔄 How It Works - Complete Flow

### Step 1: Create Shipment
```
Platform Shipment Page → Click "Create Shipment"
├── Enter shipment details (Name, Tracking, AWB, Carrier)
├── Add products (SKU, Quantity, Warehouse)
├── Click "Create Shipment"
└── Status: "Created" ⚪ (Stock NOT deducted yet)
```

**Important**: Shipment create करने पर stock **deduct नहीं** होता! यह सिर्फ plan होता है।

### Step 2: Deduct Stock (Critical Step)
```
Shipment List → Click "Deduct Stock" button
├── System validates stock availability
├── Checks: Available Stock >= Required Quantity
├── If insufficient → Error message, deduction stops
├── If sufficient → Creates outward entries
└── Status: "Deducted" ✅ (Stock REDUCED from warehouse)
```

**This is when stock actually reduces!**

---

## 📊 Technical Implementation

### 1. Stock Validation
```typescript
// Before deduction, system checks:
const validation = await validateStockAvailability(
  companyId,
  items.map(i => ({
    sku: i.sku,
    quantity: i.quantity,
    warehouseId: i.warehouseId
  }))
);

if (!validation.valid) {
  throw new Error("Insufficient stock");
}
```

### 2. Outward Entry Creation
```typescript
// Creates outward entries for each product
await applyOutwardBatch(
  companyId,
  items,
  {
    source: 'FBA_SHIPMENT',
    referenceId: shipmentId,
    channel: 'amazon-fba', // or 'flipkart-fbf', 'myntra-sjit', etc.
    destination: 'Amazon FBA', // Platform display name
    createdBy: userId,
  }
);
```

### 3. Stock Calculation
```typescript
// Available Stock = Total Inward - Total Outward
// When shipment deducted:
Available Stock = Available Stock - Shipment Quantity
```

---

## 🎯 Platform-wise Configuration

### Amazon FBA
- **Channel**: `amazon-fba`
- **Destination**: `Amazon FBA`
- **Outward Type**: Marketplace fulfillment

### Flipkart FBF
- **Channel**: `flipkart-fbf`
- **Destination**: `Flipkart FBF`
- **Outward Type**: Marketplace fulfillment

### Myntra SJIT
- **Channel**: `myntra-sjit`
- **Destination**: `Myntra SJIT`
- **Outward Type**: Marketplace fulfillment

### Zepto PO
- **Channel**: `zepto`
- **Destination**: `Zepto PO`
- **Outward Type**: Quick commerce

### Nykaa PO
- **Channel**: `nykaa`
- **Destination**: `Nykaa PO`
- **Outward Type**: Beauty platform

---

## 📱 User Workflow Example

### Scenario: Amazon FBA में 100 units भेजने हैं

**Step 1: Check Stock**
```
Product: Aura Glow Hair Serum
Warehouse: Mumbai WH
Available Stock: 250 units ✅
```

**Step 2: Create Shipment**
```
Platform: Amazon FBA
Shipment Name: "AMZN-FBA-2025-001"
Product: Aura Glow Hair Serum
Quantity: 100 units
Warehouse: Mumbai WH
Click "Create Shipment" → Status: Created ⚪
Available Stock: Still 250 units (not deducted yet)
```

**Step 3: Deduct Stock**
```
Shipment List → Find "AMZN-FBA-2025-001"
Click "Deduct Stock" button
System validates: 250 available >= 100 required ✅
System creates outward entry
Status changes: Created → Deducted ✅
Available Stock: 250 - 100 = 150 units ✓
```

**Step 4: Verify**
```
Reports → Stock Report
Product: Aura Glow Hair Serum
Warehouse: Mumbai WH
Available: 150 units ✓
Outward History shows:
  - Amazon FBA: 100 units (Reference: AMZN-FBA-2025-001)
```

---

## 🛡️ Safety Features

### 1. Stock Validation
- ❌ Cannot deduct if insufficient stock
- ✅ Shows clear error message with available vs required

### 2. Double Deduction Prevention
- ❌ Cannot deduct same shipment twice
- ✅ "Already deducted" error shown

### 3. Atomic Operations
- ✅ All items deducted together or none
- ❌ No partial stock deduction on failure

### 4. Audit Trail
- ✅ Every deduction logged with:
  - Shipment ID
  - User who deducted
  - Timestamp
  - Reference number

---

## 📋 Important Points

### ✅ What Happens When Deducted:
1. **Stock reduces** from selected warehouse
2. **Outward entry** created with platform name
3. **Status changes** from "Created" to "Deducted"
4. **Cannot edit/delete** deducted shipments
5. **Audit log** created for compliance

### ❌ What Does NOT Happen:
1. Stock does NOT reduce on shipment creation
2. Cannot deduct without sufficient stock
3. Cannot undo deduction (permanent operation)
4. Cannot modify items after deduction

---

## 🔍 How to Verify Stock Deduction

### Method 1: Check Stock Report
```
Navigation: Reports → Stock Report
Filter: Warehouse + Product
Check: Available Stock column
```

### Method 2: Check Outward Records
```
Navigation: Outward Stock page
Filter: By destination (Amazon FBA, Flipkart, etc.)
Check: Entries with shipment reference
```

### Method 3: Check Shipment Status
```
Navigation: Platform Shipment Page
Check: Status column
- "Created" = Stock NOT deducted
- "Deducted" = Stock reduced
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Insufficient Stock" Error
**Problem**: Trying to deduct more than available stock
**Solution**: 
- Check available stock in Reports
- Either reduce shipment quantity
- Or add inward stock first

### Issue 2: Button Disabled
**Problem**: "Deduct Stock" button is disabled
**Reasons**:
- Shipment already deducted (Status: Deducted)
- Or shipment cancelled (Status: Cancelled)
**Solution**: Cannot deduct again, create new shipment

### Issue 3: Stock Not Reducing
**Problem**: Created shipment but stock not reduced
**Reason**: You only created shipment, didn't deduct it
**Solution**: Click "Deduct Stock" button to actually reduce stock

---

## 📈 Reports & Analytics

### Stock Movement Report
```
Outward entries show:
- Platform name (Amazon FBA, Flipkart, etc.)
- Quantity deducted
- Reference: Shipment ID
- Date/Time
- User who deducted
```

### Platform-wise Analysis
```
Reports show outward by destination:
- Amazon FBA: 1,500 units
- Flipkart FBF: 800 units
- Myntra SJIT: 600 units
- Zepto PO: 400 units
- Nykaa PO: 300 units
Total: 3,600 units outward
```

---

## ✅ Conclusion

**सभी platform shipments (Amazon FBA, Flipkart FBF, Myntra SJIT, Zepto PO, Nykaa PO) पहले से ही perfectly implement हैं:**

1. ✅ Shipment create करने पर: Planning mode
2. ✅ "Deduct Stock" click करने पर: Stock reduces
3. ✅ Outward entries automatically create होती हैं
4. ✅ Available stock update होता है
5. ✅ Validation हर step पर है
6. ✅ Audit trail maintain होता है

**No changes needed - system is working as required!** 🎉
