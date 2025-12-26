import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import './index.css';

// Eager load
import Landing from './pages/Landing';
import Login from './pages/Login';

// Lazy load
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Inward = lazy(() => import('./pages/Inward'));
const Outward = lazy(() => import('./pages/Outward'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

const LoadingSpinner = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f1f5f9'}}>
    <div style={{textAlign:'center'}}>
      <div style={{width:'48px',height:'48px',border:'4px solid #e2e8f0',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px'}}></div>
      <p style={{color:'#64748b',fontSize:'14px'}}>Loading...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{children: React.ReactElement}> = ({children}) => {
  const {user,loading} = useAuth();
  if (!loading && !user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
              <Route path="/inward" element={<ProtectedRoute><Layout><Inward /></Layout></ProtectedRoute>} />
              <Route path="/outward" element={<ProtectedRoute><Layout><Outward /></Layout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

const s = document.createElement('style');
s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(s);
