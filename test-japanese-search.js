const externalAPIs = require('./utils/externalAPIs');

async function testJapaneseSearch() {
  console.log('🇯🇵 Testing Japanese Music Search...\n');
  
  const searchTerms = [
    'yoasobi',
    'YOASOBI',
    '米津玄師',
    'kenshi yonezu',
    'lemon',
    'pretender',
    'official髭男dism',
    'yorushika',
    'japanese music',
    'j-pop'
  ];
  
  for (const term of searchTerms) {
    try {
      console.log(`🔍 Searching for: "${term}"`);
      const spotifyResults = await externalAPIs.searchSpotify(term, 3);
      const geniusResults = await externalAPIs.searchGenius(term, 3);
      
      console.log(`  Spotify: ${spotifyResults.length} results`);
      console.log(`  Genius: ${geniusResults.length} results`);
      
      if (spotifyResults.length > 0) {
        console.log(`  Spotify sample: ${spotifyResults[0].title} by ${spotifyResults[0].artist}`);
      }
      if (geniusResults.length > 0) {
        console.log(`  Genius sample: ${geniusResults[0].title} by ${geniusResults[0].artist}`);
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error searching "${term}":`, error.message);
    }
  }
}

testJapaneseSearch();
