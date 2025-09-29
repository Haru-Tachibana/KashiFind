#!/usr/bin/env node

// Kashi.find - Environment Setup Script
// This script helps you set up the .env file for local development

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🎵 Kashi.find - Environment Setup');
console.log('=================================');

// Check if .env already exists
if (fs.existsSync('.env')) {
    console.log('⚠️  .env file already exists.');
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('✅ Keeping existing .env file');
            rl.close();
            return;
        }
        createEnvFile();
        rl.close();
    });
} else {
    createEnvFile();
}

function createEnvFile() {
    console.log('📝 Creating .env file...');
    
    // Generate a random JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    
    const envContent = `# Kashi.find - Environment Variables
# Generated on ${new Date().toISOString()}

# Database
# For local MongoDB: mongodb://localhost:27017/lyrics_search
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/lyrics_search?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/lyrics_search
DB_NAME=lyrics_search

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT (auto-generated)
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External APIs (Optional - for more search results)
# Get these from:
# - Genius: https://genius.com/api-clients
# - Spotify: https://developer.spotify.com/dashboard
GENIUS_API_KEY=your_genius_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Logging
LOG_LEVEL=info
`;

    try {
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env file created successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. If using MongoDB Atlas, update MONGODB_URI');
        console.log('2. Optionally add external API keys for more search results');
        console.log('3. Run: npm run setup');
        console.log('4. Run: ./start-dev.sh (Mac/Linux) or start-dev.bat (Windows)');
        console.log('');
        console.log('🔗 Useful links:');
        console.log('- MongoDB Atlas: https://mongodb.com/atlas');
        console.log('- Genius API: https://genius.com/api-clients');
        console.log('- Spotify API: https://developer.spotify.com/dashboard');
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
        process.exit(1);
    }
}
