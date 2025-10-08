import React, { useState } from 'react';

interface BasicCreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGame: (gameData: {
    title: string;
    stakeAmount: number;
    isPrivate: boolean;
    password?: string;
  }) => void;
}

const BasicCreateGameModal: React.FC<BasicCreateGameModalProps> = ({
  isOpen,
  onClose,
  onCreateGame
}) => {
  const [title, setTitle] = useState('');
  const [stakeAmount, setStakeAmount] = useState(0.001);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    console.log('Creating game...');
    
    if (!title.trim()) {
      alert('Please enter a game title');
      return;
    }
    
    if (stakeAmount < 0.001) {
      alert('Minimum stake amount is 0.001 BNB');
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log('Calling onCreateGame with:', {
        title: title.trim(),
        stakeAmount,
        isPrivate,
        password: isPrivate ? password : undefined
      });
      
      await onCreateGame({
        title: title.trim(),
        stakeAmount,
        isPrivate,
        password: isPrivate ? password : undefined
      });
      
      console.log('Game created successfully, closing modal');
      
      // Reset form
      setTitle('');
      setStakeAmount(0.001);
      setIsPrivate(false);
      setPassword('');
      
      onClose();
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) {
    console.log('Modal not open');
    return null;
  }

  console.log('Rendering modal');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: '#1E2329',
        borderRadius: '16px',
        border: '1px solid #2B3139',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          borderBottom: '1px solid #2B3139'
        }}>
          <h2 style={{
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚡ Create New Game
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#2B3139',
              border: '1px solid #2B3139',
              color: '#8B949E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F84960';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = '#F84960';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2B3139';
              e.currentTarget.style.color = '#8B949E';
              e.currentTarget.style.borderColor = '#2B3139';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          
          {/* Game Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Game Title
            </label>
            <input
              type="text"
              placeholder="Enter game title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2B3139',
                border: '1px solid #2B3139',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '16px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F0B90B';
                e.target.style.boxShadow = '0 0 0 2px rgba(240, 185, 11, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2B3139';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Stake Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Stake Amount (BNB)
            </label>
            <select
              value={stakeAmount}
              onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2B3139',
                border: '1px solid #2B3139',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '16px',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F0B90B';
                e.target.style.boxShadow = '0 0 0 2px rgba(240, 185, 11, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2B3139';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value={0.001}>0.001 BNB</option>
              <option value={0.01}>0.01 BNB</option>
              <option value={0.1}>0.1 BNB</option>
              <option value={0.5}>0.5 BNB</option>
              <option value={1.0}>1.0 BNB</option>
              <option value={2.0}>2.0 BNB</option>
              <option value={5.0}>5.0 BNB</option>
            </select>
          </div>

          {/* Game Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Game Type
            </label>
            <select
              value={isPrivate ? 'private' : 'public'}
              onChange={(e) => setIsPrivate(e.target.value === 'private')}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2B3139',
                border: '1px solid #2B3139',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '16px',
                cursor: 'pointer',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F0B90B';
                e.target.style.boxShadow = '0 0 0 2px rgba(240, 185, 11, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2B3139';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="public">Public Game</option>
              <option value="private">Private Game</option>
            </select>
          </div>

          {/* Password for Private Games */}
          {isPrivate && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2B3139',
                  border: '1px solid #2B3139',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F0B90B';
                  e.target.style.boxShadow = '0 0 0 2px rgba(240, 185, 11, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2B3139';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '20px',
          borderTop: '1px solid #2B3139'
        }}>
          <button
            onClick={onClose}
            disabled={isCreating}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: '1px solid #2B3139',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              background: '#2B3139',
              color: '#FFFFFF',
              opacity: isCreating ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #F0B90B 0%, #F0B90B 100%)',
              color: '#000000',
              opacity: isCreating ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isCreating) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isCreating) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isCreating ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicCreateGameModal;
