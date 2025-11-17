
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
} from '../types';

// --- MOCK DATABASE ---
const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@aura.com', role: Role.Admin, isEnabled: true, createdAt: new Date() },
  { id: '2', name: 'Manager User', email: 'manager@aura.com', role: Role.Manager, isEnabled: true, createdAt: new Date() },
  { id: '3', name: 'Warehouse Staff', email: 'staff@aura.com', role: Role.WarehouseStaff, isEnabled: true, createdAt: new Date() },
  { id: '4', name: 'Viewer User', email: 'viewer@aura.com', role: Role.Viewer, isEnabled: false, createdAt: new Date() },
];

const products: Product[] = [
  {
    id: 'prod_1', sku: 'AS-HS-50ML', name: 'Aura Glow Hair Serum', imageUrl: 'https://picsum.photos/id/106/200',
    category: ProductCategory.HairCare, unit: ProductUnit.Ml, mrp: 599, costPrice: 150, batchTracking: true,
    lowStockThreshold: 50, createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: 'prod_2', sku: 'AS-FS-30ML', name: 'Radiant Face Serum', imageUrl: 'https://picsum.photos/id/111/200',
    category: ProductCategory.FaceCare, unit: ProductUnit.Ml, mrp: 899, costPrice: 220, batchTracking: true,
    lowStockThreshold: 30, createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: 'prod_3', sku: 'AS-BC-200G', name: 'Hydrating Body Cream', imageUrl: 'https://picsum.photos/id/115/200',
    category: ProductCategory.BodyCare, unit: ProductUnit.G, mrp: 450, costPrice: 120, batchTracking: false,
    lowStockThreshold: 100, createdAt: new Date(), updatedAt: new Date()
  }
];

const warehouses: Warehouse[] = [
    { id: 'wh_1', name: 'Mumbai WH', location: 'Mumbai, Maharashtra', createdAt: new Date() },
    { id: 'wh_2', name: 'Delhi WH', location: 'Delhi, NCR', createdAt: new Date() }
];

const activities: ActivityLog[] = [
    {id: 'act_1', userId: '1', userName: 'Admin User', type: ActivityType.ProductCreated, referenceId: 'prod_3', details: 'Created new product AS-BC-200G', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    {id: 'act_2', userId: '2', userName: 'Manager User', type: ActivityType.InwardCreated, referenceId: 'in_1', details: 'Inwarded 500 units of AS-HS-50ML', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    {id: 'act_3', userId: '3', userName: 'Warehouse Staff', type: ActivityType.OutwardCreated, referenceId: 'out_1', details: 'Outwarded 150 units of AS-FS-30ML to Amazon FBA', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    {id: 'act_4', userId: '1', userName: 'Admin User', type: ActivityType.UserUpdated, referenceId: '4', details: 'Disabled user viewer@aura.com', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
];


let currentUser: User | null = null;
const SESSION_KEY = 'aura_inventory_user';

// --- MOCK AUTH FUNCTIONS ---
export const mockLogin = (email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      if (user && pass === 'password123') { // Simple password check for mock
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
    return simulateApi(newProduct);
};
export const updateProduct = (id: string, data: Partial<Product>) => {
    const prodIndex = products.findIndex(p => p.id === id);
    if (prodIndex > -1) {
        products[prodIndex] = { ...products[prodIndex], ...data, updatedAt: new Date() };
        return simulateApi(products[prodIndex]);
    }
    return Promise.reject('Product not found');
};


// Warehouses
export const getWarehouses = () => simulateApi(warehouses);
export const addWarehouse = (data: Partial<Warehouse>) => {
    const newWarehouse: Warehouse = {
        id: `wh_${Date.now()}`,
        name: data.name!,
        location: data.location!,
        createdAt: new Date()
    };
    warehouses.push(newWarehouse);
    return simulateApi(newWarehouse);
}
export const updateWarehouse = (id: string, data: Partial<Warehouse>) => {
    const whIndex = warehouses.findIndex(w => w.id === id);
    if (whIndex > -1) {
        warehouses[whIndex] = { ...warehouses[whIndex], ...data };
        return simulateApi(warehouses[whIndex]);
    }
    return Promise.reject('Warehouse not found');
}

// Inward
export const addInward = (data: Partial<Inward>) => {
    const newInward: Inward = {
        id: `in_${Date.now()}`,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        ...data
    } as Inward;
    // In real app, this would trigger a cloud function to update stock
    console.log("Adding inward:", newInward);
    return simulateApi(newInward);
};

// Outward
export const addOutward = (data: Partial<Outward>) => {
     // In real app, check for sufficient stock before proceeding
    const newOutward: Outward = {
        id: `out_${Date.now()}`,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        ...data
    } as Outward;
    console.log("Adding outward:", newOutward);
    return simulateApi(newOutward);
};

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
     console.log("Adding adjustment:", newAdjustment);
    return simulateApi(newAdjustment);
}

// Dashboard
export const getDashboardData = () => {
    const data = {
        summary: {
            totalStockValue: 1855000,
            totalUnits: 12500,
            todaysInward: 350,
            todaysOutward: 120,
            lowStockItems: 2,
            activeSKUs: 3,
        },
        inwardOutwardTrend: [
            { name: 'Mon', inward: 400, outward: 240 },
            { name: 'Tue', inward: 300, outward: 139 },
            { name: 'Wed', inward: 200, outward: 980 },
            { name: 'Thu', inward: 278, outward: 390 },
            { name: 'Fri', inward: 189, outward: 480 },
            { name: 'Sat', inward: 239, outward: 380 },
            { name: 'Sun', inward: 349, outward: 430 },
        ],
        channelWiseOutward: [
            { name: OutwardDestination.AmazonFba, value: 400 },
            { name: OutwardDestination.Flipkart, value: 300 },
            { name: OutwardDestination.Meesho, value: 300 },
            { name: OutwardDestination.OfflineStore, value: 200 },
        ],
        stockByWarehouse: warehouses.map(w => ({ name: w.name, value: Math.floor(Math.random() * 10000)})),
        topSKUsByStock: products,
        recentActivities: activities.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }
    return simulateApi(data);
};

// --- MOCK REPORT FUNCTIONS ---
export const getFullStockReport = (format: 'csv' | 'xlsx') => {
    // Simulate report data
    const data = products.map(p => ({
        sku: p.sku,
        name: p.name,
        stock: Math.floor(Math.random() * 1000),
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)].name
    }));
    return simulateApi(data);
};

export const getInwardReport = (format: 'csv' | 'xlsx') => {
    // Simulate inward data
    const data = [
        { sku: 'AS-HS-50ML', quantity: 500, date: '2025-11-01', warehouse: 'Mumbai WH' },
        { sku: 'AS-FS-30ML', quantity: 300, date: '2025-11-02', warehouse: 'Delhi WH' }
    ];
    return simulateApi(data);
};

export const getOutwardReport = (format: 'csv' | 'xlsx') => {
    // Simulate outward data
    const data = [
        { sku: 'AS-FS-30ML', quantity: 150, date: '2025-11-03', destination: 'Amazon FBA' },
        { sku: 'AS-BC-200G', quantity: 100, date: '2025-11-04', destination: 'Offline Store' }
    ];
    return simulateApi(data);
};

export const getBatchExpiryReport = (format: 'csv' | 'xlsx') => {
    // Simulate batch expiry data
    const data = [
        { sku: 'AS-HS-50ML', batch: 'BATCH001', expiry: '2026-01-15' },
        { sku: 'AS-FS-30ML', batch: 'BATCH002', expiry: '2025-12-10' }
    ];
    return simulateApi(data);
};

export const getSkuMovementReport = (format: 'csv' | 'xlsx') => {
    // Simulate SKU movement data
    const data = [
        { sku: 'AS-HS-50ML', movement: 'Inward', quantity: 500, date: '2025-11-01' },
        { sku: 'AS-HS-50ML', movement: 'Outward', quantity: 200, date: '2025-11-05' }
    ];
    return simulateApi(data);
};

export const getWarehouseStockReport = (format: 'csv' | 'xlsx') => {
    // Simulate warehouse stock data
    const data = warehouses.map(w => ({
        warehouse: w.name,
        stock: Math.floor(Math.random() * 10000)
    }));
    return simulateApi(data);
};
