import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGame, setNewGame] = useState({
    title: '',
    stakeAmount: '0.1',
    maxPlayers: 2,
    isPrivate: false,
    password: ''
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGame,
          host: '0x' + Math.random().toString(16).substr(2, 40)
        }),
      });
      
      if (response.ok) {
        const createdGame = await response.json();
        setGames([...games, createdGame]);
        setNewGame({
          title: '',
          stakeAmount: '0.1',
          maxPlayers: 2,
          isPrivate: false,
          password: ''
        });
        alert('Game created successfully!');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>BNB Xiangqi Game</title>
        <meta name="description" content="BNB Staking Xiangqi Game" />
      </Head>

      <h1>🎮 BNB Xiangqi Game</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Create New Game</h2>
        <form onSubmit={createGame} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Game Title"
            value={newGame.title}
            onChange={(e) => setNewGame({...newGame, title: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Stake Amount (BNB)"
            value={newGame.stakeAmount}
            onChange={(e) => setNewGame({...newGame, stakeAmount: e.target.value})}
            step="0.01"
            min="0.01"
          />
          <input
            type="number"
            placeholder="Max Players"
            value={newGame.maxPlayers}
            onChange={(e) => setNewGame({...newGame, maxPlayers: parseInt(e.target.value)})}
            min="2"
            max="10"
          />
          <label>
            <input
              type="checkbox"
              checked={newGame.isPrivate}
              onChange={(e) => setNewGame({...newGame, isPrivate: e.target.checked})}
            />
            Private Game
          </label>
          {newGame.isPrivate && (
            <input
              type="password"
              placeholder="Password"
              value={newGame.password}
              onChange={(e) => setNewGame({...newGame, password: e.target.value})}
            />
          )}
          <button type="submit" style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
            Create Game
          </button>
        </form>
      </div>

      <div>
        <h2>Available Games</h2>
        {loading ? (
          <p>Loading games...</p>
        ) : games.length === 0 ? (
          <p>No games available. Create one above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {games.map((game) => (
              <div key={game.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                <h3>{game.title}</h3>
                <p>Stake: {game.stakeAmount} BNB</p>
                <p>Players: {game.players.length}/{game.maxPlayers}</p>
                <p>Status: {game.status}</p>
                <p>Created: {new Date(game.createdAt).toLocaleString()}</p>
                {game.isPrivate && <p>🔒 Private Game</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
