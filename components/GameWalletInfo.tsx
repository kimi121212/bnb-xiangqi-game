import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';
import { clientWalletManager } from '../utils/ClientWalletManager';
import { useWallet } from '../hooks/useWallet';

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
  onCheckWallet?: () => void;
}

export const GameWalletInfo: React.FC<GameWalletInfoProps> = ({ gameId, onBalanceUpdate, onCheckWallet }) => {
  const { walletInfo: userWallet } = useWallet();
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

  // Refetch balance when user wallet provider changes
  useEffect(() => {
    if (userWallet.provider) {
      fetchWalletInfo();
    }
  }, [userWallet.provider]);

  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching wallet info for game: ${gameId}`);
      
      // Get or create wallet using client-side manager
      let wallet = clientWalletManager.getGameWallet(gameId);
      if (!wallet) {
        wallet = clientWalletManager.createGameWallet(gameId);
      }
      
      console.log('Wallet info:', wallet);
      
      // Fetch real balance from BSC blockchain
      let realBalance = 0;
      if (userWallet.provider) {
        try {
          console.log(`Fetching balance for wallet ${wallet.address} on BSC...`);
          realBalance = await clientWalletManager.getWalletBalance(gameId, userWallet.provider);
          console.log(`✅ Real BSC balance for ${wallet.address}: ${realBalance} BNB`);
        } catch (balanceError) {
          console.error('❌ Could not fetch balance from BSC:', balanceError);
          realBalance = 0;
        }
      } else {
        console.warn('No provider available for balance fetch');
      }
      
      setWalletInfo({
        address: wallet.address,
        balance: realBalance,
        createdAt: wallet.createdAt
      });

      if (onBalanceUpdate) {
        onBalanceUpdate(realBalance);
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
          <InfoLabel>Pool Wallet Address</InfoLabel>
          <InfoValue style={{ 
            fontSize: '0.8rem', 
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            {walletInfo.address}
          </InfoValue>
          <a 
            href={`https://bscscan.com/address/${walletInfo.address}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.primary,
              textDecoration: 'none',
              fontSize: '0.8rem',
              marginTop: '4px',
              display: 'inline-block'
            }}
          >
            🔗 View on BSCScan
          </a>
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
        <BalanceLabel>Pool Balance (Live from BSC)</BalanceLabel>
        {walletInfo.balance > 0 && (
          <div style={{ 
            fontSize: '0.7rem', 
            color: colors.success || '#10b981',
            marginTop: '2px'
          }}>
            ✅ Funds detected in pool wallet
          </div>
        )}
      </BalanceDisplay>

      <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.sm }}>
        <button 
          onClick={fetchWalletInfo}
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: borderRadius.sm,
            cursor: 'pointer',
            fontSize: '0.9rem',
            flex: 1
          }}
        >
          {loading ? 'Checking...' : 'Check Balance'}
        </button>
        
        <a
          href={`https://bscscan.com/address/${walletInfo.address}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.secondary || '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: borderRadius.sm,
            cursor: 'pointer',
            fontSize: '0.9rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
        >
          🔍 BSCScan
        </a>
      </div>
    </WalletContainer>
  );
};

export default GameWalletInfo;
