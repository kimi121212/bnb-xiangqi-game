// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XiangqiGame
 * @dev Smart contract for BNB-themed Xiangqi game
 * @author BNB Xiangqi Team
 */
contract XiangqiGame is ReentrancyGuard, Pausable, Ownable {
    enum GameStatus { Waiting, Active, Finished, Cancelled }
    enum PieceType { General, Advisor, Elephant, Horse, Chariot, Cannon, Soldier }
    enum PieceColor { Red, Black }
    
    struct Game {
        address[2] players;
        uint256 stakeAmount;
        GameStatus status;
        address currentPlayer;
        uint256 createdAt;
        uint256[10][9] board;
        uint256 totalMoves;
        address winner;
    }
    
    struct Move {
        uint8[2] from;
        uint8[2] to;
        uint8 pieceType;
        uint8 pieceColor;
        uint256 timestamp;
    }
    
    // Game parameters
    uint256 public constant MIN_STAKE = 0.1 ether;
    uint256 public constant PLATFORM_FEE = 5; // 5%
    uint256 public constant PIECE_VALUES = 7; // Number of piece types
    
    // Piece values in wei (BNB)
    uint256[PIECE_VALUES] public pieceValues = [
        100 ether,  // General
        20 ether,   // Advisor
        15 ether,   // Elephant
        30 ether,   // Horse
        50 ether,   // Chariot
        25 ether,   // Cannon
        5 ether     // Soldier
    ];
    
    // State variables
    uint256 public gameCounter;
    uint256 public totalGamesPlayed;
    uint256 public totalVolume;
    
    // Mappings
    mapping(uint256 => Game) public games;
    mapping(uint256 => Move[]) public gameMoves;
    mapping(address => uint256[]) public playerGames;
    mapping(address => uint256) public playerWinnings;
    mapping(address => uint256) public playerGamesWon;
    
    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 stakeAmount);
    event GameJoined(uint256 indexed gameId, address indexed player);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8[2] from, uint8[2] to);
    event GameFinished(uint256 indexed gameId, address indexed winner, uint256 winnings);
    event RewardsClaimed(uint256 indexed gameId, address indexed player, uint256 amount);
    
    /**
     * @dev Create a new game
     * @param stakeAmount Amount to stake for the game
     */
    function createGame(uint256 stakeAmount) external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_STAKE, "Minimum stake not met");
        require(stakeAmount >= MIN_STAKE, "Invalid stake amount");
        require(msg.value >= stakeAmount, "Insufficient stake amount");
        
        uint256 gameId = gameCounter++;
        address creator = msg.sender;
        
        // Initialize game board (empty board)
        uint256[10][9] memory initialBoard;
        
        games[gameId] = Game({
            players: [creator, address(0)],
            stakeAmount: stakeAmount,
            status: GameStatus.Waiting,
            currentPlayer: creator,
            createdAt: block.timestamp,
            board: initialBoard,
            totalMoves: 0,
            winner: address(0)
        });
        
        playerGames[creator].push(gameId);
        
        emit GameCreated(gameId, creator, stakeAmount);
    }
    
    /**
     * @dev Join an existing game
     * @param gameId ID of the game to join
     */
    function joinGame(uint256 gameId) external payable nonReentrant whenNotPaused {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not available");
        require(game.players[0] != msg.sender, "Cannot join own game");
        require(msg.value >= game.stakeAmount, "Insufficient stake amount");
        
        game.players[1] = msg.sender;
        game.status = GameStatus.Active;
        game.currentPlayer = game.players[0]; // Red player starts
        
        playerGames[msg.sender].push(gameId);
        totalGamesPlayed++;
        totalVolume += game.stakeAmount * 2;
        
        emit GameJoined(gameId, msg.sender);
    }
    
    /**
     * @dev Make a move in the game
     * @param gameId ID of the game
     * @param from Starting position [x, y]
     * @param to Ending position [x, y]
     */
    function makeMove(uint256 gameId, uint8[2] memory from, uint8[2] memory to) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game not active");
        require(game.currentPlayer == msg.sender, "Not your turn");
        require(_isValidMove(game, from, to), "Invalid move");
        
        // Record the move
        Move memory move = Move({
            from: from,
            to: to,
            pieceType: game.board[from[1]][from[0]],
            pieceColor: _getPieceColor(game.board[from[1]][from[0]]),
            timestamp: block.timestamp
        });
        
        gameMoves[gameId].push(move);
        game.totalMoves++;
        
        // Update board
        uint8 capturedPiece = game.board[to[1]][to[0]];
        game.board[to[1]][to[0]] = game.board[from[1]][from[0]];
        game.board[from[1]][from[0]] = 0;
        
        // Check for game end conditions
        if (_isGameFinished(game, capturedPiece)) {
            game.status = GameStatus.Finished;
            game.winner = msg.sender;
            _distributeWinnings(gameId);
        } else {
            // Switch turns
            game.currentPlayer = game.currentPlayer == game.players[0] 
                ? game.players[1] 
                : game.players[0];
        }
        
        emit MoveMade(gameId, msg.sender, from, to);
    }
    
    /**
     * @dev Claim winnings from a finished game
     * @param gameId ID of the game
     */
    function claimWinnings(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Finished, "Game not finished");
        require(game.winner == msg.sender, "Not the winner");
        
        uint256 winnings = game.stakeAmount * 2;
        uint256 platformFee = (winnings * PLATFORM_FEE) / 100;
        uint256 netWinnings = winnings - platformFee;
        
        playerWinnings[msg.sender] += netWinnings;
        playerGamesWon[msg.sender]++;
        
        // Transfer winnings
        (bool success, ) = payable(msg.sender).call{value: netWinnings}("");
        require(success, "Transfer failed");
        
        emit RewardsClaimed(gameId, msg.sender, netWinnings);
    }
    
    /**
     * @dev Get game information
     * @param gameId ID of the game
     */
    function getGameInfo(uint256 gameId) external view returns (
        address[2] memory players,
        uint256 stakeAmount,
        uint8 status,
        address currentPlayer,
        uint256 createdAt
    ) {
        Game memory game = games[gameId];
        return (
            game.players,
            game.stakeAmount,
            uint8(game.status),
            game.currentPlayer,
            game.createdAt
        );
    }
    
    /**
     * @dev Get game board state
     * @param gameId ID of the game
     */
    function getGameBoard(uint256 gameId) external view returns (uint256[10][9] memory) {
        return games[gameId].board;
    }
    
    /**
     * @dev Get active games
     */
    function getActiveGames() external view returns (uint256[] memory) {
        uint256[] memory activeGames = new uint256[](gameCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < gameCounter; i++) {
            if (games[i].status == GameStatus.Waiting) {
                activeGames[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeGames[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get player's games
     * @param player Player address
     */
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }
    
    /**
     * @dev Check if move is valid (simplified validation)
     */
    function _isValidMove(Game memory game, uint8[2] memory from, uint8[2] memory to) 
        internal 
        pure 
        returns (bool) 
    {
        // Basic bounds checking
        if (from[0] >= 9 || from[1] >= 10 || to[0] >= 9 || to[1] >= 10) {
            return false;
        }
        
        // Check if there's a piece at the starting position
        if (game.board[from[1]][from[0]] == 0) {
            return false;
        }
        
        // Check if destination is not occupied by own piece
        uint8 fromPiece = game.board[from[1]][from[0]];
        uint8 toPiece = game.board[to[1]][to[0]];
        
        if (toPiece != 0 && _getPieceColor(fromPiece) == _getPieceColor(toPiece)) {
            return false;
        }
        
        // Additional validation would go here (piece-specific movement rules)
        return true;
    }
    
    /**
     * @dev Check if game is finished
     */
    function _isGameFinished(Game memory game, uint8 capturedPiece) internal pure returns (bool) {
        // Game ends if General (piece type 0) is captured
        return capturedPiece == 0;
    }
    
    /**
     * @dev Get piece color from piece value
     */
    function _getPieceColor(uint8 piece) internal pure returns (uint8) {
        // Simplified: odd values are red, even values are black
        return piece % 2;
    }
    
    /**
     * @dev Distribute winnings after game ends
     */
    function _distributeWinnings(uint256 gameId) internal {
        Game storage game = games[gameId];
        // Winnings are claimed by the winner using claimWinnings function
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
}
