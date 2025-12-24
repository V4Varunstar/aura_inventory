import React from 'react';

function AppTest() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ React is Working!</h1>
        <p style={{ fontSize: '20px', marginBottom: '10px' }}>Aura Inventory</p>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>Build: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}

export default AppTest;
