import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import './index.css';

// Inline Landing Page
function Landing() {
  const navigate = useNavigate();
  
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',fontFamily:'system-ui',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{maxWidth:'800px',textAlign:'center',color:'white'}}>
        <h1 style={{fontSize:'48px',fontWeight:'bold',marginBottom:'20px'}}>Aura Inventory</h1>
        <p style={{fontSize:'20px',marginBottom:'40px',opacity:0.9}}>Complete Inventory Management System</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'20px',marginBottom:'40px'}}>
          {['📦 Products','📊 Analytics','🏢 Warehouses','📈 Reports'].map(f=>(
            <div key={f} style={{background:'rgba(255,255,255,0.2)',padding:'20px',borderRadius:'12px',backdropFilter:'blur(10px)'}}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>{f.split(' ')[0]}</div>
              <div style={{fontSize:'16px',fontWeight:'600'}}>{f.split(' ')[1]}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>navigate('/login')} style={{padding:'16px 48px',background:'white',color:'#667eea',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
          Get Started
        </button>
      </div>
    </div>
  );
}

// Inline Login Page
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

// Inline Dashboard with sidebar navigation
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return <Navigate to="/login" replace />;
  
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'products', name: 'Products', icon: '📦' },
    { id: 'inward', name: 'Inward', icon: '📥' },
    { id: 'outward', name: 'Outward', icon: '📤' },
    { id: 'reports', name: 'Reports', icon: '📈' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];
  
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f1f5f9',fontFamily:'system-ui'}}>
      {/* Sidebar */}
      <div style={{width:'250px',background:'#1e293b',color:'white',padding:'20px',display:'flex',flexDirection:'column'}}>
        <h2 style={{fontSize:'24px',fontWeight:'bold',marginBottom:'32px',color:'#667eea'}}>Aura Inventory</h2>
        <div style={{flex:1}}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width:'100%',
                padding:'12px 16px',
                marginBottom:'8px',
                background:currentPage===item.id?'#667eea':'transparent',
                color:'white',
                border:'none',
                borderRadius:'8px',
                cursor:'pointer',
                textAlign:'left',
                fontSize:'14px',
                fontWeight:'500',
                display:'flex',
                alignItems:'center',
                gap:'12px'
              }}
            >
              <span style={{fontSize:'20px'}}>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>
        <div style={{paddingTop:'20px',borderTop:'1px solid #334155'}}>
          <p style={{fontSize:'13px',color:'#94a3b8',marginBottom:'8px'}}>{user.name}</p>
          <p style={{fontSize:'12px',color:'#64748b',marginBottom:'12px'}}>{user.email}</p>
          <button onClick={logout} style={{width:'100%',padding:'10px',background:'#ef4444',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'14px',fontWeight:'600'}}>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{flex:1,padding:'32px'}}>
        <div style={{maxWidth:'1400px',margin:'0 auto'}}>
          {currentPage === 'dashboard' && (
            <>
              <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'24px',color:'#1e293b'}}>Dashboard</h1>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:'20px',marginBottom:'32px'}}>
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
              <div style={{background:'white',padding:'32px',borderRadius:'12px',textAlign:'center'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>✅</div>
                <h2 style={{fontSize:'28px',marginBottom:'12px',color:'#1e293b'}}>Dashboard Ready!</h2>
                <p style={{fontSize:'16px',color:'#64748b'}}>Click sidebar items to navigate</p>
              </div>
            </>
          )}
          
          {currentPage === 'products' && (
            <>
              <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'24px',color:'#1e293b'}}>Products Management</h1>
              <div style={{background:'white',padding:'32px',borderRadius:'12px',textAlign:'center'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>📦</div>
                <h2 style={{fontSize:'24px',marginBottom:'12px',color:'#1e293b'}}>Products Module</h2>
                <p style={{fontSize:'16px',color:'#64748b'}}>Add, edit, and manage your products here</p>
              </div>
            </>
          )}
          
          {currentPage === 'inward' && (
            <>
              <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'24px',color:'#1e293b'}}>Stock Inward</h1>
              <div style={{background:'white',padding:'32px',borderRadius:'12px',textAlign:'center'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>📥</div>
                <h2 style={{fontSize:'24px',marginBottom:'12px',color:'#1e293b'}}>Inward Module</h2>
                <p style={{fontSize:'16px',color:'#64748b'}}>Record incoming stock with EAN scanning</p>
              </div>
            </>
          )}
          
          {currentPage === 'outward' && (
            <>
              <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'24px',color:'#1e293b'}}>Stock Outward</h1>
              <div style={{background:'white',padding:'32px',borderRadius:'12px',textAlign:'center'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>📤</div>
                <h2 style={{fontSize:'24px',marginBottom:'12px',color:'#1e293b'}}>Outward Module</h2>
                <p style={{fontSize:'16px',color:'#64748b'}}>Process outgoing stock and shipments</p>
              </div>
            </>
          )}
          
          {currentPage === 'reports' && (
            <>
              <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'24px',color:'#1e293b'}}>Reports</h1>
              <div style={{background:'white',padding:'32px',borderRadius:'12px',textAlign:'center'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>📈</div>
                <h2 style={{fontSize:'24px',marginBottom:'12px',color:'#1e293b'}}>Reports Module</h2>
                <p style={{fontSize:'16px',color:'#64748b'}}>Generate and download various reports</p>
              </div>
            </>
          )}
          
          {currentPage === 'settings' && (
            <>
              <h1 style={{fontSize:'32px',fontWeight:'bold',marginBottom:'24px',color:'#1e293b'}}>Settings</h1>
              <div style={{background:'white',padding:'32px',borderRadius:'12px',textAlign:'center'}}>
                <div style={{fontSize:'64px',marginBottom:'16px'}}>⚙️</div>
                <h2 style={{fontSize:'24px',marginBottom:'12px',color:'#1e293b'}}>Settings Module</h2>
                <p style={{fontSize:'16px',color:'#64748b'}}>Configure your system preferences</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
const ProtectedRoute: React.FC<{children: React.ReactElement}> = ({children}) => {
  const {user} = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Main App Component
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/inward" element={<ProtectedRoute><Inward /></ProtectedRoute>} />
            <Route path="/outward" element={<ProtectedRoute><Outward /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

// Render App
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

// Add spin animation
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);
