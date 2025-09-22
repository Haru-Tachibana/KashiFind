require('dotenv').config();
const externalAPIs = require('./utils/externalAPIs');

console.log('🔍 Debugging API Configuration...\n');

console.log('Environment Variables:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Not set');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
console.log('GENIUS_API_KEY:', process.env.GENIUS_API_KEY ? '✅ Set' : '❌ Not set');

console.log('\n🔑 API Keys (first 10 chars):');
console.log('Spotify Client ID:', process.env.SPOTIFY_CLIENT_ID?.substring(0, 10) + '...');
console.log('Spotify Secret:', process.env.SPOTIFY_CLIENT_SECRET?.substring(0, 10) + '...');
console.log('Genius Key:', process.env.GENIUS_API_KEY?.substring(0, 10) + '...');

async function testSpotifyToken() {
  try {
    console.log('\n🎵 Testing Spotify Token Generation...');
    const token = await externalAPIs.getSpotifyToken();
    console.log('Token generated:', token ? '✅ Success' : '❌ Failed');
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('❌ Token Error:', error.message);
  }
}

async function testSimpleSearch() {
  try {
    console.log('\n🔍 Testing Simple Search...');
    const results = await externalAPIs.searchSpotify('love', 1);
    console.log('Search results:', results.length);
    if (results.length > 0) {
      console.log('First result:', results[0]);
    }
  } catch (error) {
    console.error('❌ Search Error:', error.message);
  }
}

testSpotifyToken().then(() => testSimpleSearch());
