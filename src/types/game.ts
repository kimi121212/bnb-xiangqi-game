export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
  value: number; // BNB value for staking
}

export enum PieceType {
  GENERAL = 'general',      // 将/帅 (King)
  ADVISOR = 'advisor',      // 士 (Advisor)
  ELEPHANT = 'elephant',    // 象 (Elephant)
  HORSE = 'horse',          // 马 (Horse)
  CHARIOT = 'chariot',      // 车 (Chariot)
  CANNON = 'cannon',        // 炮 (Cannon)
  SOLDIER = 'soldier'       // 兵/卒 (Soldier)
}

export enum PieceColor {
  RED = 'red',
  BLACK = 'black'
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  gameStatus: GameStatus;
  moves: Move[];
  redPlayer: Player;
  blackPlayer: Player;
  stakedBNB: number;
  winner?: PieceColor;
}

export interface Player {
  address: string;
  name: string;
  stakedAmount: number;
  totalWinnings: number;
  gamesPlayed: number;
  gamesWon: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  timestamp: number;
  bnbEarned?: number;
}

export enum GameStatus {
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  PAUSED = 'paused'
}

export interface StakingInfo {
  totalStaked: number;
  playerStake: number;
  rewardRate: number;
  lockPeriod: number;
  canUnstake: boolean;
}

export interface TournamentInfo {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startTime: number;
  status: 'upcoming' | 'active' | 'finished';
}
