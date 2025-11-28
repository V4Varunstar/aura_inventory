# Quick Reference - New Features

## 🚀 Production URL
https://aura-inventory-m9fgp3jmc-v4varunstars-projects.vercel.app

---

## 1️⃣ EAN SCANNING (Inward/Outward Forms)

**Location**: Inward page, Outward page

**Usage**:
- Enter or scan EAN in the "EAN / Barcode" field
- Product automatically selected if EAN is mapped
- Green ✅ = Found, Red ❌ = Not mapped

**Setup**:
- Go to **Product Mapping** → Bulk Import
- Upload CSV: `ean,sku`
- Or add manually: Product Mapping → Add Mapping

---

## 2️⃣ PRODUCT SEARCH (250ms Debounce)

**Location**: Inward page, Outward page

**Usage**:
- Click "Product (SKU)" field
- Type product name, SKU, or EAN
- Wait 250ms → Dropdown shows filtered results
- Click to select

---

## 3️⃣ SOURCE MANAGEMENT

**Location**: Settings → Sources & Destinations

**Quick Create (Inline)**:
- On Inward/Outward forms
- Click **"+"** button next to Source/Destination
- Enter name → Create
- Source auto-selected

**Settings Page**:
- View all sources
- Add/Edit/Delete custom sources
- Cannot delete defaults

**Default Sources**:
- Inward: Factory, Amazon Return, Flipkart Return
- Outward: Amazon FBA, Flipkart, Myntra

---

## 4️⃣ STOCK VALIDATION

**Location**: Outward form (automatic)

**How it works**:
- Select product + warehouse
- Available stock shown in placeholder
- Enter quantity
- If quantity > available → Error, won't submit
- If valid → Stock deducted

---

## 📋 NAVIGATION

```
Settings
├── Sources & Destinations (new!)
└── Product Mapping (EAN setup)

Inventory
├── Inward (with EAN + Search)
└── Outward (with EAN + Search + Validation)
```

---

## 🔑 KEY SHORTCUTS

| Action | Shortcut |
|--------|----------|
| Create Source inline | Click "+" button |
| Search products | Type in Product field |
| Scan EAN | Enter in EAN field |
| Clear selection | Click "X" on selected product |

---

## 📞 SUPPORT

Check `FEATURES_COMPLETE.md` for detailed documentation and testing guide.
