
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-Simple-Login';
import './index.css';

console.log('🎯 index.tsx loaded at', new Date().toISOString());
console.log('📍 document.readyState:', document.readyState);
console.log('📍 root element:', document.getElementById('root'));

// Remove loading screen and render app
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;">Error: Root element (#root) not found</div>';
} else {
  console.log('✅ Root element found');
  
  // Clear any existing content
  rootElement.innerHTML = '';
  
  try {
    console.log('🎯 Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('🎯 Rendering App component...');
    root.render(<App />);
    
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f5f5f5; color: #333; text-align: center; font-family: monospace; padding: 20px;">
        <div>
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h1 style="font-size: 24px; margin-bottom: 10px; color: #d32f2f;">Application Error</h1>
          <p style="margin-bottom: 20px; color: #666;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <code style="display: block; background: #f0f0f0; padding: 10px; margin-bottom: 20px; text-align: left; overflow-x: auto;">${error instanceof Error ? error.stack : 'No details'}</code>
          <button onclick="location.reload()" style="padding:12px 24px; background:#1976d2; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

