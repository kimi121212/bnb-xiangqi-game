import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Trophy, 
  Coins, 
  Shield, 
  Target, 
  Users, 
  Lock, 
  Zap,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

const GuideContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const GuideHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xxl};
`;

const GuideTitle = styled.h1`
  font-size: ${typography.fontSize.xxxl};
  font-weight: ${typography.fontWeight.bold};
  background: ${gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 ${spacing.md} 0;
`;

const GuideSubtitle = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.lg};
  margin: 0;
`;

const GuideNav = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.xl};
  justify-content: center;
`;

const NavButton = styled(motion.button)<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => props.active ? gradients.primary : colors.background.tertiary};
  color: ${props => props.active ? colors.secondary.black : colors.text.primary};
  border: 1px solid ${props => props.active ? colors.primary.yellow : colors.border.primary};
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.medium};
  }
`;

const GuideContent = styled.div`
  display: grid;
  gap: ${spacing.xl};
`;

const Section = styled(motion.div)`
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.primary};
  cursor: pointer;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${gradients.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.secondary.white};
  font-size: 20px;
`;

const SectionTitle = styled.h2`
  flex: 1;
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

const SectionToggle = styled.div`
  color: ${colors.text.secondary};
  transition: transform 0.3s ease;
`;

const SectionContent = styled(motion.div)`
  padding: ${spacing.lg};
`;

const PieceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const PieceCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const PieceIcon = styled.div<{ color: 'red' | 'black' }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid ${props => props.color === 'red' ? colors.accent.red : colors.secondary.white};
  background: ${props => props.color === 'red' ? 
    'linear-gradient(135deg, #F84960 0%, #FF6B7A 100%)' :
    'linear-gradient(135deg, #1E2329 0%, #2B3139 100%)'
  };
  color: ${props => props.color === 'red' ? colors.secondary.white : colors.primary.yellow};
  box-shadow: ${shadows.small};
`;

const PieceName = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
  text-align: center;
`;

const PieceValue = styled.div`
  color: ${colors.primary.yellow};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
`;

const PieceDescription = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
  text-align: center;
  margin: 0;
`;

const RuleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RuleItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
  padding: ${spacing.sm} 0;
  border-bottom: 1px solid ${colors.border.primary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const RuleIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${colors.primary.yellow};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.secondary.black};
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
`;

const RuleText = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.relaxed};
`;

const StakingInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const StakingCard = styled.div`
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
  text-align: center;
`;

const StakingIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.secondary.black};
  font-size: 24px;
  margin: 0 auto ${spacing.md} auto;
`;

const StakingTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0 0 ${spacing.sm} 0;
`;

const StakingDescription = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin: 0;
`;

const HighlightBox = styled.div`
  padding: ${spacing.lg};
  background: linear-gradient(135deg, ${colors.primary.yellow}20 0%, ${colors.accent.blue}20 100%);
  border: 1px solid ${colors.primary.yellow};
  border-radius: ${borderRadius.medium};
  margin: ${spacing.lg} 0;
`;

const HighlightTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0 0 ${spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const HighlightText = styled.p`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.md};
  margin: 0;
  line-height: ${typography.lineHeight.relaxed};
`;

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const GameGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('basics');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basics']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections: GuideSection[] = [
    {
      id: 'basics',
      title: 'Game Basics',
      icon: <BookOpen size={20} />,
      content: (
        <div>
          <p style={{ 
            color: colors.text.secondary, 
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.md,
            lineHeight: typography.lineHeight.relaxed
          }}>
            BNB Xiangqi combines traditional Chinese chess with blockchain staking mechanics. 
            Players stake BNB tokens to enter games, and winners take the entire staked pool.
          </p>
          
          <HighlightBox>
            <HighlightTitle>
              <Trophy size={20} />
              How to Win
            </HighlightTitle>
            <HighlightText>
              Capture your opponent's General (帅/将) to win the game and claim all staked BNB tokens!
            </HighlightText>
          </HighlightBox>

          <h3 style={{ 
            color: colors.text.primary, 
            marginBottom: spacing.md,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold
          }}>
            Basic Rules
          </h3>
          
          <RuleList>
            <RuleItem>
              <RuleIcon>1</RuleIcon>
              <RuleText>Red player always moves first</RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>2</RuleIcon>
              <RuleText>Players alternate turns</RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>3</RuleIcon>
              <RuleText>Capture pieces by landing on their square</RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>4</RuleIcon>
              <RuleText>Each piece has specific movement rules</RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>5</RuleIcon>
              <RuleText>General cannot leave the palace (3x3 area)</RuleText>
            </RuleItem>
          </RuleList>
        </div>
      )
    },
    {
      id: 'pieces',
      title: 'Pieces & Values',
      icon: <Coins size={20} />,
      content: (
        <div>
          <p style={{ 
            color: colors.text.secondary, 
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.md,
            lineHeight: typography.lineHeight.relaxed
          }}>
            Each piece has a BNB value. When you capture an opponent's piece, you earn its BNB value.
            The winner takes the entire staked pool plus all captured piece values.
          </p>
          
          <PieceGrid>
            <PieceCard>
              <PieceIcon color="red">帅</PieceIcon>
              <PieceName>General (Red)</PieceName>
              <PieceValue>100 BNB</PieceValue>
              <PieceDescription>Moves one step horizontally or vertically within palace</PieceDescription>
            </PieceCard>
            
            <PieceCard>
              <PieceIcon color="black">将</PieceIcon>
              <PieceName>General (Black)</PieceName>
              <PieceValue>100 BNB</PieceValue>
              <PieceDescription>Moves one step horizontally or vertically within palace</PieceDescription>
            </PieceCard>
            
            <PieceCard>
              <PieceIcon color="red">车</PieceIcon>
              <PieceName>Chariot</PieceName>
              <PieceValue>50 BNB</PieceValue>
              <PieceDescription>Moves horizontally or vertically any distance</PieceDescription>
            </PieceCard>
            
            <PieceCard>
              <PieceIcon color="red">马</PieceIcon>
              <PieceName>Horse</PieceName>
              <PieceValue>30 BNB</PieceValue>
              <PieceDescription>Moves in L-shape, cannot jump over pieces</PieceDescription>
            </PieceCard>
            
            <PieceCard>
              <PieceIcon color="red">炮</PieceIcon>
              <PieceName>Cannon</PieceName>
              <PieceValue>25 BNB</PieceValue>
              <PieceDescription>Moves like chariot, captures by jumping over one piece</PieceDescription>
            </PieceCard>
            
            <PieceCard>
              <PieceIcon color="red">仕</PieceIcon>
              <PieceName>Advisor</PieceName>
              <PieceValue>20 BNB</PieceValue>
              <PieceDescription>Moves diagonally one step within palace</PieceDescription>
            </PieceCard>
            
            <PieceCard>
              <PieceIcon color="red">相</PieceIcon>
              <PieceName>Elephant</PieceName>
              <PieceValue>15 BNB</PieceValue>
              <PieceDescription>Moves diagonally two steps, cannot cross river</PieceDescription>
            </PieceCard>
            
            <PieceCard>
              <PieceIcon color="red">兵</PieceIcon>
              <PieceName>Soldier</PieceName>
              <PieceValue>5 BNB</PieceValue>
              <PieceDescription>Moves forward, horizontally after crossing river</PieceDescription>
            </PieceCard>
          </PieceGrid>
        </div>
      )
    },
    {
      id: 'staking',
      title: 'Staking System',
      icon: <Shield size={20} />,
      content: (
        <div>
          <p style={{ 
            color: colors.text.secondary, 
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.md,
            lineHeight: typography.lineHeight.relaxed
          }}>
            All games require BNB staking. Players must stake the same amount to enter a game. 
            The winner takes the entire staked pool plus any captured piece values.
          </p>
          
          <StakingInfo>
            <StakingCard>
              <StakingIcon>
                <Coins size={24} />
              </StakingIcon>
              <StakingTitle>Entry Staking</StakingTitle>
              <StakingDescription>
                Both players must stake the same BNB amount to enter a game. 
                This creates the prize pool.
              </StakingDescription>
            </StakingCard>
            
            <StakingCard>
              <StakingIcon>
                <Trophy size={24} />
              </StakingIcon>
              <StakingTitle>Winner Takes All</StakingTitle>
              <StakingDescription>
                The winner receives the entire staked pool plus the BNB value 
                of all captured pieces.
              </StakingDescription>
            </StakingCard>
            
            <StakingCard>
              <StakingIcon>
                <Lock size={24} />
              </StakingIcon>
              <StakingTitle>Secure & Transparent</StakingTitle>
              <StakingDescription>
                All staking is handled by smart contracts on BSC. 
                No central authority can interfere.
              </StakingDescription>
            </StakingCard>
            
            <StakingCard>
              <StakingIcon>
                <Zap size={24} />
              </StakingIcon>
              <StakingTitle>Instant Rewards</StakingTitle>
              <StakingDescription>
                Winnings are automatically transferred to your wallet 
                when you win a game.
              </StakingDescription>
            </StakingCard>
          </StakingInfo>
        </div>
      )
    },
    {
      id: 'strategies',
      title: 'Winning Strategies',
      icon: <Target size={20} />,
      content: (
        <div>
          <p style={{ 
            color: colors.text.secondary, 
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.md,
            lineHeight: typography.lineHeight.relaxed
          }}>
            Master these strategies to maximize your BNB earnings and win more games.
          </p>
          
          <RuleList>
            <RuleItem>
              <RuleIcon>🎯</RuleIcon>
              <RuleText>
                <strong>Protect Your General:</strong> Your General is worth 100 BNB - protect it at all costs!
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>💰</RuleIcon>
              <RuleText>
                <strong>Target High-Value Pieces:</strong> Focus on capturing Chariots (50 BNB) and Horses (30 BNB)
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>⚔️</RuleIcon>
              <RuleText>
                <strong>Control the Center:</strong> Central pieces have more mobility and earning potential
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>🛡️</RuleIcon>
              <RuleText>
                <strong>Build Strong Defense:</strong> Use Advisors and Elephants to protect your General
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>🚀</RuleIcon>
              <RuleText>
                <strong>Advance Soldiers:</strong> Get soldiers across the river to increase their mobility
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>🎲</RuleIcon>
              <RuleText>
                <strong>Calculate Risk vs Reward:</strong> Sometimes sacrificing a piece is worth it for a bigger capture
              </RuleText>
            </RuleItem>
          </RuleList>
        </div>
      )
    },
    {
      id: 'private',
      title: 'Private Games',
      icon: <Users size={20} />,
      content: (
        <div>
          <p style={{ 
            color: colors.text.secondary, 
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.md,
            lineHeight: typography.lineHeight.relaxed
          }}>
            Create private games to play with friends or organize tournaments. 
            Private games require a game ID and password to join.
          </p>
          
          <RuleList>
            <RuleItem>
              <RuleIcon>🔐</RuleIcon>
              <RuleText>
                <strong>Create Private Game:</strong> Set a custom stake amount and password
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>🎫</RuleIcon>
              <RuleText>
                <strong>Share Game ID:</strong> Send the game ID and password to your friends
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>👥</RuleIcon>
              <RuleText>
                <strong>Invite Players:</strong> Only players with the correct credentials can join
              </RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>🏆</RuleIcon>
              <RuleText>
                <strong>Tournament Mode:</strong> Organize private tournaments with custom rules
              </RuleText>
            </RuleItem>
          </RuleList>
        </div>
      )
    }
  ];

  return (
    <GuideContainer>
      <GuideHeader>
        <GuideTitle>BNB Xiangqi Guide</GuideTitle>
        <GuideSubtitle>Master the art of Chinese chess and earn BNB rewards</GuideSubtitle>
      </GuideHeader>

      <GuideNav>
        {sections.map((section) => (
          <NavButton
            key={section.id}
            active={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.icon}
            {section.title}
          </NavButton>
        ))}
      </GuideNav>

      <GuideContent>
        {sections.map((section) => (
          <Section key={section.id}>
            <SectionHeader onClick={() => toggleSection(section.id)}>
              <SectionIcon>{section.icon}</SectionIcon>
              <SectionTitle>{section.title}</SectionTitle>
              <SectionToggle>
                {expandedSections.has(section.id) ? 
                  <ChevronDown size={20} /> : 
                  <ChevronRight size={20} />
                }
              </SectionToggle>
            </SectionHeader>
            
            {expandedSections.has(section.id) && (
              <SectionContent
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {section.content}
              </SectionContent>
            )}
          </Section>
        ))}
      </GuideContent>
    </GuideContainer>
  );
};

export default GameGuide;
