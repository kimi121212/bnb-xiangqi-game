import React, { useState, useEffect } from 'react';
import { sharedGameService } from '../services/SharedGameService';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

const GameSharingTest: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [testGameId, setTestGameId] = useState<string>('');

  useEffect(() => {
    // Subscribe to game updates
    const unsubscribe = sharedGameService.subscribe((updatedGames) => {
      setGames(updatedGames);
      setStats(sharedGameService.getGameStats());
    });

    // Load initial data
    setGames(sharedGameService.getAllGames());
    setStats(sharedGameService.getGameStats());

    return unsubscribe;
  }, []);

  const createTestGame = () => {
    const testGame = {
      id: `test_${Date.now()}`,
      title: `Test Game ${Date.now()}`,
      stakeAmount: 0.001,
      players: ['test-player-1'],
      maxPlayers: 2,
      status: 'waiting' as const,
      isPrivate: false,
      password: '',
      createdAt: Date.now(),
      host: 'test-player-1',
      spectators: 0,
      poolAmount: 0
    };

    sharedGameService.addGame(testGame);
    setTestGameId(testGame.id);
  };

  const joinTestGame = () => {
    if (testGameId) {
      const success = sharedGameService.joinGame(testGameId, 'test-player-2');
      console.log('Join result:', success);
    }
  };

  const clearAllGames = () => {
    sharedGameService.clearAllGames();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: colors.background.secondary,
      border: `2px solid ${colors.accent.yellow}`,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      maxWidth: '400px',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{
        color: colors.accent.yellow,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center'
      }}>
        🧪 Game Sharing Test
      </h3>

      {stats && (
        <div style={{
          background: colors.background.primary,
          borderRadius: borderRadius.medium,
          padding: spacing.sm,
          marginBottom: spacing.md
        }}>
          <div style={{ color: colors.text.primary, fontSize: typography.fontSize.sm, marginBottom: spacing.xs }}>
            <strong>Total Games:</strong> {stats.totalGames}
          </div>
          <div style={{ color: colors.text.primary, fontSize: typography.fontSize.sm, marginBottom: spacing.xs }}>
            <strong>Waiting:</strong> {stats.waitingGames}
          </div>
          <div style={{ color: colors.text.primary, fontSize: typography.fontSize.sm, marginBottom: spacing.xs }}>
            <strong>Active:</strong> {stats.activeGames}
          </div>
          <div style={{ color: colors.text.primary, fontSize: typography.fontSize.sm }}>
            <strong>Players:</strong> {stats.totalPlayers}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <button
          onClick={createTestGame}
          style={{
            background: colors.accent.green,
            color: colors.secondary.black,
            border: 'none',
            borderRadius: borderRadius.medium,
            padding: spacing.sm,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer'
          }}
        >
          Create Test Game
        </button>

        <button
          onClick={joinTestGame}
          disabled={!testGameId}
          style={{
            background: testGameId ? colors.accent.blue : colors.text.secondary,
            color: colors.secondary.black,
            border: 'none',
            borderRadius: borderRadius.medium,
            padding: spacing.sm,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            cursor: testGameId ? 'pointer' : 'not-allowed',
            opacity: testGameId ? 1 : 0.6
          }}
        >
          Join Test Game
        </button>

        <button
          onClick={clearAllGames}
          style={{
            background: colors.accent.red,
            color: colors.secondary.white,
            border: 'none',
            borderRadius: borderRadius.medium,
            padding: spacing.sm,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer'
          }}
        >
          Clear All Games
        </button>
      </div>

      <div style={{
        marginTop: spacing.md,
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <div style={{
          color: colors.text.primary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.sm
        }}>
          Current Games:
        </div>
        {games.map((game) => (
          <div key={game.id} style={{
            background: colors.background.primary,
            borderRadius: borderRadius.small,
            padding: spacing.xs,
            marginBottom: spacing.xs,
            fontSize: typography.fontSize.xs
          }}>
            <div style={{ color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
              {game.title}
            </div>
            <div style={{ color: colors.text.secondary }}>
              {game.players.length}/{game.maxPlayers} players
            </div>
            <div style={{ color: colors.text.secondary }}>
              Status: {game.status}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: spacing.sm,
        padding: spacing.sm,
        background: colors.background.primary,
        borderRadius: borderRadius.medium,
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        textAlign: 'center'
      }}>
        💡 Open multiple browser tabs to test game sharing
      </div>
    </div>
  );
};

export default GameSharingTest;
