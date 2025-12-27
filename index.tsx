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
  const [darkMode, setDarkMode] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  
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
              onClick={()=>setCurrentPage(item.id)}
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
          <h1 style={{fontSize:'24px',fontWeight:'bold',color:theme.text,marginBottom:'4px',textTransform:'capitalize'}}>{currentPage}</h1>
          <p style={{fontSize:'14px',color:theme.textSecondary}}>Welcome back, {user.name}</p>
        </div>
        
        {/* Main Content */}
        <div style={{padding:'40px'}}>
          {/* Stats Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'24px',marginBottom:'40px'}}>
            {[
              {title:'Total Products',value:'0',change:'+12%',icon:'📦',color:'#3b82f6'},
              {title:'Total Stock Value',value:'₹0',change:'+8%',icon:'💰',color:'#10b981'},
              {title:'Low Stock Items',value:'0',change:'-3%',icon:'⚠️',color:'#f59e0b'},
              {title:'Active SKUs',value:'0',change:'+5%',icon:'📊',color:'#8b5cf6'}
            ].map((stat,i)=>(
              <div key={i} style={{background:theme.cardBg,padding:'24px',borderRadius:'12px',border:`1px solid ${theme.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                  <div style={{width:'48px',height:'48px',borderRadius:'12px',background:stat.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>
                    {stat.icon}
                  </div>
                  <span style={{fontSize:'12px',fontWeight:'600',color:'#10b981',background:'#10b98120',padding:'4px 8px',borderRadius:'6px'}}>
                    {stat.change}
                  </span>
                </div>
                <p style={{fontSize:'14px',color:theme.textSecondary,marginBottom:'8px'}}>{stat.title}</p>
                <p style={{fontSize:'32px',fontWeight:'bold',color:theme.text}}>{stat.value}</p>
              </div>
            ))}
          </div>
          
          {/* Charts Section */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'24px',marginBottom:'40px'}}>
            {/* Sales Chart */}
            <div style={{background:theme.cardBg,padding:'24px',borderRadius:'12px',border:`1px solid ${theme.border}`}}>
              <h3 style={{fontSize:'18px',fontWeight:'bold',color:theme.text,marginBottom:'24px'}}>Sales Overview</h3>
              <div style={{display:'flex',alignItems:'flex-end',gap:'12px',height:'200px'}}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i)=>{
                  const heights=['65%','45%','80%','60%','90%','55%','75%'];
                  const colors=['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899'];
                  return (
                    <div key={day} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
                      <div style={{width:'100%',background:colors[i],borderRadius:'8px 8px 0 0',height:heights[i]}}></div>
                      <span style={{fontSize:'12px',color:theme.textSecondary,fontWeight:'600'}}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div style={{background:theme.cardBg,padding:'24px',borderRadius:'12px',border:`1px solid ${theme.border}`}}>
              <h3 style={{fontSize:'18px',fontWeight:'bold',color:theme.text,marginBottom:'20px'}}>Quick Actions</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {[
                  {name:'Add Product',icon:'➕',color:'#3b82f6',page:'products'},
                  {name:'Stock Inward',icon:'📥',color:'#10b981',page:'inward'},
                  {name:'Stock Outward',icon:'📤',color:'#f59e0b',page:'outward'},
                  {name:'Reports',icon:'📄',color:'#8b5cf6',page:'reports'}
                ].map(action=>(
                  <button
                    key={action.name}
                    onClick={()=>setCurrentPage(action.page)}
                    style={{padding:'14px 16px',background:theme.sidebarHover,border:`1px solid ${theme.border}`,borderRadius:'10px',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',transition:'all 0.2s',color:theme.text}}
                  >
                    <span style={{fontSize:'20px'}}>{action.icon}</span>
                    <span style={{fontSize:'14px',fontWeight:'600'}}>{action.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div style={{background:theme.cardBg,padding:'24px',borderRadius:'12px',border:`1px solid ${theme.border}`}}>
            <h3 style={{fontSize:'18px',fontWeight:'bold',color:theme.text,marginBottom:'20px'}}>Recent Activity</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                {action:'Product Added',item:'Face Cream 50ml',time:'2 mins ago',icon:'📦',color:'#3b82f6'},
                {action:'Stock Inward',item:'50 units received',time:'1 hour ago',icon:'📥',color:'#10b981'},
                {action:'Stock Outward',item:'Amazon Order #12345',time:'3 hours ago',icon:'📤',color:'#f59e0b'}
              ].map((activity,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'16px',padding:'12px',borderRadius:'10px',background:theme.sidebarHover,border:`1px solid ${theme.border}`}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'10px',background:activity.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>
                    {activity.icon}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:'14px',fontWeight:'600',color:theme.text,marginBottom:'2px'}}>{activity.action}</p>
                    <p style={{fontSize:'12px',color:theme.textSecondary}}>{activity.item}</p>
                  </div>
                  <span style={{fontSize:'11px',color:theme.textSecondary,fontWeight:'600'}}>{activity.time}</span>
                </div>
              ))}
            </div>
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
