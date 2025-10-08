import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

const ModalOverlay = styled.div`
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

const ModalContainer = styled.div`
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

const CloseButton = styled.button`
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

const ModalActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  border-top: 1px solid ${colors.border.primary};
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
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

interface SimpleCreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGame: (gameData: {
    title: string;
    stakeAmount: number;
    isPrivate: boolean;
    password?: string;
  }) => void;
}

const SimpleCreateGameModal: React.FC<SimpleCreateGameModalProps> = ({
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
      await onCreateGame({
        title: title.trim(),
        stakeAmount,
        isPrivate,
        password: isPrivate ? password : undefined
      });
      
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

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Zap size={24} />
            Create New Game
          </ModalTitle>
          <CloseButton onClick={onClose}>
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
            <Label>Stake Amount (BNB)</Label>
            <Select
              value={stakeAmount}
              onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
            >
              <option value={0.001}>0.001 BNB</option>
              <option value={0.01}>0.01 BNB</option>
              <option value={0.1}>0.1 BNB</option>
              <option value={0.5}>0.5 BNB</option>
              <option value={1.0}>1.0 BNB</option>
              <option value={2.0}>2.0 BNB</option>
              <option value={5.0}>5.0 BNB</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Game Type</Label>
            <Select
              value={isPrivate ? 'private' : 'public'}
              onChange={(e) => setIsPrivate(e.target.value === 'private')}
            >
              <option value="public">Public Game</option>
              <option value="private">Private Game</option>
            </Select>
          </FormGroup>

          {isPrivate && (
            <FormGroup>
              <Label>Password (Optional)</Label>
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>
          )}
        </ModalContent>

        <ModalActions>
          <ActionButton
            variant="secondary"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Game'}
          </ActionButton>
        </ModalActions>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default SimpleCreateGameModal;
