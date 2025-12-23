import React, { useState } from 'react';
import Sidebar from './components-dashboard/Sidebar';
import Dashboard from './components-dashboard/Dashboard';
import CompaniesPage from './components-dashboard/CompaniesPage';
import UsersPage from './components-dashboard/UsersPage';
import SubscriptionsPage from './components-dashboard/SubscriptionsPage';
import ActivityLogsPage from './components-dashboard/ActivityLogsPage';
import SettingsPage from './components-dashboard/SettingsPage';
import CompanyDashboard from './components-dashboard/CompanyDashboard';

interface User {
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'company-user';
  company?: string;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');

  // Load users from localStorage on mount
  React.useEffect(() => {
    const storedUsers = localStorage.getItem('inventoryUsers');
    if (!storedUsers) {
      // Initialize with super admin
      const defaultUsers: User[] = [
        {
          email: 'demo@aura.com',
          password: 'demo123',
          name: 'Super Admin',
          role: 'superadmin'
        }
      ];
      localStorage.setItem('inventoryUsers', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get users from localStorage
    const storedUsers = localStorage.getItem('inventoryUsers');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Find matching user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials. Try: demo@aura.com / demo123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setActivePage('Dashboard');
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: 'system-ui',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.8)', 
          backdropFilter: 'blur(20px)',
          padding: '48px', 
          borderRadius: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: '440px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo/Icon */}
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '36px',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
          }}>
            📦
          </div>
          
          <h1 style={{ 
            marginBottom: '8px', 
            color: 'white', 
            fontSize: '32px', 
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: '-0.02em'
          }}>Aura Inventory</h1>
          <p style={{ 
            color: '#94a3b8', 
            marginBottom: '32px',
            textAlign: 'center',
            fontSize: '15px'
          }}>
            Super Admin Dashboard
          </p>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#e2e8f0', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@aura.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'white',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#e2e8f0', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'white',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {error && (
              <div style={{ 
                padding: '14px 16px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#fca5a5', 
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '14px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ 
            marginTop: '24px', 
            padding: '16px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginBottom: '8px', fontWeight: '500' }}>
              Demo Credentials
            </div>
            <div style={{ fontSize: '13px', color: '#10b981', textAlign: 'center', fontFamily: 'monospace' }}>
              demo@aura.com / demo123
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  console.log('🎯 Rendering Dashboard Screen for user:', currentUser);
  console.log('🎯 Active page:', activePage);
  
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#0f172a', fontFamily: 'system-ui' }}>
      {currentUser?.role === 'superadmin' && <Sidebar onLogout={handleLogout} activePage={activePage} setActivePage={setActivePage} />}
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
        {/* Top Bar */}
        <header style={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid #334155',
          background: '#1e293b',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}>
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#334155',
              border: '1px solid #475569',
              borderRadius: '12px',
              padding: '12px 16px',
              gap: '12px'
            }}>
              <span style={{ color: '#94a3b8' }}>🔍</span>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{
              position: 'relative',
              padding: '12px',
              borderRadius: '12px',
              background: '#334155',
              border: '1px solid #475569',
              cursor: 'pointer',
              color: '#94a3b8'
            }}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid #1e293b'
              }} />
            </button>
          </div>
        </header>

        {currentUser?.role === 'superadmin' ? (
          <>
            {activePage === 'Dashboard' && <Dashboard onNavigate={setActivePage} />}
            {activePage === 'Companies' && <CompaniesPage />}
            {activePage === 'Users' && <UsersPage />}
            {activePage === 'Subscriptions' && <SubscriptionsPage />}
            {activePage === 'Activity Logs' && <ActivityLogsPage />}
            {activePage === 'Settings' && <SettingsPage />}
          </>
        ) : (
          <CompanyDashboard 
            user={{
              name: currentUser?.name || '',
              company: currentUser?.company || '',
              email: currentUser?.email || ''
            }}
            onLogout={handleLogout}
          />
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 50,
              display: 'flex'
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              style={{
                width: '288px',
                background: '#0d1812',
                height: '100%',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <Sidebar onLogout={handleLogout} activePage={activePage} setActivePage={setActivePage} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
