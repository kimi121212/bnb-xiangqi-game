import React, { useState, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { XiangqiGame } from './utils/xiangqiLogic';
import { Position, PieceColor } from './types/game';
import GameBoard from './components/GameBoard';
import WalletConnect from './components/WalletConnect';
import GameStaking from './components/GameStaking';
import StakingStatus from './components/StakingStatus';
import LandingPage from './components/LandingPage';
import GameGuide from './components/GameGuide';
import BasicCreateGameModal from './components/BasicCreateGameModal';
import BinanceHeader from './components/BinanceHeader';
import GameHeader from './components/GameHeader';
import SpectatorMode from './components/SpectatorMode';
import { useGameManager } from './hooks/useGameManager';
import { useBNBPools } from './hooks/useBNBPools';
import BNBPoolInfo from './components/BNBPoolInfo';
import GameSharingTest from './components/GameSharingTest';
import ConnectionStatus from './components/ConnectionStatus';
import { colors, gradients, shadows, borderRadius, spacing, typography } from './styles/theme';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${typography.fontFamily.primary};
    background: ${colors.background.primary};
    color: ${colors.text.primary};
    line-height: ${typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 100%);
  padding: ${spacing.lg};
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
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
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: ${spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: ${spacing.lg};
  }
`;

const GameSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.lg};
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: 16px;
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
  width: 100%;
`;

const CurrentPlayer = styled.div<{ isRed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${props => props.isRed ? `${colors.accent.red}20` : `${colors.secondary.white}20`};
  border: 1px solid ${props => props.isRed ? colors.accent.red : colors.secondary.white};
  border-radius: 12px;
  color: ${props => props.isRed ? colors.accent.red : colors.secondary.white};
  font-weight: ${typography.fontWeight.semibold};
`;

const GameStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.sm};
  width: 100%;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  border-radius: 12px;
  border: 1px solid ${colors.border.primary};
`;

const StatValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

const StatLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  text-align: center;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'game' | 'guide' | 'spectator'>('landing');
  const [game, setGame] = useState<XiangqiGame | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  
  const gameManager = useGameManager();
  const { getGamePool, getPoolBalance } = useBNBPools();

  const handlePieceSelect = useCallback((position: Position) => {
    if (!game) return;
    
    // Check if player has staked before allowing piece selection
    if (!gameManager.stakingStatus.isStaked) {
      console.log('Player must stake before selecting pieces');
      return;
    }
    
    setSelectedPiece(position);
    const moves = game.getPossibleMoves(position);
    setPossibleMoves(moves);
  }, [game, gameManager.stakingStatus.isStaked]);

  const handleMove = useCallback((from: Position, to: Position) => {
    if (!game) return;
    
    // Check if player has staked before allowing moves
    if (!gameManager.stakingStatus.isStaked) {
      console.log('Player must stake before making moves');
      return;
    }
    
    const success = game.makeMove(from, to);
    if (success) {
      setSelectedPiece(null);
      setPossibleMoves([]);
    }
  }, [game, gameManager.stakingStatus.isStaked]);

  const handleCreateGame = async (gameData: {
    title: string;
    stakeAmount: number;
    isPrivate: boolean;
    password?: string;
  }) => {
    console.log('=== handleCreateGame called ===');
    console.log('Game data:', gameData);
    console.log('Current view:', currentView);
    console.log('Show create modal:', showCreateModal);
    
    try {
      console.log('Calling gameManager.createGame...');
      const newGame = await gameManager.createGame(gameData);
      console.log('Game created successfully:', newGame);
      
      console.log('Creating new XiangqiGame instance...');
      const gameInstance = new XiangqiGame();
      console.log('Game instance created:', gameInstance);
      
      console.log('Setting game state...');
      setGame(gameInstance);
      
      console.log('Setting current view to game...');
      setCurrentView('game');
      
      console.log('Setting spectator to false...');
      setIsSpectator(false);
      
      console.log('Closing modal...');
      setShowCreateModal(false);
      
      console.log('=== handleCreateGame completed successfully ===');
    } catch (error) {
      console.error('=== ERROR in handleCreateGame ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      // Keep modal open on error so user can try again
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const game = gameManager.games.find(g => g.id === gameId);
      if (!game) return;
      
      await gameManager.joinGame(gameId, game.stakeAmount);
      const gameInstance = new XiangqiGame();
      setGame(gameInstance);
      setCurrentView('game');
      setIsSpectator(false);
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  const handleWatchGame = async (gameId: string) => {
    try {
      await gameManager.watchGame(gameId);
      setCurrentView('spectator');
      setIsSpectator(true);
    } catch (error) {
      console.error('Failed to watch game:', error);
    }
  };

  const handleExitGame = () => {
    gameManager.exitGame();
    setCurrentView('landing');
    setIsSpectator(false);
    setGame(null);
    setSelectedPiece(null);
    setPossibleMoves([]);
  };

  const handleStake = async () => {
    if (!gameManager.currentGame) return;
    
    try {
      await gameManager.stakeForGame(gameManager.currentGame.id, gameManager.currentGame.stakeAmount);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleUnstake = async () => {
    if (!gameManager.currentGame) return;
    
    try {
      await gameManager.unstakeFromGame(gameManager.currentGame.id);
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const currentPlayer = game?.getCurrentPlayer();
  const gameState = game?.getGameState();
  const moves = game?.getMoves() || [];
  
  // Safe access to game properties
  const poolAmount = gameManager.currentGame?.poolAmount || 0;
  const stakeAmount = gameManager.currentGame?.stakeAmount || 0;

  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onCreateGame={() => setShowCreateModal(true)}
            onJoinGame={handleJoinGame}
            onWatchGame={handleWatchGame}
            onShowGuide={() => setCurrentView('guide')}
            games={gameManager.getAvailableGames()}
            activeGames={gameManager.getActiveGames()}
          />
        );
      case 'guide':
        return <GameGuide />;
      case 'spectator':
        if (!gameManager.currentGame) return <LandingPage />;
        return (
          <div style={{ padding: spacing.lg }}>
            <GameHeader
              gameTitle={gameManager.currentGame.title}
              gameStatus={gameManager.currentGame.status}
              stakeAmount={gameManager.currentGame.stakeAmount}
              spectators={gameManager.currentGame.spectators}
              onExit={handleExitGame}
            />
            <SpectatorMode
              game={gameManager.currentGame}
              onExit={handleExitGame}
            />
          </div>
        );
      case 'game':
        if (!game) return <LandingPage />;
        return (
          <div style={{ padding: spacing.lg }}>
            <GameHeader
              gameTitle={gameManager.currentGame?.title || 'BNB Xiangqi Game'}
              gameStatus={gameManager.currentGame?.status || 'active'}
              stakeAmount={gameManager.currentGame?.stakeAmount || 0}
              spectators={gameManager.currentGame?.spectators || 0}
              onExit={handleExitGame}
            />
            
            <MainContent>
              <Sidebar>
                <WalletConnect />
                {gameManager.currentGame && (
                  <StakingStatus
                    isStaked={gameManager.stakingStatus.isStaked}
                    isStaking={gameManager.stakingStatus.isStaking}
                    isUnstaking={gameManager.stakingStatus.isUnstaking}
                    stakeAmount={gameManager.currentGame.stakeAmount}
                    poolAmount={gameManager.currentGame.poolAmount}
                    error={gameManager.stakingStatus.error}
                    success={gameManager.stakingStatus.success}
                    onStake={handleStake}
                    onUnstake={handleUnstake}
                  />
                )}
                
                {gameManager.currentGame && (() => {
                  const poolData = getGamePool(gameManager.currentGame.id);
                  if (poolData) {
                    return (
                      <BNBPoolInfo
                        gameId={poolData.gameId}
                        poolAddress={poolData.poolAddress}
                        totalStaked={poolData.totalStaked}
                        playerStakes={poolData.playerStakes}
                        isActive={poolData.isActive}
                        winner={poolData.winner}
                      />
                    );
                  }
                  return null;
                })()}
              </Sidebar>

              <GameSection>
                <GameInfo>
                  <CurrentPlayer isRed={currentPlayer === PieceColor.RED}>
                    {currentPlayer === PieceColor.RED ? '🔴' : '⚫'} 
                    {currentPlayer === PieceColor.RED ? 'Red Player' : 'Black Player'}'s Turn
                  </CurrentPlayer>
                  
                  <GameStats>
                    <StatCard>
                      <StatValue>{moves.length}</StatValue>
                      <StatLabel>Moves</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>{poolAmount.toFixed(4)}</StatValue>
                      <StatLabel>Prize Pool (BNB)</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>{stakeAmount.toFixed(4)}</StatValue>
                      <StatLabel>Your Stake (BNB)</StatLabel>
                    </StatCard>
                  </GameStats>
                </GameInfo>

                <div style={{ position: 'relative' }}>
                  <GameBoard
                    game={game}
                    onMove={handleMove}
                    selectedPiece={selectedPiece}
                    onPieceSelect={handlePieceSelect}
                    possibleMoves={possibleMoves}
                  />
                  
                  {!gameManager.stakingStatus.isStaked && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      zIndex: 10
                    }}>
                      <div style={{
                        background: colors.background.secondary,
                        padding: spacing.xl,
                        borderRadius: borderRadius.large,
                        border: `2px solid ${colors.accent.red}`,
                        textAlign: 'center',
                        maxWidth: '300px'
                      }}>
                        <h3 style={{ 
                          color: colors.accent.red, 
                          marginBottom: spacing.md,
                          fontSize: typography.fontSize.lg,
                          fontWeight: typography.fontWeight.semibold
                        }}>
                          Stake Required
                        </h3>
                        <p style={{ 
                          color: colors.text.secondary, 
                          marginBottom: spacing.lg,
                          fontSize: typography.fontSize.sm,
                          lineHeight: typography.lineHeight.relaxed
                        }}>
                          You must stake {stakeAmount.toFixed(4)} BNB before you can make moves in this game.
                        </p>
                        <button
                          onClick={handleStake}
                          disabled={gameManager.stakingStatus.isStaking}
                          style={{
                            background: gradients.primary,
                            color: colors.secondary.black,
                            border: 'none',
                            borderRadius: borderRadius.medium,
                            padding: `${spacing.md} ${spacing.lg}`,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            cursor: gameManager.stakingStatus.isStaking ? 'not-allowed' : 'pointer',
                            opacity: gameManager.stakingStatus.isStaking ? 0.6 : 1,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {gameManager.stakingStatus.isStaking ? 'Staking...' : `Stake ${stakeAmount.toFixed(4)} BNB`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </GameSection>

              <Sidebar>
                <div style={{ 
                  padding: spacing.lg, 
                  background: colors.background.secondary, 
                  borderRadius: '16px',
                  border: `1px solid ${colors.border.primary}`,
                  boxShadow: shadows.medium
                }}>
                  <h3 style={{ 
                    color: colors.text.primary, 
                    marginBottom: spacing.md,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    Game Rules
                  </h3>
                  <div style={{ 
                    color: colors.text.secondary, 
                    fontSize: typography.fontSize.sm,
                    lineHeight: typography.lineHeight.relaxed
                  }}>
                    <p style={{ marginBottom: spacing.sm }}>
                      • Both players stake the same amount of BNB
                    </p>
                    <p style={{ marginBottom: spacing.sm }}>
                      • Win by capturing the opponent's General
                    </p>
                    <p style={{ marginBottom: spacing.sm }}>
                      • Winner takes the entire prize pool
                    </p>
                    <p>
                      • Game only starts when both players have staked
                    </p>
                  </div>
                </div>
              </Sidebar>
            </MainContent>
          </div>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <BinanceHeader
          currentView={currentView}
          onNavigate={setCurrentView}
          onExitGame={handleExitGame}
        />

        {renderContent()}
        <GameSharingTest />
        <ConnectionStatus />
      </AppContainer>
      
      <BasicCreateGameModal
        isOpen={showCreateModal}
        onClose={() => {
          console.log('Closing create game modal');
          setShowCreateModal(false);
        }}
        onCreateGame={handleCreateGame}
      />
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: colors.background.secondary,
            color: colors.text.primary,
            border: `1px solid ${colors.border.primary}`,
          },
        }}
      />
    </>
  );
};

export default App;
