import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

console.log('✅ Starting SAFE version - Auth + Toast only');

// Simple Landing Page
function Landing() {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '20px' }}>
            ✅ Aura Inventory
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '40px', opacity: 0.9 }}>
            Complete Inventory Management System
          </p>
          <Link to="/login" style={{
            display: 'inline-block',
            padding: '16px 40px',
            background: '#4ade80',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            Get Started →
          </Link>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '60px'
        }}>
          {[
            '📦 Product Management',
            '📥 Inward Stock',
            '📤 Outward Stock',
            '📊 Analytics Dashboard',
            '📄 Reports & Export',
            '⚙️ Settings & Config'
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              fontSize: '18px'
            }}>
              {feature}
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
          <p>Version: 1.0.5-SAFE (Auth + Toast only)</p>
          <p style={{marginTop: '8px'}}>Build: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}

// Simple Login Page  
function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Login attempt:', email);
      
      // Simple direct validation for testing
      if (email === 'admin@test.com' && password === 'Admin@123') {
        // Create user directly
        const testUser = {
          id: '1',
          name: 'Admin User',
          email: email,
          role: 'Admin' as any,
          orgId: 'test-org',
          isEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Store in localStorage
        localStorage.setItem('aura_inventory_user', JSON.stringify(testUser));
        
        // Reload to trigger auth check
        window.location.href = '/#/dashboard';
        return;
      }
      
      // Otherwise try normal login
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Try: admin@test.com / Admin@123');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: '#94a3b8' }}>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{
          background: '#1e293b',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
        }}>
          {error && (
            <div style={{
              padding: '12px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="you@example.com"
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
              ← Back to Home
            </Link>
          </div>
        </form>
        
        <div style={{ marginTop: '24px', padding: '16px', background: '#1e293b', borderRadius: '12px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', textAlign: 'center' }}>
            Demo Credentials:
          </p>
          <p style={{ color: '#e2e8f0', fontSize: '14px', textAlign: 'center' }}>
            admin@test.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple Dashboard
function Dashboard() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome, {user.name}!</h1>
            <p style={{ color: '#64748b' }}>{user.email} • {user.role}</p>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
        
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Dashboard Working!</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Full features will be added incrementally
          </p>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#f1f5f9',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            Version: 1.0.5-SAFE • Auth + Toast Only
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log('✅ SAFE version rendered');
} else {
  console.error('❌ Root element not found');
}
