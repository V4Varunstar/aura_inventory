
# Sample Seed Data

Use this data to populate your Firestore database for initial testing and demonstration.

---

### `products`

**Product 1: Hair Serum**
```json
{
    "sku": "AS-HS-50ML",
    "name": "Aura Glow Hair Serum",
    "imageUrl": "https://picsum.photos/id/106/200",
    "category": "Hair Care",
    "unit": "ml",
    "mrp": 599,
    "costPrice": 150,
    "batchTracking": true,
    "lowStockThreshold": 50,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

**Product 2: Face Serum**
```json
{
    "sku": "AS-FS-30ML",
    "name": "Radiant Face Serum",
    "imageUrl": "https://picsum.photos/id/111/200",
    "category": "Face Care",
    "unit": "ml",
    "mrp": 899,
    "costPrice": 220,
    "batchTracking": true,
    "lowStockThreshold": 30,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

---

### `warehouses`

**Warehouse 1: Mumbai**
```json
{
    "name": "Mumbai WH",
    "location": "Mumbai, Maharashtra",
    "createdAt": "timestamp"
}
```

---

### Example `inward` Entries

**Inward 1: Hair Serum from Factory**
```json
{
    "productId": "ID_OF_HAIR_SERUM",
    "sku": "AS-HS-50ML",
    "batchNo": "B202405A",
    "quantity": 500,
    "mfgDate": "May 1, 2024",
    "expDate": "April 30, 2026",
    "costPrice": 150,
    "source": "Factory",
    "notes": "Regular production batch.",
    "createdBy": "ID_OF_MANAGER_USER",
    "createdAt": "timestamp"
}
```

**Inward 2: Face Serum Amazon Return**
```json
{
    "productId": "ID_OF_FACE_SERUM",
    "sku": "AS-FS-30ML",
    "batchNo": "B202403C",
    "quantity": 25,
    "mfgDate": "March 15, 2024",
    "expDate": "March 14, 2026",
    "costPrice": 220,
    "source": "Amazon Return",
    "notes": "Customer return, packaging intact.",
    "createdBy": "ID_OF_WAREHOUSE_STAFF",
    "createdAt": "timestamp"
}
```

---

### Example `outward` Entries

**Outward 1: Hair Serum to Amazon FBA**
```json
{
    "productId": "ID_OF_HAIR_SERUM",
    "sku": "AS-HS-50ML",
    "quantity": 200,
    "shipmentRef": "FBA123456789",
    "warehouseId": "ID_OF_MUMBAI_WH",
    "destination": "Amazon FBA",
    "notes": "Shipment for Prime Day sale.",
    "createdBy": "ID_OF_WAREHOUSE_STAFF",
    "createdAt": "timestamp"
}
```

---

### Example `adjustments`

**Adjustment 1: Damaged Face Serum**
```json
{
    "productId": "ID_OF_FACE_SERUM",
    "sku": "AS-FS-30ML",
    "quantity": -5,
    "type": "Damage",
    "warehouseId": "ID_OF_MUMBAI_WH",
    "notes": "Bottles broken during handling in warehouse.",
    "requiresApproval": true,
    "approved": false,
    "createdBy": "ID_OF_WAREHOUSE_STAFF",
    "createdAt": "timestamp"
}
```
