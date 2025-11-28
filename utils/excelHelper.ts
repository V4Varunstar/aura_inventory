import * as XLSX from 'xlsx';
import { Product, ProductCategory, ProductUnit } from '../types';

export interface ExcelProductRow {
  sku: string;
  name: string;
  category: string;
  unit: string;
  mrp: number;
  costPrice: number;
  lowStockThreshold: number;
  batchTracking?: string;
  imageUrl?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  data: any;
}

export interface ParsedExcelData {
  validProducts: Partial<Product>[];
  errors: ValidationError[];
  totalRows: number;
}

/**
 * Parse Excel file and extract product data
 */
export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Validate a single product row
 */
const validateProductRow = (row: any, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  const rowNumber = rowIndex + 2; // Excel row number (header is row 1)

  // Required field validations
  if (!row.sku || String(row.sku).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'sku',
      message: 'SKU is required',
      data: row,
    });
  }

  if (!row.name || String(row.name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'Product name is required',
      data: row,
    });
  }

  if (!row.category || String(row.category).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'category',
      message: 'Category is required',
      data: row,
    });
  } else {
    // Validate category value (case-insensitive, flexible matching)
    const validCategories = Object.values(ProductCategory);
    const categoryInput = String(row.category).trim();
    const categoryLower = categoryInput.toLowerCase().replace(/\s+/g, ''); // Remove all spaces
    const matchedCategory = validCategories.find(cat => 
      cat.toLowerCase().replace(/\s+/g, '') === categoryLower
    );
    
    if (!matchedCategory) {
      errors.push({
        row: rowNumber,
        field: 'category',
        message: `Invalid category "${categoryInput}". Must be one of: ${validCategories.join(', ')}`,
        data: row,
      });
    } else {
      // Use the matched category value
      row.category = matchedCategory;
    }
  }

  if (!row.unit || String(row.unit).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'unit',
      message: 'Unit is required',
      data: row,
    });
  } else {
    // Validate unit value (case-insensitive)
    const validUnits = Object.values(ProductUnit);
    const unitLower = String(row.unit).trim().toLowerCase();
    const matchedUnit = validUnits.find(u => u.toLowerCase() === unitLower);
    
    if (!matchedUnit) {
      errors.push({
        row: rowNumber,
        field: 'unit',
        message: `Invalid unit. Must be one of: ${validUnits.join(', ')}`,
        data: row,
      });
    }
  }

  // Numeric field validations
  if (row.mrp === undefined || row.mrp === null || row.mrp === '') {
    errors.push({
      row: rowNumber,
      field: 'mrp',
      message: 'MRP is required',
      data: row,
    });
  } else if (isNaN(Number(row.mrp)) || Number(row.mrp) <= 0) {
    errors.push({
      row: rowNumber,
      field: 'mrp',
      message: 'MRP must be a positive number',
      data: row,
    });
  }

  if (row.costPrice === undefined || row.costPrice === null || row.costPrice === '') {
    errors.push({
      row: rowNumber,
      field: 'costPrice',
      message: 'Cost price is required',
      data: row,
    });
  } else if (isNaN(Number(row.costPrice)) || Number(row.costPrice) <= 0) {
    errors.push({
      row: rowNumber,
      field: 'costPrice',
      message: 'Cost price must be a positive number',
      data: row,
    });
  }

  if (row.lowStockThreshold === undefined || row.lowStockThreshold === null || row.lowStockThreshold === '') {
    errors.push({
      row: rowNumber,
      field: 'lowStockThreshold',
      message: 'Low stock threshold is required',
      data: row,
    });
  } else if (isNaN(Number(row.lowStockThreshold)) || Number(row.lowStockThreshold) < 0) {
    errors.push({
      row: rowNumber,
      field: 'lowStockThreshold',
      message: 'Low stock threshold must be a non-negative number',
      data: row,
    });
  }

  return errors;
};

/**
 * Convert Excel row to Product object
 */
const mapRowToProduct = (row: any): Partial<Product> => {
  // Case-insensitive category matching
  const validCategories = Object.values(ProductCategory);
  const categoryLower = String(row.category).trim().toLowerCase();
  const matchedCategory = validCategories.find(cat => cat.toLowerCase() === categoryLower) || row.category;
  
  // Case-insensitive unit matching
  const validUnits = Object.values(ProductUnit);
  const unitLower = String(row.unit).trim().toLowerCase();
  const matchedUnit = validUnits.find(u => u.toLowerCase() === unitLower) || row.unit;
  
  return {
    sku: String(row.sku).trim(),
    name: String(row.name).trim(),
    category: matchedCategory as ProductCategory,
    unit: matchedUnit as ProductUnit,
    mrp: Number(row.mrp),
    costPrice: Number(row.costPrice),
    lowStockThreshold: Number(row.lowStockThreshold),
    batchTracking: row.batchTracking === 'Yes' || row.batchTracking === 'yes' || row.batchTracking === true,
    imageUrl: row.imageUrl && String(row.imageUrl).trim() !== '' 
      ? String(row.imageUrl).trim() 
      : 'https://picsum.photos/200',
  };
};

/**
 * Validate and parse Excel data into products
 */
export const validateAndParseExcelData = (data: any[]): ParsedExcelData => {
  const validProducts: Partial<Product>[] = [];
  const allErrors: ValidationError[] = [];

  data.forEach((row, index) => {
    const rowErrors = validateProductRow(row, index);
    
    if (rowErrors.length > 0) {
      allErrors.push(...rowErrors);
    } else {
      validProducts.push(mapRowToProduct(row));
    }
  });

  return {
    validProducts,
    errors: allErrors,
    totalRows: data.length,
  };
};

/**
 * Generate a sample Excel template for bulk upload
 */
export const generateSampleTemplate = (): void => {
  const sampleData = [
    {
      sku: 'SAMPLE-001',
      name: 'Sample Product 1',
      category: 'Hair Care',
      unit: 'ml',
      mrp: 599,
      costPrice: 150,
      lowStockThreshold: 50,
      batchTracking: 'Yes',
      imageUrl: '',
    },
    {
      sku: 'SAMPLE-002',
      name: 'Sample Product 2',
      category: 'Face Care',
      unit: 'g',
      mrp: 899,
      costPrice: 220,
      lowStockThreshold: 30,
      batchTracking: 'No',
      imageUrl: '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Add instructions sheet
  const instructions = [
    { Field: 'sku', Required: 'Yes', Description: 'Unique product SKU code' },
    { Field: 'name', Required: 'Yes', Description: 'Product name' },
    { Field: 'category', Required: 'Yes', Description: 'One of: Hair Care, Skin Care, Face Care, Body Care' },
    { Field: 'unit', Required: 'Yes', Description: 'One of: pcs, ml, g' },
    { Field: 'mrp', Required: 'Yes', Description: 'Maximum Retail Price (positive number)' },
    { Field: 'costPrice', Required: 'Yes', Description: 'Cost price (positive number)' },
    { Field: 'lowStockThreshold', Required: 'Yes', Description: 'Minimum stock alert level (number)' },
    { Field: 'batchTracking', Required: 'No', Description: 'Yes or No (default: No)' },
    { Field: 'imageUrl', Required: 'No', Description: 'Product image URL (optional)' },
  ];
  const instructionSheet = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');

  XLSX.writeFile(workbook, 'Bulk_Product_Upload_Template.xlsx');
};

/**
 * Check for duplicate SKUs within the uploaded data
 */
export const findDuplicateSKUs = (products: Partial<Product>[]): string[] => {
  const skuMap = new Map<string, number>();
  const duplicates: string[] = [];

  products.forEach((product) => {
    const sku = product.sku!.toLowerCase();
    const count = skuMap.get(sku) || 0;
    skuMap.set(sku, count + 1);
  });

  skuMap.forEach((count, sku) => {
    if (count > 1) {
      duplicates.push(sku);
    }
  });

  return duplicates;
};

/**
 * Download data as Excel file
 */
export const downloadExcel = (data: any[], filename: string): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fullFilename);
};
