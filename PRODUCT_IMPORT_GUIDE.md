# 📦 Product Import Guide

## How to Import Products in Bulk

### Step 1: Download the Template

1. Go to **Products** page
2. Click **Bulk Upload** button
3. Click **Download Template** button
4. A file named `Product_Upload_Template.xlsx` will be downloaded

### Step 2: Understanding the Template

The template has **3 sheets**:

#### 📄 Sheet 1: Products (Your Data Goes Here)
This sheet contains sample products showing the correct format. Delete these and add your own products.

#### 📋 Sheet 2: Instructions
Detailed field-by-field explanation of what each column needs.

#### 💡 Sheet 3: Tips
Common mistakes to avoid and best practices.

---

## 📊 Required Columns

### Column Details:

| Column Name | Required | Type | Example | Notes |
|------------|----------|------|---------|-------|
| `sku` | ✅ Yes | Text | SAMPLE-001 | Must be unique across all products |
| `name` | ✅ Yes | Text | Aloe Vera Hair Serum 100ml | Be descriptive, include size |
| `category` | ✅ Yes | Dropdown | Hair Care | Exact match required |
| `unit` | ✅ Yes | Dropdown | ml | Only: pcs, ml, g |
| `mrp` | ✅ Yes | Number | 599 | No currency symbols or commas |
| `costPrice` | ✅ Yes | Number | 150 | Your purchase/cost price |
| `lowStockThreshold` | ✅ Yes | Number | 50 | When to show low stock alert |
| `batchTracking` | ❌ No | Yes/No | Yes | For products with expiry dates |
| `imageUrl` | ❌ No | URL | https://... | Leave blank for default image |

---

## ✅ Valid Category Values

Copy-paste these **exactly** to avoid errors:
- `Hair Care`
- `Skin Care`
- `Face Care`
- `Body Care`

**Note:** Case-insensitive but spelling must match exactly.

---

## ✅ Valid Unit Values

- `pcs` - For countable items (bottles, boxes, pieces)
- `ml` - For liquids (milliliters)
- `g` - For solids by weight (grams)

**Note:** Can be typed in any case (PCS, pcs, Pcs all work).

---

## 📝 Example Data

```
sku          | name                        | category   | unit | mrp | costPrice | lowStockThreshold | batchTracking | imageUrl
-------------|-----------------------------|-----------:|------:|----:|----------:|------------------:|--------------|----------
SAMPLE-001   | Aloe Vera Hair Serum 100ml | Hair Care  | ml   | 599 | 150       | 50                | Yes          |
SAMPLE-002   | Rose Face Cream 50g        | Face Care  | g    | 899 | 220       | 30                | No           |
SAMPLE-003   | Vitamin C Face Wash        | Skin Care  | ml   | 349 | 95        | 40                | Yes          |
SAMPLE-004   | Body Lotion 200ml          | Body Care  | ml   | 450 | 125       | 25                | No           |
SAMPLE-005   | Hand Sanitizer (5 pcs)     | Body Care  | pcs  | 299 | 80        | 100               | Yes          |
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong Category Names
```
Electronics  ❌ (Not valid)
Haircare     ❌ (Should be "Hair Care")
FaceCare     ❌ (Should be "Face Care")
```

### ✅ Correct Category Names
```
Hair Care    ✅
Face Care    ✅
Skin Care    ✅
Body Care    ✅
```

### ❌ Price Formatting Errors
```
₹599        ❌ (Remove ₹ symbol)
5,99        ❌ (No commas)
Rs. 599     ❌ (No text)
```

### ✅ Correct Price Format
```
599         ✅
150         ✅
99.50       ✅ (decimals okay)
```

### ❌ Duplicate SKUs
```
SKU-001     ← First product
SKU-001     ❌ Same SKU used again (will be rejected)
```

### ✅ Unique SKUs
```
SKU-001     ✅
SKU-002     ✅
SKU-003     ✅
```

---

## 🔄 Upload Process

### Step 1: Prepare Your File
1. Fill in the Products sheet with your data
2. Make sure no columns are missing
3. Check for empty rows (remove them)
4. Verify SKUs are unique

### Step 2: Upload
1. Click **Bulk Upload** on Products page
2. Choose your file or drag & drop
3. Wait for validation (automatic)

### Step 3: Review
The system will show:
- ✅ **Valid Products** - Ready to import
- ❌ **Errors** - Problems found (with row numbers)
- ⚠️ **Duplicates** - SKUs that already exist

### Step 4: Fix Issues (if any)
1. Note the row numbers with errors
2. Go back to your Excel file
3. Fix the issues
4. Upload again

### Step 5: Confirm Import
1. Review the summary
2. Products with errors will be skipped
3. Click **Confirm & Import**
4. Done! ✨

---

## 📈 Validation Rules

### Text Fields
- ✅ Cannot be empty
- ✅ Leading/trailing spaces are removed automatically
- ✅ Maximum length: 255 characters

### Numbers (MRP, Cost Price)
- ✅ Must be positive (greater than 0)
- ✅ Can have decimals (e.g., 99.50)
- ❌ Cannot be negative
- ❌ Cannot be zero

### Low Stock Threshold
- ✅ Can be 0 or positive
- ✅ Whole numbers recommended
- ❌ Cannot be negative

### Batch Tracking
- ✅ Leave empty = defaults to "No"
- ✅ "Yes", "yes", "YES" = enabled
- ✅ "No", "no", "NO" = disabled
- ❌ Any other value = error

---

## 🎯 Best Practices

### 1. Start Small
Upload 5-10 products first to test the format before doing bulk upload.

### 2. Use Consistent Naming
```
Good Examples:
- Aloe Vera Hair Serum 100ml
- Rose Face Cream 50g
- Vitamin C Serum - 30ml

Bad Examples:
- product1
- Item XYZ
- test product
```

### 3. Enable Batch Tracking When Needed
Use "Yes" for:
- ✅ Products with expiry dates
- ✅ Food & beverage items
- ✅ Cosmetics with batch numbers
- ✅ Medicines

### 4. Set Realistic Stock Thresholds
- High-demand items: 100-200
- Medium-demand: 50-100
- Low-demand: 20-50

### 5. Keep SKUs Organized
```
Good SKU Format:
- HAIR-001, HAIR-002 (Category-based)
- SKU-2025-001, SKU-2025-002 (Date-based)
- PROD-A-001, PROD-B-001 (Supplier-based)
```

---

## 🐛 Troubleshooting

### Issue: "Category not valid"
**Solution:** Copy category name from template exactly. Must be one of: Hair Care, Skin Care, Face Care, Body Care

### Issue: "SKU already exists"
**Solution:** Each SKU must be unique. Check if product already exists in system.

### Issue: "Price must be positive"
**Solution:** 
- Remove ₹ symbol
- Remove commas
- Ensure number is greater than 0

### Issue: "Empty rows detected"
**Solution:** Delete all empty rows between data. Make sure data is continuous.

### Issue: "Unit not valid"
**Solution:** Use only: pcs, ml, or g (case-insensitive)

### Issue: Excel file empty
**Solution:** Make sure you're filling the "Products" sheet, not "Instructions" sheet

---

## 📞 Need Help?

If you encounter issues:

1. **Check the template** - Download fresh template and compare format
2. **Review error messages** - They show exact row and field with problem
3. **Test with samples** - Use the 5 sample products from template
4. **Start fresh** - Download new template and re-enter data

---

## ✨ Success Tips

✅ **DO:**
- Download the template every time
- Fill data in the Products sheet
- Copy-paste category names from examples
- Use consistent formatting
- Test with 2-3 products first
- Keep SKUs unique and meaningful

❌ **DON'T:**
- Modify column headers
- Add extra columns in between
- Leave empty rows in data
- Use currency symbols in prices
- Misspell category names
- Reuse SKU codes

---

## 🎉 You're Ready!

Now you can import hundreds of products in minutes instead of adding them one by one. Happy importing! 📦✨
