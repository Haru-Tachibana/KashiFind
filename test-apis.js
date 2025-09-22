require('dotenv').config();
const externalAPIs = require('./utils/externalAPIs');

async function testAPIs() {
  console.log('🧪 Testing External APIs...\n');
  
  try {
    // Test Spotify API
    console.log('🎵 Testing Spotify API...');
    const spotifyResults = await externalAPIs.searchSpotify('yoasobi', 5);
    console.log('Spotify results:', spotifyResults.length, 'songs found');
    if (spotifyResults.length > 0) {
      console.log('Sample result:', spotifyResults[0]);
    }
  } catch (error) {
    console.error('❌ Spotify API Error:', error.message);
  }
  
  try {
    // Test Genius API
    console.log('\n🎤 Testing Genius API...');
    const geniusResults = await externalAPIs.searchGenius('yoasobi', 5);
    console.log('Genius results:', geniusResults.length, 'songs found');
    if (geniusResults.length > 0) {
      console.log('Sample result:', geniusResults[0]);
    }
  } catch (error) {
    console.error('❌ Genius API Error:', error.message);
  }
  
  try {
    // Test combined search
    console.log('\n🔍 Testing Combined Search...');
    const combinedResults = await externalAPIs.searchMultipleSources('yoasobi', 10);
    console.log('Combined results:', combinedResults.length, 'songs found');
  } catch (error) {
    console.error('❌ Combined Search Error:', error.message);
  }
}

testAPIs();
