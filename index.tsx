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
  
  const handleAction = (action: string) => {
    addToast(`${action} - Feature coming soon!`, 'success');
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
            <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)',animation:'fadeIn 0.5s ease-out'}}>
              <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📦</div>
              <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #3b82f6, #8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Products Management</h2>
              <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Add products, manage inventory, track SKUs, and update stock levels</p>
              <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>handleAction('Add New Product')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #3b82f6, #2563eb)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #3b82f650',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #3b82f670';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #3b82f650';}}>➕ Add New Product</button>
                <button onClick={()=>handleAction('View All Products')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(59,130,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📋 View All</button>
                <button onClick={()=>handleAction('Import Products')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📥 Import</button>
              </div>
            </div>
          )}
          
          {/* Inward Page */}
          {currentPage === 'inward' && (
            <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)',animation:'fadeIn 0.5s ease-out'}}>
              <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📥</div>
              <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #10b981, #059669)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Stock Inward</h2>
              <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Record incoming stock, track purchase orders, and update inventory</p>
              <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>handleAction('Add Inward Entry')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #10b981, #059669)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #10b98150',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #10b98170';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #10b98150';}}>📥 Add Inward Entry</button>
                <button onClick={()=>handleAction('View Inward History')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#10b981';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(16,185,129,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📜 History</button>
              </div>
            </div>
          )}
          
          {/* Outward Page */}
          {currentPage === 'outward' && (
            <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)',animation:'fadeIn 0.5s ease-out'}}>
              <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📤</div>
              <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #f59e0b, #d97706)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Stock Outward</h2>
              <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Create shipments, manage platform orders, and track deliveries</p>
              <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>handleAction('Create Shipment')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #f59e0b, #d97706)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #f59e0b50',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #f59e0b70';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #f59e0b50';}}>📦 Create Shipment</button>
                <button onClick={()=>handleAction('Platform Orders')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#f59e0b';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(245,158,11,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🛒 Platform Orders</button>
              </div>
            </div>
          )}
          
          {/* Parties Page */}
          {currentPage === 'parties' && (
            <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)',animation:'fadeIn 0.5s ease-out'}}>
              <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>👥</div>
              <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Parties Management</h2>
              <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Manage suppliers and customers, track transactions</p>
              <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>handleAction('Add Party')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #8b5cf650',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #8b5cf670';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #8b5cf650';}}>➕ Add Party</button>
                <button onClick={()=>handleAction('View Suppliers')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🏭 Suppliers</button>
                <button onClick={()=>handleAction('View Customers')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#a78bfa';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(167,139,250,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>👤 Customers</button>
              </div>
            </div>
          )}
          
          {/* Reports Page */}
          {currentPage === 'reports' && (
            <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)',animation:'fadeIn 0.5s ease-out'}}>
              <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>📈</div>
              <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Reports & Analytics</h2>
              <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Generate reports, analyze trends, export data</p>
              <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>handleAction('Sales Report')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #06b6d4, #0891b2)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #06b6d450',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #06b6d470';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #06b6d450';}}>📊 Sales Report</button>
                <button onClick={()=>handleAction('Stock Report')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#06b6d4';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(6,182,212,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📦 Stock Report</button>
                <button onClick={()=>handleAction('Export Data')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#22d3ee';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(34,211,238,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>📥 Export</button>
              </div>
            </div>
          )}
          
          {/* Settings Page */}
          {currentPage === 'settings' && (
            <div style={{background:theme.cardBg,padding:'60px',borderRadius:'20px',border:`2px solid ${theme.border}`,textAlign:'center',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.1)',animation:'fadeIn 0.5s ease-out'}}>
              <div style={{fontSize:'80px',marginBottom:'28px',animation:'pulse 2s infinite'}}>⚙️</div>
              <h2 style={{fontSize:'36px',fontWeight:'900',color:theme.text,marginBottom:'18px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',WebkitBackgroundClip:'text',WebkitTextFillColor:darkMode?'transparent':theme.text}}>Settings</h2>
              <p style={{fontSize:'18px',color:theme.textSecondary,marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>Configure preferences, manage warehouses, set up integrations</p>
              <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>handleAction('Profile Settings')} style={{padding:'16px 40px',background:'linear-gradient(135deg, #6366f1, #4f46e5)',color:'white',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',boxShadow:'0 6px 24px #6366f150',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-4px) scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px #6366f170';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 6px 24px #6366f150';}}>👤 Profile</button>
                <button onClick={()=>handleAction('Warehouse Config')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#6366f1';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(99,102,241,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🏭 Warehouse</button>
                <button onClick={()=>handleAction('Integration Setup')} style={{padding:'16px 40px',background:theme.sidebarHover,color:theme.text,border:`2px solid ${theme.border}`,borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',transition:'all 0.4s'}} onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#818cf8';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(129,140,248,0.2)';}} onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>🔗 Integration</button>
              </div>
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
