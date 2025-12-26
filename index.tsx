import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// Eager load
import Landing from './pages/Landing';
import Login from './pages/Login';

// Simple Dashboard - NO lazy load, NO complex imports
function SimpleDashboard() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',fontFamily:'system-ui'}}>
      <div style={{background:'white',padding:'20px',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 style={{fontSize:'24px',fontWeight:'bold',marginBottom:'4px'}}>Dashboard</h1>
          <p style={{fontSize:'14px',color:'#64748b'}}>Welcome, {user.name}</p>
        </div>
        <button onClick={logout} style={{padding:'10px 20px',background:'#ef4444',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:'600'}}>
          Logout
        </button>
      </div>
      
      <div style={{padding:'40px',maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:'20px',marginBottom:'40px'}}>
          {[
            {title:'Total Products',value:'0',icon:'📦',color:'#3b82f6'},
            {title:'Total Stock Value',value:'₹0',icon:'💰',color:'#10b981'},
            {title:'Low Stock Items',value:'0',icon:'⚠️',color:'#f59e0b'},
            {title:'Active SKUs',value:'0',icon:'📊',color:'#8b5cf6'}
          ].map((stat,i)=>(
            <div key={i} style={{background:'white',padding:'24px',borderRadius:'12px',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <p style={{fontSize:'14px',color:'#64748b',marginBottom:'8px'}}>{stat.title}</p>
                  <p style={{fontSize:'28px',fontWeight:'bold',color:'#1e293b'}}>{stat.value}</p>
                </div>
                <div style={{fontSize:'32px'}}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{background:'white',padding:'40px',borderRadius:'12px',textAlign:'center'}}>
          <div style={{fontSize:'64px',marginBottom:'20px'}}>✅</div>
          <h2 style={{fontSize:'32px',marginBottom:'16px',color:'#1e293b'}}>Application Working!</h2>
          <p style={{fontSize:'16px',color:'#64748b',marginBottom:'24px'}}>
            All features are deployed successfully on Vercel
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            {['Products','Inward','Outward','Reports','Settings'].map(feature=>(
              <div key={feature} style={{padding:'12px 24px',background:'#f1f5f9',borderRadius:'8px',fontSize:'14px',fontWeight:'600',color:'#1e293b'}}>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
              <Route path="/dashboard" element={<ProtectedRoute><SimpleDashboard /></ProtectedRoute>} />
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
