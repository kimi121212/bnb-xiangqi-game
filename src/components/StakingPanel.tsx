import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Lock, Unlock } from 'lucide-react';
import { useStaking } from '../hooks/useStaking';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

const StakingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Label = styled.label`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const Input = styled.input`
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.yellow};
    box-shadow: 0 0 0 2px ${colors.primary.yellow}20;
  }
  
  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const ActionButton = styled(motion.button)<{ variant: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
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
      case 'danger':
        return `
          background: ${colors.accent.red};
          color: ${colors.secondary.white};
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.medium};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LockStatus = styled.div<{ isLocked: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  background: ${props => props.isLocked ? `${colors.accent.red}20` : `${colors.accent.green}20`};
  border: 1px solid ${props => props.isLocked ? colors.accent.red : colors.accent.green};
  border-radius: ${borderRadius.medium};
  color: ${props => props.isLocked ? colors.accent.red : colors.accent.green};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const StakingPanel: React.FC = () => {
  const { stakingInfo, isLoading, stake, unstake, claimRewards } = useStaking();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    try {
      await stake(stakeAmount);
      setStakeAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return;
    
    try {
      await unstake(unstakeAmount);
      setUnstakeAmount('');
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      await claimRewards();
    } catch (error) {
      console.error('Claim rewards failed:', error);
    }
  };

  const formatBNB = (amount: number) => {
    return amount.toFixed(4);
  };

  return (
    <StakingContainer>
      <StakingHeader>
        <StakingIcon>
          <Coins size={20} />
        </StakingIcon>
        <StakingTitle>BNB Staking</StakingTitle>
      </StakingHeader>
      
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <Coins size={16} />
          </StatIcon>
          <StatValue>{formatBNB(stakingInfo.playerStake)}</StatValue>
          <StatLabel>Staked BNB</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <TrendingUp size={16} />
          </StatIcon>
          <StatValue>{stakingInfo.rewardRate * 100}%</StatValue>
          <StatLabel>APY</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <LockStatus isLocked={!stakingInfo.canUnstake}>
        {stakingInfo.canUnstake ? (
          <>
            <Unlock size={16} />
            Unlocked - Can unstake anytime
          </>
        ) : (
          <>
            <Lock size={16} />
            Locked for {stakingInfo.lockPeriod} days
          </>
        )}
      </LockStatus>
      
      <InputGroup>
        <Label>Stake BNB</Label>
        <Input
          type="number"
          placeholder="Enter amount to stake"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          min="0"
          step="0.001"
        />
        <ButtonGroup>
          <ActionButton
            variant="primary"
            onClick={handleStake}
            disabled={isLoading || !stakeAmount}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Coins size={16} />
            Stake
          </ActionButton>
        </ButtonGroup>
      </InputGroup>
      
      {stakingInfo.playerStake > 0 && (
        <InputGroup>
          <Label>Unstake BNB</Label>
          <Input
            type="number"
            placeholder="Enter amount to unstake"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            min="0"
            max={stakingInfo.playerStake}
            step="0.001"
          />
          <ButtonGroup>
            <ActionButton
              variant="secondary"
              onClick={handleUnstake}
              disabled={isLoading || !unstakeAmount || !stakingInfo.canUnstake}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Unlock size={16} />
              Unstake
            </ActionButton>
            
            <ActionButton
              variant="primary"
              onClick={handleClaimRewards}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingUp size={16} />
              Claim Rewards
            </ActionButton>
          </ButtonGroup>
        </InputGroup>
      )}
    </StakingContainer>
  );
};

export default StakingPanel;
