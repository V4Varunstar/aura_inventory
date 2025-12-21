import React, { useState } from 'react';
import Sidebar from './components-dashboard/Sidebar';
import Dashboard from './components-dashboard/Dashboard';
import CompaniesPage from './components-dashboard/CompaniesPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === 'demo@aura.com' && password === 'demo123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials. Try: demo@aura.com / demo123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ marginBottom: '10px', color: '#333', fontSize: '24px' }}>Aura Inventory</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Login to your account</p>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@aura.com"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo123"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{ 
                padding: '10px', 
                background: '#ffebee', 
                color: '#c62828', 
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Login
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
            Demo credentials: demo@aura.com / demo123
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#112117', fontFamily: 'system-ui' }}>
      <Sidebar onLogout={handleLogout} activePage={activePage} setActivePage={setActivePage} />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        {/* Top Bar */}
        <header style={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid #2a4034',
          background: '#112117',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}>
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#182820',
              border: '1px solid #2a4034',
              borderRadius: '12px',
              padding: '12px 16px',
              gap: '12px'
            }}>
              <span style={{ color: '#64748b' }}>🔍</span>
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
              background: '#182820',
              border: '1px solid #2a4034',
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
                background: '#36e27b',
                borderRadius: '50%',
                border: '2px solid #112117'
              }} />
            </button>
          </div>
        </header>

        {activePage === 'Dashboard' && <Dashboard />}
        {activePage === 'Companies' && <CompaniesPage />}
        {activePage === 'Users' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#112117' }}>
            <div style={{ background: '#182820', border: '1px solid #2a4034', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>User Management</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>User management features coming soon...</p>
            </div>
          </div>
        )}
        {activePage === 'Subscriptions' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#112117' }}>
            <div style={{ background: '#182820', border: '1px solid #2a4034', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Subscriptions</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>Subscription management features coming soon...</p>
            </div>
          </div>
        )}
        {activePage === 'Activity Logs' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#112117' }}>
            <div style={{ background: '#182820', border: '1px solid #2a4034', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Activity Logs</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>Activity logs features coming soon...</p>
            </div>
          </div>
        )}
        {activePage === 'Settings' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#112117' }}>
            <div style={{ background: '#182820', border: '1px solid #2a4034', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Settings</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>Settings features coming soon...</p>
            </div>
          </div>
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
