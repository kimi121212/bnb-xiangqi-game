# BNB Xiangqi Game API Endpoints

## Overview
This API provides persistent game storage and management for the BNB Xiangqi game. All endpoints support CORS and are designed for production use.

## Base URL
- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-vercel-app.vercel.app`

## Endpoints

### 1. Health Check
- **GET** `/api/health`
- **Description**: Check if the API is working
- **Response**: `{ status: 'OK', timestamp: 1234567890, message: 'BNB Xiangqi API is working', version: '1.0.0' }`

### 2. Test Endpoint
- **GET** `/api/test`
- **Description**: Simple test endpoint
- **Response**: `{ message: 'Test API is working!', method: 'GET', url: '/api/test', timestamp: 1234567890, status: 'SUCCESS' }`

### 3. Status Check
- **GET** `/api/status`
- **Description**: Get database and game statistics
- **Response**: `{ totalGames: 5, availableGames: 2, activeGames: 1, timestamp: 1234567890, status: 'OK', database: 'Connected' }`

### 4. Games Management

#### Get All Games
- **GET** `/api/games`
- **Description**: Get all games
- **Response**: Array of game objects

#### Create Game
- **POST** `/api/games`
- **Body**: 
  ```json
  {
    "title": "My Game",
    "stakeAmount": "0.1",
    "maxPlayers": 2,
    "isPrivate": false,
    "password": "",
    "host": "0x123..."
  }
  ```
- **Response**: Created game object

#### Get Available Games
- **GET** `/api/games/available`
- **Description**: Get games waiting for players
- **Response**: Array of available game objects

#### Get Active Games
- **GET** `/api/games/active`
- **Description**: Get currently active games
- **Response**: Array of active game objects

#### Get Specific Game
- **GET** `/api/games/{gameId}`
- **Description**: Get a specific game by ID
- **Response**: Game object or 404 error

#### Join Game
- **POST** `/api/games/{gameId}/join`
- **Body**: 
  ```json
  {
    "playerAddress": "0x123...",
    "password": "optional_password"
  }
  ```
- **Response**: Updated game object

#### Update Game Status
- **POST** `/api/games/{gameId}/status`
- **Body**: 
  ```json
  {
    "status": "active"
  }
  ```
- **Response**: Updated game object

#### Update Pool Amount
- **POST** `/api/games/{gameId}/pool`
- **Body**: 
  ```json
  {
    "amount": "0.2"
  }
  ```
- **Response**: Updated game object

### 5. Cleanup
- **POST** `/api/cleanup`
- **Description**: Clean up old games (24+ hours old)
- **Response**: `{ totalGames: 3, availableGames: 1, activeGames: 1, cleanedUp: true, timestamp: 1234567890 }`

## Game Object Structure
```json
{
  "id": "uuid",
  "title": "Game Title",
  "stakeAmount": "0.1",
  "players": ["0x123...", "0x456..."],
  "maxPlayers": 2,
  "status": "waiting|active|finished",
  "isPrivate": false,
  "password": "",
  "createdAt": 1234567890,
  "host": "0x123...",
  "spectators": 0,
  "poolAmount": 0,
  "poolWalletAddress": "0x789...",
  "stakeCount": 0,
  "gameInstance": {
    "board": [...],
    "currentPlayer": "red",
    "gameState": "waiting",
    "moves": []
  }
}
```

## Error Responses
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Game not found
- **405 Method Not Allowed**: Invalid HTTP method
- **500 Internal Server Error**: Server error

## CORS Support
All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Database Persistence
Games are stored in a persistent file-based database (`games.json`) that survives serverless function invocations. This ensures games don't disappear between requests.

## Production Deployment
The API is configured for Vercel deployment with:
- Node.js 18.x runtime
- Automatic CORS handling
- Persistent file storage
- Global access support
