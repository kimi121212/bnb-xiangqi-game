import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Eye, Trophy, Coins } from 'lucide-react';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';
import { useLanguage } from '../contexts/LanguageContext';
import WalletAddress from './WalletAddress';

const GameHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
  margin-bottom: ${spacing.lg};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.background.tertiary};
  color: ${colors.text.primary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.primary.yellow};
    color: ${colors.secondary.black};
    border-color: ${colors.primary.yellow};
    transform: translateY(-1px);
  }
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const GameTitle = styled.h2`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

const GameStatus = styled.span<{ status: 'waiting' | 'active' | 'finished' }>`
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.small};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'waiting':
        return `
          background: ${colors.accent.blue}20;
          color: ${colors.accent.blue};
          border: 1px solid ${colors.accent.blue};
        `;
      case 'active':
        return `
          background: ${colors.accent.green}20;
          color: ${colors.accent.green};
          border: 1px solid ${colors.accent.green};
        `;
      case 'finished':
        return `
          background: ${colors.text.tertiary}20;
          color: ${colors.text.tertiary};
          border: 1px solid ${colors.text.tertiary};
        `;
    }
  }}
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
`;

const GameStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const StatIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary.yellow};
`;

const StatValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const StatLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
`;

const PoolInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.md};
  background: ${gradients.primary};
  color: ${colors.secondary.black};
  border-radius: ${borderRadius.medium};
  min-width: 120px;
`;

const PoolAmount = styled.span`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

const PoolLabel = styled.span`
  font-size: ${typography.fontSize.xs};
  opacity: 0.8;
`;

interface GameHeaderProps {
  gameTitle: string;
  gameStatus: 'waiting' | 'active' | 'finished';
  stakeAmount: number;
  spectators: number;
  onExit: () => void;
  onWatch?: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameTitle,
  gameStatus,
  stakeAmount,
  spectators,
  onExit,
  onWatch
}) => {
  const { t } = useLanguage();
  return (
    <GameHeaderContainer>
      <LeftSection>
        <BackButton
          onClick={onExit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} />
          {t('game.exit')}
        </BackButton>
        
        <GameInfo>
          <GameTitle>{gameTitle}</GameTitle>
          <GameStatus status={gameStatus}>
            {gameStatus === 'active' ? t('status.active') : t(`status.${gameStatus}`)}
          </GameStatus>
        </GameInfo>
      </LeftSection>

      <RightSection>
        <GameStats>
          <StatItem>
            <StatIcon>
              <Coins size={16} />
            </StatIcon>
            <div>
              <StatValue>{stakeAmount} BNB</StatValue>
              <StatLabel>Stake</StatLabel>
            </div>
          </StatItem>
          
          <StatItem>
            <StatIcon>
              <Eye size={16} />
            </StatIcon>
            <div>
              <StatValue>{spectators}</StatValue>
              <StatLabel>Watching</StatLabel>
            </div>
          </StatItem>
        </GameStats>

        <PoolInfo>
          <PoolAmount>{stakeAmount * 2} BNB</PoolAmount>
          <PoolLabel>Prize Pool</PoolLabel>
        </PoolInfo>
      </RightSection>
    </GameHeaderContainer>
  );
};

export default GameHeader;
