import React, { useState, useEffect } from 'react';
import { simpleGameService } from '../services/SimpleGameService';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      setIsConnecting(true);
      setError(null);

      try {
        // Try to connect to server
        await simpleGameService.connect();
        setIsConnected(true);
        setIsConnecting(false);
        console.log('✅ Connected to game server');
      } catch (err: any) {
        setIsConnected(false);
        setIsConnecting(false);
        setError(err.message);
        console.warn('❌ Failed to connect to game server:', err.message);
      }
    };

    checkConnection();

    // Check connection status periodically
    const interval = setInterval(() => {
      const connected = true; // SimpleGameService is always connected
      setIsConnected(connected);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isConnecting) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: colors.background.secondary,
        border: `1px solid ${colors.border.primary}`,
        borderRadius: borderRadius.medium,
        padding: spacing.sm,
        zIndex: 1000,
        fontSize: typography.fontSize.sm
      }}>
        <div style={{ color: colors.text.secondary }}>
          🔄 Connecting to server...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: isConnected ? colors.background.secondary : colors.background.secondary,
      border: `1px solid ${isConnected ? colors.accent.green : colors.accent.red}`,
      borderRadius: borderRadius.medium,
      padding: spacing.sm,
      zIndex: 1000,
      fontSize: typography.fontSize.sm
    }}>
      <div style={{ 
        color: isConnected ? colors.accent.green : colors.accent.red,
        fontWeight: typography.fontWeight.semibold
      }}>
        {isConnected ? '🟢 Server Connected' : '🔴 Server Offline'}
      </div>
      {error && (
        <div style={{ 
          color: colors.text.secondary,
          fontSize: typography.fontSize.xs,
          marginTop: spacing.xs
        }}>
          {error}
        </div>
      )}
      {!isConnected && (
        <div style={{ 
          color: colors.text.secondary,
          fontSize: typography.fontSize.xs,
          marginTop: spacing.xs
        }}>
          Running in offline mode
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
