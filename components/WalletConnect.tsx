import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Wallet, Coins, TrendingUp } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const WalletHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const WalletIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.secondary.black};
  font-size: 20px;
`;

const WalletTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

const ConnectButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background: ${gradients.primary};
  color: ${colors.secondary.black};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${shadows.medium};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.large};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.small};
  border: 1px solid ${colors.border.primary};
`;

const InfoLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const InfoValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const AddressDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.small};
  border: 1px solid ${colors.border.primary};
`;

const AddressText = styled.span`
  color: ${colors.text.primary};
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.sm};
`;

const CopyButton = styled(motion.button)`
  padding: ${spacing.xs};
  background: ${colors.primary.yellow};
  color: ${colors.secondary.black};
  border: none;
  border-radius: ${borderRadius.small};
  cursor: pointer;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  
  &:hover {
    background: ${colors.primary.yellowLight};
  }
`;

const DisconnectButton = styled(motion.button)`
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.accent.red};
  color: ${colors.secondary.white};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  
  &:hover {
    background: #E53E3E;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${gradients.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.secondary.white};
  font-size: 16px;
`;

const StatValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

const StatLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
  text-align: center;
`;

const WalletConnect: React.FC = () => {
  const { 
    walletInfo, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    refreshBalance 
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletInfo.address);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  if (!walletInfo.isConnected) {
    return (
      <WalletContainer>
        <WalletHeader>
          <WalletIcon>
            <Wallet size={20} />
          </WalletIcon>
          <WalletTitle>Connect Wallet</WalletTitle>
        </WalletHeader>
        
        <ConnectButton
          onClick={handleConnect}
          disabled={isConnecting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet size={20} />
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </ConnectButton>
        
        <div style={{ 
          color: colors.text.secondary, 
          fontSize: typography.fontSize.sm,
          textAlign: 'center',
          marginTop: spacing.sm
        }}>
          Connect your wallet to start playing and earning BNB rewards
        </div>
      </WalletContainer>
    );
  }

  return (
    <WalletContainer>
      <WalletHeader>
        <WalletIcon>
          <Wallet size={20} />
        </WalletIcon>
        <WalletTitle>Wallet Connected</WalletTitle>
      </WalletHeader>
      
      <WalletInfo>
        <AddressDisplay>
          <AddressText>{formatAddress(walletInfo.address)}</AddressText>
          <CopyButton
            onClick={copyAddress}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Copy
          </CopyButton>
        </AddressDisplay>
        
        <InfoRow>
          <InfoLabel>Balance</InfoLabel>
          <InfoValue>{formatBalance(walletInfo.balance)} BNB</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Network</InfoLabel>
          <InfoValue>
            {walletInfo.chainId === 56 ? 'BSC Mainnet' : 
             walletInfo.chainId === 97 ? 'BSC Testnet' : 
             'Unknown Network'}
          </InfoValue>
        </InfoRow>
      </WalletInfo>
      
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <Coins size={16} />
          </StatIcon>
          <StatValue>{formatBalance(walletInfo.balance)}</StatValue>
          <StatLabel>BNB Balance</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <TrendingUp size={16} />
          </StatIcon>
          <StatValue>0</StatValue>
          <StatLabel>Games Won</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <Wallet size={16} />
          </StatIcon>
          <StatValue>0</StatValue>
          <StatLabel>Total Earned</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <DisconnectButton
        onClick={handleDisconnect}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Disconnect Wallet
      </DisconnectButton>
    </WalletContainer>
  );
};

export default WalletConnect;
