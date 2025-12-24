import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('✅ Full Aura Inventory starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log('✅ App rendered successfully');
}
