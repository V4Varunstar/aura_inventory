/**
 * Stock Utilities - Unified stock management functions
 * Handles atomic stock operations with Firestore batched writes
 */

import { Product, Outward, Inward, FbaShipmentItem } from '../types';

// MOCK IMPLEMENTATION - Replace with real Firestore queries
let mockProducts: Product[] = [];
let mockInwards: Inward[] = [];
let mockOutwards: Outward[] = [];

/**
 * Get available quantity for a product in a warehouse
 * @param companyId Company ID
 * @param sku Product SKU
 * @param warehouseId Warehouse ID
 * @returns Available quantity
 */
export const getAvailableQty = async (
  companyId: string,
  sku: string,
  warehouseId: string
): Promise<number> => {
  console.log(`Getting available qty for SKU: ${sku}, Warehouse: ${warehouseId}`);
  
  // Calculate: Total Inward - Total Outward for this SKU and warehouse
  const totalInward = mockInwards
    .filter(i => i.companyId === companyId && i.sku === sku && i.warehouseId === warehouseId)
    .reduce((sum, i) => sum + i.quantity, 0);
  
  const totalOutward = mockOutwards
    .filter(o => o.companyId === companyId && o.sku === sku && o.warehouseId === warehouseId)
    .reduce((sum, o) => sum + o.quantity, 0);
  
  return totalInward - totalOutward;
};

/**
 * Validate stock availability for multiple items
 * @param companyId Company ID
 * @param items Items to validate
 * @returns Validation result with errors per SKU
 */
export const validateStockAvailability = async (
  companyId: string,
  items: { sku: string; quantity: number; warehouseId: string }[]
): Promise<{ valid: boolean; errors: { sku: string; required: number; available: number }[] }> => {
  const errors: { sku: string; required: number; available: number }[] = [];
  
  for (const item of items) {
    const available = await getAvailableQty(companyId, item.sku, item.warehouseId);
    if (available < item.quantity) {
      errors.push({
        sku: item.sku,
        required: item.quantity,
        available,
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

interface OutwardBatchOptions {
  source?: 'order' | 'FBA_SHIPMENT' | 'manual';
  referenceId?: string;
  channel?: string;
  destination?: string;
  createdBy: string;
}

/**
 * Apply batched outward operations atomically
 * Creates outward entries and deducts stock
 * @param companyId Company ID
 * @param items Items to outward
 * @param options Additional metadata
 * @returns Created outward IDs
 */
export const applyOutwardBatch = async (
  companyId: string,
  items: FbaShipmentItem[],
  options: OutwardBatchOptions
): Promise<string[]> => {
  console.log('Applying outward batch:', items.length, 'items');
  
  // Validate stock first
  const validation = await validateStockAvailability(
    companyId,
    items.map(i => ({ sku: i.sku, quantity: i.quantity, warehouseId: i.warehouseId }))
  );
  
  if (!validation.valid) {
    const errorMsg = validation.errors
      .map(e => `${e.sku}: need ${e.required}, have ${e.available}`)
      .join('; ');
    throw new Error(`Insufficient stock: ${errorMsg}`);
  }
  
  // Create outward entries
  const createdIds: string[] = [];
  
  // In real implementation, use Firestore batched writes
  for (const item of items) {
    const outward: Outward = {
      id: `outward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      productId: item.productId,
      sku: item.sku,
      ean: item.ean,
      quantity: item.quantity,
      warehouseId: item.warehouseId,
      destination: options.destination || 'Amazon FBA',
      channel: options.channel,
      source: options.source,
      referenceId: options.referenceId,
      transactionDate: new Date(),
      createdBy: options.createdBy,
      createdAt: new Date(),
    };
    
    mockOutwards.push(outward);
    createdIds.push(outward.id);
  }
  
  console.log(`Created ${createdIds.length} outward entries`);
  return createdIds;
};

interface InwardBatchOptions {
  documentNo?: string;
  invoiceNumber?: string;
  supplierName?: string;
  documentDate?: Date;
  type?: 'purchase' | 'return';
  source?: string;
  createdBy: string;
}

/**
 * Apply batched inward operations atomically
 * Creates inward entries and updates stock
 * @param companyId Company ID
 * @param items Items to inward
 * @param options Document metadata
 * @returns Created inward IDs
 */
export const applyInwardBatch = async (
  companyId: string,
  items: {
    productId: string;
    sku: string;
    ean?: string;
    quantity: number;
    warehouseId: string;
    costPrice: number;
    batchNo?: string;
    mfgDate?: Date;
    expDate?: Date;
  }[],
  options: InwardBatchOptions
): Promise<string[]> => {
  console.log('Applying inward batch:', items.length, 'items');
  
  const createdIds: string[] = [];
  
  // In real implementation, use Firestore batched writes/transaction
  for (const item of items) {
    const inward: Inward = {
      id: `inward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      productId: item.productId,
      sku: item.sku,
      ean: item.ean,
      quantity: item.quantity,
      warehouseId: item.warehouseId,
      costPrice: item.costPrice,
      batchNo: item.batchNo || 'N/A',
      mfgDate: item.mfgDate || new Date(),
      expDate: item.expDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      source: options.source || 'Factory',
      documentNo: options.documentNo,
      documentDate: options.documentDate,
      transactionDate: new Date(),
      type: options.type,
      createdBy: options.createdBy,
      createdAt: new Date(),
    };
    
    mockInwards.push(inward);
    createdIds.push(inward.id);
  }
  
  console.log(`Created ${createdIds.length} inward entries`);
  return createdIds;
};

/**
 * Get warehouse-wise stock breakdown for a product OR all SKUs in a warehouse
 * @param companyId Company ID
 * @param skuOrWarehouseId SKU or Warehouse ID
 * @returns Stock per warehouse or per SKU
 */
export const getWarehouseStock = async (
  companyId: string,
  skuOrWarehouseId: string
): Promise<{ sku?: string; warehouseId?: string; warehouseName?: string; quantity: number }[]> => {
  // Check if this is a warehouse ID (starts with 'wh_')
  if (skuOrWarehouseId.startsWith('wh_')) {
    // Return all SKUs in this warehouse with stock
    const warehouseId = skuOrWarehouseId;
    const skuSet = new Set<string>();
    
    // Collect all SKUs that have transactions in this warehouse
    mockInwards
      .filter(i => i.companyId === companyId && i.warehouseId === warehouseId)
      .forEach(i => skuSet.add(i.sku));
    mockOutwards
      .filter(o => o.companyId === companyId && o.warehouseId === warehouseId)
      .forEach(o => skuSet.add(o.sku));
    
    const result = [];
    for (const sku of skuSet) {
      const qty = await getAvailableQty(companyId, sku, warehouseId);
      if (qty > 0) {
        result.push({ sku, quantity: qty });
      }
    }
    
    return result;
  } else {
    // Return warehouse breakdown for this SKU
    const sku = skuOrWarehouseId;
    const warehouses = ['wh_1', 'wh_2']; // Get from warehouse service
    
    const result = [];
    for (const whId of warehouses) {
      const qty = await getAvailableQty(companyId, sku, whId);
      if (qty > 0) {
        result.push({
          warehouseId: whId,
          warehouseName: `Warehouse ${whId}`,
          quantity: qty,
        });
      }
    }
    
    return result;
  }
};

/**
 * Check if warehouse has any stock
 * Used before deletion to prevent data loss
 * @param companyId Company ID
 * @param warehouseId Warehouse ID
 * @returns True if warehouse has stock
 */
export const warehouseHasStock = async (
  companyId: string,
  warehouseId: string
): Promise<boolean> => {
  // Check if any product has inward qty > outward qty in this warehouse
  const inwardQty = mockInwards
    .filter(i => i.companyId === companyId && i.warehouseId === warehouseId)
    .reduce((sum, i) => sum + i.quantity, 0);
  
  const outwardQty = mockOutwards
    .filter(o => o.companyId === companyId && o.warehouseId === warehouseId)
    .reduce((sum, o) => sum + o.quantity, 0);
  
  return inwardQty > outwardQty;
};

/**
 * Calculate stock valuation
 * @param companyId Company ID
 * @param warehouseId Optional warehouse filter
 * @returns Valuation details per SKU
 */
export const calculateStockValuation = async (
  companyId: string,
  warehouseId?: string
): Promise<{
  sku: string;
  productName: string;
  quantity: number;
  avgCostPrice: number;
  stockValue: number;
  warehouseId?: string;
}[]> => {
  // Group by SKU and calculate weighted average cost
  const skuMap = new Map<string, { qty: number; totalCost: number; name: string }>();
  
  const filteredInwards = warehouseId
    ? mockInwards.filter(i => i.companyId === companyId && i.warehouseId === warehouseId)
    : mockInwards.filter(i => i.companyId === companyId);
  
  for (const inward of filteredInwards) {
    const existing = skuMap.get(inward.sku) || { qty: 0, totalCost: 0, name: '' };
    skuMap.set(inward.sku, {
      qty: existing.qty + inward.quantity,
      totalCost: existing.totalCost + (inward.quantity * inward.costPrice),
      name: inward.sku, // Should get from product
    });
  }
  
  // Deduct outwards
  const filteredOutwards = warehouseId
    ? mockOutwards.filter(o => o.companyId === companyId && o.warehouseId === warehouseId)
    : mockOutwards.filter(o => o.companyId === companyId);
  
  for (const outward of filteredOutwards) {
    const existing = skuMap.get(outward.sku);
    if (existing) {
      existing.qty -= outward.quantity;
    }
  }
  
  // Convert to array
  const result = [];
  for (const [sku, data] of skuMap) {
    if (data.qty > 0) {
      const avgCost = data.totalCost / (data.qty + mockOutwards.filter(o => o.sku === sku).reduce((s, o) => s + o.quantity, 0));
      result.push({
        sku,
        productName: data.name,
        quantity: data.qty,
        avgCostPrice: avgCost,
        stockValue: data.qty * avgCost,
        warehouseId,
      });
    }
  }
  
  return result;
};

// Export mock data setters for testing
export const _setMockData = (products: Product[], inwards: Inward[], outwards: Outward[]) => {
  mockProducts = products;
  mockInwards = inwards;
  mockOutwards = outwards;
};
