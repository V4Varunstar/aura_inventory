
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🎯 index.tsx loaded');

// Remove loading screen and render app
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found</div>';
} else {
  // Clear the loading screen HTML and render React app
  rootElement.innerHTML = '';
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ App mounted successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-align: center; font-family: system-ui;">
        <div>
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h1 style="font-size: 24px; margin-bottom: 10px;">Application Error</h1>
          <p style="opacity: 0.9; margin-bottom: 20px;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="location.reload()" style="margin-top:20px; padding:12px 24px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

