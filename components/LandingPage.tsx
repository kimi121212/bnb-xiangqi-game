import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Play, Users, Lock, Trophy, Coins, BookOpen, Plus, Search, Eye } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';
import CustomStakeInput from './CustomStakeInput';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 100%);
  padding: ${spacing.lg};
`;

const NavigationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xl};
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const NavTitle = styled.h1`
  font-size: ${typography.fontSize.xxl};
  font-weight: ${typography.fontWeight.bold};
  background: ${gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const NavButtons = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const NavButton = styled(motion.button)<{ variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: ${gradients.primary};
    color: ${colors.secondary.black};
  ` : `
    background: ${colors.background.tertiary};
    color: ${colors.text.primary};
    border: 1px solid ${colors.border.primary};
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.medium};
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: ${spacing.xxl};
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: ${colors.secondary.black};
  box-shadow: ${shadows.glow};
`;

const Title = styled.h1`
  font-size: ${typography.fontSize.xxxl};
  font-weight: ${typography.fontWeight.bold};
  background: ${gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.lg};
  margin: 0;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const ActionCard = styled(motion.div)`
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const ActionButton = styled(motion.button)<{ variant: 'primary' | 'secondary' }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: ${gradients.primary};
    color: ${colors.secondary.black};
  ` : `
    background: ${colors.background.tertiary};
    color: ${colors.text.primary};
    border: 1px solid ${colors.border.primary};
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.large};
  }
`;

const GameListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const GameListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md};
`;

const SectionTitle = styled.h2`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  outline: none;
  width: 200px;
  
  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

const GameCard = styled(motion.div)<{ isPrivate?: boolean }>`
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.large};
    border-color: ${colors.primary.yellow};
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md};
`;

const GameTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
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

const GameInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const InfoLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
`;

const InfoValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const GameActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const JoinButton = styled(motion.button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${gradients.primary};
  color: ${colors.secondary.black};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${shadows.medium};
  }
`;

const PrivateGameForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  padding: ${spacing.lg};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const FormInput = styled.input`
  padding: ${spacing.md};
  background: ${colors.background.secondary};
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

const FormLabel = styled.label`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const TabButton = styled(motion.button)<{ active: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => props.active ? gradients.primary : colors.background.secondary};
  color: ${props => props.active ? colors.secondary.black : colors.text.primary};
  border: 1px solid ${props => props.active ? colors.primary.yellow : colors.border.primary};
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${shadows.medium};
  }
`;

interface Game {
  id: string;
  title: string;
  stakeAmount: number;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'active' | 'finished';
  isPrivate: boolean;
  createdAt: string;
  host: string;
}

interface LandingPageProps {
  onCreateGame?: (stakeAmount?: number, gameName?: string, isPrivate?: boolean, password?: string) => void;
  onJoinGame?: (gameId: string) => void;
  onWatchGame?: (gameId: string) => void;
  onShowGuide?: () => void;
  games?: any[];
  activeGames?: any[];
  userGames?: any[];
}

const LandingPage: React.FC<LandingPageProps> = ({
  onCreateGame,
  onJoinGame,
  onWatchGame,
  onShowGuide,
  games = [],
  activeGames = [],
  userGames = []
}) => {
  const { walletInfo } = useWallet();
  const [showPrivateForm, setShowPrivateForm] = useState(false);
  const [privateGameId, setPrivateGameId] = useState('');
  const [privatePassword, setPrivatePassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomStake, setShowCustomStake] = useState(false);
  const [customStakeAmount, setCustomStakeAmount] = useState(0.001);
  const [customGameName, setCustomGameName] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [isPrivateGame, setIsPrivateGame] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'your-games'>('public');

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.stakeAmount.toString().includes(searchTerm)
  );

  const filteredUserGames = userGames.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.stakeAmount.toString().includes(searchTerm)
  );

  const displayGames = activeTab === 'public' ? filteredGames : filteredUserGames;

  const handleCreateGame = () => {
    setIsPrivateGame(false);
    setShowCustomStake(true);
  };

  const handleCreatePrivateGame = () => {
    setIsPrivateGame(true);
    setShowCustomStake(true);
  };

  const handleStakeAmountChange = (amount: number) => {
    setCustomStakeAmount(amount);
  };

  const handleGameNameChange = (name: string) => {
    setCustomGameName(name);
  };

  const handlePasswordChange = (password: string) => {
    setCustomPassword(password);
  };

  const handleConfirmStake = () => {
    if (onCreateGame) {
      onCreateGame(customStakeAmount, customGameName, isPrivateGame, customPassword);
    } else {
      console.log('Create game with stake:', customStakeAmount, 'name:', customGameName, 'private:', isPrivateGame);
    }
    setShowCustomStake(false);
    setCustomGameName('');
    setCustomPassword('');
  };

  const handleCancelStake = () => {
    setShowCustomStake(false);
    setCustomGameName('');
    setCustomPassword('');
  };

  const handleJoinGame = (gameId: string) => {
    if (onJoinGame) {
      onJoinGame(gameId);
    } else {
      console.log('Join game:', gameId);
    }
  };

  const handleWatchGame = (gameId: string) => {
    if (onWatchGame) {
      onWatchGame(gameId);
    } else {
      console.log('Watch game:', gameId);
    }
  };

  const handleJoinPrivateGame = () => {
    // TODO: Implement private game joining
    console.log('Join private game:', privateGameId, privatePassword);
  };

  return (
    <LandingContainer>
      {showCustomStake && (
        <CustomStakeInput
          onStakeAmountChange={handleStakeAmountChange}
          onGameNameChange={handleGameNameChange}
          onConfirm={handleConfirmStake}
          onCancel={handleCancelStake}
          minAmount={0.001}
          maxAmount={10}
          isPrivate={isPrivateGame}
          onPasswordChange={handlePasswordChange}
        />
      )}
      
      <NavigationHeader>
        <NavTitle>BNB Xiangqi</NavTitle>
        <NavButtons>
          <NavButton
            variant="secondary"
            onClick={onShowGuide}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen size={16} />
            Game Guide
          </NavButton>
        </NavButtons>
      </NavigationHeader>

      <MainContent>
        <Sidebar>
          <ActionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 style={{ 
              color: colors.text.primary, 
              marginBottom: spacing.md,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold
            }}>
              Quick Actions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <ActionButton
                variant="primary"
                onClick={handleCreateGame}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                Create Public Game
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                onClick={() => setShowPrivateForm(!showPrivateForm)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Lock size={20} />
                {showPrivateForm ? 'Hide' : 'Create'} Private Game
              </ActionButton>
            </div>

            {showPrivateForm && (
              <PrivateGameForm>
                <FormLabel>Game ID</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Enter game ID"
                  value={privateGameId}
                  onChange={(e) => setPrivateGameId(e.target.value)}
                />
                
                <FormLabel>Password</FormLabel>
                <FormInput
                  type="password"
                  placeholder="Enter password"
                  value={privatePassword}
                  onChange={(e) => setPrivatePassword(e.target.value)}
                />
                
                <div style={{ display: 'flex', gap: spacing.sm }}>
                  <ActionButton
                    variant="primary"
                    onClick={handleJoinPrivateGame}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play size={16} />
                    Join Game
                  </ActionButton>
                  
                  <ActionButton
                    variant="secondary"
                    onClick={handleCreatePrivateGame}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={16} />
                    Create Private Game
                  </ActionButton>
                </div>
              </PrivateGameForm>
            )}
          </ActionCard>

          <ActionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 style={{ 
              color: colors.text.primary, 
              marginBottom: spacing.md,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold
            }}>
              Game Guide
            </h3>
            
            <div style={{ 
              color: colors.text.secondary, 
              fontSize: typography.fontSize.sm,
              lineHeight: typography.lineHeight.relaxed
            }}>
              <p style={{ marginBottom: spacing.sm }}>
                <strong>How to Play:</strong>
              </p>
              <ul style={{ paddingLeft: spacing.md, marginBottom: spacing.sm }}>
                <li>Stake BNB to enter games</li>
                <li>Capture pieces to earn their BNB value</li>
                <li>Win by capturing the opponent's General</li>
                <li>Winner takes the entire staked pool</li>
              </ul>
              
              <p style={{ marginBottom: spacing.sm }}>
                <strong>Piece Values:</strong>
              </p>
              <ul style={{ paddingLeft: spacing.md }}>
                <li>General: 100 BNB</li>
                <li>Chariot: 50 BNB</li>
                <li>Horse: 30 BNB</li>
                <li>Cannon: 25 BNB</li>
                <li>Advisor: 20 BNB</li>
                <li>Elephant: 15 BNB</li>
                <li>Soldier: 5 BNB</li>
              </ul>
            </div>
          </ActionCard>
        </Sidebar>

        <GameListContainer>
          <GameListHeader>
            <SectionTitle>
              {activeTab === 'public' ? 'Available Games' : 'Your Games'}
            </SectionTitle>
            <SearchBar>
              <Search size={16} color={colors.text.secondary} />
              <SearchInput
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>
          </GameListHeader>

          <TabContainer>
            <TabButton
              active={activeTab === 'public'}
              onClick={() => setActiveTab('public')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Public Games ({filteredGames.length})
            </TabButton>
            <TabButton
              active={activeTab === 'your-games'}
              onClick={() => setActiveTab('your-games')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Your Games ({filteredUserGames.length})
            </TabButton>
          </TabContainer>

          {activeGames.length > 0 && (
            <div style={{ marginBottom: spacing.lg }}>
              <h3 style={{ 
                color: colors.text.primary, 
                marginBottom: spacing.md,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold
              }}>
                Live Games (Watch)
              </h3>
              {activeGames.map((game, index) => (
                <GameCard
                  key={`active-${game.id}`}
                  isPrivate={game.isPrivate}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                >
                  <GameHeader>
                    <GameTitle>
                      {game.isPrivate ? <Lock size={20} /> : <Users size={20} />}
                      {game.title}
                    </GameTitle>
                    <GameStatus status="active">
                      LIVE
                    </GameStatus>
                  </GameHeader>

                  <GameInfo>
                    <InfoItem>
                      <InfoLabel>Stake Amount</InfoLabel>
                      <InfoValue>{game.stakeAmount} BNB</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Players</InfoLabel>
                      <InfoValue>{game.players.length}/{game.maxPlayers}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Spectators</InfoLabel>
                      <InfoValue>{game.spectators}</InfoValue>
                    </InfoItem>
                  </GameInfo>

                  <GameActions>
                    <JoinButton
                      onClick={() => handleWatchGame(game.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye size={16} />
                      Watch Game
                    </JoinButton>
                  </GameActions>
                </GameCard>
              ))}
            </div>
          )}

          {displayGames.map((game, index) => (
            <GameCard
              key={game.id}
              isPrivate={game.isPrivate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.01 }}
            >
              <GameHeader>
                <GameTitle>
                  {game.isPrivate ? <Lock size={20} /> : <Users size={20} />}
                  {game.title}
                </GameTitle>
                <GameStatus status={game.status}>
                  {game.players.includes(walletInfo.address) 
                    ? 'YOUR GAME' 
                    : game.status.toUpperCase()
                  }
                </GameStatus>
              </GameHeader>

              <GameInfo>
                <InfoItem>
                  <InfoLabel>Stake Amount</InfoLabel>
                  <InfoValue>{game.stakeAmount} BNB</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Players</InfoLabel>
                  <InfoValue>{game.players}/{game.maxPlayers}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Created</InfoLabel>
                  <InfoValue>{game.createdAt}</InfoValue>
                </InfoItem>
              </GameInfo>

              <GameActions>
                {!walletInfo.isConnected ? (
                  <JoinButton
                    disabled
                    style={{ 
                      background: colors.background.tertiary,
                      color: colors.text.tertiary,
                      cursor: 'not-allowed'
                    }}
                  >
                    <Play size={16} />
                    Connect Wallet to Join
                  </JoinButton>
                ) : (
                  <JoinButton
                    onClick={() => handleJoinGame(game.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={game.status !== 'waiting'}
                  >
                    <Play size={16} />
                    {game.players.includes(walletInfo.address) 
                      ? 'Rejoin Game' 
                      : game.status === 'waiting' ? 'Join Game' : 'View Game'
                    }
                  </JoinButton>
                )}
              </GameActions>
            </GameCard>
          ))}

          {filteredGames.length === 0 && (
            <GameCard>
              <div style={{ 
                textAlign: 'center', 
                padding: spacing.xxl,
                color: colors.text.secondary
              }}>
                <Trophy size={48} style={{ marginBottom: spacing.md }} />
                <h3 style={{ marginBottom: spacing.sm }}>No Games Found</h3>
                <p>Create a new game or try adjusting your search</p>
              </div>
            </GameCard>
          )}
        </GameListContainer>
      </MainContent>
    </LandingContainer>
  );
};

export default LandingPage;
