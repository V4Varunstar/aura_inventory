import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { ToastProvider, useToast } from './context/ToastContext';
import WarehouseSelector from './components/ui/WarehouseSelector';
import {
  getOutwardRecords,
  getProducts,
  getInwardRecords,
  addProductsBatch,
  addProduct,
  updateProduct,
  getWarehouses,
  addWarehouse,
  updateWarehouse,
} from './services/firebaseService';
import { getParties, addParty, updateParty, deleteParty } from './services/partyService';
import SuperAdminRoute from './components/auth/SuperAdminRoute';
import * as XLSX from 'xlsx';
import './index.css';

// Used by index.html bootstrap to detect whether the entry module executed
(window as any).__AURA_ENTRY_EXECUTED__ = true;

// Lazy-load Super Admin UI to avoid blocking /login if any SA chunk fails
const SuperAdminLayout = React.lazy(() => import('./components/layout/SuperAdminLayout'));
const SuperAdminDashboard = React.lazy(() => import('./pages/super-admin/Dashboard'));
const SuperAdminCompanies = React.lazy(() => import('./pages/super-admin/Companies'));
const SuperAdminUsers = React.lazy(() => import('./pages/super-admin/Users'));
const SuperAdminSubscriptions = React.lazy(() => import('./pages/super-admin/Subscriptions'));
const SuperAdminActivityLogs = React.lazy(() => import('./pages/super-admin/ActivityLogs'));
const SuperAdminSettings = React.lazy(() => import('./pages/super-admin/Settings'));

// Error Boundary (prevents silent blank screens in production)
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  declare state: { hasError: boolean; error: Error | null };
  declare props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('❌ App crashed:', error, info);

    // If a user has a stale cached bundle, dynamic imports can fail after a new deploy.
    // Recover by forcing a one-time hard reload with a cache-busting query parameter.
    try {
      const msg = String((error as any)?.message || '');
      const isChunkFailure =
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk');

      if (isChunkFailure) {
        const flag = '__AURA_CHUNK_RECOVERY_ATTEMPTED__';
        if (!sessionStorage.getItem(flag)) {
          sessionStorage.setItem(flag, '1');
          const url =
            window.location.origin +
            window.location.pathname +
            `?reload=${Date.now()}` +
            window.location.hash;
          window.location.replace(url);
        }
      }
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0b1220',
          color: '#e2e8f0',
          fontFamily: 'system-ui',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }}>
          <div style={{ maxWidth: 720, width: '100%' }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ opacity: 0.85, marginBottom: 16 }}>
              The app hit an unexpected error. Please reload.
            </div>
            <pre style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: 16,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#6366f1',
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Reload
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('aura_inventory_user');
                    localStorage.removeItem('aura_inventory_user_backup');
                  } finally {
                    window.location.href = window.location.origin + '/';
                  }
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'transparent',
                  color: '#e2e8f0',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Clear Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const renderBootstrapError = (message: string) => {
  try {
    const rootEl = document.getElementById('root');
    if (!rootEl) return;
    rootEl.innerHTML = `
      <div style="min-height:100vh;background:#0b1220;color:#e2e8f0;font-family:system-ui;display:flex;align-items:center;justify-content:center;padding:24px">
        <div style="max-width:760px;width:100%">
          <div style="font-size:20px;font-weight:800;margin-bottom:8px">App failed to start</div>
          <div style="opacity:0.85;margin-bottom:16px">A startup error occurred (often a failed JS chunk load). Please reload.</div>
          <pre style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:16px;white-space:pre-wrap;overflow-x:auto">${String(
            message || 'Unknown error'
          )}</pre>
          <div style="display:flex;gap:12px;margin-top:16px">
            <button onclick="window.location.reload()" style="padding:10px 16px;border-radius:10px;border:none;background:#6366f1;color:white;font-weight:800;cursor:pointer">Reload</button>
            <button onclick="localStorage.removeItem('aura_inventory_user');localStorage.removeItem('aura_inventory_user_backup');window.location.reload()" style="padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.18);background:transparent;color:#e2e8f0;font-weight:800;cursor:pointer">Clear Session</button>
          </div>
        </div>
      </div>
    `;
  } catch {
    // ignore
  }
};

const tryChunkRecoveryReload = (message: string) => {
  try {
    const msg = String(message || '');
    const isChunkFailure =
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('ChunkLoadError') ||
      msg.includes('Loading chunk');
    if (!isChunkFailure) return false;

    const flag = '__AURA_CHUNK_RECOVERY_ATTEMPTED__';
    if (sessionStorage.getItem(flag)) return false;
    sessionStorage.setItem(flag, '1');

    const url =
      window.location.origin +
      window.location.pathname +
      `?reload=${Date.now()}` +
      window.location.hash;
    window.location.replace(url);
    return true;
  } catch {
    return false;
  }
};

// Catch module-load / chunk-load failures that happen before React mounts
window.addEventListener('error', (event) => {
  const anyEvent = event as any;
  const msg = anyEvent?.error?.message || anyEvent?.message || 'Unknown error';
  console.error('❌ Global error:', event);
  if (!tryChunkRecoveryReload(msg)) {
    renderBootstrapError(msg);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const anyEvent = event as any;
  const msg = anyEvent?.reason?.message || String(anyEvent?.reason || 'Unhandled promise rejection');
  console.error('❌ Unhandled rejection:', event);
  if (!tryChunkRecoveryReload(msg)) {
    renderBootstrapError(msg);
  }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (loading) return;
    if (user) {
      if (user.role === 'SuperAdmin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',fontFamily:'system-ui',color:'white'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'36px',height:'36px',border:'3px solid rgba(255,255,255,0.35)',borderTopColor:'#ffffff',borderRadius:'999px',margin:'0 auto 12px',animation:'spin 1s linear infinite'}} />
          <div style={{fontSize:'14px',fontWeight:700}}>Restoring session…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',fontFamily:'system-ui',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{maxWidth:'800px',textAlign:'center',color:'white'}}>
        <h1 style={{fontSize:'48px',fontWeight:'bold',marginBottom:'20px'}}>Aura Inventory</h1>
        <p style={{fontSize:'20px',marginBottom:'40px',opacity:0.9}}>Complete Inventory Management System</p>
        <button onClick={()=>navigate('/login')} style={{padding:'16px 48px',background:'white',color:'#667eea',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
          Get Started
        </button>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  React.useEffect(() => {
    if (authLoading) return;
    if (user) {
      if (user.role === 'SuperAdmin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      addToast('Login successful!', 'success');
      if (loggedInUser.role === 'SuperAdmin') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#e2e8f0',fontFamily:'system-ui',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px',background:'white',padding:'40px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize:'32px',fontWeight:'bold',textAlign:'center',marginBottom:'8px',color:'#667eea'}}>Aura Inventory</h1>
        <p style={{textAlign:'center',color:'#64748b',marginBottom:'32px'}}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#374151'}}>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={{width:'100%',padding:'12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',color:'#111827',background:'#f8fafc'}} placeholder="admin@test.com" />
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#374151'}}>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required style={{width:'100%',padding:'12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',color:'#111827',background:'#f8fafc'}} placeholder="Admin@123" />
          </div>
          <button type="submit" disabled={loading} style={{width:'100%',padding:'12px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'600',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'24px',fontSize:'13px',color:'#64748b'}}>
          Test: admin@test.com / Admin@123
        </p>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const { addToast } = useToast();
  const { refreshWarehouses } = useWarehouse();

  const SIMPLE_INWARD_KEY = 'aura_inventory_simple_inward_entries';
  const SIMPLE_OUTWARD_KEY = 'aura_inventory_simple_outward_entries';

  const DEFAULT_SUPPLIERS: any[] = [
    {id:1,name:'ABC Suppliers',contact:'Rajesh Kumar',phone:'+91 9876543210',email:'rajesh@abc.com'},
    {id:2,name:'XYZ Distributors',contact:'Amit Shah',phone:'+91 9876543211',email:'amit@xyz.com'},
    {id:3,name:'Global Imports',contact:'Priya Sharma',phone:'+91 9876543212',email:'priya@global.com'}
  ];

  const SIMPLE_SUPPLIERS_KEY = React.useMemo(() => {
    const anyUser = user as any;
    const scope = user?.orgId || anyUser?.companyId || user?.id || 'default';
    return `aura_inventory_simple_suppliers_${scope}`;
  }, [user]);

  const readArrayFromStorage = (key: string): any[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const [darkMode, setDarkMode] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [activeView, setActiveView] = React.useState('main');
  const [formData, setFormData] = React.useState<any>({});
  const [isImporting, setIsImporting] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>(['Electronics', 'Clothing', 'Footwear', 'Accessories', 'Stationery', 'Bags', 'Food & Beverages']);
  const [platforms, setPlatforms] = React.useState<any[]>([
    {id:1,name:'Amazon',color:'#FF9900',enabled:true},
    {id:2,name:'Flipkart',color:'#2874F0',enabled:true},
    {id:3,name:'Myntra',color:'#D4145A',enabled:true},
    {id:4,name:'Meesho',color:'#9C1AB1',enabled:true},
    {id:5,name:'Retail',color:'#10B981',enabled:true}
  ]);
  const [suppliers, setSuppliers] = React.useState<any[]>(() => {
    const stored = readArrayFromStorage(SIMPLE_SUPPLIERS_KEY);
    return stored.length ? stored : DEFAULT_SUPPLIERS;
  });
  const [lineItems, setLineItems] = React.useState<any[]>([{id: 1, ean: '', productName: '', sku: '', quantity: '', batch: ''}]);
  const [userProducts, setUserProducts] = React.useState<any>({});
  const [inwardEntries, setInwardEntries] = React.useState<any[]>(() => readArrayFromStorage(SIMPLE_INWARD_KEY));
  const [outwardEntries, setOutwardEntries] = React.useState<any[]>(() => readArrayFromStorage(SIMPLE_OUTWARD_KEY));
  const [products, setProducts] = React.useState<any[]>([]);
  const [realOutwardRecords, setRealOutwardRecords] = React.useState<any[]>([]);
  const [realProducts, setRealProducts] = React.useState<any[]>([]);
  const [realInwardRecords, setRealInwardRecords] = React.useState<any[]>([]);
  const [parties, setParties] = React.useState<any[]>([]);
  const [partiesLoading, setPartiesLoading] = React.useState(false);

  const [viewProductsPage, setViewProductsPage] = React.useState(1);
  const VIEW_PRODUCTS_PAGE_SIZE = 25;

  const normalizeSku = React.useCallback((sku: any) => {
    return String(sku ?? '').trim().toLowerCase();
  }, []);

  // Single source of truth for SKU-based counts on the dashboard.
  // - excludes soft-deleted rows
  // - dedupes by SKU (prevents duplicates inflating Low Stock > Total)
  const skuProducts = React.useMemo(() => {
    const map = new Map<string, any>();
    (realProducts || []).forEach((p: any) => {
      if (!p || p.isDeleted === true) return;
      const key = normalizeSku(p.sku);
      if (!key) return;
      if (!map.has(key)) map.set(key, p);
    });
    return Array.from(map.values());
  }, [realProducts, normalizeSku]);

  const lowStockSkuProducts = React.useMemo(() => {
    return skuProducts.filter((p: any) => {
      const qty = Number.parseFloat(String(p?.quantity ?? '0')) || 0;
      const threshold =
        Number.parseFloat(String(p?.lowStockThreshold ?? p?.minThreshold ?? p?.minStockThreshold ?? 10)) || 10;
      return qty < threshold;
    });
  }, [skuProducts]);

  const viewAllProductsItems = skuProducts;
  const viewProductsTotalPages = Math.max(1, Math.ceil(viewAllProductsItems.length / VIEW_PRODUCTS_PAGE_SIZE));
  const viewProductsPageSafe = Math.min(Math.max(1, viewProductsPage), viewProductsTotalPages);
  const viewProductsStart = (viewProductsPageSafe - 1) * VIEW_PRODUCTS_PAGE_SIZE;
  const viewProductsEnd = Math.min(viewAllProductsItems.length, viewProductsStart + VIEW_PRODUCTS_PAGE_SIZE);
  const viewProductsPageItems = React.useMemo(
    () => viewAllProductsItems.slice(viewProductsStart, viewProductsEnd),
    [viewAllProductsItems, viewProductsStart, viewProductsEnd]
  );

  React.useEffect(() => {
    // Keep pagination valid as data changes.
    setViewProductsPage(1);
  }, [viewAllProductsItems.length]);

  const handleExportAllProductsToExcel = React.useCallback(() => {
    if (!viewAllProductsItems || viewAllProductsItems.length === 0) {
      addToast('ℹ️ No products to export', 'info');
      return;
    }

    try {
      const rows = viewAllProductsItems.map((p: any) => {
        const qty = Number.parseFloat(String(p?.quantity ?? '0')) || 0;
        const threshold =
          Number.parseFloat(String(p?.lowStockThreshold ?? p?.minThreshold ?? p?.minStockThreshold ?? '')) || '';
        const mrp = Number(p?.mrp ?? p?.price ?? 0);
        const costPrice = p?.costPrice !== undefined ? Number(p.costPrice) : '';
        const sellingPrice = p?.sellingPrice !== undefined ? Number(p.sellingPrice) : '';
        const gst = p?.gstPercentage !== undefined ? Number(p.gstPercentage) : '';

        return {
          SKU: p?.sku ?? '',
          Name: p?.name ?? '',
          EAN: p?.ean ?? '',
          Category: p?.category ?? '',
          Unit: p?.unit ?? '',
          'MRP (₹)': Number.isFinite(mrp) ? mrp : '',
          'Cost Price (₹)': Number.isFinite(costPrice as any) ? costPrice : costPrice,
          'Selling Price (₹)': Number.isFinite(sellingPrice as any) ? sellingPrice : sellingPrice,
          'GST %': Number.isFinite(gst as any) ? gst : gst,
          'Low Stock Threshold': threshold,
          Stock: qty,
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      const fileDate = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `All_Products_${fileDate}.xlsx`);
      addToast(`✅ Exported ${viewAllProductsItems.length} products`, 'success');
    } catch (e) {
      console.error('Export failed:', e);
      addToast('❌ Failed to export products', 'error');
    }
  }, [addToast, viewAllProductsItems]);

  const [settingsWarehouses, setSettingsWarehouses] = React.useState<any[]>([]);
  const [settingsWarehousesLoading, setSettingsWarehousesLoading] = React.useState(false);

  const refreshSettingsWarehouses = React.useCallback(async () => {
    setSettingsWarehousesLoading(true);
    try {
      const fetched = await getWarehouses();
      setSettingsWarehouses(Array.isArray(fetched) ? fetched : []);
    } catch (e) {
      console.error('Failed to load warehouses:', e);
      addToast('Failed to load warehouses', 'error');
      setSettingsWarehouses([]);
    } finally {
      setSettingsWarehousesLoading(false);
    }
  }, [addToast]);

  const refreshAllWarehouses = React.useCallback(async () => {
    await refreshSettingsWarehouses();
    try {
      await refreshWarehouses();
    } catch {
      // ignore
    }
  }, [refreshSettingsWarehouses, refreshWarehouses]);

  const goToWarehouseConfig = React.useCallback(() => {
    setActiveView('warehouse-config');
    setFormData({});
  }, []);

  const handleCreateWarehouse = React.useCallback(async () => {
    const name = String(formData.warehouseName || '').trim();
    const location = String(formData.warehouseLocation || '').trim();
    const address = String(formData.address || '').trim();

    if (!name || !location) {
      addToast('❌ Please fill warehouse name and location', 'error');
      return;
    }

    try {
      await addWarehouse({
        name,
        location,
        address: address || undefined,
        status: 'Active',
      });
      await refreshAllWarehouses();
      addToast(`✅ Warehouse "${name}" added successfully!`, 'success');
      goToWarehouseConfig();
    } catch (e) {
      console.error('Failed to create warehouse:', e);
      addToast('Failed to add warehouse', 'error');
    }
  }, [addToast, formData, goToWarehouseConfig, refreshAllWarehouses]);

  const handleUpdateWarehouse = React.useCallback(async () => {
    const id = String(formData.warehouseId || '').trim();
    const name = String(formData.warehouseName || '').trim();
    const location = String(formData.warehouseLocation || '').trim();
    const address = String(formData.address || '').trim();
    const status = String(formData.warehouseStatus || 'Active').trim() || 'Active';

    if (!id) {
      addToast('Warehouse not found', 'error');
      return;
    }
    if (!name || !location) {
      addToast('❌ Please fill warehouse name and location', 'error');
      return;
    }

    try {
      await updateWarehouse(id, {
        name,
        location,
        address: address || undefined,
        status,
      });
      await refreshAllWarehouses();
      addToast(`✅ Warehouse "${name}" updated successfully!`, 'success');
      goToWarehouseConfig();
    } catch (e) {
      console.error('Failed to update warehouse:', e);
      addToast('Failed to update warehouse', 'error');
    }
  }, [addToast, formData, goToWarehouseConfig, refreshAllWarehouses]);
  
  // Load real data from database
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [outwardData, productsData, inwardData] = await Promise.all([
          getOutwardRecords(),
          getProducts(),
          getInwardRecords()
        ]);
        setRealOutwardRecords(outwardData);
        setRealProducts(productsData);
        setRealInwardRecords(inwardData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  const refreshParties = React.useCallback(async () => {
    setPartiesLoading(true);
    try {
      const fetched = await getParties();
      setParties(Array.isArray(fetched) ? fetched : []);
    } catch (e) {
      console.error('Failed to load parties:', e);
      addToast('Failed to load parties', 'error');
      setParties([]);
    } finally {
      setPartiesLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    if (loading) return;
    if (!user) return;
    refreshParties();
  }, [loading, user, refreshParties]);

  React.useEffect(() => {
    if (currentPage === 'settings' && activeView === 'warehouse-config') {
      refreshAllWarehouses();
    }
  }, [activeView, currentPage, refreshAllWarehouses]);

  // Persist simple (UI-only) inward/outward entries so they survive refresh
  React.useEffect(() => {
    try {
      localStorage.setItem(SIMPLE_INWARD_KEY, JSON.stringify(inwardEntries));
    } catch (e) {
      console.error('Failed to persist inward entries:', e);
    }
  }, [inwardEntries]);

  React.useEffect(() => {
    try {
      localStorage.setItem(SIMPLE_OUTWARD_KEY, JSON.stringify(outwardEntries));
    } catch (e) {
      console.error('Failed to persist outward entries:', e);
    }
  }, [outwardEntries]);

  // Load/persist suppliers so they survive logout/login (DashboardPage remount)
  React.useEffect(() => {
    const stored = readArrayFromStorage(SIMPLE_SUPPLIERS_KEY);
    setSuppliers(stored.length ? stored : DEFAULT_SUPPLIERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SIMPLE_SUPPLIERS_KEY]);

  React.useEffect(() => {
    try {
      localStorage.setItem(SIMPLE_SUPPLIERS_KEY, JSON.stringify(suppliers));
    } catch (e) {
      console.error('Failed to persist suppliers:', e);
    }
  }, [SIMPLE_SUPPLIERS_KEY, suppliers]);
  
  // EAN to Product mapping database (empty initially - products added by user)
  const eanProducts: any = {};
  
  const lookupEAN = (ean: string, lineIndex?: number) => {
    if (!ean || ean.trim() === '') {
      addToast('❌ Please enter an EAN', 'error');
      return;
    }
    
    console.log('🔍 Looking up EAN:', ean, 'in', realProducts.length, 'products');
    
    // Search in realProducts by EAN or eanNo field
    const trimmedEAN = ean.trim();
    const product = realProducts.find(p => 
      (p.ean && p.ean.trim() === trimmedEAN) || 
      (p.eanNo && p.eanNo.trim() === trimmedEAN)
    );
    
    if (product) {
      console.log('✅ Product found:', product);
      if (lineIndex !== undefined) {
        // For multiple line items
        const updatedItems = [...lineItems];
        updatedItems[lineIndex] = {
          ...updatedItems[lineIndex], 
          ean: trimmedEAN, 
          productName: product.name, 
          sku: product.sku, 
          price: product.mrp || product.price || 0
        };
        setLineItems(updatedItems);
        addToast(`✅ Product found: ${product.name}`, 'success');
      } else {
        // For single entry
        setFormData({
          ...formData, 
          ean: trimmedEAN, 
          productName: product.name, 
          sku: product.sku, 
          price: product.mrp || product.price || 0
        });
        addToast(`✅ Product found: ${product.name} (${product.sku})`, 'success');
      }
    } else {
      console.log('❌ EAN not found:', ean);
      addToast('❌ EAN not found in database', 'error');
      if (lineIndex !== undefined) {
        const updatedItems = [...lineItems];
        updatedItems[lineIndex] = {...updatedItems[lineIndex], ean: trimmedEAN, productName: '', sku: ''};
        setLineItems(updatedItems);
      } else {
        setFormData({...formData, ean: trimmedEAN, productName: '', sku: ''});
      }
    }
  };
  
  const addLineItem = () => {
    setLineItems([...lineItems, {id: lineItems.length + 1, ean: '', productName: '', sku: '', quantity: '', batch: ''}]);
  };
  
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };
  
  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {...updatedItems[index], [field]: value};
    setLineItems(updatedItems);
  };
  
  const getAllProducts = () => {
    // Return realProducts from database instead of empty eanProducts/userProducts
    // This ensures inward/outward dropdowns show all products from database
    console.log('📦 getAllProducts called, returning', realProducts.length, 'products');
    return realProducts || [];
  };
  
  const selectProductByName = (productName: string, lineIndex?: number) => {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.name === productName);
    if (product) {
      console.log('✅ Product selected:', product);
      // Update line item directly with product details
      if (lineIndex !== undefined) {
        const updatedItems = [...lineItems];
        updatedItems[lineIndex] = {
          ...updatedItems[lineIndex], 
          ean: product.ean || product.eanNo || '', 
          productName: product.name, 
          sku: product.sku, 
          price: product.mrp || product.price || 0
        };
        setLineItems(updatedItems);
        addToast(`✅ Product selected: ${product.name}`, 'success');
      } else {
        setFormData({
          ...formData, 
          ean: product.ean || product.eanNo || '', 
          productName: product.name, 
          sku: product.sku, 
          price: product.mrp || product.price || 0
        });
        addToast(`✅ Product selected: ${product.name} (${product.sku})`, 'success');
      }
    } else {
      addToast('❌ Product not found', 'error');
    }
  };
  
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const exportToExcel = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    let excelContent = '<table><thead><tr>';
    headers.forEach(h => { excelContent += `<th>${h}</th>`; });
    excelContent += '</tr></thead><tbody>';
    data.forEach(row => {
      excelContent += '<tr>';
      headers.forEach(h => { excelContent += `<td>${row[h] || ''}</td>`; });
      excelContent += '</tr>';
    });
    excelContent += '</tbody></table>';
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const handleAction = (action: string, view?: string) => {
    if (view) {
      setActiveView(view);
      addToast(`${action}`, 'success');

      if (view === 'view-products') {
        setViewProductsPage(1);
      }
    } else {
      addToast(`${action} - Feature coming soon!`, 'success');
    }
  };
  
  const resetView = () => {
    setActiveView('main');
    setFormData({});
    setLineItems([{id: 1, ean: '', productName: '', sku: '', quantity: '', batch: ''}]);
  };

  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'36px',height:'36px',border:'3px solid rgba(241,245,249,0.25)',borderTopColor:'#f1f5f9',borderRadius:'999px',margin:'0 auto 12px',animation:'spin 1s linear infinite'}} />
          <div style={{fontSize:'14px',fontWeight:700}}>Restoring session…</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  const theme = {
    bg: darkMode ? '#0f172a' : '#f1f5f9',
    cardBg: darkMode ? '#1e293b' : 'white',
    headerBg: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    sidebarBg: darkMode ? '#1e293b' : 'white',
    sidebarHover: darkMode ? '#334155' : '#f1f5f9'
  };
  
  return (
    <div style={{display:'flex',minHeight:'100vh',background:theme.bg,fontFamily:'system-ui'}}>
      {/* Sidebar */}
      <div style={{width:'260px',background:theme.sidebarBg,borderRight:`1px solid ${theme.border}`,display:'flex',flexDirection:'column'}}>
        {/* Logo */}
        <div style={{padding:'24px',borderBottom:`1px solid ${theme.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'bold',color:'white'}}>A</div>
            <span style={{fontSize:'18px',fontWeight:'bold',color:theme.text}}>Aura Inventory</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav style={{flex:1,padding:'16px',display:'flex',flexDirection:'column',gap:'4px'}}>
          {[
            {id:'dashboard',icon:'📊',name:'Dashboard'},
            {id:'products',icon:'📦',name:'Products'},
            {id:'inward',icon:'📥',name:'Inward'},
            {id:'outward',icon:'📤',name:'Outward'},
            {id:'parties',icon:'👥',name:'Parties'},
            {id:'reports',icon:'📈',name:'Reports'},
            {id:'settings',icon:'⚙️',name:'Settings'}
          ].map(item=>(
            <button
              key={item.id}
              onClick={()=>{setCurrentPage(item.id);resetView();}}
              style={{
                padding:'12px 16px',
                background:currentPage===item.id?theme.sidebarHover:'transparent',
                border:'none',
                borderRadius:'8px',
                cursor:'pointer',
                display:'flex',
                alignItems:'center',
                gap:'12px',
                color:theme.text,
                fontSize:'14px',
                fontWeight:'500',
                textAlign:'left',
                transition:'all 0.2s'
              }}
            >
              <span style={{fontSize:'20px'}}>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        
        {/* User Profile */}
        <div style={{padding:'16px',borderTop:`1px solid ${theme.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'bold',color:'white'}}>
              {user.name.charAt(0)}
            </div>
            <div style={{flex:1}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:theme.text}}>{user.name}</p>
              <p style={{fontSize:'12px',color:theme.textSecondary}}>{user.role}</p>
            </div>
          </div>
          <button onClick={()=>setDarkMode(!darkMode)} style={{width:'100%',padding:'8px',background:theme.sidebarHover,color:theme.text,border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'13px',fontWeight:'600',marginBottom:'8px'}}>
            {darkMode?'☀️':'🌙'} {darkMode?'Light':'Dark'} Mode
          </button>
          <button onClick={logout} style={{width:'100%',padding:'8px',background:'#ef4444',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{flex:1,overflow:'auto'}}>
        {/* Header */}
        <div style={{background:theme.headerBg,padding:'20px 40px',borderBottom:`1px solid ${theme.border}`}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',flexWrap:'wrap'}}>
            <div>
              <h1 style={{fontSize:'24px',fontWeight:'bold',color:theme.text,marginBottom:'4px',textTransform:'capitalize'}}>{currentPage}</h1>
              <p style={{fontSize:'14px',color:theme.textSecondary}}>Welcome back, {user.name}</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{minWidth:'180px'}}>
                <WarehouseSelector />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div style={{padding:'40px'}}>
          
          {/* Dashboard View */}
          {currentPage === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'24px',marginBottom:'40px'}}>
                {[
                  {title:'Total SKU',value:skuProducts.length.toString(),change:'+0%',icon:'📦',color:'#3b82f6',gradient:'linear-gradient(135deg, #3b82f6, #2563eb)',trend:'up',page:'products',view:''},
                  {title:"Today's Inward",value:inwardEntries.filter(e=>e.entryDate===new Date().toLocaleDateString('en-IN')).reduce((sum,e)=>sum+(parseInt(e.quantity)||0),0).toString(),change:'+12%',icon:'📥',color:'#10b981',gradient:'linear-gradient(135deg, #10b981, #059669)',trend:'up',page:'inward',view:''},
                  {title:"Today's Outward",value:outwardEntries.filter(e=>e.entryDate===new Date().toLocaleDateString('en-IN')).reduce((sum,e)=>sum+(parseInt(e.quantity)||0),0).toString(),change:'+15%',icon:'📤',color:'#f59e0b',gradient:'linear-gradient(135deg, #f59e0b, #d97706)',trend:'up',page:'outward',view:''},
                  {title:'Inventory Value',value:(()=>{const stockBySku=new Map();inwardEntries.forEach(e=>stockBySku.set(e.sku,(stockBySku.get(e.sku)||0)+(parseInt(e.quantity)||0)));outwardEntries.forEach(e=>stockBySku.set(e.sku,(stockBySku.get(e.sku)||0)-(parseInt(e.quantity)||0)));let total=0;stockBySku.forEach((qty,sku)=>{if(qty>0){const product=realProducts.find(p=>p.sku===sku);if(product){total+=qty*(parseFloat(product.costPrice)||parseFloat(product.mrp)||parseFloat(product.price)||0);}}});return total>=100000?'₹'+(total/100000).toFixed(2)+'L':total>=1000?'₹'+(total/1000).toFixed(2)+'K':'₹'+total.toFixed(0);})(),change:'+0%',icon:'💰',color:'#8b5cf6',gradient:'linear-gradient(135deg, #8b5cf6, #7c3aed)',trend:'up',page:'reports',view:''},
                  {title:'Low Stock SKU',value:lowStockSkuProducts.length.toString(),change:'-0%',icon:'⚠️',color:'#ef4444',gradient:'linear-gradient(135deg, #ef4444, #dc2626)',trend:'down',page:'reports',view:'low-stock-list'}
                ].map((stat,i)=>(
                  <div key={i} onClick={()=>{setCurrentPage(stat.page);if(stat.view){setActiveView(stat.view);}else{resetView();}addToast(`Opening ${stat.title}...`,'info');}} style={{background:theme.cardBg,padding:'26px',borderRadius:'16px',border:`2px solid ${theme.border}`,transition:'all 0.4s',cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:darkMode?'0 4px 16px rgba(0,0,0,0.3)':'0 4px 16px rgba(0,0,0,0.08)'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-8px)';e.currentTarget.style.borderColor=stat.color;e.currentTarget.style.boxShadow=`0 12px 32px ${stat.color}40`;}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.boxShadow=darkMode?'0 4px 16px rgba(0,0,0,0.3)':'0 4px 16px rgba(0,0,0,0.08)';}}>
                    <div style={{position:'absolute',top:0,right:0,width:'120px',height:'120px',background:stat.gradient,opacity:0.08,borderRadius:'50%',transform:'translate(30%, -30%)'}}></div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'18px'}}>
                      <div style={{width:'56px',height:'56px',borderRadius:'14px',background:stat.gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',boxShadow:`0 6px 20px ${stat.color}35`,animation:'pulse 2s infinite'}}>
                        {stat.icon}
                      </div>
                      <span style={{fontSize:'13px',fontWeight:'700',color:stat.trend==='up'?'#10b981':'#ef4444',background:(stat.trend==='up'?'#10b981':'#ef4444')+'15',padding:'6px 12px',borderRadius:'10px',display:'flex',alignItems:'center',gap:'4px',border:`1.5px solid ${stat.trend==='up'?'#10b981':'#ef4444'}30`}}>
                        {stat.trend==='up'?'↗':'↘'} {stat.change}
                      </span>
                    </div>
                    <p style={{fontSize:'14px',color:theme.textSecondary,marginBottom:'10px',fontWeight:'600',letterSpacing:'0.3px'}}>{stat.title}</p>
                    <p style={{fontSize:'38px',fontWeight:'900',color:theme.text,lineHeight:'1',background:stat.gradient,WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>{stat.value}</p>
                  </div>
                ))}
              </div>
          
          {/* Charts Section */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'24px',marginBottom:'40px'}}>
            {/* Sales Chart */}
            <div style={{background:theme.cardBg,padding:'28px',borderRadius:'16px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 4px 20px rgba(0,0,0,0.3)':'0 4px 20px rgba(0,0,0,0.08)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
                <div>
                  <h3 style={{fontSize:'20px',fontWeight:'800',color:theme.text,marginBottom:'6px'}}>Weekly Sales</h3>
                  <p style={{fontSize:'13px',color:theme.textSecondary}}>Last 7 days performance</p>
                </div>
                <span style={{fontSize:'13px',color:theme.textSecondary,background:theme.sidebarHover,padding:'8px 16px',borderRadius:'10px',fontWeight:'700',border:`1px solid ${theme.border}`}}>₹2.89L Total</span>
              </div>
              <div style={{display:'flex',alignItems:'flex-end',gap:'16px',height:'240px',paddingTop:'12px',position:'relative'}}>
                {[
                  {day:'Mon',value:58,sales:'₹38K',amount:38000},
                  {day:'Tue',value:42,sales:'₹28K',amount:28000},
                  {day:'Wed',value:78,sales:'₹52K',amount:52000},
                  {day:'Thu',value:65,sales:'₹43K',amount:43000},
                  {day:'Fri',value:88,sales:'₹58K',amount:58000},
                  {day:'Sat',value:52,sales:'₹35K',amount:35000},
                  {day:'Sun',value:68,sales:'₹35K',amount:35000}
                ].map((item,i)=>{
                  const colors=['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899'];
                  const gradients=['linear-gradient(to top, #3b82f6, #60a5fa)','linear-gradient(to top, #10b981, #34d399)','linear-gradient(to top, #8b5cf6, #a78bfa)','linear-gradient(to top, #f59e0b, #fbbf24)','linear-gradient(to top, #ef4444, #f87171)','linear-gradient(to top, #06b6d4, #22d3ee)','linear-gradient(to top, #ec4899, #f472b6)'];
                  return (
                    <div key={item.day} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'12px',position:'relative'}} onMouseEnter={(e)=>{const bar=e.currentTarget.querySelector('[data-bar]') as HTMLElement;const tooltip=e.currentTarget.querySelector('[data-tooltip]') as HTMLElement;if(bar){bar.style.transform='scaleY(1.05)';bar.style.opacity='1';}if(tooltip)tooltip.style.opacity='1';}} onMouseLeave={(e)=>{const bar=e.currentTarget.querySelector('[data-bar]') as HTMLElement;const tooltip=e.currentTarget.querySelector('[data-tooltip]') as HTMLElement;if(bar){bar.style.transform='scaleY(1)';bar.style.opacity='0.95';}if(tooltip)tooltip.style.opacity='0';}}>
                      <div data-tooltip style={{position:'absolute',top:'-48px',background:colors[i],color:'white',padding:'8px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:'800',opacity:0,transition:'opacity 0.3s',whiteSpace:'nowrap',zIndex:10,boxShadow:`0 4px 16px ${colors[i]}60`}}>{item.sales}</div>
                      <div data-bar style={{width:'100%',background:gradients[i],borderRadius:'12px 12px 0 0',height:`${item.value}%`,transition:'all 0.4s',cursor:'pointer',opacity:0.95,boxShadow:`0 -6px 24px ${colors[i]}30`,position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:0,left:0,right:0,height:'30%',background:'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)'}}></div>
                      </div>
                      <span style={{fontSize:'13px',color:theme.textSecondary,fontWeight:'800'}}>{item.day}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:'24px',padding:'20px',background:theme.sidebarHover,borderRadius:'14px',display:'flex',justifyContent:'space-around',border:`1px solid ${theme.border}`}}>
                <div style={{textAlign:'center'}}>
                  <p style={{fontSize:'12px',color:theme.textSecondary,marginBottom:'6px',fontWeight:'600'}}>Avg/Day</p>
                  <p style={{fontSize:'22px',fontWeight:'900',color:'#10b981'}}>₹47.9K</p>
                </div>
                <div style={{width:'1px',background:theme.border}}></div>
                <div style={{textAlign:'center'}}>
                  <p style={{fontSize:'12px',color:theme.textSecondary,marginBottom:'6px',fontWeight:'600'}}>Best Day</p>
                  <p style={{fontSize:'22px',fontWeight:'900',color:'#3b82f6'}}>Friday</p>
                </div>
                <div style={{width:'1px',background:theme.border}}></div>
                <div style={{textAlign:'center'}}>
                  <p style={{fontSize:'12px',color:theme.textSecondary,marginBottom:'6px',fontWeight:'600'}}>Growth</p>
                  <p style={{fontSize:'22px',fontWeight:'900',color:'#8b5cf6'}}>+12%</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div style={{background:theme.cardBg,padding:'28px',borderRadius:'16px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 4px 20px rgba(0,0,0,0.3)':'0 4px 20px rgba(0,0,0,0.08)'}}>
              <h3 style={{fontSize:'20px',fontWeight:'800',color:theme.text,marginBottom:'24px'}}>Quick Actions</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                {[
                  {name:'Add Product',icon:'➕',color:'#3b82f6',page:'products',gradient:'linear-gradient(135deg, #3b82f6, #2563eb)'},
                  {name:'Stock Inward',icon:'📥',color:'#10b981',page:'inward',gradient:'linear-gradient(135deg, #10b981, #059669)'},
                  {name:'Stock Outward',icon:'📤',color:'#f59e0b',page:'outward',gradient:'linear-gradient(135deg, #f59e0b, #d97706)'},
                  {name:'Reports',icon:'📄',color:'#8b5cf6',page:'reports',gradient:'linear-gradient(135deg, #8b5cf6, #7c3aed)'}
                ].map(action=>(
                  <button
                    key={action.name}
                    onClick={()=>{setCurrentPage(action.page);handleAction(`Navigated to ${action.name}`);}}
                    style={{padding:'18px 20px',background:`linear-gradient(135deg, ${action.color}12, ${action.color}05)`,border:`2px solid ${action.color}25`,borderRadius:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'16px',transition:'all 0.4s',color:theme.text,position:'relative',overflow:'hidden'}}
                    onMouseEnter={(e)=>{e.currentTarget.style.transform='translateX(8px) scale(1.02)';e.currentTarget.style.borderColor=action.color;e.currentTarget.style.background=action.gradient;e.currentTarget.style.color='white';e.currentTarget.style.boxShadow=`0 8px 24px ${action.color}40`;}}
                    onMouseLeave={(e)=>{e.currentTarget.style.transform='translateX(0) scale(1)';e.currentTarget.style.borderColor=action.color+'25';e.currentTarget.style.background=`linear-gradient(135deg, ${action.color}12, ${action.color}05)`;e.currentTarget.style.color=theme.text;e.currentTarget.style.boxShadow='none';}}
                  >
                    <div style={{width:'46px',height:'46px',borderRadius:'12px',background:action.gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0,boxShadow:`0 4px 16px ${action.color}35`}}>
                      {action.icon}
                    </div>
                    <span style={{fontSize:'15px',fontWeight:'700',flex:1}}>{action.name}</span>
                    <span style={{fontSize:'20px',transition:'all 0.3s'}}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div style={{background:theme.cardBg,padding:'28px',borderRadius:'16px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 4px 20px rgba(0,0,0,0.3)':'0 4px 20px rgba(0,0,0,0.08)'}}>
            <h3 style={{fontSize:'20px',fontWeight:'800',color:theme.text,marginBottom:'24px'}}>Recent Activity</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {[
                {action:'Product Added',item:'Face Cream 50ml • SKU: FC-50',time:'2 mins ago',icon:'📦',color:'#3b82f6',gradient:'linear-gradient(135deg, #3b82f6, #2563eb)'},
                {action:'Stock Inward',item:'50 units received • Batch #B2401',time:'1 hour ago',icon:'📥',color:'#10b981',gradient:'linear-gradient(135deg, #10b981, #059669)'},
                {action:'Stock Outward',item:'Amazon Order #AMZ-12345',time:'3 hours ago',icon:'📤',color:'#f59e0b',gradient:'linear-gradient(135deg, #f59e0b, #d97706)'},
                {action:'Low Stock Alert',item:'Hair Serum 30ml • Only 5 left',time:'5 hours ago',icon:'⚠️',color:'#ef4444',gradient:'linear-gradient(135deg, #ef4444, #dc2626)'}
              ].map((activity,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'18px',padding:'16px',borderRadius:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,transition:'all 0.3s',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateX(6px)';e.currentTarget.style.borderColor=activity.color+'60';e.currentTarget.style.boxShadow=`0 4px 16px ${activity.color}20`;}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateX(0)';e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.boxShadow='none';}} onClick={()=>handleAction(`View ${activity.action} details`)}>
                  <div style={{width:'52px',height:'52px',borderRadius:'14px',background:activity.gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0,boxShadow:`0 6px 20px ${activity.color}30`}}>
                    {activity.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'15px',fontWeight:'700',color:theme.text,marginBottom:'5px'}}>{activity.action}</p>
                    <p style={{fontSize:'13px',color:theme.textSecondary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activity.item}</p>
                  </div>
                  <span style={{fontSize:'12px',color:theme.textSecondary,fontWeight:'700',flexShrink:0,background:theme.cardBg,padding:'8px 12px',borderRadius:'10px',border:`1px solid ${theme.border}`}}>{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Analytics & Top SKUs */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginTop:'32px'}}>
            {/* Platform-wise Sales */}
            <div style={{background:theme.cardBg,padding:'32px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
              <h3 style={{fontSize:'22px',fontWeight:'900',color:theme.text,marginBottom:'24px'}}>📊 Platform-wise Sales</h3>
              {outwardEntries.length === 0 ? (
                <div style={{textAlign:'center',padding:'40px',color:theme.textSecondary}}>
                  <div style={{fontSize:'48px',marginBottom:'12px'}}>📊</div>
                  <p style={{fontSize:'16px'}}>No sales data yet</p>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                  {(() => {
                    const platformData = outwardEntries.reduce((acc, entry) => {
                      const platform = entry.platform || 'Unknown';
                      if (!acc[platform]) acc[platform] = { orders: 0, totalQty: 0 };
                      acc[platform].orders += 1;
                      acc[platform].totalQty += parseInt(entry.quantity) || 0;
                      return acc;
                    }, {} as Record<string, {orders: number, totalQty: number}>);
                    const totalOrders = (Object.values(platformData) as Array<{ orders: number; totalQty: number }>).reduce((sum, p) => sum + p.orders, 0) || 1;
                    const platforms = [
                      { platform: 'Meesho', color: '#FF006E' },
                      { platform: 'Amazon', color: '#FF9500' },
                      { platform: 'Flipkart', color: '#007AFF' },
                      { platform: 'Direct Order', color: '#34C759' }
                    ];
                    return platforms.filter(p => platformData[p.platform]).map(p => {
                      const data = platformData[p.platform];
                      const percentage = Math.round((data.orders / totalOrders) * 100);
                      return { ...p, orders: data.orders, revenue: (data.totalQty * 50 / 100000).toFixed(2) + 'L', percentage };
                    });
                  })().map(p=>(
                  <div key={p.platform}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{color:theme.text,fontWeight:'700',fontSize:'15px'}}>{p.platform}</span>
                      <span style={{color:theme.textSecondary,fontWeight:'600',fontSize:'14px'}}>{p.orders} orders · ₹{p.revenue}</span>
                    </div>
                    <div style={{background:theme.sidebarHover,height:'10px',borderRadius:'10px',overflow:'hidden',position:'relative'}}>
                      <div style={{background:`linear-gradient(90deg, ${p.color}, ${p.color}dd)`,width:`${p.percentage}%`,height:'100%',borderRadius:'10px',transition:'width 0.5s ease'}}></div>
                    </div>
                    <div style={{textAlign:'right',marginTop:'4px',color:theme.textSecondary,fontSize:'13px',fontWeight:'700'}}>{p.percentage}%</div>
                  </div>
                ))}
                </div>
              )}
            </div>

            {/* Top Performing SKUs */}
            <div style={{background:theme.cardBg,padding:'32px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
              <h3 style={{fontSize:'22px',fontWeight:'900',color:theme.text,marginBottom:'24px'}}>🏆 Top Performing SKUs</h3>
              {outwardEntries.length === 0 ? (
                <div style={{textAlign:'center',padding:'40px',color:theme.textSecondary}}>
                  <div style={{fontSize:'48px',marginBottom:'12px'}}>🏆</div>
                  <p style={{fontSize:'16px'}}>No sales data yet</p>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                  {(() => {
                    const skuData = outwardEntries.reduce((acc, entry) => {
                      const sku = entry.sku || 'Unknown';
                      if (!acc[sku]) acc[sku] = { name: entry.productName, sku, units: 0, revenue: 0 };
                      acc[sku].units += parseInt(entry.quantity) || 0;
                      const product = products.find(p => p.sku === sku);
                      acc[sku].revenue += (parseInt(entry.quantity) || 0) * (parseFloat(product?.price) || 50);
                      return acc;
                    }, {} as Record<string, {name: string, sku: string, units: number, revenue: number}>);
                    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#6366f1'];
                    return (Object.values(skuData) as Array<{ name: string; sku: string; units: number; revenue: number }>)
                      .sort((a, b) => b.units - a.units)
                      .slice(0, 4)
                      .map((s, i) => ({ ...s, rank: i + 1, revenue: (s.revenue / 100000).toFixed(2) + 'L', trend: '+0%', color: colors[i] }));
                  })().map(s=>(
                  <div key={s.sku} style={{display:'flex',alignItems:'center',gap:'16px',padding:'12px',background:theme.sidebarHover,borderRadius:'12px',border:`2px solid ${theme.border}`,transition:'all 0.3s ease',cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.transform='translateX(8px)'} onMouseLeave={(e)=>e.currentTarget.style.transform='translateX(0)'}>
                    <div style={{width:'36px',height:'36px',borderRadius:'8px',background:`linear-gradient(135deg, ${s.color}, ${s.color}dd)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'900',fontSize:'16px'}}>#{s.rank}</div>
                    <div style={{flex:1}}>
                      <div style={{color:theme.text,fontWeight:'700',fontSize:'15px',marginBottom:'2px'}}>{s.name}</div>
                      <div style={{color:theme.textSecondary,fontSize:'13px',fontWeight:'600'}}>{s.sku} · {s.units} units</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{color:theme.text,fontWeight:'800',fontSize:'16px'}}>₹{s.revenue}</div>
                      <div style={{color:'#34C759',fontSize:'13px',fontWeight:'700'}}>{s.trend}</div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
            </>
          )}
          
          {/* Products Page */}
          {currentPage === 'products' && (
            <div style={{animation:'fadeIn 0.5s ease-out'}}>
              {activeView === 'main' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📦</div>
                  <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #3b82f6, #8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Products Management</h2>
                  <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Add products, manage inventory, track SKUs, and update stock levels</p>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>handleAction('Opening Add Product Form','add-product')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #3b82f650',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #3b82f670';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #3b82f650';}}>➕ Add New Product</button>
                    <button onClick={()=>handleAction('Opening Products List','view-products')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(59,130,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📋 View All</button>
                    <button onClick={()=>handleAction('Opening Categories','manage-categories')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🏷️ Categories</button>
                    <button onClick={()=>handleAction('Opening Import Tool','import-products')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#06b6d4';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(6,182,212,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📥 Import</button>
                  </div>
                </div>
              )}
              {activeView === 'add-product' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>➕ Add New Product</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Product Name</label><input type="text" placeholder="Enter product name" value={formData.name||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,name:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>SKU</label><input type="text" placeholder="Enter SKU" value={formData.sku||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,sku:e.target.value})} /></div>
                    <div style={{gridColumn:'1 / -1'}}><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>EAN Number</label><div style={{display:'flex',gap:'12px'}}><input type="text" placeholder="13-digit EAN barcode" value={formData.ean||''} onChange={(e)=>setFormData({...formData,ean:e.target.value})} onKeyPress={(e)=>{if(e.key==='Enter' && formData.ean) lookupEAN(formData.ean);}} style={{flex:1,padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /><button onClick={()=>{if(formData.ean) lookupEAN(formData.ean);}} style={{padding:'14px 24px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>🔍 Lookup</button></div><p style={{color:theme.textSecondary,fontSize:'13px',marginTop:'6px'}}>💡 Enter EAN to auto-fill product details if already exists</p></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Category</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} value={formData.category||''} onChange={(e)=>setFormData({...formData,category:e.target.value})}><option value="">Select Category</option>{categories.map(cat=><option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Price (₹)</label><input type="number" placeholder="0.00" value={formData.price||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,price:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Stock Quantity</label><input type="number" placeholder="0" value={formData.quantity||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,quantity:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Min Stock Threshold</label><input type="number" placeholder="Minimum stock level" value={formData.minThreshold||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,minThreshold:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Warehouse</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} value={formData.warehouse||''} onChange={(e)=>setFormData({...formData,warehouse:e.target.value})}><option value="">Select Warehouse</option><option>Main Warehouse</option><option>Secondary Warehouse</option></select></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={async ()=>{
                      if(!formData.name || !formData.sku) {
                        addToast('❌ Please enter product name and SKU', 'error');
                        return;
                      }
                      try {
                        const parsedPrice = Number(formData.price || 0);
                        const parsedQty = Number(formData.quantity || 0);
                        const parsedThreshold = Number(formData.minThreshold || 0);

                        // Persist to the same store used by "View All" (getProducts())
                        await addProduct({
                          name: formData.name,
                          sku: formData.sku,
                          ean: formData.ean || '',
                          category: formData.category || '',
                          // Support both the dashboard fields and the main Product model
                          price: parsedPrice,
                          mrp: parsedPrice,
                          costPrice: parsedPrice,
                          quantity: parsedQty,
                          minThreshold: parsedThreshold,
                          minStockThreshold: parsedThreshold,
                          lowStockThreshold: parsedThreshold,
                          unit: 'pcs',
                          warehouse: formData.warehouse || ''
                        } as any);

                        const refreshed = await getProducts();
                        setRealProducts((refreshed || []).filter((p: any) => p?.isDeleted !== true));

                        if(formData.ean) {
                          setUserProducts({...userProducts, [formData.ean]: {name: formData.name, sku: formData.sku, category: formData.category, price: parsedPrice}});
                        }

                        addToast(`✅ Product "${formData.name}" added successfully!`, 'success');
                        resetView();
                      } catch (e) {
                        console.error('Failed to add product:', e);
                        addToast('❌ Failed to add product. Please try again.', 'error');
                      }
                    }} style={{padding:'14px 40px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>💾 Save Product</button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'edit-product' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>✏️ Edit Product</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Product Name</label><input type="text" placeholder="Enter product name" value={formData.name||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,name:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>SKU</label><input type="text" placeholder="Enter SKU" value={formData.sku||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,sku:e.target.value})} /></div>
                    <div style={{gridColumn:'1 / -1'}}><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>EAN Number</label><input type="text" placeholder="13-digit EAN barcode" value={formData.ean||''} onChange={(e)=>setFormData({...formData,ean:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Category</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} value={formData.category||''} onChange={(e)=>setFormData({...formData,category:e.target.value})}><option value="">Select Category</option>{categories.map(cat=><option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Price (₹)</label><input type="number" placeholder="0.00" value={formData.price||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,price:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Stock Quantity</label><input type="number" placeholder="0" value={formData.quantity||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,quantity:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Min Stock Threshold</label><input type="number" placeholder="Minimum stock level" value={formData.minThreshold||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,minThreshold:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Warehouse</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} value={formData.warehouse||''} onChange={(e)=>setFormData({...formData,warehouse:e.target.value})}><option value="">Select Warehouse</option><option>Main Warehouse</option><option>Secondary Warehouse</option></select></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={async ()=>{
                      if(!formData.name || !formData.sku) {
                        addToast('❌ Please enter product name and SKU', 'error');
                        return;
                      }
                      try {
                        const id = String(formData.id || '');
                        if (!id) {
                          addToast('❌ Missing product id', 'error');
                          return;
                        }

                        const parsedPrice = Number(formData.price || formData.mrp || 0);
                        const parsedQty = Number(formData.quantity || 0);
                        const parsedThreshold = Number(formData.minThreshold || formData.minStockThreshold || formData.lowStockThreshold || 0);

                        await updateProduct(id, {
                          name: formData.name,
                          sku: formData.sku,
                          ean: formData.ean || '',
                          category: formData.category || '',
                          price: parsedPrice,
                          mrp: parsedPrice,
                          costPrice: Number(formData.costPrice || parsedPrice),
                          quantity: parsedQty,
                          minThreshold: parsedThreshold,
                          minStockThreshold: parsedThreshold,
                          lowStockThreshold: parsedThreshold,
                          unit: formData.unit || 'pcs',
                          warehouse: formData.warehouse || ''
                        } as any);

                        const refreshed = await getProducts();
                        setRealProducts((refreshed || []).filter((p: any) => p?.isDeleted !== true));

                        if(formData.ean) {
                          setUserProducts({...userProducts, [formData.ean]: {name: formData.name, sku: formData.sku, category: formData.category, price: parsedPrice}});
                        }
                        addToast(`✅ Product "${formData.name}" updated successfully!`, 'success');
                        resetView();
                      } catch (e) {
                        console.error('Failed to update product:', e);
                        addToast('❌ Failed to update product. Please try again.', 'error');
                      }
                    }} style={{padding:'14px 40px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>💾 Update Product</button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'view-products' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📋 All Products</h2>
                    <div style={{display:'flex',gap:'12px'}}>
                      <button onClick={handleExportAllProductsToExcel} style={{padding:'10px 24px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>⬇️ Export to Excel</button>
                      <button onClick={async ()=>{
                        addToast('🔄 Refreshing products...','info');
                        const refreshed = await getProducts();
                        setRealProducts(refreshed);
                        setViewProductsPage(1);
                        addToast(`✅ Loaded ${refreshed.length} products`,'success');
                      }} style={{padding:'10px 24px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>🔄 Refresh</button>
                      <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                    </div>
                  </div>
                  <div style={{marginBottom:'16px',padding:'12px 20px',background:theme.sidebarHover,borderRadius:'10px',border:`2px solid ${theme.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'15px',fontWeight:'700',color:theme.text}}>📊 Total SKUs: {viewAllProductsItems.length}</span>
                    <span style={{fontSize:'13px',fontWeight:'700',color:theme.textSecondary}}>
                      Showing {viewAllProductsItems.length === 0 ? 0 : viewProductsStart + 1}-{viewProductsEnd} of {viewAllProductsItems.length}
                    </span>
                    <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                      <button
                        onClick={() => setViewProductsPage(p => Math.max(1, p - 1))}
                        disabled={viewProductsPageSafe <= 1}
                        style={{
                          padding:'8px 14px',
                          background: viewProductsPageSafe <= 1 ? theme.border : theme.sidebarHover,
                          color: theme.text,
                          border:`2px solid ${theme.border}`,
                          borderRadius:'10px',
                          fontSize:'13px',
                          fontWeight:'800',
                          cursor: viewProductsPageSafe <= 1 ? 'not-allowed' : 'pointer',
                          opacity: viewProductsPageSafe <= 1 ? 0.7 : 1
                        }}
                      >
                        ← Previous
                      </button>
                      <span style={{fontSize:'13px',fontWeight:'800',color:theme.textSecondary}}>
                        Page {viewProductsPageSafe} / {viewProductsTotalPages}
                      </span>
                      <button
                        onClick={() => setViewProductsPage(p => Math.min(viewProductsTotalPages, p + 1))}
                        disabled={viewProductsPageSafe >= viewProductsTotalPages}
                        style={{
                          padding:'8px 14px',
                          background: viewProductsPageSafe >= viewProductsTotalPages ? theme.border : theme.sidebarHover,
                          color: theme.text,
                          border:`2px solid ${theme.border}`,
                          borderRadius:'10px',
                          fontSize:'13px',
                          fontWeight:'800',
                          cursor: viewProductsPageSafe >= viewProductsTotalPages ? 'not-allowed' : 'pointer',
                          opacity: viewProductsPageSafe >= viewProductsTotalPages ? 0.7 : 1
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                  {viewAllProductsItems.length === 0 ? (
                    <div style={{textAlign:'center',padding:'60px'}}>
                      <div style={{fontSize:'64px',marginBottom:'16px'}}>📦</div>
                      <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'24px'}}>No products found. Try refreshing or add new products.</p>
                      <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                        <button onClick={()=>setActiveView('add-product')} style={{padding:'14px 32px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>➕ Add Product</button>
                        <button onClick={async ()=>{
                          addToast('🔄 Refreshing...','info');
                          const refreshed = await getProducts();
                          setRealProducts(refreshed);
                          setViewProductsPage(1);
                          addToast(`✅ Loaded ${refreshed.length} products`,'success');
                        }} style={{padding:'14px 32px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>🔄 Refresh</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse'}}>
                        <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>SKU</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product Name</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Category</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Stock</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Price</th><th style={{padding:'16px',textAlign:'center',color:theme.text,fontWeight:'700'}}>Actions</th></tr></thead>
                        <tbody>
                          {viewProductsPageItems.map((p,i)=>(
                            <tr key={i} style={{borderBottom:`1px solid ${theme.border}`}} onMouseEnter={(e)=>e.currentTarget.style.background=theme.sidebarHover} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                              <td style={{padding:'16px',color:theme.text,fontWeight:'600'}}>{p.sku}</td>
                              <td style={{padding:'16px',color:theme.text}}>{p.name}</td>
                              <td style={{padding:'16px',color:theme.textSecondary}}>{p.category||'-'}</td>
                              {(() => {
                                const qty = Number(p.quantity ?? 0);
                                const threshold = Number(p.minThreshold ?? p.minStockThreshold ?? p.lowStockThreshold ?? 10);
                                return (
                                  <td style={{padding:'16px',color:qty < threshold ? '#ef4444' : '#10b981',fontWeight:'700'}}>{qty}</td>
                                );
                              })()}
                              <td style={{padding:'16px',color:theme.text,fontWeight:'700'}}>₹{Number(p.price ?? p.mrp ?? 0)}</td>
                              <td style={{padding:'16px',display:'flex',gap:'8px',justifyContent:'center'}}>
                                <button onClick={()=>{
                                  setFormData({...p});
                                  setActiveView('edit-product');
                                  addToast(`✏️ Editing ${p.name}...`,'info');
                                }} style={{padding:'8px 16px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>✏️ Edit</button>
                                <button onClick={async ()=>{
                                  if(window.confirm(`Delete product "${p.name}"?`)){
                                    try {
                                      await updateProduct(String(p.id), { isDeleted: true } as any);
                                      const refreshed = await getProducts();
                                      setRealProducts((refreshed || []).filter((x: any) => x?.isDeleted !== true));
                                      setViewProductsPage(1);
                                      addToast(`🗑️ Product "${p.name}" deleted!`,'success');
                                    } catch (e) {
                                      console.error('Failed to delete product:', e);
                                      addToast('❌ Failed to delete product', 'error');
                                    }
                                  }
                                }} style={{padding:'8px 16px',background:'linear-gradient(135deg, #ef4444, #dc2626)',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>🗑️ Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {activeView === 'import-products' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <button onClick={resetView} style={{position:'absolute',top:'20px',right:'20px',padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  
                  <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'32px'}}>
                    <div style={{fontSize:'48px'}}>📥</div>
                    <div>
                      <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text,marginBottom:'4px'}}>Bulk Product Upload</h2>
                      <p style={{fontSize:'15px',color:theme.textSecondary}}>Upload Excel file to add multiple products at once</p>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div style={{border:`2px dashed #06b6d4`,borderRadius:'12px',padding:'48px',textAlign:'center',background:'rgba(8, 51, 68, 0.5)',marginBottom:'32px'}}>
                    <input 
                      id="bulk-product-file-input"
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      style={{display:'none'}} 
                      onChange={(e)=>{
                        const file = e.target.files?.[0];
                        if(file){
                          setFormData({...formData, selectedFile: file, fileName: file.name});
                          addToast(`File "${file.name}" selected. Click Start Import to proceed.`,'success');
                        }
                      }}
                    />
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style={{color:'#9ca3af',marginBottom:'16px'}}>
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>
                        {formData.fileName || 'Click to upload or drag & drop'}
                      </h3>
                      <p style={{color:'#9ca3af',fontSize:'14px',marginBottom:'16px'}}>
                        CSV, XLSX files supported
                      </p>
                      <button
                        onClick={()=>{
                          document.getElementById('bulk-product-file-input')?.click();
                        }}
                        style={{padding:'12px 32px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 12px rgba(6, 182, 212, 0.4)',transition:'all 0.3s'}}
                        onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.05)'}
                        onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}
                      >
                        📁 {formData.fileName ? 'Change File' : 'Select File'}
                      </button>
                    </div>
                  </div>

                  {/* Start Import Button */}
                  {formData.selectedFile && (
                    <div style={{textAlign:'center',marginBottom:'32px'}}>
                      <button
                        disabled={isImporting}
                        onClick={async ()=>{
                          if (isImporting) return;
                          
                          try {
                            console.log('=== onClick triggered ===');
                            const file = formData.selectedFile;
                            console.log('File object:', file);
                            
                            if (!file) {
                              console.error('No file found in formData');
                              addToast('❌ No file selected. Please select an Excel file first.','error');
                              return;
                            }
                            
                            // Check file extension
                            const fileName = file.name.toLowerCase();
                            console.log('File name:', fileName);
                            
                            if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
                              console.error('Invalid file extension:', fileName);
                              addToast('❌ Invalid file format. Please upload .xlsx, .xls, or .csv file only.','error');
                              return;
                            }
                            
                            console.log('Setting isImporting to true');
                            setIsImporting(true);
                            console.log('Starting bulk import for file:', file.name);
                            addToast('📂 Reading Excel file...','info');
                            
                            // Add a visual debug message
                            addToast(`Debug: File size ${file.size} bytes, type: ${file.type}`,'info');
                            
                            const reader = new FileReader();
                            
                            reader.onload = async (e) => {
                              try {
                                console.log('=== STEP 1: File loaded, parsing Excel ===');
                                addToast('📊 Parsing Excel data...','info');
                                
                                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                                console.log('Data buffer size:', data.length);
                                
                                const workbook = XLSX.read(data, {type: 'array'});
                                console.log('Workbook sheets:', workbook.SheetNames);
                                
                                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                                  console.error('No sheets found in workbook');
                                  addToast('❌ Excel file has no sheets. Please check the file.','error');
                                  setIsImporting(false);
                                  return;
                                }
                                
                                const sheetName = workbook.SheetNames[0];
                                console.log('Reading sheet:', sheetName);
                                const worksheet = workbook.Sheets[sheetName];
                                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                                
                                console.log('=== STEP 2: Parsed Excel data ===', jsonData.length, 'rows');
                                console.log('First row sample:', jsonData[0]);
                                
                                if (jsonData.length === 0) {
                                  console.error('Excel file is empty');
                                  addToast('❌ Excel file is empty. Please add product data and try again.','error');
                                  setIsImporting(false);
                                  return;
                                }
                                
                                addToast(`✅ Found ${jsonData.length} rows. Validating data...`,'info');
                                
                                // Map Excel columns to product fields
                                console.log('=== STEP 3: Mapping products ===');
                                const productsToImport = jsonData.map((row: any, index: number) => {
                                  const product = {
                                    rowNumber: index + 2, // Excel row number (accounting for header)
                                    sku: (row.SKU || row.sku || '').toString().trim(),
                                    name: (row['Product Name'] || row.name || '').toString().trim(),
                                    ean: (row['EAN No.'] || row.EAN || row.ean || '').toString().trim(),
                                    category: row.Category || row.category || 'Hair Care',
                                    unit: row.Unit || row.unit || 'pcs',
                                    mrp: parseFloat(row.MRP || row.mrp || 0),
                                    costPrice: parseFloat(row['Cost Price'] || row.costPrice || 0),
                                    lowStockThreshold: parseInt(row['Low Stock'] || row.lowStockThreshold || 10),
                                    batchTracking: (row['Batch Tracking'] || row.batchTracking || 'No').toLowerCase() === 'yes',
                                    imageUrl: row['Image URL'] || row.imageUrl || '',
                                    companyId: user?.companyId,
                                    orgId: user?.orgId
                                  };
                                  return product;
                                });
                                
                                console.log('Products mapped:', productsToImport.length);
                                console.log('Sample mapped product:', productsToImport[0]);
                                
                                // Detailed validation with row numbers
                                console.log('=== STEP 4: Validating products ===');
                                const invalidProducts = productsToImport.filter(p => !p.sku || !p.name);
                                console.log('Invalid products count:', invalidProducts.length);
                                
                                if (invalidProducts.length > 0) {
                                  const errorRows = invalidProducts.map(p => p.rowNumber).join(', ');
                                  console.log('Invalid products found:', invalidProducts);
                                  addToast(`❌ Validation Failed: ${invalidProducts.length} product(s) missing required fields (SKU or Product Name) in rows: ${errorRows}. Please fix and try again.`,'error');
                                  setIsImporting(false);
                                  return;
                                }
                                
                                // Check for invalid numbers
                                console.log('=== STEP 5: Checking numbers ===');
                                const invalidNumbers = productsToImport.filter(p => 
                                  isNaN(p.mrp) || p.mrp <= 0 || 
                                  isNaN(p.costPrice) || p.costPrice < 0
                                );
                                console.log('Invalid numbers count:', invalidNumbers.length);
                                
                                if (invalidNumbers.length > 0) {
                                  const errorRows = invalidNumbers.map(p => p.rowNumber).join(', ');
                                  console.log('Invalid numbers in rows:', errorRows);
                                  addToast(`❌ Invalid MRP or Cost Price in rows: ${errorRows}. Please enter valid numbers.`,'error');
                                  setIsImporting(false);
                                  return;
                                }
                                
                                console.log('=== STEP 6: Starting database import ===');
                                addToast('💾 Importing products to database...','info');
                                
                                // Import to database
                                const result = await addProductsBatch(productsToImport);
                                
                                console.log('=== STEP 7: Import completed ===');
                                console.log('Import result:', result.summary);
                                
                                // Show detailed results
                                let hasErrors = false;
                                
                                if (result.summary.successful > 0) {
                                  addToast(`✅ Success! ${result.summary.successful} product(s) imported successfully.`,'success');
                                }
                                
                                if (result.summary.duplicates > 0) {
                                  const duplicateSKUs = result.duplicates.map(d => d.product.sku).join(', ');
                                  console.log('Duplicate SKUs:', duplicateSKUs);
                                  const shortList = duplicateSKUs.substring(0, 200);
                                  addToast(`⚠️ ${result.summary.duplicates} duplicate SKU(s) skipped (already in database): ${shortList}${duplicateSKUs.length > 200 ? '...' : ''}`,'warning');
                                  hasErrors = true;
                                }
                                
                                if (result.summary.failed > 0) {
                                  const failedSKUs = result.failed.map(f => `${f.product.sku} (${f.error})`).join(', ');
                                  addToast(`❌ Failed to import ${result.summary.failed} product(s): ${failedSKUs.substring(0, 100)}${failedSKUs.length > 100 ? '...' : ''}`,'error');
                                  hasErrors = true;
                                }
                                
                                if (result.summary.successful === 0) {
                                  addToast('❌ No products were imported. Please check the errors above and try again.','error');
                                }
                                
                                // Show final summary alert
                                alert(`Import Summary:\n\n✅ Successful: ${result.summary.successful}\n❌ Failed: ${result.summary.failed}\n⚠️ Duplicates: ${result.summary.duplicates}\n\nTotal: ${result.summary.total}\n\n${result.summary.duplicates > 0 ? 'Note: Duplicate SKUs were skipped (already exist in database)' : ''}`);
                                
                                // CRITICAL: Force refresh products list after successful import
                                if (result.summary.successful > 0) {
                                  console.log('🔄 Refreshing products list after import...');
                                  const refreshedProducts = await getProducts();
                                  setRealProducts(refreshedProducts);
                                  console.log('✅ Products list refreshed:', refreshedProducts.length);
                                  
                                  setTimeout(() => {
                                    setFormData({});
                                    setIsImporting(false);
                                    resetView();
                                  }, hasErrors ? 4000 : 2000);
                                } else {
                                  setIsImporting(false);
                                }
                                
                              } catch (error: any) {
                                console.error('=== ERROR in reader.onload ===', error);
                                console.error('Error stack:', error.stack);
                                addToast(`❌ Import failed: ${error.message || 'Unknown error occurred'}. Check console for details.`,'error');
                                setIsImporting(false);
                              }
                            };
                            
                            reader.onerror = (error) => {
                              console.error('=== FileReader error ===', error);
                              addToast('❌ Failed to read file. The file may be corrupted or in use. Please try again.','error');
                              setIsImporting(false);
                            };
                            
                            console.log('=== Starting FileReader ===');
                            reader.readAsArrayBuffer(file);
                          } catch (error: any) {
                            console.error('=== ERROR in onClick handler ===', error);
                            console.error('Error stack:', error.stack);
                            addToast(`❌ Error: ${error.message || 'Failed to process file'}. Check console for details.`,'error');
                            setIsImporting(false);
                          }
                        }}
                        style={{
                          padding:'16px 48px',
                          background: isImporting ? '#6b7280' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color:'white',
                          border:'none',
                          borderRadius:'12px',
                          fontSize:'16px',
                          fontWeight:'700',
                          cursor: isImporting ? 'not-allowed' : 'pointer',
                          boxShadow: isImporting ? 'none' : '0 4px 16px rgba(139, 92, 246, 0.4)',
                          transition:'all 0.3s',
                          opacity: isImporting ? 0.6 : 1
                        }}
                        onMouseEnter={(e)=>{if(!isImporting) e.currentTarget.style.transform='scale(1.05)'}}
                        onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}
                      >
                        {isImporting ? '⏳ Importing... Please Wait' : '🚀 Start Import'}
                      </button>
                    </div>
                  )}

                  {/* Template Format Section */}
                  <div style={{background:'rgb(31, 41, 55)',borderRadius:'12px',padding:'24px',border:'1px solid rgb(55, 65, 81)'}}>
                    <div style={{display:'flex',alignItems:'center',marginBottom:'16px'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{color:'#ec4899',marginRight:'8px'}}>
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      <h3 style={{fontSize:'18px',fontWeight:'800',color:'white'}}>Excel Template Format</h3>
                    </div>
                    
                    {/* Sample Data Table */}
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',fontSize:'13px',borderCollapse:'collapse'}}>
                        <thead>
                          <tr style={{borderBottom:'1px solid rgb(55, 65, 81)'}}>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>SKU</th>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>Product Name</th>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>EAN No.</th>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>Category</th>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>Unit</th>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>MRP</th>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>Cost Price</th>
                            <th style={{textAlign:'left',padding:'12px 16px',color:'#9ca3af',fontWeight:'700'}}>Low Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{borderBottom:'1px solid rgba(55, 65, 81, 0.5)'}}>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>SAMPLE-001</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>Aloe Vera Serum</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>8901234567890</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>Hair Care</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>ml</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>599</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>150</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>50</td>
                          </tr>
                          <tr style={{borderBottom:'1px solid rgba(55, 65, 81, 0.5)'}}>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>SAMPLE-002</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>Rose Face Cream</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>8901234567891</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>Face Care</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>g</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>899</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>220</td>
                            <td style={{padding:'12px 16px',color:'#d1d5db'}}>30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Action Buttons */}
                    <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
                      <button
                        onClick={()=>{
                          // Create proper XLSX template
                          const wb = XLSX.utils.book_new();
                          
                          // Sample data
                          const sampleData = [
                            {SKU:'SAMPLE-001','Product Name':'Aloe Vera Hair Serum 100ml','EAN No.':'8901234567890',Category:'Hair Care',Unit:'ml',MRP:599,'Cost Price':150,'Low Stock':50,'Batch Tracking':'Yes','Image URL':''},
                            {SKU:'SAMPLE-002','Product Name':'Rose Face Cream 50g','EAN No.':'8901234567891',Category:'Face Care',Unit:'g',MRP:899,'Cost Price':220,'Low Stock':30,'Batch Tracking':'No','Image URL':''},
                            {SKU:'SAMPLE-003','Product Name':'Vitamin C Serum 30ml','EAN No.':'8901234567892',Category:'Skin Care',Unit:'ml',MRP:1299,'Cost Price':350,'Low Stock':40,'Batch Tracking':'Yes','Image URL':''},
                          ];
                          
                          const ws = XLSX.utils.json_to_sheet(sampleData);
                          
                          // Set column widths
                          ws['!cols'] = [
                            {wch: 15},  // SKU
                            {wch: 35},  // Product Name
                            {wch: 18},  // EAN No.
                            {wch: 15},  // Category
                            {wch: 8},   // Unit
                            {wch: 10},  // MRP
                            {wch: 12},  // Cost Price
                            {wch: 12},  // Low Stock
                            {wch: 15},  // Batch Tracking
                            {wch: 20}   // Image URL
                          ];
                          
                          XLSX.utils.book_append_sheet(wb, ws, 'Products');
                          
                          // Add instructions sheet
                          const instructions = [
                            {Field: 'SKU', Description: 'Unique product code (required)', Example: 'SAMPLE-001'},
                            {Field: 'Product Name', Description: 'Full product name (required)', Example: 'Aloe Vera Hair Serum 100ml'},
                            {Field: 'EAN No.', Description: 'EAN/Barcode number (13 digits, optional)', Example: '8901234567890'},
                            {Field: 'Category', Description: 'Hair Care, Skin Care, Face Care, Body Care', Example: 'Hair Care'},
                            {Field: 'Unit', Description: 'pcs, ml, or g', Example: 'ml'},
                            {Field: 'MRP', Description: 'Maximum retail price in ₹', Example: '599'},
                            {Field: 'Cost Price', Description: 'Your cost price in ₹', Example: '150'},
                            {Field: 'Low Stock', Description: 'Minimum stock alert threshold', Example: '50'},
                            {Field: 'Batch Tracking', Description: 'Yes or No', Example: 'Yes'},
                            {Field: 'Image URL', Description: 'Product image URL (optional)', Example: 'https://...'}
                          ];
                          const wsInstructions = XLSX.utils.json_to_sheet(instructions);
                          wsInstructions['!cols'] = [{wch: 20}, {wch: 45}, {wch: 30}];
                          XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
                          
                          XLSX.writeFile(wb, 'Product_Upload_Template.xlsx');
                          addToast('Template downloaded successfully!','success');
                        }}
                        style={{padding:'12px 24px',background:'#06b6d4',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'700',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Download Template
                      </button>
                      <button
                        onClick={()=>{
                          addToast('Required columns: SKU, Product Name, Category, Unit, MRP, Cost Price, Low Stock\\n\\nValid categories: Hair Care, Skin Care, Face Care, Body Care\\nValid units: pcs, ml, g\\n\\nOptional: Batch Tracking (Yes/No), Image URL','info');
                        }}
                        style={{padding:'12px 24px',background:'rgb(55, 65, 81)',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'700',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'}}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        View Sample
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeView === 'manage-categories' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🏷️ Manage Categories</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{marginBottom:'32px',padding:'24px',background:'linear-gradient(135deg, #8b5cf610, #7c3aed10)',border:`2px solid #8b5cf630`,borderRadius:'16px'}}>
                    <label style={{display:'block',color:theme.text,marginBottom:'12px',fontWeight:'700',fontSize:'17px'}}>➕ Add New Category</label>
                    <div style={{display:'flex',gap:'12px'}}>
                      <input type="text" placeholder="Enter category name" value={formData.newCategory||''} onChange={(e)=>setFormData({...formData,newCategory:e.target.value})} onKeyPress={(e)=>{if(e.key==='Enter' && formData.newCategory && !categories.includes(formData.newCategory)){setCategories([...categories,formData.newCategory]);addToast(`Category "${formData.newCategory}" added!`,'success');setFormData({...formData,newCategory:''});}}} style={{flex:1,padding:'14px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                      <button onClick={()=>{if(formData.newCategory){if(categories.includes(formData.newCategory)){addToast('Category already exists!','error');}else{setCategories([...categories,formData.newCategory]);addToast(`Category "${formData.newCategory}" added!`,'success');setFormData({...formData,newCategory:''});}}else{addToast('Please enter category name','error');}}} style={{padding:'14px 32px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>Add Category</button>
                    </div>
                  </div>
                  <h3 style={{fontSize:'20px',fontWeight:'800',color:theme.text,marginBottom:'20px'}}>📋 All Categories ({categories.length})</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'16px'}}>
                    {categories.map((cat,i)=>(
                      <div key={i} style={{padding:'20px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'12px',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all 0.3s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-2px)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'12px',flex:1}}>
                          <div style={{fontSize:'28px'}}>🏷️</div>
                          <div>
                            <p style={{color:theme.text,fontSize:'16px',fontWeight:'700',marginBottom:'4px'}}>{cat}</p>
                            <p style={{color:theme.textSecondary,fontSize:'13px'}}>Category {i+1}</p>
                          </div>
                        </div>
                        <button onClick={()=>{if(window.confirm(`Delete category "${cat}"?`)){setCategories(categories.filter((_,idx)=>idx!==i));addToast(`Category "${cat}" deleted!`,'success');}}} style={{padding:'8px 16px',background:'linear-gradient(135deg, #ef4444, #dc2626)',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}>🗑️ Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Inward Page */}
          {currentPage === 'inward' && (
            <div style={{animation:'fadeIn 0.5s ease-out'}}>
              {activeView === 'main' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📥</div>
                  <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #10b981, #059669)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Stock Inward</h2>
                  <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Record incoming stock, track purchase orders, and update inventory</p>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>handleAction('Opening Inward Entry Form','add-inward')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #10b98150',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #10b98170';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #10b98150';}}>📥 Add Inward Entry</button>
                    <button onClick={()=>handleAction('Opening Bulk Upload','bulk-inward')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#10b981';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(16,185,129,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📊 Bulk Upload</button>
                    <button onClick={()=>handleAction('Opening Inward History','view-inward')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#10b981';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(16,185,129,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📜 History</button>
                  </div>
                </div>
              )}
              {activeView === 'add-inward' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📥 Add Inward Entry (Multiple Products)</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{marginBottom:'28px',padding:'20px',background:'linear-gradient(135deg, #10b98110, #05966910)',border:`2px solid #10b98130`,borderRadius:'16px'}}>
                    <h3 style={{color:theme.text,fontSize:'18px',fontWeight:'800',marginBottom:'12px'}}>📦 Products to Inward</h3>
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'16px'}}>
                        <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>EAN</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Product Name</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>SKU</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Quantity</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Batch</th><th style={{padding:'12px',textAlign:'center',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Actions</th></tr></thead>
                        <tbody>
                          {lineItems.map((item,index)=>(
                            <tr key={item.id} style={{borderBottom:`1px solid ${theme.border}`}}>
                              <td style={{padding:'12px'}}><div style={{display:'flex',gap:'6px'}}><input type="text" placeholder="Scan" value={item.ean||''} onChange={(e)=>updateLineItem(index,'ean',e.target.value)} onKeyPress={(e)=>{if(e.key==='Enter' && item.ean) lookupEAN(item.ean,index);}} style={{width:'110px',padding:'9px',background:theme.cardBg,border:`2px solid #10b981`,borderRadius:'8px',color:theme.text,fontSize:'12px',fontWeight:'600'}} /><button onClick={()=>{if(item.ean) lookupEAN(item.ean,index);}} style={{padding:'9px 12px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'8px',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>🔍</button></div></td>
                              <td style={{padding:'12px'}}><select value={item.productName||''} onChange={(e)=>{if(e.target.value) selectProductByName(e.target.value,index);}} style={{width:'100%',minWidth:'180px',padding:'10px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'8px',color:theme.text,fontSize:'12px',cursor:'pointer'}}><option value="">Select Product</option>{getAllProducts().map((p,i)=><option key={i} value={p.name}>{p.name}</option>)}</select></td>
                              <td style={{padding:'12px'}}><input type="text" placeholder="Auto-filled" value={item.sku||''} readOnly style={{width:'100px',padding:'10px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'8px',color:theme.text,fontSize:'13px',opacity:0.7}} /></td>
                              <td style={{padding:'12px'}}><input type="number" placeholder="0" value={item.quantity||''} onChange={(e)=>updateLineItem(index,'quantity',e.target.value)} style={{width:'90px',padding:'10px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'8px',color:theme.text,fontSize:'13px'}} /></td>
                              <td style={{padding:'12px'}}><input type="text" placeholder="Batch #" value={item.batch||''} onChange={(e)=>updateLineItem(index,'batch',e.target.value)} style={{width:'100px',padding:'10px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'8px',color:theme.text,fontSize:'13px'}} /></td>
                              <td style={{padding:'12px',textAlign:'center'}}><button onClick={()=>removeLineItem(index)} disabled={lineItems.length===1} style={{padding:'8px 14px',background:lineItems.length===1?theme.sidebarHover:'linear-gradient(135deg, #ef4444, #dc2626)',color:lineItems.length===1?theme.textSecondary:'white',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:'700',cursor:lineItems.length===1?'not-allowed':'pointer',opacity:lineItems.length===1?0.5:1}}>🗑️</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={addLineItem} style={{padding:'12px 28px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>➕ Add Another Product</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'20px',marginBottom:'32px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Supplier</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} value={formData.supplier||''} onChange={(e)=>setFormData({...formData,supplier:e.target.value})}><option value="">Select Supplier</option>{parties.filter((p:any)=>p?.type==='Supplier' || p?.type==='Both').map((p:any)=><option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Purchase Order</label><input type="text" placeholder="PO Number" value={formData.po||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,po:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Date</label><input type="date" value={formData.date||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,date:e.target.value})} /></div>
                  </div>
                  <div style={{display:'flex',gap:'16px'}}>
                    <button onClick={()=>{const validItems=lineItems.filter(item=>item.productName && item.quantity);if(validItems.length>0 && formData.supplier && formData.date){const newEntries=validItems.map(item=>({...item,supplier:formData.supplier,date:formData.date,po:formData.po,entryDate:new Date().toLocaleDateString('en-IN')}));setInwardEntries(prev=>[...prev,...newEntries]);addToast(`✅ Inward entry recorded: ${validItems.length} product(s) added!`,'success');setLineItems([{id:1,ean:'',productName:'',sku:'',quantity:'',batch:''}]);setFormData({});resetView();}else{addToast('❌ Please fill all required fields (products, supplier, date)','error');}}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>✓ Submit All Entries</button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'bulk-inward' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📊 Bulk Inward Upload</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{marginBottom:'32px',padding:'28px',background:'linear-gradient(135deg, #10b98108, #05966908)',border:`2px dashed #10b981`,borderRadius:'16px',textAlign:'center',cursor:'pointer'}} onClick={()=>addToast('File upload dialog would open here','info')}>
                    <div style={{fontSize:'72px',marginBottom:'16px'}}>📄</div>
                    <h3 style={{color:theme.text,fontSize:'22px',fontWeight:'800',marginBottom:'12px'}}>Upload Excel File</h3>
                    <p style={{color:theme.textSecondary,fontSize:'16px',marginBottom:'8px'}}>Click to select or drag & drop your Excel file</p>
                    <p style={{color:theme.textSecondary,fontSize:'14px'}}>Supported formats: .xlsx, .xls</p>
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'28px',borderRadius:'16px',border:`2px solid ${theme.border}`,marginBottom:'32px'}}>
                    <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'16px'}}>📋 Excel Template Format</h3>
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px'}}>
                        <thead><tr style={{background:theme.cardBg}}><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>EAN Number</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Product Name</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>SKU</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Quantity</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Min Threshold</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Batch Number</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Supplier</th></tr></thead>
                        <tbody>
                          <tr><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>8901234567890</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>Wireless Mouse</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>SKU001</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>50</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>20</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>BATCH001</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>ABC Suppliers</td></tr>
                          <tr><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>8901234567891</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>USB Cable</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>SKU002</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>100</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>30</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>BATCH002</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>XYZ Distributors</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{marginTop:'20px',display:'flex',gap:'12px'}}>
                      <button onClick={()=>addToast('Downloading template...','success')} style={{padding:'12px 28px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>⬇️ Download Template</button>
                      <button onClick={()=>addToast('Opening sample file...','info')} style={{padding:'12px 28px',background:theme.cardBg,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>👁️ View Sample</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center'}}>
                    <button onClick={()=>{addToast('Processing bulk upload: 156 entries added successfully!','success');resetView();}} style={{padding:'16px 48px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer'}}>📥 Upload & Process</button>
                    <button onClick={()=>{addToast('Validating file format...','info');}} style={{padding:'16px 48px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer'}}>✓ Validate File</button>
                  </div>
                </div>
              )}
              {activeView === 'view-inward' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📜 Inward History</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Date</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Batch</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Qty</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Supplier</th></tr></thead>
                      <tbody>
                        {inwardEntries.length === 0 ? (
                          <tr><td colSpan={5} style={{padding:'40px',textAlign:'center',color:theme.textSecondary}}>
                            <div style={{fontSize:'48px',marginBottom:'12px'}}>📦</div>
                            <p style={{fontSize:'16px'}}>No inward entries yet</p>
                          </td></tr>
                        ) : inwardEntries.map((item,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.background=theme.sidebarHover} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                            <td style={{padding:'16px',color:theme.textSecondary}}>{item.date||item.entryDate}</td>
                            <td style={{padding:'16px',color:theme.text,fontWeight:'600'}}>{item.productName||item.product}</td>
                            <td style={{padding:'16px',color:theme.text}}>{item.batch}</td>
                            <td style={{padding:'16px',color:'#10b981',fontWeight:'700'}}>+{item.quantity||item.qty}</td>
                            <td style={{padding:'16px',color:theme.textSecondary}}>{item.supplier}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Outward Page */}
          {currentPage === 'outward' && (
            <div style={{animation:'fadeIn 0.5s ease-out'}}>
              {activeView === 'main' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📤</div>
                  <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #f59e0b, #d97706)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Stock Outward</h2>
                  <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Create shipments, manage platform orders, and track deliveries</p>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>handleAction('Opening Shipment Form','create-shipment')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #f59e0b50',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #f59e0b70';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #f59e0b50';}}>📦 Create Shipment</button>
                    <button onClick={()=>handleAction('Opening Bulk Outward','bulk-outward')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#f59e0b';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(245,158,11,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📊 Bulk Upload</button>
                    <button onClick={()=>handleAction('Opening Platform Orders','platform-orders')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#f59e0b';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(245,158,11,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🛒 Platform Orders</button>
                    <button onClick={()=>handleAction('Opening Outward History','view-outward')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#f59e0b';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(245,158,11,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📜 History</button>
                  </div>
                </div>
              )}
              {activeView === 'create-shipment' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📦 Create Shipment (Multiple Products)</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{marginBottom:'28px',padding:'20px',background:'linear-gradient(135deg, #f59e0b10, #d9770610)',border:`2px solid #f59e0b30`,borderRadius:'16px'}}>
                    <h3 style={{color:theme.text,fontSize:'18px',fontWeight:'800',marginBottom:'12px'}}>📦 Products to Ship</h3>
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'16px'}}>
                        <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>EAN</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Product Name</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>SKU</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Quantity</th><th style={{padding:'12px',textAlign:'center',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Actions</th></tr></thead>
                        <tbody>
                          {lineItems.map((item,index)=>(
                            <tr key={item.id} style={{borderBottom:`1px solid ${theme.border}`}}>
                              <td style={{padding:'12px'}}><div style={{display:'flex',gap:'6px'}}><input type="text" placeholder="Scan" value={item.ean||''} onChange={(e)=>updateLineItem(index,'ean',e.target.value)} onKeyPress={(e)=>{if(e.key==='Enter' && item.ean) lookupEAN(item.ean,index);}} style={{width:'110px',padding:'9px',background:theme.cardBg,border:`2px solid #f59e0b`,borderRadius:'8px',color:theme.text,fontSize:'12px',fontWeight:'600'}} /><button onClick={()=>{if(item.ean) lookupEAN(item.ean,index);}} style={{padding:'9px 12px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'8px',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>🔍</button></div></td>
                              <td style={{padding:'12px'}}><select value={item.productName||''} onChange={(e)=>{if(e.target.value) selectProductByName(e.target.value,index);}} style={{width:'100%',minWidth:'180px',padding:'10px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'8px',color:theme.text,fontSize:'12px',cursor:'pointer'}}><option value="">Select Product</option>{getAllProducts().map((p,i)=><option key={i} value={p.name}>{p.name}</option>)}</select></td>
                              <td style={{padding:'12px'}}><input type="text" placeholder="Auto-filled" value={item.sku||''} readOnly style={{width:'100px',padding:'10px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'8px',color:theme.text,fontSize:'13px',opacity:0.7}} /></td>
                              <td style={{padding:'12px'}}><input type="number" placeholder="0" value={item.quantity||''} onChange={(e)=>updateLineItem(index,'quantity',e.target.value)} style={{width:'90px',padding:'10px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'8px',color:theme.text,fontSize:'13px'}} /></td>
                              <td style={{padding:'12px',textAlign:'center'}}><button onClick={()=>removeLineItem(index)} disabled={lineItems.length===1} style={{padding:'8px 14px',background:lineItems.length===1?theme.sidebarHover:'linear-gradient(135deg, #ef4444, #dc2626)',color:lineItems.length===1?theme.textSecondary:'white',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:'700',cursor:lineItems.length===1?'not-allowed':'pointer',opacity:lineItems.length===1?0.5:1}}>🗑️</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={addLineItem} style={{padding:'12px 28px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>➕ Add Another Product</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'20px',marginBottom:'32px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Date</label><input type="date" value={formData.shipmentDate||new Date().toISOString().split('T')[0]} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,shipmentDate:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Order/Invoice Number <span style={{color:theme.textSecondary,fontSize:'13px'}}>(Optional)</span></label><input type="text" placeholder="Enter order number" value={formData.orderNo||''} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,orderNo:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Platform</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} value={formData.platform||''} onChange={(e)=>setFormData({...formData,platform:e.target.value})}><option value="">Select Platform</option><option>Meesho</option><option>Amazon</option><option>Flipkart</option><option>Myntra</option><option>Ajio</option><option>Direct Order</option></select></div>
                  </div>
                  <div style={{display:'flex',gap:'16px'}}>
                    <button onClick={()=>{const validItems=lineItems.filter(item=>item.productName && item.quantity);if(validItems.length>0 && formData.platform){const shipDate=formData.shipmentDate||new Date().toISOString().split('T')[0];const newEntries=validItems.map(item=>({...item,orderNo:formData.orderNo||'',platform:formData.platform,entryDate:new Date(shipDate).toLocaleDateString('en-IN'),shipmentDate:shipDate}));setOutwardEntries(prev=>[...prev,...newEntries]);addToast(`✅ Shipment created: ${validItems.length} product(s) dispatched to ${formData.platform}!`,'success');setLineItems([{id:1,ean:'',productName:'',sku:'',quantity:'',batch:''}]);setFormData({});resetView();}else{addToast('❌ Please fill all required fields (products, platform)','error');}}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>🚚 Create Shipment</button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'bulk-outward' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📊 Bulk Outward Upload</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{marginBottom:'32px',padding:'28px',background:'linear-gradient(135deg, #f59e0b08, #d9770608)',border:`2px dashed #f59e0b`,borderRadius:'16px',textAlign:'center',cursor:'pointer'}} onClick={()=>addToast('File upload dialog would open here','info')}>
                    <div style={{fontSize:'72px',marginBottom:'16px'}}>📄</div>
                    <h3 style={{color:theme.text,fontSize:'22px',fontWeight:'800',marginBottom:'12px'}}>Upload Excel File</h3>
                    <p style={{color:theme.textSecondary,fontSize:'16px',marginBottom:'8px'}}>Click to select or drag & drop your Excel file</p>
                    <p style={{color:theme.textSecondary,fontSize:'14px'}}>Supported formats: .xlsx, .xls</p>
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'28px',borderRadius:'16px',border:`2px solid ${theme.border}`,marginBottom:'32px'}}>
                    <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'16px'}}>📋 Excel Template Format</h3>
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px'}}>
                        <thead><tr style={{background:theme.cardBg}}><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>EAN Number</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Product Name</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>SKU</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Quantity</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Customer</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Order Number</th></tr></thead>
                        <tbody>
                          <tr><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>8901234567890</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>Wireless Mouse</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>SKU001</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>25</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>Customer A</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>ORD001</td></tr>
                          <tr><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>8901234567891</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>USB Cable</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>SKU002</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>50</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>Customer B</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>ORD002</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{marginTop:'20px',display:'flex',gap:'12px'}}>
                      <button onClick={()=>addToast('Downloading template...','success')} style={{padding:'12px 28px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>⬇️ Download Template</button>
                      <button onClick={()=>addToast('Opening sample file...','info')} style={{padding:'12px 28px',background:theme.cardBg,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>👁️ View Sample</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center'}}>
                    <button onClick={()=>{addToast('Processing bulk outward: 89 shipments created successfully!','success');resetView();}} style={{padding:'16px 48px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer'}}>📤 Upload & Process</button>
                    <button onClick={()=>{addToast('Validating file format...','info');}} style={{padding:'16px 48px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer'}}>✓ Validate File</button>
                  </div>
                </div>
              )}
              {activeView === 'platform-orders' && (() => {
                // Calculate platform-wise orders from real data
                const platformCounts = realOutwardRecords.reduce((acc: any, record: any) => {
                  const platform = record.platform || 'Other';
                  acc[platform] = (acc[platform] || 0) + 1;
                  return acc;
                }, {});
                
                const platformData = [
                  {platform: 'Amazon', orders: platformCounts['Amazon'] || 0, color: '#ff9900'},
                  {platform: 'Flipkart', orders: platformCounts['Flipkart'] || 0, color: '#2874f0'},
                  {platform: 'Meesho', orders: platformCounts['Meesho'] || 0, color: '#9c1ab1'}
                ];
                
                // Get recent orders with product names
                const recentOrders = realOutwardRecords.slice(-10).reverse().map((record: any) => {
                  const product = realProducts.find((p: any) => p.id === record.productId);
                  return {
                    id: record.orderNumber || record.awbNumber || record.id,
                    platform: record.platform || 'Other',
                    product: product?.name || 'Unknown Product',
                    quantity: record.quantity,
                    status: 'Completed',
                    date: new Date(record.createdAt).toLocaleDateString()
                  };
                });
                
                return (
                  <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                      <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🛒 Platform Orders</h2>
                      <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'32px'}}>
                      {platformData.map((p,i)=>(
                        <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.borderColor=p.color} onMouseLeave={(e)=>e.currentTarget.style.borderColor=theme.border}>
                          <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'12px'}}>{p.platform}</h3>
                          <p style={{color:p.color,fontSize:'32px',fontWeight:'900'}}>{p.orders}</p>
                          <p style={{color:theme.textSecondary,fontSize:'14px'}}>Total Orders</p>
                        </div>
                      ))}
                      {activeView === 'view-outward' && (
                        <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                            <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📜 Outward History</h2>
                            <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                          </div>
                          <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%',borderCollapse:'collapse'}}>
                              <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Date</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Qty</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Platform</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Order/Invoice</th></tr></thead>
                              <tbody>
                                {outwardEntries.length === 0 ? (
                                  <tr><td colSpan={5} style={{padding:'40px',textAlign:'center',color:theme.textSecondary}}>
                                    <div style={{fontSize:'48px',marginBottom:'12px'}}>📦</div>
                                    <p style={{fontSize:'16px'}}>No outward entries yet</p>
                                  </td></tr>
                                ) : outwardEntries.map((item,i)=>(
                                  <tr key={i} style={{borderBottom:`1px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.background=theme.sidebarHover} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                    <td style={{padding:'16px',color:theme.textSecondary}}>{item.shipmentDate||item.date||item.entryDate}</td>
                                    <td style={{padding:'16px',color:theme.text,fontWeight:'600'}}>{item.productName||item.product}</td>
                                    <td style={{padding:'16px',color:'#f59e0b',fontWeight:'700'}}>-{item.quantity||item.qty}</td>
                                    <td style={{padding:'16px',color:theme.textSecondary}}>{item.platform||'-'}</td>
                                    <td style={{padding:'16px',color:theme.textSecondary}}>{item.orderNo||'-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Order ID</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Platform</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Quantity</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Date</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Status</th></tr></thead>
                      <tbody>
                        {recentOrders.length > 0 ? recentOrders.map((order: any, i: number)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${theme.border}`}}>
                            <td style={{padding:'16px',color:theme.text,fontWeight:'600'}}>{order.id}</td>
                            <td style={{padding:'16px',color:theme.text}}>{order.platform}</td>
                            <td style={{padding:'16px',color:theme.textSecondary}}>{order.product}</td>
                            <td style={{padding:'16px',color:theme.text}}>{order.quantity}</td>
                            <td style={{padding:'16px',color:theme.textSecondary,fontSize:'13px'}}>{order.date}</td>
                            <td style={{padding:'16px'}}><span style={{padding:'6px 14px',background:'#10b98120',color:'#10b981',borderRadius:'8px',fontSize:'13px',fontWeight:'700'}}>{order.status}</span></td>
                          </tr>
                        )) : (
                          <tr><td colSpan={6} style={{padding:'32px',textAlign:'center',color:theme.textSecondary}}>No platform orders found. Create outward entries to see data here.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* Parties Page */}
          {currentPage === 'parties' && (
            <div style={{animation:'fadeIn 0.5s ease-out'}}>
              {activeView === 'main' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>👥</div>
                  <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Parties Management</h2>
                  <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Manage suppliers and customers, track transactions</p>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>handleAction('Opening Add Party Form','add-party')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #8b5cf650',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #8b5cf670';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #8b5cf650';}}>➕ Add Party</button>
                    <button onClick={()=>handleAction('Opening Suppliers List','view-suppliers')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🏭 Suppliers</button>
                    <button onClick={()=>handleAction('Opening Customers List','view-customers')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#a78bfa';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(167,139,250,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>👤 Customers</button>
                  </div>
                </div>
              )}
              {activeView === 'add-party' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>➕ Add New Party</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Party Name</label>
                      <input type="text" placeholder="Enter name" value={formData.partyName||''} onChange={(e)=>setFormData({...formData,partyName:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Party Type</label>
                      <select value={formData.partyType||'Supplier'} onChange={(e)=>setFormData({...formData,partyType:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}}>
                        <option value="Supplier">Supplier</option>
                        <option value="Customer">Customer</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Contact Person</label>
                      <input type="text" placeholder="Contact name" value={formData.partyContactPerson||''} onChange={(e)=>setFormData({...formData,partyContactPerson:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Phone</label>
                      <input type="tel" placeholder="+91 XXXXXXXXXX" value={formData.partyPhone||''} onChange={(e)=>setFormData({...formData,partyPhone:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Email</label>
                      <input type="email" placeholder="email@example.com" value={formData.partyEmail||''} onChange={(e)=>setFormData({...formData,partyEmail:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>GSTIN</label>
                      <input type="text" placeholder="22AAAAA0000A1Z5" value={formData.partyGstNumber||''} onChange={(e)=>setFormData({...formData,partyGstNumber:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button 
                      onClick={async ()=>{
                        if(!formData.partyName){
                          addToast('Please enter party name', 'error');
                          return;
                        }
                        try {
                          await addParty({
                            name: formData.partyName,
                            type: formData.partyType || 'Supplier',
                            contactPerson: formData.partyContactPerson,
                            phone: formData.partyPhone,
                            email: formData.partyEmail,
                            gstNumber: formData.partyGstNumber,
                          } as any);
                          addToast('Party added successfully!', 'success');
                          await refreshParties();
                          resetView();
                        } catch (e) {
                          console.error('Failed to add party:', e);
                          addToast('Failed to add party', 'error');
                        }
                      }}
                      style={{padding:'14px 40px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}
                    >
                      💾 Save Party
                    </button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'edit-party' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}` ,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>✏️ Edit Party</h2>
                    <button onClick={()=>setActiveView(formData.partyEditBackView || 'main')} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Party Name</label>
                      <input type="text" placeholder="Enter name" value={formData.partyName||''} onChange={(e)=>setFormData({...formData,partyName:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Party Type</label>
                      <select value={formData.partyType||'Supplier'} onChange={(e)=>setFormData({...formData,partyType:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}}>
                        <option value="Supplier">Supplier</option>
                        <option value="Customer">Customer</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Contact Person</label>
                      <input type="text" placeholder="Contact name" value={formData.partyContactPerson||''} onChange={(e)=>setFormData({...formData,partyContactPerson:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Phone</label>
                      <input type="tel" placeholder="+91 XXXXXXXXXX" value={formData.partyPhone||''} onChange={(e)=>setFormData({...formData,partyPhone:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Email</label>
                      <input type="email" placeholder="email@example.com" value={formData.partyEmail||''} onChange={(e)=>setFormData({...formData,partyEmail:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>GSTIN</label>
                      <input type="text" placeholder="22AAAAA0000A1Z5" value={formData.partyGstNumber||''} onChange={(e)=>setFormData({...formData,partyGstNumber:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} />
                    </div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button 
                      onClick={async ()=>{
                        if(!formData.partyEditId){
                          addToast('Missing party id', 'error');
                          return;
                        }
                        if(!formData.partyName){
                          addToast('Please enter party name', 'error');
                          return;
                        }
                        try {
                          await updateParty(formData.partyEditId, {
                            name: formData.partyName,
                            type: formData.partyType || 'Supplier',
                            contactPerson: formData.partyContactPerson,
                            phone: formData.partyPhone,
                            email: formData.partyEmail,
                            gstNumber: formData.partyGstNumber,
                          } as any);
                          addToast('Party updated successfully!', 'success');
                          await refreshParties();
                          setActiveView(formData.partyEditBackView || 'main');
                        } catch (e) {
                          console.error('Failed to update party:', e);
                          addToast('Failed to update party', 'error');
                        }
                      }}
                      style={{padding:'14px 40px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}
                    >
                      💾 Save Changes
                    </button>
                    <button onClick={()=>setActiveView(formData.partyEditBackView || 'main')} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'view-suppliers' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🏭 Suppliers</h2>
                    <div style={{display:'flex',gap:'12px'}}>
                      <button onClick={()=>{setFormData({...formData,partyType:'Supplier'});setActiveView('add-party');}} style={{padding:'10px 24px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'800',cursor:'pointer'}}>➕ Add Supplier</button>
                      <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                    </div>
                  </div>
                  {partiesLoading ? (
                    <div style={{textAlign:'center',padding:'60px',color:theme.textSecondary}}>Loading suppliers…</div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'20px'}}>
                      {parties.filter(p=>p.type==='Supplier' || p.type==='Both').length === 0 ? (
                        <div style={{gridColumn:'1 / -1',textAlign:'center',padding:'60px',color:theme.textSecondary}}>
                          <div style={{fontSize:'48px',marginBottom:'12px'}}>🏭</div>
                          <p style={{fontSize:'16px'}}>No suppliers yet</p>
                        </div>
                      ) : parties.filter(p=>p.type==='Supplier' || p.type==='Both').map((p:any)=>(
                        <div key={p.id} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px'}}>
                            <div style={{flex:1}}>
                              <h3 style={{color:theme.text,fontSize:'18px',fontWeight:'900',marginBottom:'8px'}}>{p.name}</h3>
                              {p.contactPerson && <p style={{color:theme.textSecondary,fontSize:'13px',marginBottom:'4px'}}>👤 {p.contactPerson}</p>}
                              {p.phone && <p style={{color:theme.textSecondary,fontSize:'13px',marginBottom:'4px'}}>📞 {p.phone}</p>}
                              {p.email && <p style={{color:theme.textSecondary,fontSize:'13px',marginBottom:'4px'}}>✉️ {p.email}</p>}
                              {p.gstNumber && <p style={{color:theme.textSecondary,fontSize:'13px'}}>🧾 {p.gstNumber}</p>}
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                              <button onClick={()=>{setFormData({...formData,partyEditId:p.id,partyName:p.name,partyType:p.type,partyContactPerson:p.contactPerson||'',partyPhone:p.phone||'',partyEmail:p.email||'',partyGstNumber:p.gstNumber||'',partyEditBackView:'view-suppliers'});setActiveView('edit-party');}} style={{padding:'8px 14px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:'800',cursor:'pointer'}}>✏️ Edit</button>
                              <button onClick={async ()=>{if(!window.confirm(`Delete "${p.name}"?`)) return; try { await deleteParty(p.id); addToast('Supplier deleted','success'); await refreshParties(); } catch(e){ console.error(e); addToast('Failed to delete','error'); }}} style={{padding:'8px 14px',background:'linear-gradient(135deg, #ef4444, #dc2626)',color:'white',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:'800',cursor:'pointer'}}>🗑️ Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeView === 'view-customers' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>👤 Customers</h2>
                    <div style={{display:'flex',gap:'12px'}}>
                      <button onClick={()=>{setFormData({...formData,partyType:'Customer'});setActiveView('add-party');}} style={{padding:'10px 24px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'800',cursor:'pointer'}}>➕ Add Customer</button>
                      <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                    </div>
                  </div>
                  {partiesLoading ? (
                    <div style={{textAlign:'center',padding:'60px',color:theme.textSecondary}}>Loading customers…</div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'20px'}}>
                      {parties.filter(p=>p.type==='Customer' || p.type==='Both').length === 0 ? (
                        <div style={{gridColumn:'1 / -1',textAlign:'center',padding:'60px',color:theme.textSecondary}}>
                          <div style={{fontSize:'48px',marginBottom:'12px'}}>👤</div>
                          <p style={{fontSize:'16px'}}>No customers yet</p>
                        </div>
                      ) : parties.filter(p=>p.type==='Customer' || p.type==='Both').map((p:any)=>(
                        <div key={p.id} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px'}}>
                            <div style={{flex:1}}>
                              <h3 style={{color:theme.text,fontSize:'18px',fontWeight:'900',marginBottom:'8px'}}>{p.name}</h3>
                              {p.contactPerson && <p style={{color:theme.textSecondary,fontSize:'13px',marginBottom:'4px'}}>👤 {p.contactPerson}</p>}
                              {p.phone && <p style={{color:theme.textSecondary,fontSize:'13px',marginBottom:'4px'}}>📞 {p.phone}</p>}
                              {p.email && <p style={{color:theme.textSecondary,fontSize:'13px',marginBottom:'4px'}}>✉️ {p.email}</p>}
                              {p.gstNumber && <p style={{color:theme.textSecondary,fontSize:'13px'}}>🧾 {p.gstNumber}</p>}
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                              <button onClick={()=>{setFormData({...formData,partyEditId:p.id,partyName:p.name,partyType:p.type,partyContactPerson:p.contactPerson||'',partyPhone:p.phone||'',partyEmail:p.email||'',partyGstNumber:p.gstNumber||'',partyEditBackView:'view-customers'});setActiveView('edit-party');}} style={{padding:'8px 14px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:'800',cursor:'pointer'}}>✏️ Edit</button>
                              <button onClick={async ()=>{if(!window.confirm(`Delete "${p.name}"?`)) return; try { await deleteParty(p.id); addToast('Customer deleted','success'); await refreshParties(); } catch(e){ console.error(e); addToast('Failed to delete','error'); }}} style={{padding:'8px 14px',background:'linear-gradient(135deg, #ef4444, #dc2626)',color:'white',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:'800',cursor:'pointer'}}>🗑️ Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Reports Page */}
          {currentPage === 'reports' && (
            <div style={{animation:'fadeIn 0.5s ease-out'}}>
              {activeView === 'main' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📈</div>
                  <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Reports & Analytics</h2>
                  <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Generate reports, analyze trends, export data</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',maxWidth:'1200px',margin:'0 auto'}}>
                    <button onClick={()=>handleAction('Generating Sales Report','sales-report')} style={{padding:'20px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #06b6d450',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 40px #06b6d470';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 6px 24px #06b6d450';}}>📊 Sales Report</button>
                    <button onClick={()=>handleAction('Generating Stock Report','stock-report')} style={{padding:'20px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#06b6d4';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(6,182,212,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📦 Stock Report</button>
                    <button onClick={()=>handleAction('Generating Low Stock Report','low-stock-report')} style={{padding:'20px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(239,68,68,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>⚠️ Low Stock</button>
                    <button onClick={()=>handleAction('Generating Inward Report','inward-report')} style={{padding:'20px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#10b981';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(16,185,129,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📥 Inward Report</button>
                    <button onClick={()=>handleAction('Generating Outward Report','outward-report')} style={{padding:'20px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#f59e0b';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(245,158,11,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📤 Outward Report</button>
                    <button onClick={()=>handleAction('Generating Batch Report','batch-report')} style={{padding:'20px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🏷️ Batch Wise</button>
                  </div>
                </div>
              )}
              {activeView === 'sales-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📊 Sales Report</h2>
                    <div style={{display:'flex',gap:'12px'}}>
                      <button onClick={()=>{const data=[{Product:'Wireless Mouse',Sales:67000,Units:89,AvgPrice:753},{Product:'USB Cable',Sales:45000,Units:234,AvgPrice:192},{Product:'T-Shirt',Sales:38000,Units:67,AvgPrice:567}];exportToExcel(data,'sales-report.xls');addToast('✅ Sales report exported to Excel','success');}} style={{padding:'10px 24px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📊 Export Excel</button>
                      <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px',marginBottom:'32px'}}>
                    {[{label:'Total Sales',value:'₹ 0',color:'#06b6d4'},{label:'Orders',value:'0',color:'#10b981'},{label:'Avg Order',value:'₹ 0',color:'#f59e0b'},{label:'Growth',value:'0%',color:'#8b5cf6'}].map((stat,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,textAlign:'center'}}>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'8px',fontWeight:'600'}}>{stat.label}</p>
                        <p style={{color:stat.color,fontSize:'28px',fontWeight:'900'}}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'32px',borderRadius:'16px',border:`2px solid ${theme.border}`,textAlign:'center'}}>
                    <div style={{fontSize:'48px',marginBottom:'12px'}}>📊</div>
                    <p style={{color:theme.textSecondary,fontSize:'16px'}}>No sales data available</p>
                  </div>
                </div>
              )}
              {activeView === 'stock-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📦 Stock Report</h2>
                    <div style={{display:'flex',gap:'12px'}}>
                      <button onClick={()=>{const data=[{Product:'Logitech Mouse',SKU:'TECH-WM-001',Stock:12,MinStock:20,Status:'Low'},{Product:'USB Cable',SKU:'TECH-UC-002',Stock:35,MinStock:30,Status:'OK'}];exportToExcel(data,'stock-report.xls');addToast('✅ Stock report exported to Excel','success');}} style={{padding:'10px 24px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📊 Export Excel</button>
                      <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'32px'}}>
                    {[{label:'Total Items',value:products.length.toString(),color:'#3b82f6'},{label:'Low Stock',value:'0',color:'#ef4444'},{label:'Out of Stock',value:'0',color:'#f59e0b'}].map((stat,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,textAlign:'center'}}>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'8px',fontWeight:'600'}}>{stat.label}</p>
                        <p style={{color:stat.color,fontSize:'32px',fontWeight:'900'}}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'32px',borderRadius:'16px',border:`2px solid ${theme.border}`,textAlign:'center'}}>
                    <div style={{fontSize:'48px',marginBottom:'12px'}}>📦</div>
                    <p style={{color:theme.textSecondary,fontSize:'16px'}}>No stock alerts</p>
                  </div>
                </div>
              )}
              {activeView === 'low-stock-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>⚠️ Low Stock Report</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'flex',gap:'16px',marginBottom:'24px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>From Date</label><input type="date" value={formData.fromDate||''} onChange={(e)=>setFormData({...formData,fromDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>To Date</label><input type="date" value={formData.toDate||''} onChange={(e)=>setFormData({...formData,toDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:'12px'}}>
                      <button onClick={()=>addToast('Applying filters...','success')} style={{padding:'12px 24px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>🔍 Filter</button>
                      <button onClick={()=>{const data=[{Product:'Running Shoes',SKU:'SKU004',Stock:23,MinStock:50,Status:'Low'},{Product:'Notebook',SKU:'SKU006',Stock:18,MinStock:30,Status:'Critical'}];exportToCSV(data,'low-stock-report.csv');addToast('✅ Exported to CSV','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📄 CSV</button>
                      <button onClick={()=>{const data=[{Product:'Running Shoes',SKU:'SKU004',Stock:23,MinStock:50,Status:'Low'},{Product:'Notebook',SKU:'SKU006',Stock:18,MinStock:30,Status:'Critical'}];exportToExcel(data,'low-stock-report.xls');addToast('✅ Exported to Excel','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📊 Excel</button>
                    </div>
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr style={{borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>EAN</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>SKU</th><th style={{padding:'12px',textAlign:'right',color:theme.text,fontWeight:'700'}}>Current Stock</th><th style={{padding:'12px',textAlign:'right',color:theme.text,fontWeight:'700'}}>Min Stock</th><th style={{padding:'12px',textAlign:'center',color:theme.text,fontWeight:'700'}}>Status</th></tr></thead>
                      <tbody>
                        <tr><td colSpan={6} style={{padding:'40px',textAlign:'center',color:theme.textSecondary}}>
                          <div style={{fontSize:'48px',marginBottom:'12px'}}>✅</div>
                          <p style={{fontSize:'16px'}}>No low stock items</p>
                        </td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeView === 'low-stock-list' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <div>
                      <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text,marginBottom:'8px'}}>⚠️ Low Stock SKU List</h2>
                      <p style={{fontSize:'15px',color:theme.textSecondary}}>Products with stock below threshold</p>
                    </div>
                    <div style={{display:'flex',gap:'12px'}}>
                      <button 
                        onClick={()=>{
                          const lowStockProducts = lowStockSkuProducts;
                          if(lowStockProducts.length === 0){
                            addToast('No low stock items to export','info');
                            return;
                          }
                          const exportData = lowStockProducts.map(p=>({
                            'EAN': p.ean || p.eanNo || '-',
                            'Product Name': p.name,
                            'SKU': p.sku,
                            'Category': p.category || '-',
                            'Current Stock': p.quantity || 0,
                            'Threshold': p.lowStockThreshold || p.minThreshold || 10,
                            'Shortage': (p.lowStockThreshold || p.minThreshold || 10) - (p.quantity || 0),
                            'MRP': p.mrp || p.price || 0,
                            'Cost Price': p.costPrice || 0
                          }));
                          exportToExcel(exportData,'low-stock-sku-list.xls');
                          addToast(`✅ Exported ${lowStockProducts.length} low stock SKUs to Excel`,'success');
                        }} 
                        style={{padding:'12px 28px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,0.3)'}}
                      >
                        📊 Export to Excel
                      </button>
                      <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                    </div>
                  </div>
                  
                  {/* Summary Cards */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'32px'}}>
                    {[
                      {label:'Total Low Stock SKUs',value:lowStockSkuProducts.length.toString(),color:'#ef4444',icon:'⚠️'},
                      {label:'Critical (Stock = 0)',value:realProducts.filter(p=>(parseFloat(p.quantity)||0)===0).length.toString(),color:'#dc2626',icon:'🚨'},
                      {label:'Total SKUs',value:skuProducts.length.toString(),color:'#3b82f6',icon:'📦'}
                    ].map((stat,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,textAlign:'center'}}>
                        <div style={{fontSize:'32px',marginBottom:'8px'}}>{stat.icon}</div>
                        <p style={{color:theme.textSecondary,fontSize:'13px',marginBottom:'8px',fontWeight:'600'}}>{stat.label}</p>
                        <p style={{color:stat.color,fontSize:'32px',fontWeight:'900'}}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Low Stock Products Table */}
                  <div style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                    {lowStockSkuProducts.length === 0 ? (
                      <div style={{textAlign:'center',padding:'60px'}}>
                        <div style={{fontSize:'64px',marginBottom:'16px'}}>✅</div>
                        <p style={{fontSize:'18px',color:theme.text,fontWeight:'700',marginBottom:'8px'}}>All stocks are healthy!</p>
                        <p style={{fontSize:'15px',color:theme.textSecondary}}>No products below threshold</p>
                      </div>
                    ) : (
                      <div style={{overflowX:'auto'}}>
                        <table style={{width:'100%',borderCollapse:'collapse'}}>
                          <thead>
                            <tr style={{borderBottom:`2px solid ${theme.border}`}}>
                              <th style={{padding:'14px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>EAN</th>
                              <th style={{padding:'14px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Product Name</th>
                              <th style={{padding:'14px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>SKU</th>
                              <th style={{padding:'14px',textAlign:'left',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Category</th>
                              <th style={{padding:'14px',textAlign:'right',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Current Stock</th>
                              <th style={{padding:'14px',textAlign:'right',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Threshold</th>
                              <th style={{padding:'14px',textAlign:'right',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Shortage</th>
                              <th style={{padding:'14px',textAlign:'center',color:theme.text,fontWeight:'700',fontSize:'13px'}}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lowStockSkuProducts
                              .sort((a,b)=>(parseFloat(a.quantity)||0)-(parseFloat(b.quantity)||0))
                              .map((p,i)=>{
                                const currentStock = parseFloat(p.quantity)||0;
                                const threshold = parseFloat(p.lowStockThreshold)||parseFloat(p.minThreshold)||10;
                                const shortage = threshold - currentStock;
                                const isCritical = currentStock === 0;
                                const isVeryLow = currentStock > 0 && currentStock < threshold * 0.3;
                                
                                return (
                                  <tr 
                                    key={i} 
                                    style={{
                                      borderBottom:`1px solid ${theme.border}`,
                                      background: isCritical ? '#dc262610' : isVeryLow ? '#ef444410' : 'transparent'
                                    }} 
                                    onMouseEnter={(e)=>e.currentTarget.style.background=isCritical?'#dc262620':isVeryLow?'#ef444420':theme.sidebarHover} 
                                    onMouseLeave={(e)=>e.currentTarget.style.background=isCritical?'#dc262610':isVeryLow?'#ef444410':'transparent'}
                                  >
                                    <td style={{padding:'14px',color:theme.textSecondary,fontSize:'13px'}}>{p.ean || p.eanNo || '-'}</td>
                                    <td style={{padding:'14px',color:theme.text,fontWeight:'600',fontSize:'14px'}}>{p.name}</td>
                                    <td style={{padding:'14px',color:theme.text,fontSize:'13px',fontFamily:'monospace'}}>{p.sku}</td>
                                    <td style={{padding:'14px',color:theme.textSecondary,fontSize:'13px'}}>{p.category || '-'}</td>
                                    <td style={{padding:'14px',textAlign:'right',color:isCritical?'#dc2626':isVeryLow?'#ef4444':'#f59e0b',fontWeight:'900',fontSize:'16px'}}>{currentStock}</td>
                                    <td style={{padding:'14px',textAlign:'right',color:theme.textSecondary,fontSize:'14px'}}>{threshold}</td>
                                    <td style={{padding:'14px',textAlign:'right',color:'#ef4444',fontWeight:'700',fontSize:'14px'}}>↓ {shortage}</td>
                                    <td style={{padding:'14px',textAlign:'center'}}>
                                      <span style={{
                                        padding:'6px 14px',
                                        borderRadius:'8px',
                                        fontSize:'12px',
                                        fontWeight:'700',
                                        background: isCritical ? '#dc2626' : isVeryLow ? '#ef4444' : '#f59e0b',
                                        color:'white'
                                      }}>
                                        {isCritical ? '🚨 Critical' : isVeryLow ? '⚠️ Very Low' : '⚠️ Low'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeView === 'inward-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📥 Inward Report</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'flex',gap:'16px',marginBottom:'24px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>From Date</label><input type="date" value={formData.fromDate||''} onChange={(e)=>setFormData({...formData,fromDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>To Date</label><input type="date" value={formData.toDate||''} onChange={(e)=>setFormData({...formData,toDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:'12px'}}>
                      <button onClick={()=>addToast('Applying filters...','success')} style={{padding:'12px 24px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>🔍 Filter</button>
                      <button onClick={()=>{const data=[{Date:'28 Dec 2024',Product:'Wireless Mouse',SKU:'SKU001',Quantity:50,Supplier:'ABC Suppliers',Batch:'BATCH001'},{Date:'27 Dec 2024',Product:'USB Cable',SKU:'SKU002',Quantity:100,Supplier:'XYZ Distributors',Batch:'BATCH002'}];exportToCSV(data,'inward-report.csv');addToast('✅ Exported to CSV','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📄 CSV</button>
                      <button onClick={()=>{const data=[{Date:'28 Dec 2024',Product:'Wireless Mouse',SKU:'SKU001',Quantity:50,Supplier:'ABC Suppliers',Batch:'BATCH001'},{Date:'27 Dec 2024',Product:'USB Cable',SKU:'SKU002',Quantity:100,Supplier:'XYZ Distributors',Batch:'BATCH002'}];exportToExcel(data,'inward-report.xls');addToast('✅ Exported to Excel','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📊 Excel</button>
                    </div>
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr style={{borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Date</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>EAN</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>SKU</th><th style={{padding:'12px',textAlign:'right',color:theme.text,fontWeight:'700'}}>Quantity</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Supplier</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Batch</th></tr></thead>
                      <tbody>
                        {inwardEntries.length === 0 ? (
                          <tr><td colSpan={7} style={{padding:'40px',textAlign:'center',color:theme.textSecondary}}>
                            <div style={{fontSize:'48px',marginBottom:'12px'}}>📥</div>
                            <p style={{fontSize:'16px'}}>No inward entries yet</p>
                          </td></tr>
                        ) : inwardEntries.map((item,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${theme.border}`}}>
                            <td style={{padding:'12px',color:theme.textSecondary}}>{item.date||item.entryDate}</td>
                            <td style={{padding:'12px',color:theme.textSecondary,fontSize:'11px',fontFamily:'monospace'}}>{item.ean}</td>
                            <td style={{padding:'12px',color:theme.text,fontWeight:'600'}}>{item.productName||item.product}</td>
                            <td style={{padding:'12px',color:theme.textSecondary}}>{item.sku}</td>
                            <td style={{padding:'12px',textAlign:'right',color:'#10b981',fontWeight:'700'}}>+{item.quantity||item.qty}</td>
                            <td style={{padding:'12px',color:theme.textSecondary}}>{item.supplier}</td>
                            <td style={{padding:'12px',color:theme.text,fontFamily:'monospace',fontSize:'12px'}}>{item.batch}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeView === 'outward-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📤 Outward Report</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'flex',gap:'16px',marginBottom:'24px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>From Date</label><input type="date" value={formData.fromDate||''} onChange={(e)=>setFormData({...formData,fromDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>To Date</label><input type="date" value={formData.toDate||''} onChange={(e)=>setFormData({...formData,toDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:'12px'}}>
                      <button onClick={()=>addToast('Applying filters...','success')} style={{padding:'12px 24px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>🔍 Filter</button>
                      <button onClick={()=>{const data=[{Date:'28 Dec 2024',Product:'Wireless Mouse',SKU:'SKU001',Quantity:25,Platform:'Meesho',OrderNo:'ORD-001'},{Date:'27 Dec 2024',Product:'USB Cable',SKU:'SKU002',Quantity:50,Platform:'Amazon',OrderNo:'ORD-002'}];exportToCSV(data,'outward-report.csv');addToast('✅ Exported to CSV','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📄 CSV</button>
                      <button onClick={()=>{const data=[{Date:'28 Dec 2024',Product:'Wireless Mouse',SKU:'SKU001',Quantity:25,Platform:'Meesho',OrderNo:'ORD-001'},{Date:'27 Dec 2024',Product:'USB Cable',SKU:'SKU002',Quantity:50,Platform:'Amazon',OrderNo:'ORD-002'}];exportToExcel(data,'outward-report.xls');addToast('✅ Exported to Excel','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📊 Excel</button>
                    </div>
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr style={{borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Date</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>EAN</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>SKU</th><th style={{padding:'12px',textAlign:'right',color:theme.text,fontWeight:'700'}}>Quantity</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Platform</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Order No</th></tr></thead>
                      <tbody>
                        {outwardEntries.length === 0 ? (
                          <tr><td colSpan={7} style={{padding:'40px',textAlign:'center',color:theme.textSecondary}}>
                            <div style={{fontSize:'48px',marginBottom:'12px'}}>📤</div>
                            <p style={{fontSize:'16px'}}>No outward entries yet</p>
                          </td></tr>
                        ) : outwardEntries.map((item,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${theme.border}`}}>
                            <td style={{padding:'12px',color:theme.textSecondary}}>{item.entryDate||item.date}</td>
                            <td style={{padding:'12px',color:theme.textSecondary,fontSize:'11px',fontFamily:'monospace'}}>{item.ean}</td>
                            <td style={{padding:'12px',color:theme.text,fontWeight:'600'}}>{item.productName||item.product}</td>
                            <td style={{padding:'12px',color:theme.textSecondary}}>{item.sku}</td>
                            <td style={{padding:'12px',textAlign:'right',color:'#f59e0b',fontWeight:'700'}}>-{item.quantity||item.qty}</td>
                            <td style={{padding:'12px',color:'#3b82f6',fontWeight:'600'}}>{item.platform}</td>
                            <td style={{padding:'12px',color:theme.textSecondary,fontFamily:'monospace',fontSize:'12px'}}>{item.orderNo||item.order}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeView === 'batch-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🏷️ Batch Wise Report</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'flex',gap:'16px',marginBottom:'24px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>From Date</label><input type="date" value={formData.fromDate||''} onChange={(e)=>setFormData({...formData,fromDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>To Date</label><input type="date" value={formData.toDate||''} onChange={(e)=>setFormData({...formData,toDate:e.target.value})} style={{padding:'12px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'14px'}} /></div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:'12px'}}>
                      <button onClick={()=>addToast('Applying filters...','success')} style={{padding:'12px 24px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>🔍 Filter</button>
                      <button onClick={()=>{const data=[{Batch:'BATCH001',Product:'Wireless Mouse',Inward:50,Outward:25,Balance:25,Supplier:'ABC Suppliers'},{Batch:'BATCH002',Product:'USB Cable',Inward:100,Outward:50,Balance:50,Supplier:'XYZ Distributors'}];exportToCSV(data,'batch-report.csv');addToast('✅ Exported to CSV','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📄 CSV</button>
                      <button onClick={()=>{const data=[{Batch:'BATCH001',Product:'Wireless Mouse',Inward:50,Outward:25,Balance:25,Supplier:'ABC Suppliers'},{Batch:'BATCH002',Product:'USB Cable',Inward:100,Outward:50,Balance:50,Supplier:'XYZ Distributors'}];exportToExcel(data,'batch-report.xls');addToast('✅ Exported to Excel','success');}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>📊 Excel</button>
                    </div>
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr style={{borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Batch No</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>EAN</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'12px',textAlign:'right',color:theme.text,fontWeight:'700'}}>Inward</th><th style={{padding:'12px',textAlign:'right',color:theme.text,fontWeight:'700'}}>Outward</th><th style={{padding:'12px',textAlign:'right',color:theme.text,fontWeight:'700'}}>Balance</th><th style={{padding:'12px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Supplier</th></tr></thead>
                      <tbody>
                        <tr><td colSpan={7} style={{padding:'40px',textAlign:'center',color:theme.textSecondary}}>
                          <div style={{fontSize:'48px',marginBottom:'12px'}}>🏷️</div>
                          <p style={{fontSize:'16px'}}>No batch data available</p>
                        </td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeView === 'export-data' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <button onClick={resetView} style={{position:'absolute',top:'20px',right:'20px',padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  <div style={{fontSize:'80px',marginBottom:'28px'}}>📥</div>
                  <h2 style={{fontSize:'32px',fontWeight:'900',color:theme.text,marginBottom:'18px'}}>Export Data</h2>
                  <p style={{fontSize:'17px',color:theme.textSecondary,marginBottom:'40px'}}>Select data type and format to export</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'20px',maxWidth:'600px',margin:'0 auto 32px'}}>
                    {[{type:'Products',icon:'📦',color:'#3b82f6'},{type:'Sales',icon:'📊',color:'#06b6d4'},{type:'Inventory',icon:'📋',color:'#10b981'},{type:'Parties',icon:'👥',color:'#8b5cf6'}].map((item,i)=>(
                      <button key={i} onClick={()=>addToast(`Exporting ${item.type} data...`,'success')} style={{padding:'28px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'16px',cursor:'pointer',textAlign:'center'}}>
                        <div style={{fontSize:'48px',marginBottom:'12px'}}>{item.icon}</div>
                        <p style={{color:theme.text,fontSize:'18px',fontWeight:'800'}}>{item.type}</p>
                      </button>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center'}}>
                    <button onClick={()=>{const data=[{SKU:'SKU001',Product:'Wireless Mouse',Category:'Electronics',Stock:45,Price:'₹899'},{SKU:'SKU002',Product:'USB Cable',Category:'Electronics',Stock:120,Price:'₹199'}];exportToCSV(data,'inventory-data.csv');addToast('✅ Data exported as CSV','success');}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>Export as CSV</button>
                    <button onClick={()=>{const data=[{SKU:'SKU001',Product:'Wireless Mouse',Category:'Electronics',Stock:45,Price:'₹899'},{SKU:'SKU002',Product:'USB Cable',Category:'Electronics',Stock:120,Price:'₹199'}];exportToExcel(data,'inventory-data.xls');addToast('✅ Data exported as Excel','success');}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>Export as Excel</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Settings Page */}
          {currentPage === 'settings' && (
            <div style={{animation:'fadeIn 0.5s ease-out'}}>
              {activeView === 'main' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>⚙️</div>
                  <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Settings</h2>
                  <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Configure preferences, manage warehouses, set up integrations</p>
                  <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>handleAction('Opening Profile Settings','profile-settings')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #6366f150',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #6366f170';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #6366f150';}}>👤 Profile</button>
                    <button onClick={()=>handleAction('Opening Warehouse Config','warehouse-config')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#6366f1';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(99,102,241,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🏭 Warehouse</button>
                    <button onClick={()=>handleAction('Opening Platform Management','platform-management')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#f59e0b';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(245,158,11,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🛒 Platforms</button>
                  </div>
                </div>
              )}
              {activeView === 'profile-settings' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>👤 Profile Settings</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Full Name</label><input type="text" defaultValue="Admin User" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Email</label><input type="email" defaultValue="admin@test.com" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Phone</label><input type="tel" placeholder="+91 XXXXXXXXXX" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Company Name</label><input type="text" placeholder="Your Company" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>New Password</label><input type="password" placeholder="Leave blank to keep current" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Confirm Password</label><input type="password" placeholder="Confirm new password" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={()=>{addToast('Profile updated successfully!','success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>💾 Save Changes</button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'warehouse-config' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🏭 Warehouse Configuration</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'20px',marginBottom:'32px'}}>
                    {settingsWarehousesLoading ? (
                      <div style={{gridColumn:'1 / -1',padding:'24px',color:theme.textSecondary}}>Loading warehouses...</div>
                    ) : settingsWarehouses.length === 0 ? (
                      <div style={{gridColumn:'1 / -1',padding:'24px',color:theme.textSecondary}}>No warehouses configured</div>
                    ) : settingsWarehouses.map((w:any)=>(
                      <div key={w.id || w.name} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                          <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800'}}>{w.name || 'Unnamed Warehouse'}</h3>
                          <button onClick={()=>{setActiveView('edit-warehouse');setFormData({...formData,warehouseId:w.id,warehouseName:w.name,warehouseLocation:w.location||'',address:w.address||'',warehouseStatus:w.status||'Active'});addToast(`✏️ Editing ${w.name || 'Warehouse'}...`,'info');}} style={{padding:'6px 16px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>✏️ Edit</button>
                        </div>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'8px'}}>📍 {w.location || '—'}</p>
                        <p style={{color:'#10b981',fontSize:'14px',marginBottom:'8px',fontWeight:'700'}}>✓ {w.status || 'Active'}</p>
                        <p style={{color:theme.text,fontSize:'14px'}}>— products stored</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{setActiveView('add-warehouse');setFormData({});addToast('➕ Opening Add Warehouse form...','success');}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>➕ Add New Warehouse</button>
                </div>
              )}
              {activeView === 'add-warehouse' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>➕ Add New Warehouse</h2>
                    <button onClick={goToWarehouseConfig} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Warehouse Name</label><input type="text" placeholder="Enter warehouse name" value={formData.warehouseName||''} onChange={(e)=>setFormData({...formData,warehouseName:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Location</label><input type="text" placeholder="City, Country" value={formData.warehouseLocation||''} onChange={(e)=>setFormData({...formData,warehouseLocation:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Contact Person</label><input type="text" placeholder="Manager name" value={formData.contactPerson||''} onChange={(e)=>setFormData({...formData,contactPerson:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Phone Number</label><input type="tel" placeholder="+91 XXXXXXXXXX" value={formData.phone||''} onChange={(e)=>setFormData({...formData,phone:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div style={{gridColumn:'1 / -1'}}><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Address</label><textarea placeholder="Full address" value={formData.address||''} onChange={(e)=>setFormData({...formData,address:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px',minHeight:'100px'}} /></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={handleCreateWarehouse} style={{padding:'14px 40px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>💾 Save Warehouse</button>
                    <button onClick={goToWarehouseConfig} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'edit-warehouse' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>✏️ Edit Warehouse</h2>
                    <button onClick={goToWarehouseConfig} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Warehouse Name</label><input type="text" placeholder="Enter warehouse name" value={formData.warehouseName||''} onChange={(e)=>setFormData({...formData,warehouseName:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Location</label><input type="text" placeholder="City, Country" value={formData.warehouseLocation||''} onChange={(e)=>setFormData({...formData,warehouseLocation:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Contact Person</label><input type="text" placeholder="Manager name" value={formData.contactPerson||''} onChange={(e)=>setFormData({...formData,contactPerson:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Phone Number</label><input type="tel" placeholder="+91 XXXXXXXXXX" value={formData.phone||''} onChange={(e)=>setFormData({...formData,phone:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div style={{gridColumn:'1 / -1'}}><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Address</label><textarea placeholder="Full address" value={formData.address||''} onChange={(e)=>setFormData({...formData,address:e.target.value})} style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px',minHeight:'100px'}} /></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={handleUpdateWarehouse} style={{padding:'14px 40px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>💾 Save Changes</button>
                    <button onClick={goToWarehouseConfig} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'platform-management' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🛒 Platform Management</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  
                  {/* Add New Platform Form */}
                  <div style={{marginBottom:'32px',padding:'24px',background:'linear-gradient(135deg, #f59e0b10, #d9770610)',border:`2px solid #f59e0b30`,borderRadius:'16px'}}>
                    <label style={{display:'block',color:theme.text,marginBottom:'12px',fontWeight:'700',fontSize:'17px'}}>➕ Add New Platform</label>
                    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:'12px'}}>
                      <input 
                        type="text" 
                        placeholder="Platform name (e.g., Nykaa, Blinkit)" 
                        value={formData.newPlatformName||''} 
                        onChange={(e)=>setFormData({...formData,newPlatformName:e.target.value})} 
                        style={{padding:'14px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} 
                      />
                      <input 
                        type="color" 
                        value={formData.newPlatformColor||'#FF9900'} 
                        onChange={(e)=>setFormData({...formData,newPlatformColor:e.target.value})} 
                        style={{padding:'6px',background:theme.cardBg,border:`2px solid ${theme.border}`,borderRadius:'10px',cursor:'pointer',height:'100%'}}
                        title="Choose platform color"
                      />
                      <button 
                        onClick={()=>{
                          if(formData.newPlatformName){
                            const newId = Math.max(...platforms.map(p=>p.id),0)+1;
                            setPlatforms([...platforms,{
                              id:newId,
                              name:formData.newPlatformName,
                              color:formData.newPlatformColor||'#FF9900',
                              enabled:true
                            }]);
                            addToast(`Platform "${formData.newPlatformName}" added!`,'success');
                            setFormData({...formData,newPlatformName:'',newPlatformColor:'#FF9900'});
                          }else{
                            addToast('Please enter platform name','error');
                          }
                        }} 
                        style={{padding:'14px 32px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',whiteSpace:'nowrap'}}
                      >
                        Add Platform
                      </button>
                    </div>
                  </div>

                  {/* Platforms List */}
                  <h3 style={{fontSize:'20px',fontWeight:'800',color:theme.text,marginBottom:'20px'}}>📋 All Platforms ({platforms.length})</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',gap:'16px'}}>
                    {platforms.map((platform)=>(
                      <div 
                        key={platform.id} 
                        style={{
                          padding:'20px',
                          background:theme.sidebarHover,
                          border:`2px solid ${platform.enabled?platform.color+'40':theme.border}`,
                          borderRadius:'12px',
                          display:'flex',
                          justifyContent:'space-between',
                          alignItems:'center',
                          transition:'all 0.3s',
                          opacity:platform.enabled?1:0.6
                        }} 
                        onMouseEnter={(e)=>{
                          if(platform.enabled){
                            e.currentTarget.style.borderColor=platform.color;
                            e.currentTarget.style.transform='translateY(-2px)';
                          }
                        }} 
                        onMouseLeave={(e)=>{
                          e.currentTarget.style.borderColor=platform.enabled?platform.color+'40':theme.border;
                          e.currentTarget.style.transform='translateY(0)';
                        }}
                      >
                        <div style={{display:'flex',alignItems:'center',gap:'12px',flex:1}}>
                          <div style={{width:'40px',height:'40px',background:platform.color,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🛒</div>
                          <div>
                            <p style={{color:theme.text,fontSize:'16px',fontWeight:'700',marginBottom:'4px'}}>{platform.name}</p>
                            <p style={{color:theme.textSecondary,fontSize:'13px'}}>{platform.enabled?'✅ Active':'⏸️ Disabled'}</p>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:'8px'}}>
                          <button 
                            onClick={()=>{
                              setPlatforms(platforms.map(p=>p.id===platform.id?{...p,enabled:!p.enabled}:p));
                              addToast(`Platform "${platform.name}" ${!platform.enabled?'enabled':'disabled'}!`,!platform.enabled?'success':'info');
                            }} 
                            style={{
                              padding:'8px 12px',
                              background:platform.enabled?'linear-gradient(135deg, #6b7280, #4b5563)':'linear-gradient(135deg, #10b981, #059669)',
                              color:'white',
                              border:'none',
                              borderRadius:'8px',
                              fontSize:'12px',
                              fontWeight:'700',
                              cursor:'pointer'
                            }}
                          >
                            {platform.enabled?'⏸️':'▶️'}
                          </button>
                          <button 
                            onClick={()=>{
                              setFormData({
                                ...formData,
                                editPlatformId:platform.id,
                                editPlatformName:platform.name,
                                editPlatformColor:platform.color
                              });
                              setActiveView('edit-platform');
                              addToast(`Editing ${platform.name}...`,'info');
                            }} 
                            style={{
                              padding:'8px 12px',
                              background:'linear-gradient(135deg, #3b82f6, #2563eb)',
                              color:'white',
                              border:'none',
                              borderRadius:'8px',
                              fontSize:'12px',
                              fontWeight:'700',
                              cursor:'pointer'
                            }}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={()=>{
                              if(window.confirm(`Delete platform "${platform.name}"? This cannot be undone.`)){
                                setPlatforms(platforms.filter(p=>p.id!==platform.id));
                                addToast(`Platform "${platform.name}" deleted!`,'success');
                              }
                            }} 
                            style={{
                              padding:'8px 12px',
                              background:'linear-gradient(135deg, #ef4444, #dc2626)',
                              color:'white',
                              border:'none',
                              borderRadius:'8px',
                              fontSize:'12px',
                              fontWeight:'700',
                              cursor:'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeView === 'edit-platform' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>✏️ Edit Platform</h2>
                    <button onClick={()=>setActiveView('platform-management')} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'24px',maxWidth:'600px'}}>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Platform Name</label>
                      <input 
                        type="text" 
                        placeholder="Platform name" 
                        value={formData.editPlatformName||''} 
                        onChange={(e)=>setFormData({...formData,editPlatformName:e.target.value})} 
                        style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} 
                      />
                    </div>
                    <div>
                      <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Platform Color</label>
                      <input 
                        type="color" 
                        value={formData.editPlatformColor||'#FF9900'} 
                        onChange={(e)=>setFormData({...formData,editPlatformColor:e.target.value})} 
                        style={{width:'100%',padding:'6px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',cursor:'pointer',height:'52px'}}
                      />
                    </div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button 
                      onClick={()=>{
                        if(formData.editPlatformName){
                          setPlatforms(platforms.map(p=>
                            p.id===formData.editPlatformId
                              ?{...p,name:formData.editPlatformName,color:formData.editPlatformColor}
                              :p
                          ));
                          addToast('Platform updated successfully!','success');
                          setActiveView('platform-management');
                        }else{
                          addToast('Please enter platform name','error');
                        }
                      }} 
                      style={{padding:'14px 40px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}
                    >
                      💾 Save Changes
                    </button>
                    <button onClick={()=>setActiveView('platform-management')} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'integration-setup' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🔗 Integration Setup</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
                    {[{name:'Amazon',icon:'🛒',status:'Connected',color:'#ff9900'},{name:'Flipkart',icon:'🛍️',status:'Connected',color:'#2874f0'},{name:'Meesho',icon:'📦',status:'Not Connected',color:'#9c1ab1'},{name:'Shopify',icon:'🏪',status:'Not Connected',color:'#96bf48'},{name:'WooCommerce',icon:'🛒',status:'Not Connected',color:'#96588a'},{name:'Custom API',icon:'🔗',status:'Not Connected',color:'#6366f1'}].map((int,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'28px',borderRadius:'16px',border:`2px solid ${int.status==='Connected'?int.color+'40':theme.border}`,textAlign:'center',cursor:'pointer'}} onClick={()=>addToast(`${int.name} integration ${int.status==='Connected'?'already active':'coming soon'}`,int.status==='Connected'?'success':'info')}>
                        <div style={{fontSize:'48px',marginBottom:'12px'}}>{int.icon}</div>
                        <h3 style={{color:theme.text,fontSize:'18px',fontWeight:'800',marginBottom:'8px'}}>{int.name}</h3>
                        <p style={{color:int.status==='Connected'?int.color:theme.textSecondary,fontSize:'13px',fontWeight:'700'}}>{int.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

const ProtectedRoute: React.FC<{children: React.ReactElement}> = ({children}) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'36px',height:'36px',border:'3px solid rgba(241,245,249,0.25)',borderTopColor:'#f1f5f9',borderRadius:'999px',margin:'0 auto 12px',animation:'spin 1s linear infinite'}} />
          <div style={{fontSize:'14px',fontWeight:700}}>Restoring session…</div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SuperAdmin') return <Navigate to="/super-admin/dashboard" replace />;
  return children;
};

function App() {
  React.useEffect(() => {
    (window as any).__AURA_APP_MOUNTED__ = true;
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CompanyProvider>
            <WarehouseProvider>
              <HashRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
                  <Route
                    path="/super-admin/dashboard"
                    element={
                      <SuperAdminRoute>
                        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
                          <SuperAdminLayout>
                            <SuperAdminDashboard />
                          </SuperAdminLayout>
                        </React.Suspense>
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/super-admin/companies"
                    element={
                      <SuperAdminRoute>
                        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
                          <SuperAdminLayout>
                            <SuperAdminCompanies />
                          </SuperAdminLayout>
                        </React.Suspense>
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/super-admin/users"
                    element={
                      <SuperAdminRoute>
                        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
                          <SuperAdminLayout>
                            <SuperAdminUsers />
                          </SuperAdminLayout>
                        </React.Suspense>
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/super-admin/subscriptions"
                    element={
                      <SuperAdminRoute>
                        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
                          <SuperAdminLayout>
                            <SuperAdminSubscriptions />
                          </SuperAdminLayout>
                        </React.Suspense>
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/super-admin/activity-logs"
                    element={
                      <SuperAdminRoute>
                        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
                          <SuperAdminLayout>
                            <SuperAdminActivityLogs />
                          </SuperAdminLayout>
                        </React.Suspense>
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/super-admin/settings"
                    element={
                      <SuperAdminRoute>
                        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading…</div>}>
                          <SuperAdminLayout>
                            <SuperAdminSettings />
                          </SuperAdminLayout>
                        </React.Suspense>
                      </SuperAdminRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </HashRouter>
            </WarehouseProvider>
          </CompanyProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Show immediate bootstrap UI to avoid a blank screen while JS loads/mounts
(window as any).__AURA_APP_MOUNTED__ = false;
const rootEl = document.getElementById('root');
if (rootEl) {
  rootEl.innerHTML = `
    <div style="min-height:100vh;background:#0b1220;color:#e2e8f0;font-family:system-ui;display:flex;align-items:center;justify-content:center;padding:24px">
      <div style="text-align:center">
        <div style="width:36px;height:36px;border:3px solid rgba(226,232,240,0.25);border-top-color:#e2e8f0;border-radius:999px;margin:0 auto 12px;animation:spin 1s linear infinite"></div>
        <div style="font-size:14px;font-weight:800">Loading Aura Inventory…</div>
      </div>
    </div>
  `;
}

// If React never mounts (blocked JS / runtime stall), show a clear error
setTimeout(() => {
  if (!(window as any).__AURA_APP_MOUNTED__) {
    renderBootstrapError('App did not mount. Check Console/Network for blocked JS or a runtime error.');
  }
}, 5000);

root.render(<App />);

// Add spin animation for loading
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);
