import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BNB Xiangqi title', () => {
  render(<App />);
  const titleElement = screen.getByText(/BNB Xiangqi/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders connect wallet button', () => {
  render(<App />);
  const connectButton = screen.getByText(/Connect MetaMask/i);
  expect(connectButton).toBeInTheDocument();
});
