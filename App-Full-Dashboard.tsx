import React, { useState } from 'react';
import Sidebar from './components-dashboard/Sidebar';
import Dashboard from './components-dashboard/Dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-border-dark bg-white/50 dark:bg-[#112117]/80 backdrop-blur-md sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              className="text-gray-500 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span>☰</span>
            </button>
            <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>
          </div>
          
          <div className="hidden lg:flex flex-col">
            <h2 className="text-2xl font-bold dark:text-white tracking-tight">Dashboard Overview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, here's what's happening today.</p>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="relative p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-highlight transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
            </button>
          </div>
        </header>

        <Dashboard />

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-72 bg-white dark:bg-[#0d1812] h-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <Sidebar onLogout={handleLogout} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
