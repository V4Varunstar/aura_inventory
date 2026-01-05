import React, { Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ToastProvider } from './context/ToastContext';
import { WarehouseProvider } from './context/WarehouseContext';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Something Went Wrong</h1>
            <p style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: 'white',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import Layout from './components/layout/Layout';
// Eager load critical components
import Landing from './pages/Landing';
import Login from './pages/Login';

// Lazy load non-critical pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Inward = lazy(() => import('./pages/Inward'));
const Outward = lazy(() => import('./pages/Outward'));
const Adjustments = lazy(() => import('./pages/Adjustments'));
const Audit = lazy(() => import('./pages/Audit'));
const Warehouses = lazy(() => import('./pages/Warehouses'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Lazy load platform pages
const FbaShipments = lazy(() => import('./pages/amazon-fba'));
const CreateAmazonFbaShipment = lazy(() => import('./pages/amazon-fba/create'));
const FlipkartFbfShipments = lazy(() => import('./pages/flipkart-fbf'));
const CreateFlipkartFbfShipment = lazy(() => import('./pages/flipkart-fbf/create'));
const MyntraSjitShipments = lazy(() => import('./pages/myntra-sjit'));
const CreateMyntraSjitShipment = lazy(() => import('./pages/myntra-sjit/create'));

// Lazy load marketing pages
const Pricing = lazy(() => import('./pages/Pricing'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
// Lazy load remaining platform pages
const ZeptoPoShipments = lazy(() => import('./pages/zepto-po'));
const CreateZeptoPoShipment = lazy(() => import('./pages/zepto-po/create'));
const NykaaPoShipments = lazy(() => import('./pages/nykaa-po'));
const CreateNykaaPoShipment = lazy(() => import('./pages/nykaa-po/create'));

// Lazy load utility pages
const ProductMapping = lazy(() => import('./pages/ProductMapping'));
const Sources = lazy(() => import('./pages/settings/Sources'));
const Demo = lazy(() => import('./pages/Demo'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ExpiringProducts = lazy(() => import('./pages/ExpiringProducts'));
const CategorySalesAnalytics = lazy(() => import('./pages/CategorySalesAnalytics'));
const DashboardHTML = lazy(() => import('./pages/DashboardHTML'));

// Lazy load new outward stock pages
const OutwardStockPage = lazy(() => import('./pages/OutwardStockPage'));
const OutwardInventoryPage = lazy(() => import('./pages/OutwardInventoryPage'));

// NEW: Lazy load party and stock adjustment pages
const Parties = lazy(() => import('./pages/Parties'));
const StockAdjustment = lazy(() => import('./pages/StockAdjustment'));

// Critical components that should NOT be lazy loaded
import SuperAdminRoute from './components/auth/SuperAdminRoute';

// Lazy load Super Admin pages (but not the route guard)
const SuperAdminLayout = lazy(() => import('./components/layout/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/Dashboard'));
const SuperAdminCompanies = lazy(() => import('./pages/super-admin/Companies'));
const SuperAdminUsers = lazy(() => import('./pages/super-admin/Users'));
const SuperAdminSubscriptions = lazy(() => import('./pages/super-admin/Subscriptions'));
const SuperAdminActivityLogs = lazy(() => import('./pages/super-admin/ActivityLogs'));
const SuperAdminSettings = lazy(() => import('./pages/super-admin/Settings'));

// Optimized Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

// ProtectedRoute component - optimized with loading state
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  // Don't block on loading - just redirect if no user after loaded
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect Super Admin to Super Admin panel
  if (user && user.role === 'SuperAdmin') {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  return children;
};


const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return(
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                    user ? (
                        user.role === 'SuperAdmin' ? 
                        <Navigate to="/super-admin/dashboard" /> : 
                        <Navigate to="/dashboard" />
                    ) : <Landing />
                } />
                <Route path="/demo" element={<Demo />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/login" element={
                    user ? (
                        user.role === 'SuperAdmin' ?
                        <Navigate to="/super-admin/dashboard" /> :
                        <Navigate to="/dashboard" />
                    ) : <Login />
                } />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/dashboard-html" element={<ProtectedRoute><DashboardHTML /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
                <Route path="/inward" element={<ProtectedRoute><Layout><Inward /></Layout></ProtectedRoute>} />
                <Route path="/outward" element={<ProtectedRoute><Layout><Outward /></Layout></ProtectedRoute>} />
                <Route path="/outward-stock" element={<ProtectedRoute><Layout><OutwardStockPage /></Layout></ProtectedRoute>} />
                <Route path="/outward-inventory" element={<OutwardInventoryPage />} />
                <Route path="/adjustments" element={<ProtectedRoute><Layout><Adjustments /></Layout></ProtectedRoute>} />
                <Route path="/stock-adjustment" element={<ProtectedRoute><Layout><StockAdjustment /></Layout></ProtectedRoute>} />
                <Route path="/parties" element={<ProtectedRoute><Layout><Parties /></Layout></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><Layout><Audit /></Layout></ProtectedRoute>} />
            <Route path="/warehouses" element={<ProtectedRoute><Layout><Warehouses /></Layout></ProtectedRoute>} />
            <Route path="/amazon-fba" element={<ProtectedRoute><Layout><FbaShipments /></Layout></ProtectedRoute>} />
            <Route path="/amazon-fba/create" element={<ProtectedRoute><Layout><CreateAmazonFbaShipment /></Layout></ProtectedRoute>} />
            <Route path="/flipkart-fbf" element={<ProtectedRoute><Layout><FlipkartFbfShipments /></Layout></ProtectedRoute>} />
            <Route path="/flipkart-fbf/create" element={<ProtectedRoute><Layout><CreateFlipkartFbfShipment /></Layout></ProtectedRoute>} />
            <Route path="/myntra-sjit" element={<ProtectedRoute><Layout><MyntraSjitShipments /></Layout></ProtectedRoute>} />
            <Route path="/myntra-sjit/create" element={<ProtectedRoute><Layout><CreateMyntraSjitShipment /></Layout></ProtectedRoute>} />
            <Route path="/zepto-po" element={<ProtectedRoute><Layout><ZeptoPoShipments /></Layout></ProtectedRoute>} />
            <Route path="/zepto-po/create" element={<ProtectedRoute><Layout><CreateZeptoPoShipment /></Layout></ProtectedRoute>} />
            <Route path="/nykaa-po" element={<ProtectedRoute><Layout><NykaaPoShipments /></Layout></ProtectedRoute>} />
            <Route path="/nykaa-po/create" element={<ProtectedRoute><Layout><CreateNykaaPoShipment /></Layout></ProtectedRoute>} />
            <Route path="/product-mapping" element={<ProtectedRoute><Layout><ProductMapping /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/category-sales" element={<ProtectedRoute><Layout><CategorySalesAnalytics /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route path="/settings/sources" element={<ProtectedRoute><Layout><Sources /></Layout></ProtectedRoute>} />
            <Route path="/expiring-products" element={<ProtectedRoute><Layout><ExpiringProducts /></Layout></ProtectedRoute>} />
            
            {/* Super Admin Routes */}
            <Route path="/super-admin/*" element={
                <SuperAdminRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                        <SuperAdminLayout>
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<SuperAdminDashboard />} />
                                <Route path="companies" element={<SuperAdminCompanies />} />
                                <Route path="users" element={<SuperAdminUsers />} />
                                <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
                                <Route path="activity-logs" element={<SuperAdminActivityLogs />} />
                                <Route path="settings" element={<SuperAdminSettings />} />
                            </Routes>
                        </SuperAdminLayout>
                    </Suspense>
                </SuperAdminRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    )
}

function App() {
  console.log('🎯 App component rendering...');
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CompanyProvider>
            <WarehouseProvider>
              <HashRouter>
                <AppRoutes />
              </HashRouter>
            </WarehouseProvider>
          </CompanyProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
