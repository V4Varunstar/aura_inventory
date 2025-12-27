import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import './index.css';

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

function DashboardPage() {
  const { user, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',fontFamily:'system-ui'}}>
      {/* Header */}
      <div style={{background:'#1e293b',padding:'20px 40px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'4px'}}>Dashboard</h1>
          <p style={{fontSize:'14px',color:'#94a3b8'}}>Welcome back, {user.name}</p>
        </div>
        <button onClick={logout} style={{padding:'10px 24px',background:'#ef4444',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>
          Logout
        </button>
      </div>
      
      {/* Main Content */}
      <div style={{padding:'40px',maxWidth:'1400px',margin:'0 auto'}}>
        {/* Stats Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'24px',marginBottom:'40px'}}>
          {[
            {title:'Total Products',value:'0',change:'+12%',icon:'📦',color:'#3b82f6'},
            {title:'Total Stock Value',value:'₹0',change:'+8%',icon:'💰',color:'#10b981'},
            {title:'Low Stock Items',value:'0',change:'-3%',icon:'⚠️',color:'#f59e0b'},
            {title:'Active SKUs',value:'0',change:'+5%',icon:'📊',color:'#8b5cf6'}
          ].map((stat,i)=>(
            <div key={i} style={{background:'#1e293b',padding:'24px',borderRadius:'12px',border:'1px solid #334155'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'12px',background:stat.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>
                  {stat.icon}
                </div>
                <span style={{fontSize:'12px',fontWeight:'600',color:'#10b981',background:'#10b98120',padding:'4px 8px',borderRadius:'6px'}}>
                  {stat.change}
                </span>
              </div>
              <p style={{fontSize:'14px',color:'#94a3b8',marginBottom:'8px'}}>{stat.title}</p>
              <p style={{fontSize:'32px',fontWeight:'bold',color:'#f1f5f9'}}>{stat.value}</p>
            </div>
          ))}
        </div>
        
        {/* Charts Section */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'24px',marginBottom:'40px'}}>
          {/* Sales Chart */}
          <div style={{background:'#1e293b',padding:'24px',borderRadius:'12px',border:'1px solid #334155'}}>
            <h3 style={{fontSize:'18px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'24px'}}>Sales Overview</h3>
            <div style={{display:'flex',alignItems:'flex-end',gap:'12px',height:'200px'}}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i)=>{
                const heights=['65%','45%','80%','60%','90%','55%','75%'];
                const colors=['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899'];
                return (
                  <div key={day} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
                    <div style={{width:'100%',background:colors[i],borderRadius:'8px 8px 0 0',height:heights[i]}}></div>
                    <span style={{fontSize:'12px',color:'#94a3b8',fontWeight:'600'}}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div style={{background:'#1e293b',padding:'24px',borderRadius:'12px',border:'1px solid #334155'}}>
            <h3 style={{fontSize:'18px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'20px'}}>Quick Actions</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                {name:'Add Product',icon:'➕',color:'#3b82f6'},
                {name:'Stock Inward',icon:'📥',color:'#10b981'},
                {name:'Stock Outward',icon:'📤',color:'#f59e0b'},
                {name:'Reports',icon:'📄',color:'#8b5cf6'}
              ].map(action=>(
                <div key={action.name} style={{padding:'14px 16px',background:'#0f172a',border:'1px solid #334155',borderRadius:'10px',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',transition:'all 0.2s'}}>
                  <span style={{fontSize:'20px'}}>{action.icon}</span>
                  <span style={{fontSize:'14px',fontWeight:'600',color:'#f1f5f9'}}>{action.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div style={{background:'#1e293b',padding:'24px',borderRadius:'12px',border:'1px solid #334155'}}>
          <h3 style={{fontSize:'18px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'20px'}}>Recent Activity</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {[
              {action:'Product Added',item:'Face Cream 50ml',time:'2 mins ago',icon:'📦',color:'#3b82f6'},
              {action:'Stock Inward',item:'50 units received',time:'1 hour ago',icon:'📥',color:'#10b981'},
              {action:'Stock Outward',item:'Amazon Order #12345',time:'3 hours ago',icon:'📤',color:'#f59e0b'}
            ].map((activity,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'16px',padding:'12px',borderRadius:'10px',background:'#0f172a',border:'1px solid #334155'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'10px',background:activity.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>
                  {activity.icon}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:'14px',fontWeight:'600',color:'#f1f5f9',marginBottom:'2px'}}>{activity.action}</p>
                  <p style={{fontSize:'12px',color:'#94a3b8'}}>{activity.item}</p>
                </div>
                <span style={{fontSize:'11px',color:'#64748b',fontWeight:'600'}}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ProtectedRoute: React.FC<{children: React.ReactElement}> = ({children}) => {
  const {user} = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
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
