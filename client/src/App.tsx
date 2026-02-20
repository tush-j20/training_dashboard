function App() {
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
        <p style={{ color: '#666' }}>
          Application is running successfully!
        </p>
      </div>
    </div>
  );
}

export default App;
