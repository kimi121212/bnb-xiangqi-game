import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#f0b90b', fontSize: '3rem', marginBottom: '1rem' }}>
        🎮 BNB Xiangqi
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        If you can see this, React is working!
      </p>
      <button 
        onClick={() => alert('Test successful!')}
        style={{
          background: '#f0b90b',
          color: '#000000',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default App;
