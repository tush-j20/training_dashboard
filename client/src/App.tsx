import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  timestamp: string;
  message: string;
  environment: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to connect to API: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Training Dashboard
        </h1>
        
        {loading && <p>Connecting to API...</p>}
        
        {error && (
          <p style={{ color: 'red' }}>❌ {error}</p>
        )}
        
        {health && (
          <div style={{ 
            background: '#e8f5e9', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              ✅ API Connected
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Status: {health.status}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Environment: {health.environment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
