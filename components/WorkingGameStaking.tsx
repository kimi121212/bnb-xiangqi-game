import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const StakingContainer = styled.div`
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.large};
  padding: ${spacing.lg};
  box-shadow: ${shadows.medium};
`;

const StakingTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing.md};
  text-align: center;
`;

const StakeAmount = styled.div`
  text-align: center;
  margin-bottom: ${spacing.lg};
`;

const AmountLabel = styled.div`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing.sm};
`;

const AmountValue = styled.div`
  color: ${colors.primary};
  font-size: ${typography.fontSize.xxl};
  font-weight: ${typography.fontWeight.bold};
`;

const StakeButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => props.disabled ? colors.background.tertiary : colors.primary};
  color: ${props => props.disabled ? colors.text.secondary : 'white'};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.disabled ? colors.background.tertiary : colors.primary};
    opacity: ${props => props.disabled ? 1 : 0.9};
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  margin-top: ${spacing.md};
  padding: ${spacing.sm};
  border-radius: ${borderRadius.sm};
  background: ${props => props.type === 'success' ? colors.success : colors.error}20;
  color: ${props => props.type === 'success' ? colors.success : colors.error};
  font-size: ${typography.fontSize.sm};
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: ${spacing.sm};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface WorkingGameStakingProps {
  gameId: string;
  stakeAmount: number;
  onStake: (amount: number) => Promise<{ success: boolean; hash?: string; error?: string }>;
  isStaked: boolean;
  isStaking: boolean;
  error?: string | null;
  success?: string | null;
}

export const WorkingGameStaking: React.FC<WorkingGameStakingProps> = ({
  gameId,
  stakeAmount,
  onStake,
  isStaked,
  isStaking,
  error,
  success
}) => {
  const handleStake = async () => {
    try {
      const result = await onStake(stakeAmount);
      if (result.success) {
        console.log('✅ Staking successful:', result.hash);
      } else {
        console.error('❌ Staking failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Staking error:', error);
    }
  };

  if (isStaked) {
    return (
      <StakingContainer>
        <StakingTitle>✅ Staked Successfully!</StakingTitle>
        <StakeAmount>
          <AmountLabel>Amount Staked</AmountLabel>
          <AmountValue>{stakeAmount} BNB</AmountValue>
        </StakeAmount>
        <StatusMessage type="success">
          You have successfully staked {stakeAmount} BNB for this game!
        </StatusMessage>
      </StakingContainer>
    );
  }

  return (
    <StakingContainer>
      <StakingTitle>Stake BNB to Join Game</StakingTitle>
      
      <StakeAmount>
        <AmountLabel>Stake Amount</AmountLabel>
        <AmountValue>{stakeAmount} BNB</AmountValue>
      </StakeAmount>

      <StakeButton 
        onClick={handleStake} 
        disabled={isStaking}
      >
        {isStaking ? (
          <>
            <LoadingSpinner />
            Staking...
          </>
        ) : (
          `Stake ${stakeAmount} BNB`
        )}
      </StakeButton>

      {error && (
        <StatusMessage type="error">
          {error}
        </StatusMessage>
      )}

      {success && (
        <StatusMessage type="success">
          {success}
        </StatusMessage>
      )}
    </StakingContainer>
  );
};

export default WorkingGameStaking;
