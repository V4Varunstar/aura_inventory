import React from 'react';
import ReactDOM from 'react-dom/client';
import AppMinimal from './AppMinimal';

console.log('🎯 Minimal index.tsx loaded');

function initializeMinimalApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    console.log('🎯 Creating minimal React app...');
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(<AppMinimal />);
    
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