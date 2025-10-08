import React from 'react';

interface GameDebugProps {
  game: any;
}

const GameDebug: React.FC<GameDebugProps> = ({ game }) => {
  if (!game) {
    return (
      <div style={{ 
        color: '#ff6b6b', 
        padding: '10px', 
        textAlign: 'center',
        fontSize: '14px'
      }}>
        No game object
      </div>
    );
  }

  return (
    <div style={{ 
      fontSize: '12px',
      color: '#fff',
      lineHeight: '1.4'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#f0b90b' }}>
        Game Status: {game.status || 'Unknown'}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>ID:</strong> {game.id ? game.id.substring(0, 8) + '...' : 'No ID'}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Instance:</strong> {game.gameInstance ? '✅' : '❌'}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Players:</strong> {game.players?.length || 0}/2
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Stake:</strong> {game.stakeAmount ? `${game.stakeAmount} BNB` : 'Not set'}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Pool:</strong> {game.poolAmount ? `${game.poolAmount} BNB` : '0 BNB'}
      </div>
      {game.players && game.players.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <strong>Players:</strong>
          {game.players.map((player: any, index: number) => (
            <div key={index} style={{ fontSize: '10px', marginLeft: '8px' }}>
              {player.address ? player.address.substring(0, 6) + '...' + player.address.substring(player.address.length - 4) : 'Unknown'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameDebug;
