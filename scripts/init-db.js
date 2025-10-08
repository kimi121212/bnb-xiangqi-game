const fs = require('fs');
const path = require('path');

// Initialize database directory and file
const initDatabase = () => {
  const dataDir = path.join(process.cwd(), 'data');
  const gamesFile = path.join(dataDir, 'games.json');
  
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory');
    }
    
    // Create games.json file if it doesn't exist
    if (!fs.existsSync(gamesFile)) {
      fs.writeFileSync(gamesFile, JSON.stringify([], null, 2));
      console.log('📄 Created games.json file');
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

// Run initialization
initDatabase();
