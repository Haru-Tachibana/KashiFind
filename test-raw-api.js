const fetch = require('node-fetch');

async function testRawSpotifyAPI() {
  console.log('🎵 Testing Raw Spotify API...\n');
  
  try {
    // Get access token
    const clientId = '87cb781f8bf6495e995aaab94332d632';
    const clientSecret = '8e6ad4794f6949668804ca08172722c5';
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);
    
    if (tokenData.access_token) {
      // Test search
      const searchResponse = await fetch('https://api.spotify.com/v1/search?q=taylor%20swift&type=track&limit=5', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      const searchData = await searchResponse.json();
      console.log('Search response:', JSON.stringify(searchData, null, 2));
    }
  } catch (error) {
    console.error('❌ Raw API Error:', error.message);
  }
}

async function testRawGeniusAPI() {
  console.log('\n🎤 Testing Raw Genius API...\n');
  
  try {
    const apiKey = 'n2Aq4YCgurTl0cfCGKfK9W3OFtDZs-4x1jtEgDz2vJymk6vZ5nNZ4yWEENRFeiVV';
    
    const searchResponse = await fetch(`https://api.genius.com/search?q=taylor%20swift&per_page=5`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const searchData = await searchResponse.json();
    console.log('Genius response:', JSON.stringify(searchData, null, 2));
  } catch (error) {
    console.error('❌ Raw Genius API Error:', error.message);
  }
}

testRawSpotifyAPI().then(() => testRawGeniusAPI());
