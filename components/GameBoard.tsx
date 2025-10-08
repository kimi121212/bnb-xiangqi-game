import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { XiangqiGame } from '../utils/xiangqiLogic';
import { Piece, Position, PieceType, PieceColor } from '../types/game';
import { colors, shadows, borderRadius, spacing } from '../styles/theme';

interface GameBoardProps {
  game: XiangqiGame;
  onMove: (from: Position, to: Position) => void;
  selectedPiece: Position | null;
  onPieceSelect: (position: Position) => void;
  possibleMoves: Position[];
}

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg};
  background: ${colors.background.primary};
  border-radius: ${borderRadius.large};
  box-shadow: ${shadows.large};
  width: 100%;
  max-width: 600px;
`;

const Board = styled.div`
  position: relative;
  width: 100%;
  max-width: 540px;
  aspect-ratio: 9/10;
  background: linear-gradient(135deg, #1E2329 0%, #2B3139 100%);
  border: 3px solid ${colors.primary.yellow};
  border-radius: ${borderRadius.large};
  box-shadow: ${shadows.glow};
  
  @media (max-width: 768px) {
    max-width: 400px;
  }
  
  @media (max-width: 480px) {
    max-width: 320px;
  }
`;

const Grid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 0;
`;

const Cell = styled(motion.div)<{ 
  isSelected: boolean; 
  isPossibleMove: boolean; 
  isLastMove: boolean;
  isRedPalace: boolean;
  isBlackPalace: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${props => 
    props.isSelected ? colors.primary.yellow : 
    props.isPossibleMove ? colors.accent.green :
    props.isLastMove ? colors.accent.blue :
    'transparent'
  };
  background: ${props => {
    if (props.isSelected) return `${colors.primary.yellow}20`;
    if (props.isPossibleMove) return `${colors.accent.green}20`;
    if (props.isLastMove) return `${colors.accent.blue}20`;
    if (props.isRedPalace || props.isBlackPalace) return `${colors.primary.yellow}10`;
    return 'transparent';
  }};
  
  &:hover {
    background: ${props => 
      props.isSelected ? `${colors.primary.yellow}30` :
      props.isPossibleMove ? `${colors.accent.green}30` :
      `${colors.primary.yellow}15`
    };
  }
`;

const PieceContainer = styled(motion.div)<{ 
  pieceType: PieceType; 
  pieceColor: PieceColor;
  isSelected: boolean;
}>`
  width: clamp(30px, 4vw, 40px);
  height: clamp(30px, 4vw, 40px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: clamp(12px, 2.5vw, 16px);
  border: 2px solid ${props => 
    props.pieceColor === PieceColor.RED ? colors.accent.red : colors.secondary.white
  };
  background: ${props => 
    props.pieceColor === PieceColor.RED ? 
    'linear-gradient(135deg, #F84960 0%, #FF6B7A 100%)' :
    'linear-gradient(135deg, #1E2329 0%, #2B3139 100%)'
  };
  color: ${props => 
    props.pieceColor === PieceColor.RED ? colors.secondary.white : colors.primary.yellow
  };
  box-shadow: ${props => props.isSelected ? shadows.glow : shadows.small};
  cursor: pointer;
  user-select: none;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${shadows.glow};
  }
`;

const River = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, ${colors.primary.yellow} 50%, transparent 100%);
  transform: translateY(-50%);
  z-index: 1;
`;

const Palace = styled.div<{ isRed: boolean }>`
  position: absolute;
  top: ${props => props.isRed ? '70%' : '0%'};
  left: 33.33%;
  width: 33.33%;
  height: 30%;
  border: 2px dashed ${colors.primary.yellow};
  border-radius: ${borderRadius.medium};
  z-index: 1;
`;

const getPieceSymbol = (type: PieceType, color: PieceColor): string => {
  const symbols = {
    [PieceType.GENERAL]: color === PieceColor.RED ? '帅' : '将',
    [PieceType.ADVISOR]: color === PieceColor.RED ? '仕' : '士',
    [PieceType.ELEPHANT]: color === PieceColor.RED ? '相' : '象',
    [PieceType.HORSE]: '马',
    [PieceType.CHARIOT]: '车',
    [PieceType.CANNON]: '炮',
    [PieceType.SOLDIER]: color === PieceColor.RED ? '兵' : '卒',
  };
  return symbols[type];
};

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onMove,
  selectedPiece,
  onPieceSelect,
  possibleMoves
}) => {
  // Handle case where game doesn't have gameInstance
  if (!game || !game.gameInstance) {
    console.error('Game or gameInstance is missing:', { game, hasGameInstance: !!game?.gameInstance });
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#ff6b6b',
        fontSize: '18px'
      }}>
        <div>
          <h3>Game Loading...</h3>
          <p>Please wait while the game initializes.</p>
        </div>
      </div>
    );
  }

  const gameState = game.gameInstance.getGameState();
  const board = gameState.board;
  const moves = gameState.moves;
  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;

  const handleCellClick = useCallback((x: number, y: number) => {
    const position = { x, y };
    
    if (selectedPiece) {
      // Try to make a move
      if (game.isValidMove(selectedPiece, position)) {
        onMove(selectedPiece, position);
      }
    } else {
      // Select a piece
      const piece = board[y][x];
      if (piece && piece.color === game.getCurrentPlayer()) {
        onPieceSelect(position);
      }
    }
  }, [selectedPiece, board, game, onMove, onPieceSelect]);

  const isRedPalace = (x: number, y: number) => {
    return y >= 7 && y <= 9 && x >= 3 && x <= 5;
  };

  const isBlackPalace = (x: number, y: number) => {
    return y >= 0 && y <= 2 && x >= 3 && x <= 5;
  };

  const isLastMove = (x: number, y: number) => {
    if (!lastMove) return false;
    return (lastMove.from.x === x && lastMove.from.y === y) || 
           (lastMove.to.x === x && lastMove.to.y === y);
  };

  return (
    <BoardContainer>
      <Board>
        <Grid>
          {Array.from({ length: 10 }, (_, y) =>
            Array.from({ length: 9 }, (_, x) => {
              const piece = board[y][x];
              const isSelected = selectedPiece?.x === x && selectedPiece?.y === y;
              const isPossibleMove = possibleMoves.some(move => move.x === x && move.y === y);
              const isLastMoveCell = isLastMove(x, y);
              const isRedPalaceCell = isRedPalace(x, y);
              const isBlackPalaceCell = isBlackPalace(x, y);

              return (
                <Cell
                  key={`${x}-${y}`}
                  isSelected={isSelected}
                  isPossibleMove={isPossibleMove}
                  isLastMove={isLastMoveCell}
                  isRedPalace={isRedPalaceCell}
                  isBlackPalace={isBlackPalaceCell}
                  onClick={() => handleCellClick(x, y)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {piece && (
                    <PieceContainer
                      pieceType={piece.type}
                      pieceColor={piece.color}
                      isSelected={isSelected}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {getPieceSymbol(piece.type, piece.color)}
                    </PieceContainer>
                  )}
                </Cell>
              );
            })
          )}
        </Grid>
        
        <River />
        <Palace isRed={true} />
        <Palace isRed={false} />
      </Board>
    </BoardContainer>
  );
};

export default GameBoard;
