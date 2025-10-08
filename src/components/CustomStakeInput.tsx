import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

interface CustomStakeInputProps {
  onStakeAmountChange: (amount: number) => void;
  onGameNameChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  minAmount?: number;
  maxAmount?: number;
  isPrivate?: boolean;
  onPasswordChange?: (password: string) => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.large};
  padding: 2rem;
  box-shadow: ${shadows.large};
  max-width: 400px;
  width: 90%;
`;

const Title = styled.h2`
  color: ${colors.primary.yellow};
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: ${colors.text.primary};
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  background: ${colors.background.primary};
  color: ${colors.text.primary};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.yellow};
    box-shadow: 0 0 0 2px ${colors.primary.yellow}20;
  }
`;

const AmountDisplay = styled.div`
  background: ${colors.background.primary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  color: ${colors.primary.yellow};
  font-weight: bold;
  font-size: 1.1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${borderRadius.medium};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: ${colors.primary.yellow};
    color: ${colors.background.primary};
    
    &:hover {
      background: ${colors.primary.yellow}dd;
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${colors.text.secondary};
    border: 1px solid ${colors.border.primary};
    
    &:hover {
      background: ${colors.background.primary};
      color: ${colors.text.primary};
    }
  `}
`;

const PresetAmounts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const PresetButton = styled.button<{ isSelected: boolean }>`
  padding: 0.5rem;
  border: 1px solid ${props => props.isSelected ? colors.primary.yellow : colors.border.primary};
  border-radius: ${borderRadius.medium};
  background: ${props => props.isSelected ? colors.primary.yellow : 'transparent'};
  color: ${props => props.isSelected ? colors.background.primary : colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${colors.primary.yellow};
    background: ${colors.primary.yellow}20;
  }
`;

const CustomStakeInput: React.FC<CustomStakeInputProps> = ({
  onStakeAmountChange,
  onGameNameChange,
  onConfirm,
  onCancel,
  minAmount = 0.001,
  maxAmount = 10,
  isPrivate = false,
  onPasswordChange
}) => {
  const [stakeAmount, setStakeAmount] = useState(minAmount.toString());
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [gameName, setGameName] = useState('');
  const [password, setPassword] = useState('');

  const presetAmounts = [0.001, 0.01, 0.1, 0.5, 1, 5];

  const handleAmountChange = (value: string) => {
    setStakeAmount(value);
    setSelectedPreset(null);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= minAmount && numValue <= maxAmount) {
      onStakeAmountChange(numValue);
    }
  };

  const handleGameNameChange = (value: string) => {
    setGameName(value);
    onGameNameChange(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (onPasswordChange) {
      onPasswordChange(value);
    }
  };

  const handlePresetClick = (amount: number) => {
    setStakeAmount(amount.toString());
    setSelectedPreset(amount.toString());
    onStakeAmountChange(amount);
  };

  const handleConfirm = () => {
    const amount = parseFloat(stakeAmount);
    
    if (!gameName.trim()) {
      alert('Please enter a game name');
      return;
    }
    
    if (amount < minAmount || amount > maxAmount) {
      alert(`Please enter an amount between ${minAmount} and ${maxAmount} BNB`);
      return;
    }
    
    if (isPrivate && !password.trim()) {
      alert('Please enter a password for the private game');
      return;
    }
    
    onConfirm();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Title>{isPrivate ? 'Create Private Game' : 'Create Public Game'}</Title>
        
        <InputGroup>
          <Label>Game Name:</Label>
          <Input
            type="text"
            value={gameName}
            onChange={(e) => handleGameNameChange(e.target.value)}
            placeholder="Enter game name"
            maxLength={50}
          />
        </InputGroup>
        
        {isPrivate && (
          <InputGroup>
            <Label>Password:</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter password for private game"
              maxLength={20}
            />
          </InputGroup>
        )}
        
        <InputGroup>
          <Label>Choose a preset amount or enter custom:</Label>
          <PresetAmounts>
            {presetAmounts.map((amount) => (
              <PresetButton
                key={amount}
                isSelected={selectedPreset === amount.toString()}
                onClick={() => handlePresetClick(amount)}
              >
                {amount} BNB
              </PresetButton>
            ))}
          </PresetAmounts>
        </InputGroup>

        <InputGroup>
          <Label>Custom Amount (BNB):</Label>
          <Input
            type="number"
            value={stakeAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onKeyDown={handleKeyPress}
            min={minAmount}
            max={maxAmount}
            step="0.001"
            placeholder={`Enter amount (${minAmount} - ${maxAmount} BNB)`}
          />
        </InputGroup>

        <AmountDisplay>
          Stake Amount: {stakeAmount} BNB
        </AmountDisplay>

        <ButtonGroup>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            {isPrivate ? 'Create Private Game' : 'Create Public Game'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CustomStakeInput;
