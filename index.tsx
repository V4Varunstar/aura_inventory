
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-Simple';
import './index.css';

console.log('🎯 index.tsx loaded');

// Robust initialization with error handling
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('❌ Root element not found!');
      throw new Error("Could not find root element to mount to");
    }

    console.log('🎯 Root element found, creating React root...');
    const root = ReactDOM.createRoot(rootElement);

    console.log('🎯 Rendering App component...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✅ React render called successfully');
    
    // Remove loading state after successful render
    setTimeout(() => {
      const loadingEl = document.querySelector('.app-loading');
      if (loadingEl && document.querySelector('[data-reactroot]')) {
        console.log('✅ App mounted successfully, removing loader');
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-align: center; font-family: system-ui;">
          <div>
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h1 style="font-size: 24px; margin-bottom: 10px;">React App Failed to Load</h1>
            <p style="opacity: 0.9; margin-bottom: 20px;">Error: ${error.message}</p>
            <button onclick="location.reload()" style="margin-top:20px; padding:12px 24px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">
              Refresh Page
            </button>
            <br/>
            <button onclick="window.location.href='/simple'" style="margin-top:10px; padding:8px 16px; background:transparent; color:white; border:1px solid white; border-radius:6px; cursor:pointer; font-size:14px;">
              Simple Version
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
