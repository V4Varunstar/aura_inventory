# FBA & Advanced Features Implementation

## Overview
This document outlines the implementation of 13 major features for Aura Inventory system.

## Implementation Status

### ✅ Completed
1. **Types & Infrastructure** - Added EAN, FBA types, extended Inward/Outward interfaces
2. **Stock Utilities** (`utils/stockUtils.ts`) - Atomic operations, validation, valuation
3. **FBA Service** (`services/fbaService.ts`) - Complete CRUD + deduction logic

### 🚧 In Progress  
4. Warehouse Delete with Stock Validation
5. FBA UI Pages (Create, List, Deduct)

### 📋 Pending (High Priority)
- Outward dual modes (Shipment Bulk + B2C Scanning)
- EAN Mapping bulk upload
- Stock Valuation Report
- Marketplace Shipment Report
- Bulk Inward (Invoice-based)
- Single Return Scanning
- Channel/Destination/Source CRUD
- Firestore Security Rules

## Key Architecture Decisions

### Stock Calculation
```
Available Stock = Σ(Inward) - Σ(Outward) + Σ(Adjustments)
```
- Per warehouse, per SKU
- Real-time calculation from transaction history
- No separate stock table to maintain consistency

### FBA Shipment Flow
1. **Create Shipment** - No stock deduction, status='created'
2. **Add Items** - SKU selection with EAN support, warehouse selection
3. **Deduct Shipment** - Validates stock → Creates outward entries → Updates status='deducted'
4. **Outward Linkage** - source='FBA_SHIPMENT', referenceId=shipmentId

### EAN Implementation
- Product.ean field for 1:1 mapping
- /eanMaps collection for bulk imports
- Scanner support via html5-qrcode library
- Fallback to manual entry

### Security
- Company isolation: /companies/{companyId}/*
- Role-based: admin/manager (full), employee (operations), viewer (read-only)
- Firestore rules enforce companyId matching

## File Structure

```
services/
  ├── fbaService.ts ✅
  ├── eanService.ts
  ├── reportService.ts
  └── firebaseService.ts (extend)

utils/
  ├── stockUtils.ts ✅
  └── scannerUtils.ts

hooks/
  ├── useFbaShipments.ts
  ├── useEanMapping.ts
  ├── useWarehouses.ts (extend)
  └── useStock.ts

components/
  ├── DeleteWarehouseModal.tsx
  ├── EanScannerInput.tsx
  ├── FbaAddItemRow.tsx
  └── StockValidationAlert.tsx

pages/
  ├── amazon-fba/
  │   ├── index.tsx
  │   ├── create.tsx
  │   └── [id].tsx
  ├── inward/
  │   ├── bulk-create.tsx
  │   └── scan-return.tsx
  ├── reports/
  │   ├── stock-valuation.tsx
  │   └── marketplace-shipments.tsx
  └── settings/
      ├── ean-mapping.tsx
      └── misc.tsx
```

## Database Collections

```
/companies/{companyId}/
  ├── products (add: ean field)
  ├── warehouses
  ├── inward (add: documentNo, type, transactionDate)
  ├── outward (add: source, referenceId, channel, orderId)
  ├── fbaShipments ⭐ NEW
  ├── eanMaps ⭐ NEW
  ├── channels ⭐ NEW
  ├── destinations ⭐ NEW
  ├── sources ⭐ NEW
  └── auditLogs
```

## Critical Functions

### Stock Validation (Before Warehouse Delete)
```typescript
const canDeleteWarehouse = async (warehouseId: string) => {
  const hasStock = await warehouseHasStock(companyId, warehouseId);
  if (hasStock) {
    throw new Error('Cannot delete warehouse with stock. Transfer or adjust stock first.');
  }
  // Check pending shipments
  const pendingShipments = await getShipments(companyId, { 
    status: 'created',
    // filter by items.warehouseId 
  });
  if (pendingShipments.length > 0) {
    throw new Error('Warehouse has pending FBA shipments. Process or cancel them first.');
  }
};
```

### Deduct Shipment (Atomic)
```typescript
// Uses Firestore transaction in production
const deductShipment = async (shipmentId: string) => {
  const batch = firestore.batch();
  
  // 1. Validate stock
  // 2. Create outward docs
  // 3. Update shipment status
  // 4. Create audit log
  
  await batch.commit();
};
```

## Next Steps

1. ✅ Complete warehouse delete modal + validation
2. ✅ Build FBA pages (list, create, deduct UI)
3. Implement EAN scanning component
4. Create bulk inward upload
5. Build reports pages
6. Add Firestore rules
7. Integration testing
8. Deploy to production

## Migration Notes

For existing installations:
1. Run `scripts/add-ean-field.ts` to add ean: null to products
2. Run `scripts/migrate-outward-source.ts` to add source field to existing outwards
3. Update Firestore indexes for new queries
4. Deploy security rules

## Testing Checklist

- [ ] Create FBA shipment with 3 SKUs
- [ ] Deduct shipment (success case)
- [ ] Deduct shipment (insufficient stock)
- [ ] Scan EAN → Find product
- [ ] Bulk inward with 10 SKUs
- [ ] Stock valuation report export
- [ ] Warehouse delete (with stock - should fail)
- [ ] Warehouse delete (empty - should succeed)
- [ ] Cross-company isolation
- [ ] Role-based access control

## Performance Considerations

- Use pagination for large lists (100 items per page)
- Index on: companyId, status, createdAt, transactionDate
- Cache EAN mappings client-side
- Debounce scanner input (300ms)
- Lazy load report data
- Export via Cloud Function for large datasets
