import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import './index.css';

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
  const { addToast } = useToast();
  const [darkMode, setDarkMode] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [activeView, setActiveView] = React.useState('main');
  const [formData, setFormData] = React.useState<any>({});
  
  // EAN to Product mapping database
  const eanProducts: any = {
    '8901234567890': {name: 'Wireless Mouse', sku: 'SKU001', category: 'Electronics', price: 899},
    '8901234567891': {name: 'USB Cable', sku: 'SKU002', category: 'Electronics', price: 199},
    '8901234567892': {name: 'Cotton T-Shirt', sku: 'SKU003', category: 'Clothing', price: 599},
    '8901234567893': {name: 'Running Shoes', sku: 'SKU004', category: 'Footwear', price: 2499},
    '8901234567894': {name: 'Water Bottle', sku: 'SKU005', category: 'Accessories', price: 299},
    '8901234567895': {name: 'Notebook Set', sku: 'SKU006', category: 'Stationery', price: 149},
    '8901234567896': {name: 'Backpack', sku: 'SKU007', category: 'Bags', price: 1299},
    '8901234567897': {name: 'Headphones', sku: 'SKU008', category: 'Electronics', price: 1599},
  };
  
  const lookupEAN = (ean: string) => {
    const product = eanProducts[ean];
    if (product) {
      setFormData({...formData, ean, productName: product.name, sku: product.sku, price: product.price});
      addToast(`Product found: ${product.name} (${product.sku})`, 'success');
    } else {
      addToast('EAN not found in database', 'error');
      setFormData({...formData, ean, productName: '', sku: ''});
    }
  };
  
  const handleAction = (action: string, view?: string) => {
    if (view) {
      setActiveView(view);
      addToast(`${action}`, 'success');
    } else {
      addToast(`${action} - Feature coming soon!`, 'success');
    }
  };
  
  const resetView = () => {
    setActiveView('main');
    setFormData({});
  };
  
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
          <h1 style={{fontSize:'24px',fontWeight:'bold',color:theme.text,marginBottom:'4px',textTransform:'capitalize'}}>{currentPage}</h1>
          <p style={{fontSize:'14px',color:theme.textSecondary}}>Welcome back, {user.name}</p>
        </div>
        
        {/* Main Content */}
        <div style={{padding:'40px'}}>
          
          {/* Dashboard View */}
          {currentPage === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'24px',marginBottom:'40px'}}>
                {[
                  {title:'Total Products',value:'247',change:'+12%',icon:'📦',color:'#3b82f6',gradient:'linear-gradient(135deg, #3b82f6, #2563eb)',trend:'up'},
                  {title:'Total Stock Value',value:'₹15.2L',change:'+8%',icon:'💰',color:'#10b981',gradient:'linear-gradient(135deg, #10b981, #059669)',trend:'up'},
                  {title:'Low Stock Items',value:'23',change:'-3%',icon:'⚠️',color:'#f59e0b',gradient:'linear-gradient(135deg, #f59e0b, #d97706)',trend:'down'},
                  {title:'Active SKUs',value:'189',change:'+5%',icon:'📊',color:'#8b5cf6',gradient:'linear-gradient(135deg, #8b5cf6, #7c3aed)',trend:'up'}
                ].map((stat,i)=>(
                  <div key={i} style={{background:theme.cardBg,padding:'26px',borderRadius:'16px',border:`2px solid ${theme.border}`,transition:'all 0.4s',cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:darkMode?'0 4px 16px rgba(0,0,0,0.3)':'0 4px 16px rgba(0,0,0,0.08)'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-8px)';e.currentTarget.style.borderColor=stat.color;e.currentTarget.style.boxShadow=`0 12px 32px ${stat.color}40`;}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.boxShadow=darkMode?'0 4px 16px rgba(0,0,0,0.3)':'0 4px 16px rgba(0,0,0,0.08)';}}>
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
                <span style={{fontSize:'13px',color:theme.textSecondary,background:theme.sidebarHover,padding:'8px 16px',borderRadius:'10px',fontWeight:'700',border:`1px solid ${theme.border}`}}>₹3.35L Total</span>
              </div>
              <div style={{display:'flex',alignItems:'flex-end',gap:'16px',height:'240px',paddingTop:'12px',position:'relative'}}>
                {[
                  {day:'Mon',value:65,sales:'₹45K',amount:45000},
                  {day:'Tue',value:45,sales:'₹32K',amount:32000},
                  {day:'Wed',value:85,sales:'₹58K',amount:58000},
                  {day:'Thu',value:60,sales:'₹42K',amount:42000},
                  {day:'Fri',value:95,sales:'₹68K',amount:68000},
                  {day:'Sat',value:55,sales:'₹38K',amount:38000},
                  {day:'Sun',value:75,sales:'₹52K',amount:52000}
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
                    <button onClick={()=>handleAction('Opening Import Tool','import-products')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📥 Import</button>
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
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Product Name</label><input type="text" placeholder="Enter product name" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,name:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>SKU</label><input type="text" placeholder="Enter SKU" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,sku:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Category</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,category:e.target.value})}><option>Select Category</option><option>Electronics</option><option>Clothing</option><option>Food</option></select></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Price (₹)</label><input type="number" placeholder="0.00" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,price:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Stock Quantity</label><input type="number" placeholder="0" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,quantity:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Warehouse</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,warehouse:e.target.value})}><option>Main Warehouse</option><option>Secondary Warehouse</option></select></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={()=>{addToast(`Product "${formData.name || 'New Product'}" added successfully!`,'success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>💾 Save Product</button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'view-products' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📋 All Products</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>SKU</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product Name</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Category</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Stock</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Price</th></tr></thead>
                      <tbody>
                        {[{sku:'SKU001',name:'Wireless Mouse',category:'Electronics',stock:45,price:'₹899'},{sku:'SKU002',name:'USB Cable',category:'Electronics',stock:120,price:'₹199'},{sku:'SKU003',name:'Cotton T-Shirt',category:'Clothing',stock:67,price:'₹599'},{sku:'SKU004',name:'Running Shoes',category:'Footwear',stock:23,price:'₹2499'},{sku:'SKU005',name:'Water Bottle',category:'Accessories',stock:89,price:'₹299'}].map((p,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.background=theme.sidebarHover} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                            <td style={{padding:'16px',color:theme.text,fontWeight:'600'}}>{p.sku}</td>
                            <td style={{padding:'16px',color:theme.text}}>{p.name}</td>
                            <td style={{padding:'16px',color:theme.textSecondary}}>{p.category}</td>
                            <td style={{padding:'16px',color:p.stock<30?'#ef4444':'#10b981',fontWeight:'700'}}>{p.stock}</td>
                            <td style={{padding:'16px',color:theme.text,fontWeight:'700'}}>{p.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeView === 'import-products' && (
                <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <button onClick={resetView} style={{position:'absolute',top:'20px',right:'20px',padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  <div style={{fontSize:'80px',marginBottom:'28px'}}>📥</div>
                  <h2 style={{fontSize:'32px',fontWeight:'900',color:theme.text,marginBottom:'18px'}}>Import Products</h2>
                  <p style={{fontSize:'17px',color:theme.textSecondary,marginBottom:'32px'}}>Upload CSV or Excel file to bulk import products</p>
                  <div style={{border:`3px dashed ${theme.border}`,borderRadius:'16px',padding:'60px',marginBottom:'24px',cursor:'pointer'}} onClick={()=>addToast('File upload dialog would open here','info')}>
                    <div style={{fontSize:'64px',marginBottom:'16px'}}>📄</div>
                    <p style={{color:theme.text,fontSize:'18px',fontWeight:'600'}}>Click to upload or drag & drop</p>
                    <p style={{color:theme.textSecondary,fontSize:'14px',marginTop:'8px'}}>CSV, XLSX files supported</p>
                  </div>
                  <button onClick={()=>{addToast('Import completed: 156 products added','success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>Start Import</button>
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
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📥 Add Inward Entry</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{marginBottom:'32px',padding:'24px',background:'linear-gradient(135deg, #10b98110, #05966910)',border:`2px solid #10b98130`,borderRadius:'16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
                      <div style={{fontSize:'48px'}}>📷</div>
                      <div style={{flex:1}}>
                        <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'700',fontSize:'18px'}}>🔍 Scan or Enter EAN Number</label>
                        <input type="text" placeholder="Enter 13-digit EAN barcode" value={formData.ean||''} onChange={(e)=>setFormData({...formData,ean:e.target.value})} onKeyPress={(e)=>{if(e.key==='Enter' && formData.ean) lookupEAN(formData.ean);}} style={{width:'100%',padding:'16px',background:theme.cardBg,border:`3px solid #10b981`,borderRadius:'12px',color:theme.text,fontSize:'20px',fontWeight:'700',letterSpacing:'2px'}} />
                        <p style={{color:theme.textSecondary,fontSize:'13px',marginTop:'8px'}}>💡 Scan barcode or type EAN and press Enter</p>
                      </div>
                      <button onClick={()=>{if(formData.ean) lookupEAN(formData.ean);}} style={{padding:'16px 32px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer',height:'fit-content'}}>🔍 Lookup</button>
                    </div>
                    {formData.productName && (
                      <div style={{padding:'16px',background:theme.cardBg,borderRadius:'12px',border:`2px solid #10b981`}}>
                        <p style={{color:'#10b981',fontSize:'16px',fontWeight:'800',marginBottom:'8px'}}>✅ Product Found</p>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                          <div><span style={{color:theme.textSecondary,fontSize:'13px'}}>Product:</span><p style={{color:theme.text,fontSize:'15px',fontWeight:'700'}}>{formData.productName}</p></div>
                          <div><span style={{color:theme.textSecondary,fontSize:'13px'}}>SKU:</span><p style={{color:theme.text,fontSize:'15px',fontWeight:'700'}}>{formData.sku}</p></div>
                          <div><span style={{color:theme.textSecondary,fontSize:'13px'}}>Price:</span><p style={{color:theme.text,fontSize:'15px',fontWeight:'700'}}>₹{formData.price}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Product Name</label><input type="text" value={formData.productName||''} placeholder="Auto-filled from EAN" readOnly style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px',opacity:0.7}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>SKU</label><input type="text" value={formData.sku||''} placeholder="Auto-filled from EAN" readOnly style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px',opacity:0.7}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Quantity</label><input type="number" placeholder="0" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,quantity:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Batch/Lot Number</label><input type="text" placeholder="Enter batch number" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,batch:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Supplier</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,supplier:e.target.value})}><option>Select Supplier</option><option>ABC Suppliers</option><option>XYZ Distributors</option></select></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Purchase Order</label><input type="text" placeholder="PO Number (optional)" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,po:e.target.value})} /></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={()=>{addToast(`Inward entry recorded: ${formData.quantity||0} units of ${formData.productName||'product'}!`,'success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>✓ Submit Entry</button>
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
                        <thead><tr style={{background:theme.cardBg}}><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>EAN Number</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Product Name</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>SKU</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Quantity</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Batch Number</th><th style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.text,fontWeight:'700',textAlign:'left'}}>Supplier</th></tr></thead>
                        <tbody>
                          <tr><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>8901234567890</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>Wireless Mouse</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>SKU001</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>50</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>BATCH001</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>ABC Suppliers</td></tr>
                          <tr><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>8901234567891</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>USB Cable</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>SKU002</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>100</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>BATCH002</td><td style={{padding:'12px',border:`1px solid ${theme.border}`,color:theme.textSecondary}}>XYZ Distributors</td></tr>
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
                        {[{date:'28 Dec 2024',product:'Wireless Mouse',batch:'BATCH001',qty:50,supplier:'ABC Suppliers'},{date:'27 Dec 2024',product:'USB Cable',batch:'BATCH002',qty:100,supplier:'XYZ Distributors'},{date:'26 Dec 2024',product:'Cotton T-Shirt',batch:'BATCH003',qty:75,supplier:'Fashion Hub'},{date:'25 Dec 2024',product:'Running Shoes',batch:'BATCH004',qty:30,supplier:'Sports Co'}].map((item,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.background=theme.sidebarHover} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                            <td style={{padding:'16px',color:theme.textSecondary}}>{item.date}</td>
                            <td style={{padding:'16px',color:theme.text,fontWeight:'600'}}>{item.product}</td>
                            <td style={{padding:'16px',color:theme.text}}>{item.batch}</td>
                            <td style={{padding:'16px',color:'#10b981',fontWeight:'700'}}>+{item.qty}</td>
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
                  </div>
                </div>
              )}
              {activeView === 'create-shipment' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📦 Create Shipment</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{marginBottom:'32px',padding:'24px',background:'linear-gradient(135deg, #f59e0b10, #d9770610)',border:`2px solid #f59e0b30`,borderRadius:'16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
                      <div style={{fontSize:'48px'}}>📷</div>
                      <div style={{flex:1}}>
                        <label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'700',fontSize:'18px'}}>🔍 Scan or Enter EAN Number</label>
                        <input type="text" placeholder="Enter 13-digit EAN barcode" value={formData.ean||''} onChange={(e)=>setFormData({...formData,ean:e.target.value})} onKeyPress={(e)=>{if(e.key==='Enter' && formData.ean) lookupEAN(formData.ean);}} style={{width:'100%',padding:'16px',background:theme.cardBg,border:`3px solid #f59e0b`,borderRadius:'12px',color:theme.text,fontSize:'20px',fontWeight:'700',letterSpacing:'2px'}} />
                        <p style={{color:theme.textSecondary,fontSize:'13px',marginTop:'8px'}}>💡 Scan barcode or type EAN and press Enter</p>
                      </div>
                      <button onClick={()=>{if(formData.ean) lookupEAN(formData.ean);}} style={{padding:'16px 32px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer',height:'fit-content'}}>🔍 Lookup</button>
                    </div>
                    {formData.productName && (
                      <div style={{padding:'16px',background:theme.cardBg,borderRadius:'12px',border:`2px solid #f59e0b`}}>
                        <p style={{color:'#f59e0b',fontSize:'16px',fontWeight:'800',marginBottom:'8px'}}>✅ Product Found</p>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                          <div><span style={{color:theme.textSecondary,fontSize:'13px'}}>Product:</span><p style={{color:theme.text,fontSize:'15px',fontWeight:'700'}}>{formData.productName}</p></div>
                          <div><span style={{color:theme.textSecondary,fontSize:'13px'}}>SKU:</span><p style={{color:theme.text,fontSize:'15px',fontWeight:'700'}}>{formData.sku}</p></div>
                          <div><span style={{color:theme.textSecondary,fontSize:'13px'}}>Price:</span><p style={{color:theme.text,fontSize:'15px',fontWeight:'700'}}>₹{formData.price}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',maxWidth:'900px'}}>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Order/Invoice Number</label><input type="text" placeholder="Enter order number" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,orderNo:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Customer</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,customer:e.target.value})}><option>Select Customer</option><option>Customer A</option><option>Customer B</option></select></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Product Name</label><input type="text" value={formData.productName||''} placeholder="Auto-filled from EAN" readOnly style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px',opacity:0.7}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>SKU</label><input type="text" value={formData.sku||''} placeholder="Auto-filled from EAN" readOnly style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px',opacity:0.7}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Quantity</label><input type="number" placeholder="0" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,quantity:e.target.value})} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Shipping Method</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} onChange={(e)=>setFormData({...formData,shipping:e.target.value})}><option>Standard</option><option>Express</option><option>Same Day</option></select></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={()=>{addToast(`Shipment created: ${formData.quantity||0} units of ${formData.productName||'product'} to ${formData.customer||'customer'}!`,'success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>🚚 Create Shipment</button>
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
              {activeView === 'platform-orders' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🛒 Platform Orders</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'32px'}}>
                    {[{platform:'Amazon',orders:45,color:'#ff9900'},{platform:'Flipkart',orders:32,color:'#2874f0'},{platform:'Meesho',orders:28,color:'#9c1ab1'}].map((p,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.borderColor=p.color} onMouseLeave={(e)=>e.currentTarget.style.borderColor=theme.border}>
                        <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'12px'}}>{p.platform}</h3>
                        <p style={{color:p.color,fontSize:'32px',fontWeight:'900'}}>{p.orders}</p>
                        <p style={{color:theme.textSecondary,fontSize:'14px'}}>Pending Orders</p>
                      </div>
                    ))}
                  </div>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr style={{background:theme.sidebarHover,borderBottom:`2px solid ${theme.border}`}}><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Order ID</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Platform</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Product</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Status</th><th style={{padding:'16px',textAlign:'left',color:theme.text,fontWeight:'700'}}>Action</th></tr></thead>
                    <tbody>
                      {[{id:'AMZ12345',platform:'Amazon',product:'Wireless Mouse',status:'Pending'},{id:'FLP67890',platform:'Flipkart',product:'USB Cable',status:'Processing'},{id:'MSH45678',platform:'Meesho',product:'T-Shirt',status:'Pending'}].map((order,i)=>(
                        <tr key={i} style={{borderBottom:`1px solid ${theme.border}`}}>
                          <td style={{padding:'16px',color:theme.text,fontWeight:'600'}}>{order.id}</td>
                          <td style={{padding:'16px',color:theme.text}}>{order.platform}</td>
                          <td style={{padding:'16px',color:theme.textSecondary}}>{order.product}</td>
                          <td style={{padding:'16px'}}><span style={{padding:'6px 14px',background:'#fbbf2420',color:'#f59e0b',borderRadius:'8px',fontSize:'13px',fontWeight:'700'}}>{order.status}</span></td>
                          <td style={{padding:'16px'}}><button onClick={()=>addToast(`Processing order ${order.id}`,'success')} style={{padding:'8px 20px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Process</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Party Name</label><input type="text" placeholder="Enter name" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Party Type</label><select style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}}><option>Supplier</option><option>Customer</option><option>Both</option></select></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Contact Person</label><input type="text" placeholder="Contact name" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Phone</label><input type="tel" placeholder="+91 XXXXXXXXXX" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>Email</label><input type="email" placeholder="email@example.com" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                    <div><label style={{display:'block',color:theme.text,marginBottom:'8px',fontWeight:'600'}}>GSTIN</label><input type="text" placeholder="22AAAAA0000A1Z5" style={{width:'100%',padding:'14px',background:theme.sidebarHover,border:`2px solid ${theme.border}`,borderRadius:'10px',color:theme.text,fontSize:'15px'}} /></div>
                  </div>
                  <div style={{marginTop:'32px',display:'flex',gap:'16px'}}>
                    <button onClick={()=>{addToast('Party added successfully!','success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>💾 Save Party</button>
                    <button onClick={resetView} style={{padding:'14px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              )}
              {activeView === 'view-suppliers' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>🏭 Suppliers</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
                    {[{name:'ABC Suppliers',contact:'Rajesh Kumar',phone:'+91 9876543210',balance:'₹ 45,000'},{name:'XYZ Distributors',contact:'Amit Shah',phone:'+91 9876543211',balance:'₹ 32,000'},{name:'Fashion Hub',contact:'Priya Sharma',phone:'+91 9876543212',balance:'₹ 18,500'}].map((s,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.borderColor='#8b5cf6'} onMouseLeave={(e)=>e.currentTarget.style.borderColor=theme.border}>
                        <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'8px'}}>{s.name}</h3>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'4px'}}>👤 {s.contact}</p>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'12px'}}>📞 {s.phone}</p>
                        <p style={{color:'#8b5cf6',fontSize:'18px',fontWeight:'800'}}>Balance: {s.balance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeView === 'view-customers' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>👤 Customers</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
                    {[{name:'Retail Store A',contact:'Suresh Mehta',phone:'+91 9876543220',orders:45},{name:'Wholesale B',contact:'Kiran Patel',phone:'+91 9876543221',orders:32},{name:'E-commerce C',contact:'Neha Gupta',phone:'+91 9876543222',orders:67}].map((c,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.borderColor='#a78bfa'} onMouseLeave={(e)=>e.currentTarget.style.borderColor=theme.border}>
                        <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'8px'}}>{c.name}</h3>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'4px'}}>👤 {c.contact}</p>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'12px'}}>📞 {c.phone}</p>
                        <p style={{color:'#a78bfa',fontSize:'18px',fontWeight:'800'}}>Total Orders: {c.orders}</p>
                      </div>
                    ))}
                  </div>
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
                  <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>handleAction('Generating Sales Report','sales-report')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #06b6d450',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #06b6d470';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #06b6d450';}}>📊 Sales Report</button>
                    <button onClick={()=>handleAction('Generating Stock Report','stock-report')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#06b6d4';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(6,182,212,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📦 Stock Report</button>
                    <button onClick={()=>handleAction('Opening Export Tool','export-data')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#22d3ee';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(34,211,238,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📥 Export</button>
                  </div>
                </div>
              )}
              {activeView === 'sales-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📊 Sales Report</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px',marginBottom:'32px'}}>
                    {[{label:'Total Sales',value:'₹ 3,35,300',color:'#06b6d4'},{label:'Orders',value:'105',color:'#10b981'},{label:'Avg Order',value:'₹ 3,193',color:'#f59e0b'},{label:'Growth',value:'+12%',color:'#8b5cf6'}].map((stat,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,textAlign:'center'}}>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'8px',fontWeight:'600'}}>{stat.label}</p>
                        <p style={{color:stat.color,fontSize:'28px',fontWeight:'900'}}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'32px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                    <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'20px'}}>Top Products</h3>
                    {[{name:'Wireless Mouse',sales:'₹ 67,000',units:89},{name:'USB Cable',sales:'₹ 45,000',units:234},{name:'T-Shirt',sales:'₹ 38,000',units:67}].map((p,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',background:theme.cardBg,borderRadius:'12px',marginBottom:'12px'}}>
                        <div>
                          <p style={{color:theme.text,fontSize:'16px',fontWeight:'700',marginBottom:'4px'}}>{p.name}</p>
                          <p style={{color:theme.textSecondary,fontSize:'13px'}}>{p.units} units sold</p>
                        </div>
                        <p style={{color:'#06b6d4',fontSize:'20px',fontWeight:'900'}}>{p.sales}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeView === 'stock-report' && (
                <div style={{background:theme.cardBg,padding:'40px',borderRadius:'20px',border:`2px solid ${theme.border}`,boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
                    <h2 style={{fontSize:'28px',fontWeight:'900',color:theme.text}}>📦 Stock Report</h2>
                    <button onClick={resetView} style={{padding:'10px 24px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>← Back</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'32px'}}>
                    {[{label:'Total Items',value:'247',color:'#3b82f6'},{label:'Low Stock',value:'23',color:'#ef4444'},{label:'Out of Stock',value:'5',color:'#f59e0b'}].map((stat,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`,textAlign:'center'}}>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'8px',fontWeight:'600'}}>{stat.label}</p>
                        <p style={{color:stat.color,fontSize:'32px',fontWeight:'900'}}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{background:theme.sidebarHover,padding:'32px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                    <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'20px'}}>Low Stock Alert</h3>
                    {[{name:'Running Shoes',stock:23,min:50},{name:'Notebook',stock:18,min:30},{name:'Water Bottle',stock:12,min:25}].map((p,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',background:theme.cardBg,borderRadius:'12px',marginBottom:'12px',border:`2px solid #ef444420`}}>
                        <p style={{color:theme.text,fontSize:'16px',fontWeight:'700'}}>{p.name}</p>
                        <div style={{textAlign:'right'}}>
                          <p style={{color:'#ef4444',fontSize:'20px',fontWeight:'900'}}>{p.stock}</p>
                          <p style={{color:theme.textSecondary,fontSize:'12px'}}>Min: {p.min}</p>
                        </div>
                      </div>
                    ))}
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
                    <button onClick={()=>{addToast('Data exported as CSV','success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>Export as CSV</button>
                    <button onClick={()=>{addToast('Data exported as Excel','success');resetView();}} style={{padding:'14px 40px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>Export as Excel</button>
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
                    <button onClick={()=>handleAction('Opening Integration Setup','integration-setup')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#818cf8';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(129,140,248,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🔗 Integration</button>
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
                    {[{name:'Main Warehouse',location:'Mumbai, India',status:'Active',products:189},{name:'Secondary Warehouse',location:'Delhi, India',status:'Active',products:58}].map((w,i)=>(
                      <div key={i} style={{background:theme.sidebarHover,padding:'24px',borderRadius:'16px',border:`2px solid ${theme.border}`}}>
                        <h3 style={{color:theme.text,fontSize:'20px',fontWeight:'800',marginBottom:'12px'}}>{w.name}</h3>
                        <p style={{color:theme.textSecondary,fontSize:'14px',marginBottom:'8px'}}>📍 {w.location}</p>
                        <p style={{color:'#10b981',fontSize:'14px',marginBottom:'8px',fontWeight:'700'}}>✓ {w.status}</p>
                        <p style={{color:theme.text,fontSize:'14px'}}>{w.products} products stored</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>addToast('Add new warehouse feature coming soon!','info')} style={{padding:'14px 40px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'800',cursor:'pointer'}}>➕ Add New Warehouse</button>
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
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);
