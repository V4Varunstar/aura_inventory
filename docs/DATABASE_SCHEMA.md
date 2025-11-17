
# Firestore Database Schema

This document outlines the collection and field structure for the Aura Inventory Management System on Firestore.

---

### `users`

Stores user information and roles. Document ID is the Firebase Auth `uid`.

-   **id**: `string` (Firebase Auth UID)
-   **name**: `string` (Full Name)
-   **email**: `string` (Login email)
-   **role**: `string` (Enum: 'Admin', 'Manager', 'Warehouse Staff', 'Viewer')
-   **isEnabled**: `boolean` (To activate/deactivate users)
-   **createdAt**: `timestamp`

---

### `orgs`

Stores organization details. For multi-tenancy in the future.

-   **id**: `string` (auto-generated)
-   **name**: `string` (e.g., "Aura Skincare")
-   **ownerId**: `string` (references `users` collection)
-   **createdAt**: `timestamp`

---

### `warehouses`

Stores information about physical warehouse locations.

-   **id**: `string` (auto-generated)
-   **name**: `string` (e.g., "Mumbai WH")
-   **location**: `string` (e.g., "Bhiwandi, Maharashtra")
-   **createdAt**: `timestamp`

---

### `products`

Master list of all products (SKUs).

-   **id**: `string` (auto-generated)
-   **sku**: `string` (UNIQUE, e.g., "AS-HS-50ML")
-   **name**: `string` (e.g., "Aura Glow Hair Serum")
-   **imageUrl**: `string` (URL from Firebase Storage)
-   **category**: `string` (Enum: 'Hair Care', 'Skin Care', etc.)
-   **unit**: `string` (Enum: 'pcs', 'ml', 'g')
-   **mrp**: `number` (Maximum Retail Price in INR)
-   **costPrice**: `number` (Default cost price in INR)
-   **batchTracking**: `boolean` (If true, batch details are required for inwards)
-   **lowStockThreshold**: `number` (Units to trigger low stock alert)
-   **createdAt**: `timestamp`
-   **updatedAt**: `timestamp`

---

### `stock`

Real-time aggregated stock levels. Document ID is a composite key: `{productId}_{warehouseId}`.

-   **productId**: `string` (references `products` collection)
-   **warehouseId**: `string` (references `warehouses` collection)
-   **quantity**: `number` (Total available quantity)
-   **avgCost**: `number` (Weighted average cost of the stock)
-   **stockValue**: `number` (quantity * avgCost)
-   **reserved**: `number` (Stock reserved for outbound orders but not yet shipped)
-   **updatedAt**: `timestamp`

---

### `batches`

Tracks batch-level stock. Document ID is `{productId}_{batchNo}`.

-   **productId**: `string` (references `products` collection)
-   **batchNo**: `string` (e.g., "B012345")
-   **quantityByWarehouse**: `map` (e.g., `{ warehouseId1: 100, warehouseId2: 50 }`)
-   **mfgDate**: `timestamp`
-   **expDate**: `timestamp`
-   **costPrice**: `number` (Cost price for this specific batch)
-   **createdAt**: `timestamp`

---

### `inward`

Log of all incoming stock transactions.

-   **id**: `string` (auto-generated)
-   **productId**: `string`
-   **sku**: `string`
-   **batchNo**: `string`
-   **quantity**: `number`
-   **mfgDate**: `timestamp`
-   **expDate**: `timestamp`
-   **costPrice**: `number`
-   **source**: `string` (Enum: 'Factory', 'Amazon Return', etc.)
-   **notes**: `string` (optional)
-   **attachmentUrl**: `string` (URL to invoice/photo in Firebase Storage, optional)
-   **createdBy**: `string` (references `users` collection)
-   **createdAt**: `timestamp`

---

### `outward`

Log of all outgoing stock transactions.

-   **id**: `string` (auto-generated)
-   **productId**: `string`
-   **sku**: `string`
-   **quantity**: `number`
-   **shipmentRef**: `string` (AWB number or reference ID, optional)
-   **warehouseId**: `string` (references `warehouses` collection)
-   **destination**: `string` (Enum: 'Amazon FBA', 'Flipkart', etc.)
-   **notes**: `string` (optional)
-   **attachmentUrl**: `string` (optional)
-   **createdBy**: `string` (references `users` collection)
-   **createdAt**: `timestamp`

---

### `adjustments`

Log of all manual stock adjustments.

-   **id**: `string` (auto-generated)
-   **productId**: `string`
-   **sku**: `string`
-   **quantity**: `number` (can be negative for reduction)
-   **type**: `string` (Enum: 'Damage', 'QC Fail', 'Expired', 'Audit Correction')
-   **warehouseId**: `string`
-   **notes**: `string`
-   **requiresApproval**: `boolean` (True for negative adjustments by non-admins)
-   **approved**: `boolean`
-   **createdBy**: `string`
-   **createdAt**: `timestamp`

---

### `activityLogs`

Audit trail for all significant actions in the system.

-   **id**: `string` (auto-generated)
-   **userId**: `string` (references `users`)
-   **userName**: `string`
-   **type**: `string` (Enum: 'ProductCreated', 'UserUpdated', 'InwardCreated', etc.)
-   **referenceId**: `string` (ID of the document that was changed, e.g., product ID)
-   **details**: `string` (e.g., "Updated product name from 'Old' to 'New'")
-   **ipAddress**: `string` (optional)
-   **createdAt**: `timestamp`
