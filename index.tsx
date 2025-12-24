import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('✅ Starting Aura Inventory...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Fatal error:', error);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#1e293b;color:white;font-family:Arial,sans-serif;padding:40px;text-align:center;">
        <div>
          <div style="font-size:72px;margin-bottom:20px;">⚠️</div>
          <h1 style="font-size:32px;margin-bottom:16px;">Application Error</h1>
          <p style="color:#94a3b8;margin-bottom:20px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="location.reload()" style="padding:12px 24px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
