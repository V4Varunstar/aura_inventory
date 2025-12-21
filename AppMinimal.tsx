import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-4xl font-bold mb-4">Aura Inventory</h1>
        <p className="text-xl opacity-90 mb-8">Multi-Tenant Inventory Management</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-300">✅</span>
            <span>React App Loaded Successfully</span>
          </div>
          <button 
            className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            onClick={() => window.location.href = '/simple'}
          >
            View Simple Version
          </button>
        </div>
      </div>
    </div>
  );
}