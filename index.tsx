import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

console.log('✅ Testing with AuthContext only...');

// Test component to check if AuthContext works
function TestAuth() {
  const { user, loading } = useAuth();
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ Aura Inventory</h1>
        <h2 style={{ fontSize: '32px', color: '#4ade80', marginBottom: '20px' }}>Testing AuthContext</h2>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'Not logged in'}</p>
          <p style={{color: '#fbbf24', marginTop: '10px'}}>Version: 1.0.4-AUTH-TEST</p>
        </div>
        <Link to="/login" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '15px 30px',
          background: '#4ade80',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Go to Login →
        </Link>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      padding: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Login Page</h1>
        <Link to="/" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<TestAuth />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log('✅ App with AuthContext rendered');
} else {
  console.error('❌ Root element not found');
}
