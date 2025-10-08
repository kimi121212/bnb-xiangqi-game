import React, { useState, useCallback, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

// Import game components
import BinanceHeader from './BinanceHeader';
import LandingPage from './LandingPage';
import GameBoard from './GameBoard';
import GameHeader from './GameHeader';
import GameStaking from './GameStaking';
import SpectatorMode from './SpectatorMode';
import GameDebug from './GameDebug';
import TransactionInfo from './TransactionInfo';

// Import hooks
import { useWallet } from '../hooks/useWallet';
import { useGameManager } from '../hooks/useGameManager';
import { useBNBPools } from '../hooks/useBNBPools';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: #ffffff;
    min-height: 100vh;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
`;

const GameBoardSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const GameInfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 300px;
`;

const GameInfoCard = styled.div`
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.large};
  padding: 1.5rem;
  box-shadow: ${shadows.medium};
`;

const GameInfoTitle = styled.h3`
  color: ${colors.primary.yellow};
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ResponsiveContainer = styled.div`
  @media (max-width: 1200px) {
    ${GameContainer} {
      flex-direction: column;
    }
    
    ${GameInfoSection} {
      min-width: auto;
    }
  }
`;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'lobby' | 'game' | 'spectator'>('lobby');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  
  // Initialize hooks
  const wallet = useWallet();
  const gameManager = useGameManager();
  const bnbPools = useBNBPools();

  // Get current game info
  const currentGame = gameManager.currentGame;
  const poolAmount = selectedGame?.poolAmount || currentGame?.poolAmount || 0;
  const stakeAmount = selectedGame?.stakeAmount || currentGame?.stakeAmount || 0;
  
  // Get staking status from game manager
  const stakingStatus = gameManager.stakingStatus;

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedView = localStorage.getItem('bnb-xiangqi-current-view');
    const savedGameId = localStorage.getItem('bnb-xiangqi-current-game-id');
    
    if (savedView && ['lobby', 'game', 'spectator'].includes(savedView)) {
      setCurrentView(savedView as 'lobby' | 'game' | 'spectator');
    }
    
    if (savedGameId && gameManager.games.length > 0) {
      const savedGame = gameManager.games.find(g => g.id === savedGameId);
      if (savedGame) {
        setSelectedGame(savedGame);
        // If we have a saved game and we're in game view, restore the game
        if (savedView === 'game' && savedGame) {
          gameManager.setCurrentGame(savedGame);
        }
      }
    }
  }, [gameManager.games, gameManager.setCurrentGame]);

  // Update selectedGame when game data changes (for live updates)
  useEffect(() => {
    if (selectedGame && gameManager.games.length > 0) {
      const updatedGame = gameManager.games.find(g => g.id === selectedGame.id);
      if (updatedGame) {
        // Check if the game data has actually changed
        const hasChanged = 
          updatedGame.poolAmount !== selectedGame.poolAmount ||
          updatedGame.stakeCount !== selectedGame.stakeCount ||
          updatedGame.players.length !== selectedGame.players.length ||
          updatedGame.status !== selectedGame.status;
          
        if (hasChanged) {
          console.log('Updating selectedGame with new data:', updatedGame);
          setSelectedGame(updatedGame);
        }
      }
    }
  }, [gameManager.games, selectedGame]);

  // Save current view and game to localStorage
  useEffect(() => {
    localStorage.setItem('bnb-xiangqi-current-view', currentView);
    if (selectedGame) {
      localStorage.setItem('bnb-xiangqi-current-game-id', selectedGame.id);
    }
  }, [currentView, selectedGame]);

  const handleCreateGame = useCallback(async (customStakeAmount?: number, gameName?: string, isPrivate?: boolean, password?: string) => {
    try {
      console.log('Creating new game...', { customStakeAmount, gameName, isPrivate, password });
      
      // Check if wallet is connected
      if (!wallet.walletInfo.isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }
      
      const stakeAmount = customStakeAmount || 0.001; // Use custom amount or default minimum
      const title = gameName || (isPrivate ? 'Private Xiangqi Game' : 'Public Xiangqi Game');
      
      const gameData = {
        title: title,
        stakeAmount: stakeAmount,
        isPrivate: isPrivate || false,
        password: password,
        maxPlayers: 2,
        host: wallet.walletInfo.address
      };
      
      const game = await gameManager.createGame(gameData);
      console.log('Game created:', game);
      
      // Ensure the game has a game instance
      if (!game.gameInstance) {
        console.log('Adding game instance to created game');
        game.gameInstance = new (await import('./utils/xiangqiLogic')).XiangqiGame();
      }
      
      setSelectedGame(game);
      setCurrentView('game');
    } catch (error: any) {
      console.error('Error creating game:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to create game: ${errorMessage}`);
    }
  }, [gameManager, wallet]);

  const handleJoinGame = useCallback(async (gameId: string) => {
    try {
      console.log('Joining game:', gameId);
      // Find the game to get its stake amount
      const game = gameManager.games.find(g => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      const joinedGame = await gameManager.joinGame(gameId, game.stakeAmount);
      
      // Ensure the game has a game instance
      if (!joinedGame.gameInstance) {
        console.log('Adding game instance to joined game');
        joinedGame.gameInstance = new (await import('./utils/xiangqiLogic')).XiangqiGame();
      }
      
      setSelectedGame(joinedGame);
      setCurrentView('game');
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
    }
  }, [gameManager]);

  const handleJoinPrivateGame = useCallback((gameId: string, password: string) => {
    console.log('Join private game requested:', gameId, password);
    // This will be handled by the LandingPage component
  }, []);

  const handleWatchGame = useCallback(async (gameId: string) => {
    try {
      console.log('Watching game:', gameId);
      const game = await gameManager.watchGame(gameId);
      
      // Ensure the game has a game instance
      if (!game.gameInstance) {
        console.log('Adding game instance to watched game');
        game.gameInstance = new (await import('./utils/xiangqiLogic')).XiangqiGame();
      }
      
      setSelectedGame(game);
      setCurrentView('spectator');
    } catch (error) {
      console.error('Error watching game:', error);
      alert('Failed to watch game. Please try again.');
    }
  }, [gameManager]);

  const handleExitGame = useCallback(() => {
    setCurrentView('lobby');
    setSelectedGame(null);
    gameManager.exitGame();
  }, [gameManager]);

  const handleStakeForGame = useCallback(async (amount: number) => {
    try {
      await gameManager.stakeForGame(selectedGame?.id, amount);
    } catch (error) {
      console.error('Error staking for game:', error);
      alert('Failed to stake for game. Please try again.');
    }
  }, [gameManager, selectedGame]);


  const handleEndGameWithRefunds = useCallback(async () => {
    try {
      await gameManager.endGameWithRefunds(selectedGame?.id);
      setCurrentView('lobby');
      setSelectedGame(null);
    } catch (error) {
      console.error('Error ending game with refunds:', error);
      alert('Failed to end game. Please try again.');
    }
  }, [gameManager, selectedGame]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'lobby':
        return (
          <LandingPage
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            onWatchGame={handleWatchGame}
            games={gameManager.games}
            activeGames={gameManager.games.filter((g: any) => g.status === 'active')}
            userGames={gameManager.getUserGames()}
          />
        );
      
      case 'game':
        return (
          <ResponsiveContainer>
            <GameContainer>
              <GameBoardSection>
                <GameHeader
                  gameTitle="BNB Xiangqi Game"
                  gameStatus={selectedGame?.status || 'waiting'}
                  stakeAmount={stakeAmount}
                  spectators={selectedGame?.spectators || 0}
                  onExit={handleExitGame}
                />
                
                <GameBoard
                  game={selectedGame}
                  onMove={gameManager.makeMove}
                  selectedPiece={null}
                  onPieceSelect={() => {}}
                  possibleMoves={[]}
                />
              </GameBoardSection>
              
              <GameInfoSection>
                <GameInfoCard>
                  <GameInfoTitle>Game Status</GameInfoTitle>
                  <GameDebug game={selectedGame} />
                </GameInfoCard>
                
                <GameInfoCard>
                  <GameInfoTitle>Staking</GameInfoTitle>
                  <GameStaking
                    gameId={selectedGame?.id || ''}
                    stakeAmount={stakeAmount}
                    onStake={handleStakeForGame}
                    isStaked={stakingStatus.isStaked}
                    isStaking={stakingStatus.isStaking}
                    isUnstaking={false}
                    error={stakingStatus.error}
                    success={stakingStatus.success}
                  />
                </GameInfoCard>
                
                <GameInfoCard>
                  <GameInfoTitle>Pool Status</GameInfoTitle>
                  <TransactionInfo
                    gameId={selectedGame?.id || ''}
                    poolAddress={selectedGame?.poolWalletAddress || ''}
                    totalStaked={poolAmount}
                    playerStakes={selectedGame?.playerStakes || {}}
                    stakeAmount={stakeAmount}
                    maxPlayers={selectedGame?.maxPlayers || 2}
                    currentPlayers={selectedGame?.players?.length || 0}
                    stakeCount={selectedGame?.stakeCount || 0}
                    isActive={selectedGame?.status === 'active'}
                  />
                </GameInfoCard>
                
              </GameInfoSection>
            </GameContainer>
          </ResponsiveContainer>
        );
      
      case 'spectator':
        return (
          <SpectatorMode
            game={selectedGame}
            onExit={handleExitGame}
          />
        );
      
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <MainContent>
          <BinanceHeader 
            currentView={currentView}
            onNavigate={(view: string) => setCurrentView(view as 'lobby' | 'game' | 'spectator')}
            onExitGame={handleExitGame}
          />
          {renderCurrentView()}
        </MainContent>
      </AppContainer>
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2d2d2d',
            color: '#ffffff',
            border: '1px solid #404040',
          },
        }}
      />
    </>
  );
};

export default App;