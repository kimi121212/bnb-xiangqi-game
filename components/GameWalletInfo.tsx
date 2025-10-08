import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

const WalletContainer = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  margin: ${spacing.sm} 0;
  box-shadow: ${shadows.sm};
`;

const WalletHeader = styled.h3`
  color: ${colors.text};
  margin: 0 0 ${spacing.sm} 0;
  font-size: 1.1rem;
`;

const WalletInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.sm};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  margin-bottom: 2px;
`;

const InfoValue = styled.span`
  font-size: 0.9rem;
  color: ${colors.text};
  font-family: monospace;
  word-break: break-all;
`;

const BalanceDisplay = styled.div`
  background: ${colors.primary}20;
  border: 1px solid ${colors.primary};
  border-radius: ${borderRadius.sm};
  padding: ${spacing.sm};
  text-align: center;
`;

const BalanceAmount = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${colors.primary};
`;

const BalanceLabel = styled.div`
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  margin-top: 2px;
`;

interface GameWalletInfoProps {
  gameId: string;
  onBalanceUpdate?: (balance: number) => void;
}

export const GameWalletInfo: React.FC<GameWalletInfoProps> = ({ gameId, onBalanceUpdate }) => {
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    balance: number;
    createdAt: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletInfo();
  }, [gameId]);

  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching wallet info for game: ${gameId}`);
      const response = await fetch(`/api/wallet/${gameId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch wallet info`);
      }

      const data = await response.json();
      console.log('Wallet info received:', data);
      
      setWalletInfo({
        address: data.address,
        balance: 0, // This would be fetched from blockchain
        createdAt: data.createdAt
      });

      if (onBalanceUpdate) {
        onBalanceUpdate(0);
      }
    } catch (err: any) {
      console.error('Error fetching wallet info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <WalletContainer>
        <WalletHeader>Game Wallet</WalletHeader>
        <div>Loading wallet information...</div>
      </WalletContainer>
    );
  }

  if (error) {
    return (
      <WalletContainer>
        <WalletHeader>Game Wallet</WalletHeader>
        <div style={{ color: colors.error, marginBottom: spacing.sm }}>
          Error: {error}
        </div>
        <button 
          onClick={fetchWalletInfo}
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: borderRadius.sm,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </WalletContainer>
    );
  }

  if (!walletInfo) {
    return (
      <WalletContainer>
        <WalletHeader>Game Wallet</WalletHeader>
        <div>No wallet found for this game.</div>
      </WalletContainer>
    );
  }

  return (
    <WalletContainer>
      <WalletHeader>Game Wallet</WalletHeader>
      
      <WalletInfo>
        <InfoItem>
          <InfoLabel>Address</InfoLabel>
          <InfoValue>{walletInfo.address}</InfoValue>
        </InfoItem>
        
        <InfoItem>
          <InfoLabel>Created</InfoLabel>
          <InfoValue>
            {new Date(walletInfo.createdAt).toLocaleString()}
          </InfoValue>
        </InfoItem>
      </WalletInfo>

      <BalanceDisplay>
        <BalanceAmount>{walletInfo.balance.toFixed(4)} BNB</BalanceAmount>
        <BalanceLabel>Pool Balance</BalanceLabel>
      </BalanceDisplay>
    </WalletContainer>
  );
};

export default GameWalletInfo;
