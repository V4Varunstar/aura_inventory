/**
 * Multi-Platform Shipment Service
 * Handles shipments for Amazon FBA, Flipkart FBF, Myntra SJIT, Zepto PO, Nykaa PO
 */

import { FbaShipment, FbaShipmentItem, ShipmentStatus } from '../types';
import { getProductStock, addOutward, getProducts } from './firebaseService';

// Platform types
export type Platform = 'amazon-fba' | 'flipkart-fbf' | 'myntra-sjit' | 'zepto-po' | 'nykaa-po';

export interface PlatformShipment extends FbaShipment {
  platform: Platform;
}

// MOCK DATABASE - Separate storage per platform
const mockShipments: { [key in Platform]: PlatformShipment[] } = {
  'amazon-fba': [],
  'flipkart-fbf': [],
  'myntra-sjit': [],
  'zepto-po': [],
  'nykaa-po': [],
};

let currentUser = { id: 'user_1', companyId: 'company_1' };

const simulateApi = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

/**
 * Get all shipments for a platform
 */
export const getPlatformShipments = async (
  companyId: string,
  platform: Platform,
  filters?: {
    status?: ShipmentStatus;
    trackingId?: string;
    awb?: string;
    carrier?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<PlatformShipment[]> => {
  console.log(`Fetching ${platform} shipments with filters:`, filters);
  
  let results = mockShipments[platform].filter(s => s.companyId === companyId);
  
  if (filters) {
    if (filters.status) {
      results = results.filter(s => s.status === filters.status);
    }
    if (filters.trackingId) {
      results = results.filter(s => 
        s.trackingId?.toLowerCase().includes(filters.trackingId!.toLowerCase())
      );
    }
    if (filters.awb) {
      results = results.filter(s => 
        s.awb?.toLowerCase().includes(filters.awb!.toLowerCase())
      );
    }
    if (filters.carrier) {
      results = results.filter(s => 
        s.carrier?.toLowerCase().includes(filters.carrier!.toLowerCase())
      );
    }
    if (filters.startDate) {
      results = results.filter(s => s.createdAt >= filters.startDate!);
    }
    if (filters.endDate) {
      results = results.filter(s => s.createdAt <= filters.endDate!);
    }
  }
  
  return simulateApi(results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
};

/**
 * Get all shipments across all platforms
 */
export const getAllPlatformShipments = async (
  companyId: string,
  filters?: {
    platform?: Platform;
    status?: ShipmentStatus;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<PlatformShipment[]> => {
  let allShipments: PlatformShipment[] = [];
  
  const platforms: Platform[] = filters?.platform 
    ? [filters.platform]
    : ['amazon-fba', 'flipkart-fbf', 'myntra-sjit', 'zepto-po', 'nykaa-po'];
  
  for (const platform of platforms) {
    const shipments = await getPlatformShipments(companyId, platform, filters);
    allShipments = [...allShipments, ...shipments];
  }
  
  return allShipments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

/**
 * Create a new shipment for a platform
 */
export const createPlatformShipment = async (
  companyId: string,
  platform: Platform,
  data: {
    shipmentName: string;
    trackingId?: string;
    awb?: string;
    carrier?: string;
    items: FbaShipmentItem[];
    notes?: string;
  }
): Promise<PlatformShipment> => {
  console.log(`Creating ${platform} shipment:`, data.shipmentName);
  
  // Validate items
  if (!data.items || data.items.length === 0) {
    throw new Error('Shipment must have at least one item');
  }
  
  for (const item of data.items) {
    if (!item.sku || !item.productId || item.quantity <= 0) {
      throw new Error(`Invalid item: ${item.sku}`);
    }
    if (!item.warehouseId) {
      throw new Error(`Warehouse is required for SKU: ${item.sku}`);
    }
  }
  
  const shipment: PlatformShipment = {
    id: `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    companyId,
    platform,
    shipmentName: data.shipmentName,
    trackingId: data.trackingId,
    awb: data.awb,
    carrier: data.carrier,
    status: ShipmentStatus.Created,
    items: data.items,
    notes: data.notes,
    createdBy: currentUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockShipments[platform].push(shipment);
  console.log('Shipment created:', shipment.id);
  
  return simulateApi(shipment);
};

/**
 * Deduct shipment - Creates outward entries and updates stock
 */
export const deductPlatformShipment = async (
  platform: Platform,
  shipmentId: string,
  options?: {
    partialItems?: { sku: string; quantity: number }[];
  }
): Promise<PlatformShipment> => {
  console.log(`Deducting ${platform} shipment:`, shipmentId);
  
  const shipment = mockShipments[platform].find(s => s.id === shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  if (shipment.status === ShipmentStatus.Deducted) {
    throw new Error('Shipment already deducted');
  }
  
  // Determine which items to deduct
  let itemsToDeduct = shipment.items;
  if (options?.partialItems) {
    itemsToDeduct = shipment.items
      .map(item => {
        const partial = options.partialItems!.find(p => p.sku === item.sku);
        if (partial) {
          return { ...item, quantity: Math.min(partial.quantity, item.quantity) };
        }
        return null;
      })
      .filter(Boolean) as FbaShipmentItem[];
  }
  
  // Validate stock availability using actual stock data
  const products = await getProducts();
  const stockErrors: string[] = [];
  
  for (const item of itemsToDeduct) {
    const product = products.find(p => p.sku === item.sku);
    if (!product) {
      stockErrors.push(`${item.sku}: Product not found`);
      continue;
    }
    
    const availableStock = getProductStock(product.id, item.warehouseId, shipment.companyId);
    if (availableStock < item.quantity) {
      stockErrors.push(`${item.sku}: need ${item.quantity}, available ${availableStock}`);
    }
  }
  
  if (stockErrors.length > 0) {
    throw new Error(`Insufficient stock:\n${stockErrors.join('\n')}`);
  }
  
  // Create outward entries (one by one to use existing validation)
  try {
    const channelMap: { [key in Platform]: string } = {
      'amazon-fba': 'amazon-fba',
      'flipkart-fbf': 'flipkart-fbf',
      'myntra-sjit': 'myntra-sjit',
      'zepto-po': 'zepto',
      'nykaa-po': 'nykaa',
    };
    
    // Create outward for each item
    for (const item of itemsToDeduct) {
      const product = products.find(p => p.sku === item.sku);
      if (!product) continue;
      
      await addOutward({
        companyId: shipment.companyId,
        productId: product.id,
        sku: item.sku,
        ean: item.ean,
        quantity: item.quantity,
        warehouseId: item.warehouseId,
        destination: getPlatformDisplayName(platform),
        channel: channelMap[platform],
        source: 'FBA_SHIPMENT',
        referenceId: shipmentId,
        shipmentRef: shipment.trackingId || shipment.awb,
        notes: `Deducted from ${getPlatformDisplayName(platform)} shipment: ${shipment.shipmentName}`,
      });
    }
    
    // Update shipment status
    shipment.status = ShipmentStatus.Deducted;
    shipment.deductedAt = new Date();
    shipment.deductedBy = currentUser.id;
    shipment.updatedAt = new Date();
    
    console.log('Shipment deducted successfully:', shipmentId);
    
    return simulateApi(shipment);
  } catch (error) {
    console.error('Failed to deduct shipment:', error);
    throw error;
  }
};

/**
 * Get platform display name
 */
export const getPlatformDisplayName = (platform: Platform): string => {
  const names: { [key in Platform]: string } = {
    'amazon-fba': 'Amazon FBA',
    'flipkart-fbf': 'Flipkart FBF',
    'myntra-sjit': 'Myntra SJIT',
    'zepto-po': 'Zepto PO',
    'nykaa-po': 'Nykaa PO',
  };
  return names[platform];
};

/**
 * Update shipment details
 */
export const updatePlatformShipment = async (
  platform: Platform,
  shipmentId: string,
  updates: Partial<Pick<PlatformShipment, 'shipmentName' | 'trackingId' | 'awb' | 'carrier' | 'notes' | 'items'>>
): Promise<PlatformShipment> => {
  const shipment = mockShipments[platform].find(s => s.id === shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  if (shipment.status === ShipmentStatus.Deducted) {
    throw new Error('Cannot update deducted shipment');
  }
  
  Object.assign(shipment, updates, { updatedAt: new Date() });
  
  return simulateApi(shipment);
};

/**
 * Delete shipment
 */
export const deletePlatformShipment = async (
  platform: Platform,
  shipmentId: string
): Promise<void> => {
  const shipmentIndex = mockShipments[platform].findIndex(s => s.id === shipmentId);
  if (shipmentIndex === -1) {
    throw new Error('Shipment not found');
  }
  
  const shipment = mockShipments[platform][shipmentIndex];
  if (shipment.status === ShipmentStatus.Deducted) {
    throw new Error('Cannot delete deducted shipment. Outward entries already created.');
  }
  
  mockShipments[platform].splice(shipmentIndex, 1);
  
  return simulateApi(undefined);
};

// Export mock data setters for testing
export const _setCurrentUser = (user: { id: string; companyId: string }) => {
  currentUser = user;
};

export const _addMockShipment = (platform: Platform, shipment: PlatformShipment) => {
  mockShipments[platform].push(shipment);
};
