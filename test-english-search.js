const externalAPIs = require('./utils/externalAPIs');

async function testEnglishSearch() {
  console.log('🇺🇸 Testing English Music Search...\n');
  
  const searchTerms = [
    'taylor swift',
    'ed sheeran',
    'billie eilish',
    'the weeknd',
    'dua lipa',
    'harry styles',
    'ariana grande',
    'justin bieber',
    'drake',
    'post malone'
  ];
  
  for (const term of searchTerms) {
    try {
      console.log(`🔍 Searching for: "${term}"`);
      const spotifyResults = await externalAPIs.searchSpotify(term, 2);
      const geniusResults = await externalAPIs.searchGenius(term, 2);
      
      console.log(`  Spotify: ${spotifyResults.length} results`);
      console.log(`  Genius: ${geniusResults.length} results`);
      
      if (spotifyResults.length > 0) {
        console.log(`  Spotify: "${spotifyResults[0].title}" by ${spotifyResults[0].artist}`);
      }
      if (geniusResults.length > 0) {
        console.log(`  Genius: "${geniusResults[0].title}" by ${geniusResults[0].artist}`);
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error searching "${term}":`, error.message);
    }
  }
}

testEnglishSearch();
