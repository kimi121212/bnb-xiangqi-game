import React from 'react';

const App: React.FC = () => {
  console.log('App component rendering...');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#f0b90b', fontSize: '3rem', marginBottom: '1rem' }}>
        🎮 BNB Xiangqi Debug
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>
        If you can see this, the React app is working!<br/>
        Check the browser console for any errors.
      </p>
      <div style={{
        background: '#2d2d2d',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontFamily: 'monospace',
        fontSize: '0.9rem'
      }}>
        <div>✅ React: Working</div>
        <div>✅ TypeScript: Working</div>
        <div>✅ Vite: Working</div>
        <div>✅ Server: http://localhost:5001</div>
        <div>✅ Client: http://localhost:3002</div>
      </div>
      <button 
        onClick={() => {
          console.log('Test button clicked!');
          alert('Test successful! React is working correctly.');
        }}
        style={{
          background: '#f0b90b',
          color: '#000000',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(240, 185, 11, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default App;
