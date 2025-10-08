import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Eye, Users, Trophy, Coins, MessageCircle, Heart } from 'lucide-react';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';
import { GameData } from '../hooks/useGameManager';

const SpectatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  padding: ${spacing.lg};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const SpectatorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${spacing.md};
  border-bottom: 1px solid ${colors.border.primary};
`;

const SpectatorTitle = styled.h3`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const SpectatorCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const CountValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
`;

const CountLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
`;

const GameInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const InfoTitle = styled.h4`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const InfoValue = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.bold};
`;

const InfoSubtext = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
`;

const PlayersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const PlayerCard = styled.div<{ isCurrentPlayer: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${props => props.isCurrentPlayer ? `${colors.primary.yellow}20` : colors.background.tertiary};
  border: 1px solid ${props => props.isCurrentPlayer ? colors.primary.yellow : colors.border.primary};
  border-radius: ${borderRadius.medium};
  transition: all 0.3s ease;
`;

const PlayerAvatar = styled.div<{ color: 'red' | 'black' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color === 'red' ? 
    'linear-gradient(135deg, #F84960 0%, #FF6B7A 100%)' :
    'linear-gradient(135deg, #1E2329 0%, #2B3139 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color === 'red' ? colors.secondary.white : colors.primary.yellow};
  font-weight: bold;
  font-size: 16px;
`;

const PlayerInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const PlayerName = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const PlayerAddress = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
  font-family: ${typography.fontFamily.mono};
`;

const PlayerStatus = styled.span<{ isCurrentPlayer: boolean }>`
  color: ${props => props.isCurrentPlayer ? colors.primary.yellow : colors.text.secondary};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
`;

const ChatSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding-bottom: ${spacing.sm};
  border-bottom: 1px solid ${colors.border.primary};
`;

const ChatTitle = styled.h4`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

const ChatMessages = styled.div`
  height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  background: ${colors.background.tertiary};
  border-radius: ${borderRadius.medium};
  border: 1px solid ${colors.border.primary};
`;

const ChatMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.small};
  border: 1px solid ${colors.border.primary};
`;

const MessageAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${colors.primary.yellow};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.secondary.black};
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const MessageAuthor = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
`;

const MessageTime = styled.span`
  color: ${colors.text.tertiary};
  font-size: ${typography.fontSize.xs};
`;

const MessageText = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.normal};
`;

const ChatInput = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const MessageInput = styled.input`
  flex: 1;
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.yellow};
    box-shadow: 0 0 0 2px ${colors.primary.yellow}20;
  }
  
  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

const SendButton = styled(motion.button)`
  padding: ${spacing.sm} ${spacing.md};
  background: ${gradients.primary};
  color: ${colors.secondary.black};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${shadows.small};
  }
`;

const ReactionButton = styled(motion.button)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  color: ${colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.accent.red};
    color: ${colors.secondary.white};
    border-color: ${colors.accent.red};
  }
`;

interface SpectatorModeProps {
  game: GameData;
  onExit: () => void;
}

const SpectatorMode: React.FC<SpectatorModeProps> = ({ game, onExit }) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    author: string;
    text: string;
    timestamp: number;
    reactions: number;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Mock chat messages
  useEffect(() => {
    const mockMessages = [
      {
        id: '1',
        author: 'Player1',
        text: 'Great move!',
        timestamp: Date.now() - 300000,
        reactions: 3
      },
      {
        id: '2',
        author: 'Spectator1',
        text: 'This is intense!',
        timestamp: Date.now() - 200000,
        reactions: 1
      },
      {
        id: '3',
        author: 'Player2',
        text: 'Nice strategy',
        timestamp: Date.now() - 100000,
        reactions: 2
      }
    ];
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      author: 'You',
      text: newMessage,
      timestamp: Date.now(),
      reactions: 0
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleReaction = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: msg.reactions + 1 }
        : msg
    ));
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <SpectatorContainer>
      <SpectatorHeader>
        <SpectatorTitle>
          <Eye size={20} />
          Spectating Game
        </SpectatorTitle>
        <SpectatorCount>
          <Users size={16} />
          <CountValue>{game.spectators}</CountValue>
          <CountLabel>watching</CountLabel>
        </SpectatorCount>
      </SpectatorHeader>

      <GameInfo>
        <InfoCard>
          <InfoTitle>
            <Trophy size={16} />
            Prize Pool
          </InfoTitle>
          <InfoValue>{game.poolAmount} BNB</InfoValue>
          <InfoSubtext>Winner takes all</InfoSubtext>
        </InfoCard>
        
        <InfoCard>
          <InfoTitle>
            <Coins size={16} />
            Stake Amount
          </InfoTitle>
          <InfoValue>{game.stakeAmount} BNB</InfoValue>
          <InfoSubtext>Per player</InfoSubtext>
        </InfoCard>
      </GameInfo>

      <PlayersList>
        <h4 style={{ 
          color: colors.text.primary, 
          marginBottom: spacing.sm,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold
        }}>
          Players
        </h4>
        
        {game.players.map((player, index) => (
          <PlayerCard key={player} isCurrentPlayer={index === 0}>
            <PlayerAvatar color={index === 0 ? 'red' : 'black'}>
              {index === 0 ? '帅' : '将'}
            </PlayerAvatar>
            <PlayerInfo>
              <PlayerName>
                {index === 0 ? 'Red Player' : 'Black Player'}
              </PlayerName>
              <PlayerAddress>
                {player.slice(0, 6)}...{player.slice(-4)}
              </PlayerAddress>
              <PlayerStatus isCurrentPlayer={index === 0}>
                {index === 0 ? 'Current Turn' : 'Waiting'}
              </PlayerStatus>
            </PlayerInfo>
          </PlayerCard>
        ))}
      </PlayersList>

      <ChatSection>
        <ChatHeader>
          <ChatTitle>
            <MessageCircle size={16} />
            Live Chat
          </ChatTitle>
        </ChatHeader>
        
        <ChatMessages>
          {messages.map((message) => (
            <ChatMessage key={message.id}>
              <MessageAvatar>
                {message.author.charAt(0).toUpperCase()}
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <MessageAuthor>{message.author}</MessageAuthor>
                  <MessageTime>{formatTime(message.timestamp)}</MessageTime>
                </MessageHeader>
                <MessageText>{message.text}</MessageText>
              </MessageContent>
              <ReactionButton
                onClick={() => handleReaction(message.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={12} />
              </ReactionButton>
            </ChatMessage>
          ))}
        </ChatMessages>
        
        <ChatInput>
          <MessageInput
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <SendButton
            onClick={handleSendMessage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </SendButton>
        </ChatInput>
      </ChatSection>
    </SpectatorContainer>
  );
};

export default SpectatorMode;
