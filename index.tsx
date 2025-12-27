import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { CompanyProvider } from './context/CompanyContext';
import { WarehouseProvider } from './context/WarehouseContext';
import './index.css';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Inward = lazy(() => import('./pages/Inward'));
const Outward = lazy(() => import('./pages/Outward'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Parties = lazy(() => import('./pages/Parties'));
const StockAdjustment = lazy(() => import('./pages/StockAdjustment'));
const Layout = lazy(() => import('./components/layout/Layout'));

function Landing() {
  const navigate = useNavigate();
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
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',fontFamily:'system-ui',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px',background:'white',padding:'40px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize:'32px',fontWeight:'bold',textAlign:'center',marginBottom:'8px',color:'#667eea'}}>Aura Inventory</h1>
        <p style={{textAlign:'center',color:'#64748b',marginBottom:'32px'}}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#374151'}}>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={{width:'100%',padding:'12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px'}} placeholder="admin@test.com" />
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',marginBottom:'8px',fontSize:'14px',fontWeight:'600',color:'#374151'}}>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required style={{width:'100%',padding:'12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px'}} placeholder="Admin@123" />
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

// Loading fallback component
const LoadingFallback = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f1f5f9'}}>
    <div style={{textAlign:'center'}}>
      <div style={{width:'48px',height:'48px',border:'4px solid #e2e8f0',borderTopColor:'#667eea',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}}></div>
      <p style={{color:'#64748b',fontSize:'14px'}}>Loading...</p>
    </div>
  </div>
);

// Protected route with contexts
const ProtectedRoute: React.FC<{children: React.ReactElement}> = ({children}) => {
  const {user} = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <CompanyProvider>
      <WarehouseProvider>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </WarehouseProvider>
    </CompanyProvider>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <Layout><Products /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/inward" element={
              <ProtectedRoute>
                <Layout><Inward /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/outward" element={
              <ProtectedRoute>
                <Layout><Outward /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout><Reports /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/parties" element={
              <ProtectedRoute>
                <Layout><Parties /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/stock-adjustment" element={
              <ProtectedRoute>
                <Layout><StockAdjustment /></Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

// Add spin animation for loading
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);
