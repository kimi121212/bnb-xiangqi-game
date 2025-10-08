import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: #1a1a1a;
    color: #ffffff;
    min-height: 100vh;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
`;

const TestContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
`;

const TestTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #f0b90b;
`;

const TestMessage = styled.p`
  font-size: 1.2rem;
  color: #cccccc;
  margin-bottom: 2rem;
`;

const TestButton = styled.button`
  background: linear-gradient(135deg, #f0b90b 0%, #f0b90b 100%);
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(240, 185, 11, 0.3);
  }
`;

const App: React.FC = () => {
  const handleTest = () => {
    alert('Test button clicked! App is working!');
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <TestContent>
          <TestTitle>🎮 BNB Xiangqi Test</TestTitle>
          <TestMessage>
            If you can see this, the React app is loading correctly!
          </TestMessage>
          <TestButton onClick={handleTest}>
            Test Button
          </TestButton>
        </TestContent>
      </AppContainer>
    </>
  );
};

export default App;
