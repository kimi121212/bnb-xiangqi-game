import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Coins, Wallet, Trophy, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';
import StakingError from './StakingError';
import GameWalletInfo from './GameWalletInfo';
import GasPriceDisplay from './GasPriceDisplay';

const StakingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const StakingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const StakingIcon = styled.div`
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

const StakingTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

const PrizePool = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  background: ${gradients.primary};
  color: ${colors.secondary.black};
  border-radius: ${borderRadius.medium};
  margin-bottom: ${spacing.lg};
`;

const PrizeAmount = styled.span`
  font-size: ${typography.fontSize.xxxl};
  font-weight: ${typography.fontWeight.bold};
`;

const PrizeLabel = styled.span`
  font-size: ${typography.fontSize.md};
  opacity: 0.8;
`;

const StakeInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const InfoTitle = styled.h4`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const InfoValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.bold};
`;

const StakeButton = styled(motion.button)<{ 
  variant: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  width: 100%;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${gradients.primary};
          color: ${colors.secondary.black};
        `;
      case 'secondary':
        return `
          background: ${colors.background.tertiary};
          color: ${colors.text.primary};
          border: 1px solid ${colors.border.primary};
        `;
      case 'success':
        return `
          background: ${colors.accent.green};
          color: ${colors.secondary.white};
        `;
      case 'danger':
        return `
          background: ${colors.accent.red};
          color: ${colors.secondary.white};
        `;
    }
  }}
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : shadows.medium};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'warning' | 'info' }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: ${colors.accent.green}20;
          color: ${colors.accent.green};
          border: 1px solid ${colors.accent.green};
        `;
      case 'error':
        return `
          background: ${colors.accent.red}20;
          color: ${colors.accent.red};
          border: 1px solid ${colors.accent.red};
        `;
      case 'warning':
        return `
          background: ${colors.primary.yellow}20;
          color: ${colors.primary.yellow};
          border: 1px solid ${colors.primary.yellow};
        `;
      case 'info':
        return `
          background: ${colors.accent.blue}20;
          color: ${colors.accent.blue};
          border: 1px solid ${colors.accent.blue};
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface GameStakingProps {
  stakeAmount: number;
  gameId: string;
  onStake: (amount: number) => Promise<void>;
  onUnstake: () => Promise<void>;
  isStaked: boolean;
  isStaking: boolean;
  isUnstaking: boolean;
  error?: string;
  success?: string;
}

const GameStaking: React.FC<GameStakingProps> = ({
  stakeAmount,
  gameId,
  onStake,
  onUnstake,
  isStaked,
  isStaking,
  isUnstaking,
  error,
  success
}) => {
  const { walletInfo } = useWallet();
  const [confirmStake, setConfirmStake] = useState(false);

  const handleStake = async () => {
    if (!confirmStake) {
      setConfirmStake(true);
      return;
    }
    
    try {
      console.log('Starting stake process...');
      await onStake(stakeAmount);
      console.log('Stake process completed');
      setConfirmStake(false);
    } catch (error) {
      console.error('Staking failed:', error);
      setConfirmStake(false);
    }
  };

  const handleUnstake = async () => {
    try {
      await onUnstake();
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const formatBNB = (amount: number) => {
    return amount.toFixed(4);
  };

  const hasInsufficientBalance = walletInfo.balance && parseFloat(walletInfo.balance) < stakeAmount;

  return (
    <StakingContainer>
      <StakingHeader>
        <StakingIcon>
          <Coins size={20} />
        </StakingIcon>
        <StakingTitle>Game Staking</StakingTitle>
      </StakingHeader>

      <PrizePool>
        <PrizeAmount>{formatBNB(stakeAmount * 2)} BNB</PrizeAmount>
        <PrizeLabel>Winner Takes All</PrizeLabel>
      </PrizePool>

      <GameWalletInfo 
        gameId={gameId} 
        onCheckWallet={() => {
          // This will trigger a real balance fetch from BSC
          console.log('Manual wallet check triggered - fetching live balance from BSC');
          // The GameWalletInfo component will handle the actual balance fetch
        }}
      />

      <GasPriceDisplay />

      <StakeInfo>
        <InfoCard>
          <InfoTitle>
            <Wallet size={16} />
            Your Stake
          </InfoTitle>
          <InfoValue>{formatBNB(stakeAmount)} BNB</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoTitle>
            <Trophy size={16} />
            Total Prize
          </InfoTitle>
          <InfoValue>{formatBNB(stakeAmount * 2)} BNB</InfoValue>
        </InfoCard>
      </StakeInfo>

      {error && (
        <StakingError 
          error={error} 
          onRetry={() => handleStake()}
          onDismiss={() => setConfirmStake(false)}
        />
      )}

      {success && (
        <StatusMessage type="success">
          <CheckCircle size={16} />
          {success}
        </StatusMessage>
      )}

      {!walletInfo.isConnected ? (
        <StatusMessage type="warning">
          <AlertCircle size={16} />
          Connect your wallet to stake and play
        </StatusMessage>
      ) : hasInsufficientBalance ? (
        <StatusMessage type="error">
          <AlertCircle size={16} />
          Insufficient BNB balance. You need {formatBNB(stakeAmount)} BNB
        </StatusMessage>
      ) : !isStaked ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {!confirmStake ? (
            <StakeButton
              variant="primary"
              onClick={handleStake}
              disabled={isStaking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isStaking ? (
                <>
                  <LoadingSpinner />
                  Staking...
                </>
              ) : (
                <>
                  <Coins size={16} />
                  Stake {formatBNB(stakeAmount)} BNB
                </>
              )}
            </StakeButton>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <StatusMessage type="warning">
                <AlertCircle size={16} />
                Confirm your stake of {formatBNB(stakeAmount)} BNB
              </StatusMessage>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <StakeButton
                  variant="primary"
                  onClick={handleStake}
                  disabled={isStaking}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isStaking ? (
                    <>
                      <LoadingSpinner />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirm Stake
                    </>
                  )}
                </StakeButton>
                <StakeButton
                  variant="secondary"
                  onClick={() => setConfirmStake(false)}
                  disabled={isStaking}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </StakeButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <StatusMessage type="success">
            <CheckCircle size={16} />
            You have staked {formatBNB(stakeAmount)} BNB
          </StatusMessage>
          
          <StakeButton
            variant="danger"
            onClick={handleUnstake}
            disabled={isUnstaking}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isUnstaking ? (
              <>
                <LoadingSpinner />
                Unstaking...
              </>
            ) : (
              <>
                <Coins size={16} />
                Unstake
              </>
            )}
          </StakeButton>
        </div>
      )}
    </StakingContainer>
  );
};

export default GameStaking;
