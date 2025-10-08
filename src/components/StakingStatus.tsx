import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.sm};
`;

const StatusIcon = styled.div<{ status: 'success' | 'error' | 'warning' | 'info' }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background: ${colors.accent.green};
          color: ${colors.secondary.white};
        `;
      case 'error':
        return `
          background: ${colors.accent.red};
          color: ${colors.secondary.white};
        `;
      case 'warning':
        return `
          background: ${colors.primary.yellow};
          color: ${colors.secondary.black};
        `;
      case 'info':
        return `
          background: ${colors.accent.blue};
          color: ${colors.secondary.white};
        `;
    }
  }}
`;

const StatusTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
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

const StatusDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const DetailLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const DetailValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const ActionButton = styled(motion.button)<{ 
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
  font-size: ${typography.fontSize.sm};
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

interface StakingStatusProps {
  isStaked: boolean;
  isStaking: boolean;
  isUnstaking: boolean;
  stakeAmount: number;
  poolAmount: number;
  error?: string;
  success?: string;
  onStake: () => void;
  onUnstake: () => void;
}

const StakingStatus: React.FC<StakingStatusProps> = ({
  isStaked,
  isStaking,
  isUnstaking,
  stakeAmount,
  poolAmount,
  error,
  success,
  onStake,
  onUnstake
}) => {
  const getStatusInfo = () => {
    if (isStaking) {
      return {
        status: 'info' as const,
        icon: <Clock size={16} />,
        title: 'Staking in Progress',
        message: 'Please wait while your BNB is being staked...',
        type: 'info' as const
      };
    }
    
    if (isUnstaking) {
      return {
        status: 'warning' as const,
        icon: <Clock size={16} />,
        title: 'Unstaking in Progress',
        message: 'Please wait while your BNB is being unstaked...',
        type: 'warning' as const
      };
    }
    
    if (isStaked) {
      return {
        status: 'success' as const,
        icon: <CheckCircle size={16} />,
        title: 'Staked Successfully',
        message: 'You can now make moves in the game!',
        type: 'success' as const
      };
    }
    
    return {
      status: 'error' as const,
      icon: <XCircle size={16} />,
      title: 'Not Staked',
      message: 'You must stake BNB before you can make moves.',
      type: 'error' as const
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <StatusContainer>
      <StatusHeader>
        <StatusIcon status={statusInfo.status}>
          {statusInfo.icon}
        </StatusIcon>
        <StatusTitle>{statusInfo.title}</StatusTitle>
      </StatusHeader>

      <StatusMessage type={statusInfo.type}>
        {statusInfo.message}
      </StatusMessage>

      {error && (
        <StatusMessage type="error">
          <AlertTriangle size={16} />
          {error}
        </StatusMessage>
      )}

      {success && (
        <StatusMessage type="success">
          <CheckCircle size={16} />
          {success}
        </StatusMessage>
      )}

      <StatusDetails>
        <DetailItem>
          <DetailLabel>Your Stake</DetailLabel>
          <DetailValue>{stakeAmount.toFixed(4)} BNB</DetailValue>
        </DetailItem>
        
        <DetailItem>
          <DetailLabel>Total Pool</DetailLabel>
          <DetailValue>{poolAmount.toFixed(4)} BNB</DetailValue>
        </DetailItem>
        
        <DetailItem>
          <DetailLabel>Prize Pool</DetailLabel>
          <DetailValue>{(stakeAmount * 2).toFixed(4)} BNB</DetailValue>
        </DetailItem>
      </StatusDetails>

      {!isStaked && !isStaking && (
        <ActionButton
          variant="primary"
          onClick={onStake}
          disabled={isStaking}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckCircle size={16} />
          Stake {stakeAmount.toFixed(4)} BNB
        </ActionButton>
      )}

      {isStaked && !isUnstaking && (
        <ActionButton
          variant="danger"
          onClick={onUnstake}
          disabled={isUnstaking}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <XCircle size={16} />
          Unstake
        </ActionButton>
      )}
    </StatusContainer>
  );
};

export default StakingStatus;
