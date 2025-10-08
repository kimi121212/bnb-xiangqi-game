import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Lock, Users, Zap } from 'lucide-react';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${spacing.lg};
`;

const ModalContainer = styled(motion.div)`
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.large};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.border.primary};
`;

const ModalTitle = styled.h2`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const CloseButton = styled(motion.button)`
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

const ModalContent = styled.div`
  padding: ${spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.lg};
`;

const Label = styled.label`
  display: block;
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
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

const Select = styled.select`
  width: 100%;
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.md};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.yellow};
    box-shadow: 0 0 0 2px ${colors.primary.yellow}20;
  }
`;

const GameTypeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const GameTypeButton = styled(motion.button)<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  background: ${props => props.active ? gradients.primary : colors.background.tertiary};
  color: ${props => props.active ? colors.secondary.black : colors.text.primary};
  border: 1px solid ${props => props.active ? colors.primary.yellow : colors.border.primary};
  border-radius: ${borderRadius.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.medium};
  }
`;

const GameTypeIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary.yellow};
  font-size: 20px;
`;

const GameTypeTitle = styled.span`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const GameTypeDescription = styled.span`
  font-size: ${typography.fontSize.xs};
  text-align: center;
  opacity: 0.8;
`;

const StakeAmountSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const StakeButton = styled(motion.button)<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.md};
  background: ${props => props.active ? gradients.primary : colors.background.tertiary};
  color: ${props => props.active ? colors.secondary.black : colors.text.primary};
  border: 1px solid ${props => props.active ? colors.primary.yellow : colors.border.primary};
  border-radius: ${borderRadius.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${shadows.small};
  }
`;

const StakeAmount = styled.span`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

const StakeLabel = styled.span`
  font-size: ${typography.fontSize.xs};
  opacity: 0.8;
`;

const CustomStakeInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};
`;

const CustomInput = styled(Input)`
  flex: 1;
`;

const BNBLabel = styled.span`
  color: ${colors.primary.yellow};
  font-weight: ${typography.fontWeight.semibold};
`;

const InfoBox = styled.div`
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  margin-bottom: ${spacing.lg};
`;

const InfoTitle = styled.h4`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0 0 ${spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const InfoText = styled.p`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin: 0;
  line-height: ${typography.lineHeight.relaxed};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  border-top: 1px solid ${colors.border.primary};
`;

const ActionButton = styled(motion.button)<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
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
    box-shadow: ${shadows.medium};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGame: (gameData: {
    title: string;
    stakeAmount: number;
    isPrivate: boolean;
    password?: string;
  }) => void;
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({
  isOpen,
  onClose,
  onCreateGame
}) => {
  const [gameType, setGameType] = useState<'public' | 'private'>('public');
  const [title, setTitle] = useState('');
  const [stakeAmount, setStakeAmount] = useState(0.1);
  const [customStake, setCustomStake] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const predefinedStakes = [0.1, 0.5, 1.0];

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Please enter a game title');
      return;
    }
    
    if (stakeAmount <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const finalStakeAmount = customStake ? parseFloat(customStake) : stakeAmount;
      
      console.log('Creating game with:', {
        title: title.trim(),
        stakeAmount: finalStakeAmount,
        isPrivate: gameType === 'private',
        password: gameType === 'private' ? password : undefined
      });
      
      await onCreateGame({
        title: title.trim(),
        stakeAmount: finalStakeAmount,
        isPrivate: gameType === 'private',
        password: gameType === 'private' ? password : undefined
      });
      
      // Reset form
      setTitle('');
      setStakeAmount(0.1);
      setCustomStake('');
      setPassword('');
      setGameType('public');
      
      onClose();
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStakeSelect = (amount: number) => {
    setStakeAmount(amount);
    setCustomStake('');
  };

  const handleCustomStakeChange = (value: string) => {
    setCustomStake(value);
    if (value) {
      setStakeAmount(parseFloat(value) || 0);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
      >
        <ModalContainer
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>
              <Zap size={24} />
              Create New Game
            </ModalTitle>
            <CloseButton
              onClick={() => {
                console.log('Closing modal');
                onClose();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </CloseButton>
          </ModalHeader>

          <ModalContent>
            <FormGroup>
              <Label>Game Title</Label>
              <Input
                type="text"
                placeholder="Enter game title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Game Type</Label>
              <GameTypeSelector>
                <GameTypeButton
                  active={gameType === 'public'}
                  onClick={() => setGameType('public')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GameTypeIcon>
                    <Users size={20} />
                  </GameTypeIcon>
                  <GameTypeTitle>Public Game</GameTypeTitle>
                  <GameTypeDescription>Anyone can join</GameTypeDescription>
                </GameTypeButton>
                
                <GameTypeButton
                  active={gameType === 'private'}
                  onClick={() => setGameType('private')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GameTypeIcon>
                    <Lock size={20} />
                  </GameTypeIcon>
                  <GameTypeTitle>Private Game</GameTypeTitle>
                  <GameTypeDescription>Password required</GameTypeDescription>
                </GameTypeButton>
              </GameTypeSelector>
            </FormGroup>

            {gameType === 'private' && (
              <FormGroup>
                <Label>Game Password</Label>
                <Input
                  type="password"
                  placeholder="Enter password for private game..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Stake Amount (BNB)</Label>
              <StakeAmountSelector>
                {predefinedStakes.map((amount) => (
                  <StakeButton
                    key={amount}
                    active={stakeAmount === amount && !customStake}
                    onClick={() => handleStakeSelect(amount)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <StakeAmount>{amount}</StakeAmount>
                    <StakeLabel>BNB</StakeLabel>
                  </StakeButton>
                ))}
              </StakeAmountSelector>
              
              <CustomStakeInput>
                <CustomInput
                  type="number"
                  placeholder="Custom amount"
                  value={customStake}
                  onChange={(e) => handleCustomStakeChange(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <BNBLabel>BNB</BNBLabel>
              </CustomStakeInput>
            </FormGroup>

            <InfoBox>
              <InfoTitle>
                <Coins size={16} />
                Game Rules
              </InfoTitle>
              <InfoText>
                • Both players must stake the same BNB amount<br/>
                • Winner takes the entire staked pool<br/>
                • Capture pieces to earn their BNB value<br/>
                • Minimum stake: 0.01 BNB
              </InfoText>
            </InfoBox>
          </ModalContent>

          <ModalActions>
            <ActionButton
              variant="secondary"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </ActionButton>
            
            <ActionButton
              variant="primary"
              onClick={handleCreate}
              disabled={!title.trim() || stakeAmount <= 0 || isCreating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCreating ? 'Creating...' : 'Create Game'}
            </ActionButton>
          </ModalActions>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default CreateGameModal;
