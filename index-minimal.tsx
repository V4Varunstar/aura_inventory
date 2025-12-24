import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';

// Minimal working version with routing
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </HashRouter>
  );
}

function HomePage() {
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
        <h2 style={{ fontSize: '32px', color: '#4ade80', marginBottom: '20px' }}>Working on Vercel!</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Inventory Management System for Beauty, Cosmetics, and Personal Care Businesses
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{
            padding: '15px 30px',
            background: '#4ade80',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            Go to Login →
          </Link>
        </div>
        <div style={{ marginTop: '40px', fontSize: '14px', opacity: 0.8' }}>
          <p>Build: {new Date().toISOString()}</p>
          <p>Version: 1.0.2-minimal</p>
        </div>
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
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>Login</h1>
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px' }}>
          <p style={{ marginBottom: '20px', textAlign: 'center' }}>Login form coming soon...</p>
          <Link to="/" style={{
            display: 'block',
            padding: '12px',
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

console.log('🎯 Minimal index.tsx loaded');

function initializeMinimalApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    console.log('🎯 Creating minimal React app...');
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(<App />);
    
    console.log('✅ Minimal React app rendered successfully');
    
  } catch (error) {
    console.error('❌ Minimal app failed:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-align: center; font-family: system-ui;">
          <div>
            <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <h1>React Failed to Load</h1>
            <p>Error: ${error.message}</p>
            <button onclick="window.location.href='/simple'" style="margin-top:20px; padding:12px 24px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer;">
              Use Simple Version
            </button>
          </div>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMinimalApp);
} else {
  initializeMinimalApp();
}