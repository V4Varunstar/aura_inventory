# Bulk Product Upload Guide

## Overview
The Bulk Product Upload feature allows you to import multiple products at once using an Excel file (.xlsx format). This guide explains how to use this feature effectively.

## Accessing the Feature
1. Navigate to the **Products** page
2. Click the **"Upload Excel"** button in the top-right corner
3. The Bulk Upload dialog will open

## Downloading the Template
Click the **"Download Template"** button to get a pre-formatted Excel file with:
- Sample product data
- Column headers with correct naming
- Instructions sheet explaining each field

## Excel File Format

### Required Columns
Your Excel file must include these columns (case-sensitive):

| Column Name | Required | Data Type | Description | Valid Values |
|------------|----------|-----------|-------------|--------------|
| `sku` | Yes | Text | Unique product SKU code | Any unique string |
| `name` | Yes | Text | Product name | Any string |
| `category` | Yes | Text | Product category | Hair Care, Skin Care, Face Care, Body Care |
| `unit` | Yes | Text | Unit of measurement | pcs, ml, g |
| `mrp` | Yes | Number | Maximum Retail Price | Positive number |
| `costPrice` | Yes | Number | Cost price | Positive number |
| `lowStockThreshold` | Yes | Number | Minimum stock alert level | Non-negative number |
| `batchTracking` | No | Text/Boolean | Enable batch tracking | Yes, No, true, false |
| `imageUrl` | No | Text | Product image URL | Valid URL or leave blank |

### Sample Data
```
sku          | name              | category   | unit | mrp  | costPrice | lowStockThreshold | batchTracking | imageUrl
SAMPLE-001   | Sample Product 1  | Hair Care  | ml   | 599  | 150       | 50                | Yes           |
SAMPLE-002   | Sample Product 2  | Face Care  | g    | 899  | 220       | 30                | No            |
```

## Upload Process

### Step 1: Select File
- Click the upload area or drag and drop your Excel file
- Only `.xlsx` and `.xls` files are accepted
- File is parsed automatically upon selection

### Step 2: Review Products
The system will validate your data and show:
- **Valid Products**: Number of products that passed validation
- **Errors**: Number of rows with validation errors
- **Duplicates**: Number of duplicate SKUs (within file or existing in database)

#### Validation Errors
Common validation errors include:
- Missing required fields
- Invalid category or unit values
- Non-numeric values in number fields
- Negative values for price fields

#### Duplicate Detection
The system checks for:
- Duplicate SKUs within the uploaded file
- SKUs that already exist in the database

Products with duplicate SKUs will be skipped during import.

### Step 3: Preview Table
Review the parsed products in a table showing:
- SKU
- Name
- Category
- MRP
- Status (Ready to import / Duplicate / Already exists)

You can:
- **Cancel**: Close the dialog without importing
- **Upload Different File**: Start over with a new file
- **Continue to Confirm**: Proceed to confirmation step

### Step 4: Confirm Import
Review the import summary:
- Number of products to be imported
- Number of products to be skipped (duplicates)
- Number of rows with validation errors

Click **"Confirm & Import"** to proceed with the import.

### Step 5: View Results
After import completion, you'll see:
- **Successfully Imported**: Count of products added
- **Total Processed**: Total number of products processed
- **Skipped - Duplicates**: List of products skipped due to duplicate SKUs
- **Failed**: List of products that failed to import (with error messages)

## Best Practices

### 1. Data Preparation
- Use the template file as a starting point
- Ensure all required fields are filled
- Use exact category and unit values as specified
- Verify SKUs are unique before upload

### 2. Validation Before Upload
- Check for duplicate SKUs in your Excel file
- Verify all numeric fields contain valid numbers
- Ensure category and unit values match allowed values
- Test with a small batch first (2-3 products)

### 3. Error Handling
- Review all validation errors before proceeding
- Fix errors in the Excel file and re-upload
- Products with errors will not be imported
- Only valid products will be processed

### 4. Large Imports
- For very large files (1000+ products), consider splitting into smaller batches
- Monitor the import progress
- Save the results summary for your records

## Troubleshooting

### File Upload Fails
- Ensure file is in `.xlsx` or `.xls` format
- Check file is not corrupted or password-protected
- Try re-saving the file in Excel

### Validation Errors
- **"SKU is required"**: Empty SKU field
- **"Invalid category"**: Category not in allowed list
- **"MRP must be a positive number"**: Non-numeric or negative value
- **"Low stock threshold must be a non-negative number"**: Negative value

### Duplicate SKUs
- Check existing products before uploading
- Use unique SKU codes for each product
- Remove duplicate rows from Excel file

### Import Fails
- Check internet connection
- Verify you have permission to add products
- Contact administrator if issue persists

## Field Details

### SKU (Stock Keeping Unit)
- Must be unique across all products
- Recommended format: `CATEGORY-TYPE-SIZE` (e.g., `HS-SERUM-50ML`)
- Cannot be changed after product creation

### Category
Valid values (case-sensitive):
- `Hair Care`
- `Skin Care`
- `Face Care`
- `Body Care`

### Unit
Valid values (case-sensitive):
- `pcs` - Pieces
- `ml` - Milliliters
- `g` - Grams

### Batch Tracking
- Set to `Yes` or `true` to enable batch tracking
- Set to `No` or `false` (or leave blank) to disable
- Required for products with expiry dates

### Image URL
- Optional field
- Must be a valid URL
- Leave blank to use default placeholder image

## Tips for Success

1. **Download and use the template** - It has the correct format
2. **Test with small batches** - Verify format before bulk import
3. **Keep a backup** - Save original Excel file before upload
4. **Review validation errors carefully** - Fix issues before re-uploading
5. **Check for duplicates** - Ensure SKUs are unique

## Support
If you encounter issues not covered in this guide, contact your system administrator or refer to the main documentation.
