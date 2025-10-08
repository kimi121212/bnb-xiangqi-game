import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: ${spacing.xs} ${spacing.sm};
  border: none;
  border-radius: ${borderRadius.sm};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? colors.primary.yellow : 'transparent'};
  color: ${props => props.active ? colors.secondary.black : colors.text.primary};
  
  &:hover {
    background: ${props => props.active ? colors.primary.yellow : colors.background.primary};
    transform: translateY(-1px);
  }
`;

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <ToggleContainer>
      <ToggleButton
        active={language === 'zh'}
        onClick={() => setLanguage('zh')}
      >
        中文
      </ToggleButton>
      <ToggleButton
        active={language === 'en'}
        onClick={() => setLanguage('en')}
      >
        English
      </ToggleButton>
    </ToggleContainer>
  );
};

export default LanguageToggle;
