/**
 * FBA Service - Manages Amazon FBA Shipments
 * Handles shipment creation, deduction, and tracking
 */

import { FbaShipment, FbaShipmentItem, ShipmentStatus } from '../types';
import { applyOutwardBatch, validateStockAvailability } from '../utils/stockUtils';

// MOCK DATABASE
let mockShipments: FbaShipment[] = [];
let currentUser = { id: 'user_1', companyId: 'company_1' };

/**
 * Simulate API delay
 */
const simulateApi = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

/**
 * Get all FBA shipments for a company
 * @param companyId Company ID
 * @param filters Optional filters
 * @returns List of shipments
 */
export const getShipments = async (
  companyId: string,
  filters?: {
    status?: ShipmentStatus;
    trackingId?: string;
    awb?: string;
    carrier?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<FbaShipment[]> => {
  console.log('Fetching FBA shipments with filters:', filters);
  
  let results = mockShipments.filter(s => s.companyId === companyId);
  
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
 * Get a single shipment by ID
 * @param shipmentId Shipment ID
 * @returns Shipment details
 */
export const getShipmentById = async (shipmentId: string): Promise<FbaShipment | null> => {
  const shipment = mockShipments.find(s => s.id === shipmentId);
  return simulateApi(shipment || null);
};

/**
 * Create a new FBA shipment (does NOT deduct stock)
 * @param companyId Company ID
 * @param data Shipment data
 * @returns Created shipment
 */
export const createShipment = async (
  companyId: string,
  data: {
    shipmentName: string;
    trackingId?: string;
    awb?: string;
    carrier?: string;
    items: FbaShipmentItem[];
    notes?: string;
  }
): Promise<FbaShipment> => {
  console.log('Creating FBA shipment:', data.shipmentName);
  
  // Validate items
  if (!data.items || data.items.length === 0) {
    throw new Error('Shipment must have at least one item');
  }
  
  for (const item of data.items) {
    if (!item.sku || !item.productId || item.quantity <= 0) {
      throw new Error(`Invalid item: ${item.sku}`);
    }
  }
  
  const shipment: FbaShipment = {
    id: `fba_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    companyId,
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
  
  mockShipments.push(shipment);
  console.log('Shipment created:', shipment.id);
  
  return simulateApi(shipment);
};

/**
 * Deduct shipment - Creates outward entries and updates stock
 * This is the critical operation that moves stock out
 * @param shipmentId Shipment ID
 * @param options Deduction options
 * @returns Updated shipment
 */
export const deductShipment = async (
  shipmentId: string,
  options?: {
    partialItems?: { sku: string; quantity: number }[]; // Allow partial deduction
  }
): Promise<FbaShipment> => {
  console.log('Deducting FBA shipment:', shipmentId);
  
  const shipment = mockShipments.find(s => s.id === shipmentId);
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
  
  // Validate stock availability
  const validation = await validateStockAvailability(
    shipment.companyId,
    itemsToDeduct.map(i => ({ 
      sku: i.sku, 
      quantity: i.quantity, 
      warehouseId: i.warehouseId 
    }))
  );
  
  if (!validation.valid) {
    const errors = validation.errors
      .map(e => `${e.sku}: need ${e.required}, available ${e.available}`)
      .join('\n');
    throw new Error(`Insufficient stock:\n${errors}`);
  }
  
  // Create outward entries (atomic operation)
  try {
    await applyOutwardBatch(
      shipment.companyId,
      itemsToDeduct,
      {
        source: 'FBA_SHIPMENT',
        referenceId: shipmentId,
        channel: 'amazon-fba',
        destination: 'Amazon FBA',
        createdBy: currentUser.id,
      }
    );
    
    // Update shipment status
    shipment.status = ShipmentStatus.Deducted;
    shipment.deductedAt = new Date();
    shipment.deductedBy = currentUser.id;
    shipment.updatedAt = new Date();
    
    console.log('Shipment deducted successfully:', shipmentId);
    
    // In real implementation, also create audit log
    // await createAuditLog({ action: 'deduct-fba-shipment', ...})
    
    return simulateApi(shipment);
  } catch (error) {
    console.error('Failed to deduct shipment:', error);
    throw error;
  }
};

/**
 * Update shipment details (only for non-deducted shipments)
 * @param shipmentId Shipment ID
 * @param updates Updates to apply
 * @returns Updated shipment
 */
export const updateShipment = async (
  shipmentId: string,
  updates: Partial<Pick<FbaShipment, 'shipmentName' | 'trackingId' | 'awb' | 'carrier' | 'notes' | 'items'>>
): Promise<FbaShipment> => {
  const shipment = mockShipments.find(s => s.id === shipmentId);
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
 * Cancel a shipment (only for non-deducted)
 * @param shipmentId Shipment ID
 * @returns Updated shipment
 */
export const cancelShipment = async (shipmentId: string): Promise<FbaShipment> => {
  const shipment = mockShipments.find(s => s.id === shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  if (shipment.status === ShipmentStatus.Deducted) {
    throw new Error('Cannot cancel deducted shipment');
  }
  
  shipment.status = ShipmentStatus.Cancelled;
  shipment.updatedAt = new Date();
  
  return simulateApi(shipment);
};

/**
 * Delete a shipment (only for created status)
 * @param shipmentId Shipment ID
 */
export const deleteShipment = async (shipmentId: string): Promise<void> => {
  const shipment = mockShipments.find(s => s.id === shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  if (shipment.status === ShipmentStatus.Deducted) {
    throw new Error('Cannot delete deducted shipment. Outward entries already created.');
  }
  
  mockShipments = mockShipments.filter(s => s.id !== shipmentId);
  
  return simulateApi(undefined);
};

// Export for testing
export const _setMockShipments = (shipments: FbaShipment[]) => {
  mockShipments = shipments;
};

export const _setCurrentUser = (user: { id: string; companyId: string }) => {
  currentUser = user;
};
