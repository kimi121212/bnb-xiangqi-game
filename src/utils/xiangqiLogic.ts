import { Piece, PieceType, PieceColor, Position, GameState, Move } from '../types/game';

export class XiangqiGame {
  private board: (Piece | null)[][];
  private currentPlayer: PieceColor;
  private gameStatus: string;
  private moves: Move[];

  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = PieceColor.RED;
    this.gameStatus = 'waiting_for_players';
    this.moves = [];
  }

  private initializeBoard(): (Piece | null)[][] {
    const board: (Piece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null));
    
    // Initialize pieces (no values needed for simple 1v1 staking game)

    // Red pieces (bottom)
    board[9][4] = { id: 'red-general', type: PieceType.GENERAL, color: PieceColor.RED, position: { x: 4, y: 9 }, hasMoved: false, value: 0 };
    board[9][3] = { id: 'red-advisor-1', type: PieceType.ADVISOR, color: PieceColor.RED, position: { x: 3, y: 9 }, hasMoved: false, value: 0 };
    board[9][5] = { id: 'red-advisor-2', type: PieceType.ADVISOR, color: PieceColor.RED, position: { x: 5, y: 9 }, hasMoved: false, value: 0 };
    board[9][2] = { id: 'red-elephant-1', type: PieceType.ELEPHANT, color: PieceColor.RED, position: { x: 2, y: 9 }, hasMoved: false, value: 0 };
    board[9][6] = { id: 'red-elephant-2', type: PieceType.ELEPHANT, color: PieceColor.RED, position: { x: 6, y: 9 }, hasMoved: false, value: 0 };
    board[9][1] = { id: 'red-horse-1', type: PieceType.HORSE, color: PieceColor.RED, position: { x: 1, y: 9 }, hasMoved: false, value: 0 };
    board[9][7] = { id: 'red-horse-2', type: PieceType.HORSE, color: PieceColor.RED, position: { x: 7, y: 9 }, hasMoved: false, value: 0 };
    board[9][0] = { id: 'red-chariot-1', type: PieceType.CHARIOT, color: PieceColor.RED, position: { x: 0, y: 9 }, hasMoved: false, value: 0 };
    board[9][8] = { id: 'red-chariot-2', type: PieceType.CHARIOT, color: PieceColor.RED, position: { x: 8, y: 9 }, hasMoved: false, value: 0 };
    board[7][1] = { id: 'red-cannon-1', type: PieceType.CANNON, color: PieceColor.RED, position: { x: 1, y: 7 }, hasMoved: false, value: 0 };
    board[7][7] = { id: 'red-cannon-2', type: PieceType.CANNON, color: PieceColor.RED, position: { x: 7, y: 7 }, hasMoved: false, value: 0 };
    
    // Red soldiers
    for (let i = 0; i < 5; i++) {
      board[6][i * 2] = { 
        id: `red-soldier-${i + 1}`, 
        type: PieceType.SOLDIER, 
        color: PieceColor.RED, 
        position: { x: i * 2, y: 6 }, 
        hasMoved: false, 
        value: 0 
      };
    }

    // Black pieces (top)
    board[0][4] = { id: 'black-general', type: PieceType.GENERAL, color: PieceColor.BLACK, position: { x: 4, y: 0 }, hasMoved: false, value: 0 };
    board[0][3] = { id: 'black-advisor-1', type: PieceType.ADVISOR, color: PieceColor.BLACK, position: { x: 3, y: 0 }, hasMoved: false, value: 0 };
    board[0][5] = { id: 'black-advisor-2', type: PieceType.ADVISOR, color: PieceColor.BLACK, position: { x: 5, y: 0 }, hasMoved: false, value: 0 };
    board[0][2] = { id: 'black-elephant-1', type: PieceType.ELEPHANT, color: PieceColor.BLACK, position: { x: 2, y: 0 }, hasMoved: false, value: 0 };
    board[0][6] = { id: 'black-elephant-2', type: PieceType.ELEPHANT, color: PieceColor.BLACK, position: { x: 6, y: 0 }, hasMoved: false, value: 0 };
    board[0][1] = { id: 'black-horse-1', type: PieceType.HORSE, color: PieceColor.BLACK, position: { x: 1, y: 0 }, hasMoved: false, value: 0 };
    board[0][7] = { id: 'black-horse-2', type: PieceType.HORSE, color: PieceColor.BLACK, position: { x: 7, y: 0 }, hasMoved: false, value: 0 };
    board[0][0] = { id: 'black-chariot-1', type: PieceType.CHARIOT, color: PieceColor.BLACK, position: { x: 0, y: 0 }, hasMoved: false, value: 0 };
    board[0][8] = { id: 'black-chariot-2', type: PieceType.CHARIOT, color: PieceColor.BLACK, position: { x: 8, y: 0 }, hasMoved: false, value: 0 };
    board[2][1] = { id: 'black-cannon-1', type: PieceType.CANNON, color: PieceColor.BLACK, position: { x: 1, y: 2 }, hasMoved: false, value: 0 };
    board[2][7] = { id: 'black-cannon-2', type: PieceType.CANNON, color: PieceColor.BLACK, position: { x: 7, y: 2 }, hasMoved: false, value: 0 };
    
    // Black soldiers
    for (let i = 0; i < 5; i++) {
      board[3][i * 2] = { 
        id: `black-soldier-${i + 1}`, 
        type: PieceType.SOLDIER, 
        color: PieceColor.BLACK, 
        position: { x: i * 2, y: 3 }, 
        hasMoved: false, 
        value: 0 
      };
    }

    return board;
  }

  public getBoard(): (Piece | null)[][] {
    return this.board;
  }

  public getCurrentPlayer(): PieceColor {
    return this.currentPlayer;
  }

  public getGameStatus(): string {
    return this.gameStatus;
  }

  public getMoves(): Move[] {
    return this.moves;
  }

  public isValidMove(from: Position, to: Position): boolean {
    const piece = this.board[from.y][from.x];
    if (!piece || piece.color !== this.currentPlayer) {
      return false;
    }

    // Check if destination is within bounds
    if (to.x < 0 || to.x >= 9 || to.y < 0 || to.y >= 10) {
      return false;
    }

    // Check if destination is occupied by own piece
    const destinationPiece = this.board[to.y][to.x];
    if (destinationPiece && destinationPiece.color === piece.color) {
      return false;
    }

    // Check piece-specific movement rules
    return this.isValidPieceMove(piece, from, to);
  }

  private isValidPieceMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    switch (piece.type) {
      case PieceType.GENERAL:
        return this.isValidGeneralMove(piece, from, to);
      case PieceType.ADVISOR:
        return this.isValidAdvisorMove(piece, from, to);
      case PieceType.ELEPHANT:
        return this.isValidElephantMove(piece, from, to);
      case PieceType.HORSE:
        return this.isValidHorseMove(piece, from, to);
      case PieceType.CHARIOT:
        return this.isValidChariotMove(piece, from, to);
      case PieceType.CANNON:
        return this.isValidCannonMove(piece, from, to);
      case PieceType.SOLDIER:
        return this.isValidSoldierMove(piece, from, to);
      default:
        return false;
    }
  }

  private isValidGeneralMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    // General can only move one step horizontally or vertically
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // Check if staying within palace
      const isRed = piece.color === PieceColor.RED;
      const palaceY = isRed ? [7, 8, 9] : [0, 1, 2];
      const palaceX = [3, 4, 5];
      
      return palaceY.includes(to.y) && palaceX.includes(to.x);
    }
    
    return false;
  }

  private isValidAdvisorMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    // Advisor moves diagonally one step
    if (dx === 1 && dy === 1) {
      const isRed = piece.color === PieceColor.RED;
      const palaceY = isRed ? [7, 8, 9] : [0, 1, 2];
      const palaceX = [3, 4, 5];
      
      return palaceY.includes(to.y) && palaceX.includes(to.x);
    }
    
    return false;
  }

  private isValidElephantMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    // Elephant moves diagonally two steps
    if (dx === 2 && dy === 2) {
      // Check if blocked
      const blockX = from.x + (to.x - from.x) / 2;
      const blockY = from.y + (to.y - from.y) / 2;
      
      if (this.board[blockY][blockX]) {
        return false;
      }
      
      // Check if staying on own side
      const isRed = piece.color === PieceColor.RED;
      return isRed ? to.y >= 5 : to.y <= 4;
    }
    
    return false;
  }

  private isValidHorseMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    // Horse moves in L-shape
    if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
      // Check if blocked
      let blockX, blockY;
      if (dx === 2) {
        blockX = from.x + (to.x - from.x) / 2;
        blockY = from.y;
      } else {
        blockX = from.x;
        blockY = from.y + (to.y - from.y) / 2;
      }
      
      return !this.board[blockY][blockX];
    }
    
    return false;
  }

  private isValidChariotMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Chariot moves horizontally or vertically
    if (dx === 0 || dy === 0) {
      return this.isPathClear(from, to);
    }
    
    return false;
  }

  private isValidCannonMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Cannon moves horizontally or vertically
    if (dx === 0 || dy === 0) {
      const destinationPiece = this.board[to.y][to.x];
      
      if (destinationPiece) {
        // Capturing: must jump over exactly one piece
        return this.countPiecesInPath(from, to) === 1;
      } else {
        // Moving: path must be clear
        return this.isPathClear(from, to);
      }
    }
    
    return false;
  }

  private isValidSoldierMove(piece: Piece, from: Position, to: Position): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const isRed = piece.color === PieceColor.RED;
    
    // Soldier moves forward one step
    if (dx === 0 && dy === (isRed ? -1 : 1)) {
      return true;
    }
    
    // After crossing the river, can move horizontally
    const hasCrossedRiver = isRed ? from.y <= 4 : from.y >= 5;
    if (hasCrossedRiver && Math.abs(dx) === 1 && dy === 0) {
      return true;
    }
    
    return false;
  }

  private isPathClear(from: Position, to: Position): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
    
    for (let i = 1; i < steps; i++) {
      const checkX = from.x + stepX * i;
      const checkY = from.y + stepY * i;
      
      if (this.board[checkY][checkX]) {
        return false;
      }
    }
    
    return true;
  }

  private countPiecesInPath(from: Position, to: Position): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
    
    let count = 0;
    for (let i = 1; i < steps; i++) {
      const checkX = from.x + stepX * i;
      const checkY = from.y + stepY * i;
      
      if (this.board[checkY][checkX]) {
        count++;
      }
    }
    
    return count;
  }

  public makeMove(from: Position, to: Position): boolean {
    if (!this.isValidMove(from, to)) {
      return false;
    }

    const piece = this.board[from.y][from.x];
    const capturedPiece = this.board[to.y][to.x];
    
    // Update piece position
    piece.position = { ...to };
    piece.hasMoved = true;
    
    // Move piece on board
    this.board[to.y][to.x] = piece;
    this.board[from.y][from.x] = null;
    
    // Record move
    const move: Move = {
      from: { ...from },
      to: { ...to },
      piece: { ...piece },
      capturedPiece: capturedPiece ? { ...capturedPiece } : undefined,
      timestamp: Date.now(),
      bnbEarned: 0 // No BNB earning in simple 1v1 staking game
    };
    
    this.moves.push(move);
    
    // Switch players
    this.currentPlayer = this.currentPlayer === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED;
    
    // Check for game end conditions
    this.checkGameEnd();
    
    return true;
  }

  private checkGameEnd(): void {
    // Check if general is captured
    const redGeneral = this.findPiece(PieceType.GENERAL, PieceColor.RED);
    const blackGeneral = this.findPiece(PieceType.GENERAL, PieceColor.BLACK);
    
    if (!redGeneral) {
      this.gameStatus = 'finished';
      this.currentPlayer = PieceColor.BLACK; // Winner
    } else if (!blackGeneral) {
      this.gameStatus = 'finished';
      this.currentPlayer = PieceColor.RED; // Winner
    }
  }

  private findPiece(type: PieceType, color: PieceColor): Piece | null {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = this.board[y][x];
        if (piece && piece.type === type && piece.color === color) {
          return piece;
        }
      }
    }
    return null;
  }

  public getPossibleMoves(position: Position): Position[] {
    const piece = this.board[position.y][position.x];
    if (!piece || piece.color !== this.currentPlayer) {
      return [];
    }

    const moves: Position[] = [];
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.isValidMove(position, { x, y })) {
          moves.push({ x, y });
        }
      }
    }
    
    return moves;
  }

  public getGameState(): GameState {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus as any,
      moves: this.moves,
      redPlayer: {
        address: '',
        name: 'Red Player',
        stakedAmount: 0,
        totalWinnings: 0,
        gamesPlayed: 0,
        gamesWon: 0
      },
      blackPlayer: {
        address: '',
        name: 'Black Player',
        stakedAmount: 0,
        totalWinnings: 0,
        gamesPlayed: 0,
        gamesWon: 0
      },
      stakedBNB: 0,
      winner: this.gameStatus === 'finished' ? this.currentPlayer : undefined
    };
  }
}
