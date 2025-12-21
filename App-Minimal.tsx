import React, { useState, useEffect } from 'react';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('✅ App component mounted');
      setLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error:', message);
      setError(message);
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
        <h1>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Aura Inventory - Test</h1>
      {loaded ? (
        <div>
          <p>✅ React is working!</p>
          <button onClick={() => console.log('Button clicked')}>Test Button</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
