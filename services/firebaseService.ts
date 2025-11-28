
import {
  User,
  Role,
  Product,
  ProductCategory,
  ProductUnit,
  Warehouse,
  Inward,
  Outward,
  Adjustment,
  ActivityLog,
  ActivityType,
  OutwardDestination,
  InwardSource,
} from '../types';
import { getSources } from './sourceService';

// --- MOCK DATABASE ---
const users: User[] = [
  { id: '1', name: 'Super Admin', email: 'superadmin@aura.com', role: Role.SuperAdmin, isEnabled: true, createdAt: new Date(), updatedAt: new Date() },
];

const products: Product[] = [];

const warehouses: Warehouse[] = [];

const activities: ActivityLog[] = [];


let currentUser: User | null = null;
const SESSION_KEY = 'aura_inventory_user';
const STORAGE_KEYS = {
  PRODUCTS: 'aura_inventory_products',
  WAREHOUSES: 'aura_inventory_warehouses',
  INWARD: 'aura_inventory_inward',
  OUTWARD: 'aura_inventory_outward',
  ADJUSTMENTS: 'aura_inventory_adjustments',
  ACTIVITIES: 'aura_inventory_activities',
  CATEGORIES: 'aura_inventory_categories',
  COURIER_PARTNERS: 'aura_inventory_courier_partners',
};

// Clean up corrupted outward data on load
const cleanCorruptedOutwardData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.OUTWARD);
        if (stored) {
            const records = JSON.parse(stored);
            let hasCorruptedData = false;
            
            const cleanedRecords = records.map((record: any) => {
                // Fix corrupted destination fields with long IDs
                if (record.destination && record.destination.startsWith('src_') && record.destination.length > 20) {
                    hasCorruptedData = true;
                    console.log('🔧 Cleaning corrupted destination:', record.destination);
                    
                    // Try to map back to proper names
                    if (record.destination.toLowerCase().includes('meesho')) {
                        record.destination = 'Meesho';
                    } else if (record.destination.toLowerCase().includes('amazon')) {
                        record.destination = 'Amazon FBA';
                    } else if (record.destination.toLowerCase().includes('flipkart')) {
                        record.destination = 'Flipkart';
                    } else if (record.destination.toLowerCase().includes('myntra')) {
                        record.destination = 'Myntra';
                    } else {
                        record.destination = 'Amazon FBA'; // Default fallback
                    }
                    console.log('✅ Fixed to:', record.destination);
                }
                return record;
            });
            
            // Only update if we found corrupted data
            if (hasCorruptedData) {
                localStorage.setItem(STORAGE_KEYS.OUTWARD, JSON.stringify(cleanedRecords));
                console.log('🎯 Successfully cleaned corrupted outward data!');
            }
        }
    } catch (error) {
        console.error('❌ Error cleaning outward data:', error);
    }
};

// Clear all localStorage data for fresh start
const clearAllStorageData = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('superadmin_companies');
        localStorage.removeItem('superadmin_users');
        console.log('🧹 Cleared all localStorage data for fresh deployment');
    } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
    }
};

// Run cleanup immediately on module load
clearAllStorageData(); // Clear all data for deployment
cleanCorruptedOutwardData();

// Helper functions for localStorage persistence
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// --- MOCK AUTH FUNCTIONS ---
export const mockLogin = (email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      
      // Check password based on user
      let validPassword = false;
      if (email === 'Test@orgatre.com' && pass === 'Test@1234') {
        validPassword = true;
      } else if (email === 'superadmin@aura.com' && pass === 'SuperAdmin@123') {
        validPassword = true;
      } else if (pass === 'password123') {
        validPassword = true;
      }
      
      if (user && validPassword) {
        if (!user.isEnabled) {
            reject(new Error("Your account is disabled. Please contact an administrator."));
        } else {
            currentUser = user;
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            resolve(user);
        }
      } else {
        reject(new Error("Invalid email or password"));
      }
    }, 1000);
  });
};

export const mockLogout = (): Promise<void> => {
    return new Promise(resolve => {
        currentUser = null;
        localStorage.removeItem(SESSION_KEY);
        resolve();
    });
}

export const mockFetchUser = (): Promise<User> => {
    return new Promise((resolve, reject) => {
        const userJson = localStorage.getItem(SESSION_KEY);
        if (userJson) {
            currentUser = JSON.parse(userJson);
            resolve(currentUser as User);
        } else {
            reject();
        }
    });
};


// --- MOCK API FUNCTIONS ---
const simulateApi = <T,>(data: T, delay = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));
};

// Users
export const getUsers = () => simulateApi(users);
export const addUser = (data: Partial<User>) => {
    const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name || 'New User',
        email: data.email || '',
        role: data.role || Role.Viewer,
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    users.push(newUser);
    return simulateApi(newUser);
};
export const updateUser = (id: string, data: Partial<User>) => {
    const userIndex = users.findIndex(u => u.id === id);
    if(userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...data };
        return simulateApi(users[userIndex]);
    }
    return Promise.reject('User not found');
};


// Products
export const getProducts = () => simulateApi(products);
export const addProduct = (data: Partial<Product>) => {
    const newProduct: Product = {
        id: `prod_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
    } as Product;
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return simulateApi(newProduct);
};
export const updateProduct = (id: string, data: Partial<Product>) => {
    const prodIndex = products.findIndex(p => p.id === id);
    if (prodIndex > -1) {
        products[prodIndex] = { ...products[prodIndex], ...data, updatedAt: new Date() };
        saveToStorage(STORAGE_KEYS.PRODUCTS, products);
        return simulateApi(products[prodIndex]);
    }
    return Promise.reject('Product not found');
};

// Bulk Product Upload
export interface BulkUploadResult {
    imported: Product[];
    failed: Array<{ product: Partial<Product>; error: string }>;
    duplicates: Array<{ product: Partial<Product>; existingSKU: string }>;
    summary: {
        total: number;
        successful: number;
        failed: number;
        duplicates: number;
    };
}

export const checkExistingSKUs = (skus: string[]): Promise<string[]> => {
    // Check which SKUs already exist in the database
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingSKUs = skus.filter(sku => 
                products.some(p => p.sku.toLowerCase() === sku.toLowerCase())
            );
            resolve(existingSKUs);
        }, 300);
    });
};

export const addProductsBatch = async (productsData: Partial<Product>[]): Promise<BulkUploadResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result: BulkUploadResult = {
                imported: [],
                failed: [],
                duplicates: [],
                summary: {
                    total: productsData.length,
                    successful: 0,
                    failed: 0,
                    duplicates: 0,
                },
            };

            productsData.forEach((productData) => {
                try {
                    // Check for duplicate SKU
                    const existingProduct = products.find(
                        p => p.sku.toLowerCase() === productData.sku!.toLowerCase()
                    );

                    if (existingProduct) {
                        result.duplicates.push({
                            product: productData,
                            existingSKU: existingProduct.sku,
                        });
                        result.summary.duplicates++;
                    } else {
                        // Add the product
                        const newProduct: Product = {
                            id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            ...productData,
                        } as Product;

                        products.push(newProduct);
                        result.imported.push(newProduct);
                        result.summary.successful++;
                        saveToStorage(STORAGE_KEYS.PRODUCTS, products);
                    }
                } catch (error) {
                    result.failed.push({
                        product: productData,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    result.summary.failed++;
                }
            });

            resolve(result);
        }, 1000); // Simulate API delay
    });
};


// Stock tracking in memory with localStorage persistence
interface StockRecord {
    productId: string;
    warehouseId: string;
    quantity: number;
}

const stockRecords: StockRecord[] = [];

// Custom categories management
let customCategories: string[] = loadFromStorage<string[]>(STORAGE_KEYS.CATEGORIES, ['Hair Care', 'Skin Care', 'Face Care', 'Body Care']);

export const getCategories = () => simulateApi(customCategories);
export const addCategory = (categoryName: string) => {
  if (!customCategories.includes(categoryName)) {
    customCategories.push(categoryName);
    saveToStorage(STORAGE_KEYS.CATEGORIES, customCategories);
  }
  return simulateApi(customCategories);
};
export const deleteCategory = (categoryName: string) => {
  customCategories = customCategories.filter(c => c !== categoryName);
  saveToStorage(STORAGE_KEYS.CATEGORIES, customCategories);
  return simulateApi(customCategories);
};

// Courier partners management
let courierPartners: string[] = loadFromStorage<string[]>(STORAGE_KEYS.COURIER_PARTNERS, ['Delhivery', 'Blue Dart', 'DTDC', 'Ecom Express', 'Xpressbees', 'Self Delivery']);

export const getCourierPartners = () => simulateApi(courierPartners);
export const addCourierPartner = (partnerName: string) => {
  if (!courierPartners.includes(partnerName)) {
    courierPartners.push(partnerName);
    saveToStorage(STORAGE_KEYS.COURIER_PARTNERS, courierPartners);
  }
  return simulateApi(courierPartners);
};
export const deleteCourierPartner = (partnerName: string) => {
  courierPartners = courierPartners.filter(c => c !== partnerName);
  saveToStorage(STORAGE_KEYS.COURIER_PARTNERS, courierPartners);
  return simulateApi(courierPartners);
};

// Load persisted data from localStorage
let inwardRecords: Inward[] = [];
let outwardRecords: Outward[] = [];
let adjustmentRecords: Adjustment[] = [];

// Initialize products and warehouses from localStorage or use defaults
const initProducts = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
if (initProducts.length > 0) {
  products.length = 0;
  products.push(...initProducts);
}

const initWarehouses = loadFromStorage<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
if (initWarehouses.length > 0) {
  warehouses.length = 0;
  warehouses.push(...initWarehouses);
}

// Mock Orders data - using outward as sales orders
const generateMockOrders = () => {
    const today = new Date();
    const todayOrders = [];
    
    // Generate some random orders for today
    const channels = ['Amazon FBA', 'Flipkart', 'Meesho', 'Offline Store', 'Myntra'];
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    
    products.slice(0, 3).forEach((product, idx) => {
        hours.forEach((hour, hourIdx) => {
            if (Math.random() > 0.5) { // 50% chance of sale in each hour
                const orderTime = new Date(today);
                orderTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
                
                todayOrders.push({
                    id: `order_${Date.now()}_${idx}_${hourIdx}`,
                    companyId: 'demo-company-001',
                    productId: product.id,
                    sku: product.sku,
                    productName: product.name,
                    quantity: Math.floor(Math.random() * 10) + 1,
                    channel: channels[Math.floor(Math.random() * channels.length)],
                    orderRef: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    warehouseId: warehouses[Math.floor(Math.random() * warehouses.length)].id,
                    timestamp: orderTime,
                    createdBy: currentUser?.id || 'system',
                    createdAt: orderTime,
                });
            }
        });
    });
    
    return todayOrders;
};

let ordersCache: any[] = [];

// Custom Sources and Destinations
let customInwardSources: string[] = [...Object.values(InwardSource)];
let customOutwardDestinations: string[] = [...Object.values(OutwardDestination)];

export const getInwardSources = () => simulateApi(customInwardSources);
export const addInwardSource = (source: string) => {
    if (!customInwardSources.includes(source)) {
        customInwardSources.push(source);
    }
    return simulateApi(customInwardSources);
};
export const removeInwardSource = (source: string) => {
    customInwardSources = customInwardSources.filter(s => s !== source);
    return simulateApi(customInwardSources);
};

export const getOutwardDestinations = () => simulateApi(customOutwardDestinations);
export const addOutwardDestination = (destination: string) => {
    if (!customOutwardDestinations.includes(destination)) {
        customOutwardDestinations.push(destination);
    }
    return simulateApi(customOutwardDestinations);
};
export const removeOutwardDestination = (destination: string) => {
    customOutwardDestinations = customOutwardDestinations.filter(d => d !== destination);
    return simulateApi(customOutwardDestinations);
};

// Stock calculation
export const getProductStock = (productId: string, warehouseId?: string, companyId?: string) => {
    let totalInward = 0;
    let totalOutward = 0;
    let totalAdjustment = 0;

    inwardRecords.forEach(record => {
        if (record.productId === productId) {
            // Filter by companyId if provided
            if (companyId && record.companyId !== companyId) return;
            if (!warehouseId || record.warehouseId === warehouseId) {
                totalInward += record.quantity;
            }
        }
    });

    outwardRecords.forEach(record => {
        if (record.productId === productId) {
            // Filter by companyId if provided
            if (companyId && record.companyId !== companyId) return;
            if (!warehouseId || record.warehouseId === warehouseId) {
                totalOutward += record.quantity;
            }
        }
    });

    adjustmentRecords.forEach(record => {
        if (record.productId === productId && record.approved) {
            // Filter by companyId if provided
            if (companyId && record.companyId !== companyId) return;
            if (!warehouseId || record.warehouseId === warehouseId) {
                totalAdjustment += record.quantity;
            }
        }
    });

    return totalInward - totalOutward + totalAdjustment;
};

export const getAllProductStocks = () => {
    const stockMap: { [productId: string]: { total: number; byWarehouse: { [whId: string]: number } } } = {};

    products.forEach(product => {
        stockMap[product.id] = {
            total: getProductStock(product.id),
            byWarehouse: {}
        };
        
        warehouses.forEach(wh => {
            const whStock = getProductStock(product.id, wh.id);
            if (whStock > 0) {
                stockMap[product.id].byWarehouse[wh.id] = whStock;
            }
        });
    });

    return simulateApi(stockMap);
};

// Warehouses
export const getWarehouses = () => simulateApi(warehouses);
export const addWarehouse = (data: Partial<Warehouse>) => {
    const newWarehouse: Warehouse = {
        id: `wh_${Date.now()}`,
        name: data.name!,
        location: data.location!,
        createdAt: new Date(),
        companyId: 'demo-company-001',
        isActive: true,
        createdBy: currentUser?.id || 'unknown',
        updatedAt: new Date()
    };
    warehouses.push(newWarehouse);
    saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses);
    return simulateApi(newWarehouse);
}
export const updateWarehouse = (id: string, data: Partial<Warehouse>) => {
    const whIndex = warehouses.findIndex(w => w.id === id);
    if (whIndex > -1) {
        warehouses[whIndex] = { ...warehouses[whIndex], ...data };
        saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses);
        return simulateApi(warehouses[whIndex]);
    }
    return Promise.reject('Warehouse not found');
}

export const deleteWarehouse = async (id: string, reason: string) => {
    const whIndex = warehouses.findIndex(w => w.id === id);
    if (whIndex === -1) {
        return Promise.reject('Warehouse not found');
    }
    
    // In production, check stock using warehouseHasStock utility
    // For now, just remove it
    warehouses.splice(whIndex, 1);
    
    // Create audit log
    activities.push({
        id: `act_${Date.now()}`,
        companyId: 'demo-company-001',
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'Unknown',
        type: ActivityType.WarehouseUpdated,
        referenceId: id,
        details: `Deleted warehouse. Reason: ${reason}`,
        createdAt: new Date(),
    });
    
    return simulateApi(true, 200); // Reduced delay to 200ms for faster response
};

// Inward
export const addInward = (data: Partial<Inward>) => {
    const newInward: Inward = {
        id: `in_${Date.now()}`,
        companyId: data.companyId || 'demo-company-001',
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        transactionDate: new Date(),
        ...data
    } as Inward;
    inwardRecords.push(newInward);
    saveToStorage(STORAGE_KEYS.INWARD, inwardRecords);
    console.log("Adding inward:", newInward);
    return simulateApi(newInward);
};

export const getInwardRecords = () => simulateApi(inwardRecords);

// Outward
export const addOutward = (data: Partial<Outward>) => {
    // Check for sufficient stock with companyId
    const companyId = data.companyId || 'demo-company-001';
    const currentStock = getProductStock(data.productId!, data.warehouseId, companyId);
    if (currentStock < data.quantity!) {
        return Promise.reject(new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${data.quantity}`));
    }
    
    const newOutward: Outward = {
        id: `out_${Date.now()}`,
        companyId: companyId,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        transactionDate: new Date(),
        ...data
    } as Outward;
    outwardRecords.push(newOutward);
    saveToStorage(STORAGE_KEYS.OUTWARD, outwardRecords);
    console.log("Adding outward:", newOutward);
    return simulateApi(newOutward);
};

export const getOutwardRecords = () => simulateApi(outwardRecords);

// Adjustment
export const addAdjustment = (data: Partial<Adjustment>) => {
    const newAdjustment: Adjustment = {
        id: `adj_${Date.now()}`,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        requiresApproval: data.quantity! < 0,
        approved: !(data.quantity! < 0),
        ...data
    } as Adjustment;
    adjustmentRecords.push(newAdjustment);
    saveToStorage(STORAGE_KEYS.ADJUSTMENTS, adjustmentRecords);
    console.log("Adding adjustment:", newAdjustment);
    return simulateApi(newAdjustment);
}

export const getAdjustmentRecords = () => simulateApi(adjustmentRecords);

// Today's Sales Analytics
export const getTodaysSalesData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Use real outward records as sales data (instead of mock orders)
    const todaysOutward = outwardRecords.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= today && recordDate < tomorrow;
    });
    
    // Calculate total sold today from real outward records
    const totalSoldToday = todaysOutward.reduce((sum, record) => sum + record.quantity, 0);
    
    // Hourly sales from real outward data
    const hourlySales: { [key: string]: number } = {};
    for (let hour = 0; hour <= 23; hour++) {
        hourlySales[`${hour}:00`] = 0;
    }
    
    todaysOutward.forEach(record => {
        const hour = new Date(record.createdAt).getHours();
        const hourKey = `${hour}:00`;
        hourlySales[hourKey] = (hourlySales[hourKey] || 0) + record.quantity;
    });
    
    const hourlySalesData = Object.entries(hourlySales)
        .filter(([_, qty]) => qty > 0)
        .map(([hour, quantity]) => ({
            hour,
            quantity,
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    
    // Top 5 SKUs sold today from real data
    const skuSales: { [sku: string]: { name: string; quantity: number } } = {};
    todaysOutward.forEach(record => {
        const product = products.find(p => p.id === record.productId);
        if (!skuSales[record.sku]) {
            skuSales[record.sku] = { 
                name: product?.name || record.sku, 
                quantity: 0 
            };
        }
        skuSales[record.sku].quantity += record.quantity;
    });
    
    const topSKUs = Object.entries(skuSales)
        .map(([sku, data]) => ({ sku, name: data.name, quantity: data.quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    // Channel-wise breakdown from real outward destinations with proper names
    const companyId = currentUser?.companyId || 'default';
    const outwardSources = await getSources(companyId, 'outward');
    const channelSales: { [channel: string]: number } = {};
    
    todaysOutward.forEach(record => {
        const destinationId = record.destination || 'Others';
        const source = outwardSources.find(s => s.id === destinationId);
        const channel = source ? source.name : 'Others';
        if (!channelSales[channel]) {
            channelSales[channel] = 0;
        }
        channelSales[channel] += record.quantity;
    });
    
    const channelBreakdown = Object.entries(channelSales).map(([name, value]) => ({
        name,
        value,
    }));
    
    // Transform outward records to order format for compatibility
    const todaysOrders = todaysOutward.map(record => {
        const product = products.find(p => p.id === record.productId);
        return {
            id: record.id,
            companyId: record.companyId,
            productId: record.productId,
            sku: record.sku,
            productName: product?.name || record.sku,
            quantity: record.quantity,
            channel: record.destination || 'Others',
            orderRef: record.shipmentRef,
            warehouseId: record.warehouseId,
            timestamp: record.createdAt,
            createdBy: record.createdBy,
            createdAt: record.createdAt,
        };
    });
    
    return simulateApi({
        totalSoldToday,
        hourlySalesData,
        topSKUs,
        channelBreakdown,
        todaysOrders,
    });
};

// Dashboard
export const getDashboardData = async () => {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate real inward and outward for today
    const todaysInward = inwardRecords.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= today && recordDate < tomorrow;
    }).reduce((sum, record) => sum + record.quantity, 0);
    
    const todaysOutward = outwardRecords.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= today && recordDate < tomorrow;
    }).reduce((sum, record) => sum + record.quantity, 0);
    
    // Today's sales = Today's outward (real data, not mock)
    const todaysSales = todaysOutward;
    
    // Calculate total stock units and value
    let totalUnits = 0;
    let totalStockValue = 0;
    
    // Group by SKU to calculate stock
    const stockBySku = new Map<string, number>();
    
    // Add inward quantities
    inwardRecords.forEach(record => {
        const current = stockBySku.get(record.sku) || 0;
        stockBySku.set(record.sku, current + record.quantity);
    });
    
    // Subtract outward quantities
    outwardRecords.forEach(record => {
        const current = stockBySku.get(record.sku) || 0;
        stockBySku.set(record.sku, current - record.quantity);
    });
    
    // Calculate total units and value
    stockBySku.forEach((qty, sku) => {
        if (qty > 0) {
            totalUnits += qty;
            const product = products.find(p => p.sku === sku);
            if (product) {
                totalStockValue += qty * product.costPrice;
            }
        }
    });
    
    // Calculate low stock items
    const lowStockItems = products.filter(product => {
        const stock = stockBySku.get(product.sku) || 0;
        return stock > 0 && stock <= product.lowStockThreshold;
    }).length;
    
    // Active SKUs (products with stock > 0)
    const activeSKUs = Array.from(stockBySku.values()).filter(qty => qty > 0).length;
    
    // Calculate expiring items (products with batches expiring within 6 months)
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    sixMonthsFromNow.setHours(23, 59, 59, 999);
    const expiringSkus = new Set<string>();
    
    console.log('Dashboard Expiring Calculation:');
    console.log('Today:', today.toLocaleDateString());
    console.log('Six months from now:', sixMonthsFromNow.toLocaleDateString());
    console.log('Total inward records:', inwardRecords.length);
    
    inwardRecords.forEach(record => {
        if (record.expDate) {
            const expDate = new Date(record.expDate);
            expDate.setHours(0, 0, 0, 0);
            const stock = stockBySku.get(record.sku) || 0;
            
            console.log('Checking record:', {
                sku: record.sku,
                ean: record.ean,
                expDateRaw: record.expDate,
                expDateParsed: expDate.toLocaleDateString(),
                stock,
                expDate_vs_today: expDate > today,
                expDate_vs_sixMonths: expDate <= sixMonthsFromNow,
                willShow: expDate <= sixMonthsFromNow && expDate > today && stock > 0
            });
            
            if (expDate <= sixMonthsFromNow && expDate > today && stock > 0) {
                console.log('✓ Found expiring item:', {
                    sku: record.sku,
                    ean: record.ean,
                    expDate: expDate.toLocaleDateString(),
                    stock,
                    daysToExpiry: Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                });
                expiringSkus.add(record.sku);
            }
        }
    });
    
    console.log('Total expiring SKUs:', expiringSkus.size);
    const expiringItems = expiringSkus.size;
    
    // Calculate inward/outward trend for last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const inwardOutwardTrend = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayInward = inwardRecords.filter(record => {
            const recordDate = new Date(record.createdAt);
            return recordDate >= date && recordDate < nextDate;
        }).reduce((sum, record) => sum + record.quantity, 0);
        
        const dayOutward = outwardRecords.filter(record => {
            const recordDate = new Date(record.createdAt);
            return recordDate >= date && recordDate < nextDate;
        }).reduce((sum, record) => sum + record.quantity, 0);
        
        inwardOutwardTrend.push({
            name: days[date.getDay()],
            inward: dayInward,
            outward: dayOutward
        });
    }
    
    // Calculate channel-wise outward with proper source names
    const channelOutwardMap = new Map<string, number>();
    const companyId = currentUser?.companyId || 'default';
    const outwardSources = await getSources(companyId, 'outward');
    
    console.log('=== CHANNEL WISE OUTWARD DEBUG ===');
    console.log('Dashboard - currentUser:', currentUser);
    console.log('Dashboard - companyId:', companyId);
    console.log('Dashboard - outwardSources:', outwardSources);
    console.log('Dashboard - outwardRecords sample:', outwardRecords.slice(0, 3));
    
    outwardRecords.forEach(record => {
        let destination = 'Unknown';
        
        // First check if destination is already a readable name
        if (record.destination && !record.destination.startsWith('src_')) {
            destination = record.destination;
        } else {
            // Find the source by ID
            const source = outwardSources.find(s => s.id === record.destination);
            if (source) {
                destination = source.name;
            } else {
                // Fallback - try to find by partial ID match or use default mapping
                if (record.destination?.includes('meesho') || record.destination?.toLowerCase().includes('meesho')) {
                    destination = 'Meesho';
                } else if (record.destination?.includes('amazon') || record.destination?.toLowerCase().includes('amazon')) {
                    destination = 'Amazon FBA';
                } else if (record.destination?.includes('flipkart') || record.destination?.toLowerCase().includes('flipkart')) {
                    destination = 'Flipkart';
                } else if (record.destination?.includes('myntra') || record.destination?.toLowerCase().includes('myntra')) {
                    destination = 'Myntra';
                } else {
                    destination = record.destination || 'Unknown';
                }
            }
        }
        
        console.log('Dashboard - Processed outward:', {
            recordId: record.id,
            originalDestination: record.destination,
            finalDestination: destination,
            quantity: record.quantity
        });
        
        const current = channelOutwardMap.get(destination) || 0;
        channelOutwardMap.set(destination, current + record.quantity);
    });
    
    console.log('Dashboard - Final channelOutwardMap:', Array.from(channelOutwardMap.entries()));
    
    const channelWiseOutward = Array.from(channelOutwardMap.entries()).map(([name, value]) => ({
        name,
        value
    }));
    
    // Add default chart data if no outward records exist OR if all destinations are corrupted IDs
    const hasValidData = channelWiseOutward.some(item => 
        !item.name.startsWith('src_') && item.name !== 'Unknown'
    );
    
    if (channelWiseOutward.length === 0 || !hasValidData) {
        channelWiseOutward.length = 0; // Clear any corrupted data
        channelWiseOutward.push(
            { name: 'Amazon FBA', value: 400 },
            { name: 'Flipkart', value: 300 },
            { name: 'Meesho', value: 250 },
            { name: 'Myntra', value: 200 }
        );
    }
    
    // Calculate stock by warehouse
    const warehouseStockMap = new Map<string, number>();
    inwardRecords.forEach(record => {
        const current = warehouseStockMap.get(record.warehouseId) || 0;
        warehouseStockMap.set(record.warehouseId, current + record.quantity);
    });
    outwardRecords.forEach(record => {
        const current = warehouseStockMap.get(record.warehouseId) || 0;
        warehouseStockMap.set(record.warehouseId, current - record.quantity);
    });
    
    const stockByWarehouse = warehouses.map(w => ({
        name: w.name,
        value: warehouseStockMap.get(w.id) || 0
    }));
    
    // Get top SKUs by stock
    const topSKUsByStock = Array.from(stockBySku.entries())
        .filter(([_, qty]) => qty > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([sku, qty]) => {
            const product = products.find(p => p.sku === sku);
            if (product) {
                return { ...product, stockQuantity: qty };
            }
            return null;
        })
        .filter(p => p !== null) as (Product & { stockQuantity: number })[];
    
    // Prepare product inventory for pie chart (top 10 products by stock)
    const productInventory = Array.from(stockBySku.entries())
        .filter(([_, qty]) => qty > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([sku, qty]) => {
            const product = products.find(p => p.sku === sku);
            return {
                name: product?.name || sku,
                inHandQty: qty
            };
        });
    
    const data = {
        summary: {
            totalStockValue,
            totalUnits,
            todaysInward,
            todaysOutward,
            todaysSales,
            lowStockItems,
            expiringItems,
            activeSKUs,
        },
        inwardOutwardTrend,
        channelWiseOutward,
        stockByWarehouse,
        topSKUsByStock,
        productInventory,
        recentActivities: activities.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }
    return simulateApi(data);
};

// --- MOCK REPORT FUNCTIONS ---
export const getFullStockReport = (format: 'csv' | 'xlsx') => {
    // Generate real stock report data
    const reportData: any[] = [];
    
    products.forEach(product => {
        warehouses.forEach(warehouse => {
            const stock = getProductStock(product.id, warehouse.id);
            if (stock > 0) {
                // Get earliest expiry date for this product in this warehouse
                const relevantBatches = inwardRecords.filter(
                    r => r.productId === product.id && r.warehouseId === warehouse.id && r.expDate
                );
                const earliestExpiry = relevantBatches.length > 0
                    ? new Date(Math.min(...relevantBatches.map(r => new Date(r.expDate).getTime())))
                    : null;
                const daysToExpiry = earliestExpiry
                    ? Math.ceil((earliestExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                
                reportData.push({
                    SKU: product.sku,
                    'Product Name': product.name,
                    Category: product.category,
                    Warehouse: warehouse.name,
                    'Available Stock': stock,
                    'Expiry Date': earliestExpiry ? earliestExpiry.toLocaleDateString('en-IN') : '-',
                    'Days to Expiry': daysToExpiry !== null ? daysToExpiry : '-',
                    'Expiry Status': daysToExpiry === null ? '-' : daysToExpiry < 0 ? 'Expired' : daysToExpiry < 30 ? 'Expiring Soon' : 'Active',
                    MRP: product.mrp,
                    'Cost Price': product.costPrice,
                    'Stock Value': stock * product.costPrice
                });
            }
        });
    });
    
    return simulateApi(reportData);
};

export const getInwardReport = (format: 'csv' | 'xlsx') => {
    // Generate real inward report
    const data = inwardRecords.map(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        const daysToExpiry = record.expDate
            ? Math.ceil((new Date(record.expDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;
        
        return {
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            'Invoice/Ref No': record.documentNo || '-',
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Quantity: record.quantity,
            'Batch No': record.batchNo || '-',
            'Mfg Date': record.mfgDate ? new Date(record.mfgDate).toLocaleDateString('en-IN') : '-',
            'Expiry Date': record.expDate ? new Date(record.expDate).toLocaleDateString('en-IN') : '-',
            'Days to Expiry': daysToExpiry !== null ? daysToExpiry : '-',
            'Expiry Status': daysToExpiry === null ? '-' : daysToExpiry < 0 ? 'Expired' : daysToExpiry < 30 ? 'Expiring Soon' : 'Active',
            'Cost Price': record.costPrice,
            'Total Value': record.quantity * record.costPrice,
            Warehouse: warehouse?.name || 'Unknown',
            Source: record.source,
            Notes: record.notes || '-'
        };
    });
    return simulateApi(data);
};

export const getOutwardReport = async (format: 'csv' | 'xlsx') => {
    // Generate real outward report with proper destination names
    const outwardSources = await getSources('default', 'outward');
    
    const data = outwardRecords.map(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        const destinationId = record.destination;
        const source = outwardSources.find(s => s.id === destinationId);
        const destinationName = source ? source.name : destinationId;
        
        return {
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Quantity: record.quantity,
            Warehouse: warehouse?.name || 'Unknown',
            Destination: destinationName,
            'Courier Partner': record.courierPartner || '-',
            'Shipment Ref': record.shipmentRef || '-',
            Channel: record.channel || '-',
            Notes: record.notes || '-'
        };
    });
    return simulateApi(data);
};

export const getBatchExpiryReport = (format: 'csv' | 'xlsx') => {
    // Generate real batch expiry report from inward records with batch-wise quantity
    const data = inwardRecords
        .filter(record => record.batchNo && record.expDate)
        .map(record => {
            const product = products.find(p => p.id === record.productId);
            const warehouse = warehouses.find(w => w.id === record.warehouseId);
            const daysToExpiry = Math.ceil((new Date(record.expDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const monthsToExpiry = Math.floor(daysToExpiry / 30);
            
            return {
                SKU: record.sku,
                'Product Name': product?.name || 'Unknown',
                'Batch No': record.batchNo,
                'Batch Quantity': record.quantity,
                'Mfg Date': new Date(record.mfgDate).toLocaleDateString('en-IN'),
                'Expiry Date': new Date(record.expDate).toLocaleDateString('en-IN'),
                'Months to Expiry': monthsToExpiry,
                Warehouse: warehouse?.name || 'Unknown',
                Status: daysToExpiry < 0 ? 'Expired' : monthsToExpiry <= 6 ? 'Expiring Soon (≤6 months)' : 'Active'
            };
        })
        .sort((a, b) => a['Months to Expiry'] - b['Months to Expiry']); // Sort by expiry date
    
    return simulateApi(data);
};

export const getSkuMovementReport = (format: 'csv' | 'xlsx') => {
    // Generate real SKU movement report from all inward and outward records
    const movements: any[] = [];
    
    // Add all inward movements
    inwardRecords.forEach(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        movements.push({
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Movement: 'Inward',
            Quantity: record.quantity,
            'Batch No': record.batchNo || '-',
            'Cost Price': record.costPrice,
            Warehouse: warehouse?.name || 'Unknown',
            'Source/Destination': record.source,
            Reference: record.documentNo || '-'
        });
    });
    
    // Add all outward movements
    outwardRecords.forEach(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        movements.push({
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Movement: 'Outward',
            Quantity: record.quantity,
            'Batch No': '-',
            'Cost Price': '-',
            Warehouse: warehouse?.name || 'Unknown',
            'Source/Destination': record.destination,
            Reference: record.shipmentRef || '-'
        });
    });
    
    // Sort by date (most recent first)
    movements.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    
    return simulateApi(movements);
};

export const getWarehouseStockReport = (format: 'csv' | 'xlsx') => {
    // Generate real warehouse stock report
    const reportData: any[] = [];
    
    warehouses.forEach(warehouse => {
        let totalStock = 0;
        let totalValue = 0;
        const productDetails: any[] = [];
        
        products.forEach(product => {
            const stock = getProductStock(product.id, warehouse.id);
            if (stock > 0) {
                totalStock += stock;
                totalValue += stock * product.costPrice;
                productDetails.push({
                    Warehouse: warehouse.name,
                    Location: warehouse.location,
                    SKU: product.sku,
                    'Product Name': product.name,
                    Category: product.category,
                    'Available Stock': stock,
                    'Cost Price': product.costPrice,
                    MRP: product.mrp,
                    'Stock Value': stock * product.costPrice
                });
            }
        });
        
        reportData.push(...productDetails);
    });
    
    return simulateApi(reportData);
};
