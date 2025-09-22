require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const externalAPIs = require('./utils/externalAPIs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// More lenient rate limiting for search endpoints
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute for search (increased for development)
  message: 'Too many search requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply search rate limiting to search endpoints
app.use('/api/search/', searchLimiter);

// Sample data for demonstration - now only for songs not available on Spotify
const sampleSongs = [
  // Local database now only contains songs not available on Spotify
  // This will be used for rare, local, or custom songs only
];
// Google-like search function with fuzzy matching
const searchSongs = (query, options = {}) => {
  const { page = 1, limit = 20, type = 'all', genre, year, sortBy = 'relevance' } = options;
  
  if (!query || query.trim().length === 0) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };
  }
  
  const searchQuery = query.toLowerCase().trim();
  
  // Google-like scoring system
  const scoredResults = sampleSongs.map(song => {
    let score = 0;
    const title = song.title.toLowerCase();
    const artist = song.artist.toLowerCase();
    const album = song.album.toLowerCase();
    const lyrics = song.lyrics.original.toLowerCase();
    const tags = song.tags.join(' ').toLowerCase();
    
    // Exact title match (highest priority)
    if (title === searchQuery) score += 1000;
    else if (title.includes(searchQuery)) score += 500;
    else if (title.startsWith(searchQuery)) score += 300;
    
    // Artist match
    if (artist === searchQuery) score += 800;
    else if (artist.includes(searchQuery)) score += 400;
    else if (artist.startsWith(searchQuery)) score += 200;
    
    // Album match
    if (album.includes(searchQuery)) score += 200;
    
    // Lyrics match
    if (lyrics.includes(searchQuery)) score += 100;
    
    // Tags match
    if (tags.includes(searchQuery)) score += 150;
    
    // Partial word matches (Google-like)
    const queryWords = searchQuery.split(/\s+/);
    queryWords.forEach(word => {
      if (word.length >= 2) {
        if (title.includes(word)) score += 50;
        if (artist.includes(word)) score += 40;
        if (album.includes(word)) score += 30;
        if (lyrics.includes(word)) score += 20;
        if (tags.includes(word)) score += 25;
      }
    });
    
    // Popularity boost
    score += Math.log(song.popularity) * 10;
    
    return { ...song, score };
  });
  
  // Filter by genre and year
  let filteredResults = scoredResults.filter(song => {
    const matchesGenre = !genre || song.genre.toLowerCase().includes(genre.toLowerCase());
    const matchesYear = !year || song.year === parseInt(year);
    return matchesGenre && matchesYear;
  });
  
  // Sort by score (relevance) or other criteria
  if (sortBy === 'relevance') {
    filteredResults.sort((a, b) => b.score - a.score);
  } else if (sortBy === 'popularity') {
    filteredResults.sort((a, b) => b.popularity - a.popularity);
  } else if (sortBy === 'year') {
    filteredResults.sort((a, b) => b.year - a.year);
  } else if (sortBy === 'title') {
    filteredResults.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  // Remove songs with score 0 (no matches)
  filteredResults = filteredResults.filter(song => song.score > 0);
  
  // Remove score from final results
  const results = filteredResults.map(({ score, ...song }) => song);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: results.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: results.length,
      pages: Math.ceil(results.length / limit)
    }
  };
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Search endpoint - Google-like real-time search
app.get('/api/search', (req, res) => {
  try {
    const { 
      q: query, 
      query: queryAlt, // Support both 'q' and 'query' parameters
      page = 1, 
      limit = 20, 
      type = 'all', 
      genre, 
      year,
      sortBy = 'relevance',
      realtime = false
    } = req.query;
    
    // Use either 'q' or 'query' parameter
    const searchQuery = query || queryAlt;
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const results = searchSongs(searchQuery, { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      type, 
      genre, 
      year,
      sortBy
    });
    
    res.json({
      success: true,
      data: results.data,
      query: searchQuery.trim(),
      pagination: results.pagination,
      filters: { type, genre, year },
      realtime: realtime === 'true'
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// Real-time search endpoint with external API integration
app.get('/api/search/realtime', async (req, res) => {
  try {
    const { 
      q: query, 
      query: queryAlt, // Support both 'q' and 'query' parameters
      limit = 20, 
      includeExternal = true 
    } = req.query;
    
    // Use either 'q' or 'query' parameter
    const searchQuery = query || queryAlt;
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const finalQuery = searchQuery.trim();
    const dbResults = searchSongs(finalQuery, { limit: parseInt(limit) });
    
    // Get external API results
    let externalResults = [];
    if (includeExternal === 'true') {
      try {
        // Use real external APIs
        const externalData = await externalAPIs.searchRealtime(finalQuery, { 
          limit: parseInt(limit),
          includeExternal: true 
        });
        externalResults = externalData.external || [];
        console.log(`External API returned ${externalResults.length} songs for query: "${finalQuery}"`);
        
        // Cache the external songs for later retrieval
        console.log(`Caching ${externalResults.length} external songs...`);
        externalResults.forEach(song => {
          if (song.externalId) {
            // Add id field to match externalId for consistent routing
            song.id = song.externalId;
            
            // Cache with both externalId and a generated ID for flexibility
            const cacheId = `ext_${song.externalId}`;
            externalSongCache.set(song.externalId, song);
            externalSongCache.set(cacheId, song);
            console.log(`Cached song: ${song.title} with ID: ${song.externalId} and cacheId: ${cacheId}`);
          } else {
            console.log(`Song ${song.title} has no externalId, skipping cache`);
          }
        });
        console.log(`Total cached songs: ${externalSongCache.size}`);
        
        // Debug: show all cached songs
        console.log('All cached songs after search:');
        for (const [key, song] of externalSongCache.entries()) {
          console.log(`  ${key} -> ${song.title} (externalId: ${song.externalId})`);
        }
      } catch (error) {
        console.error('Error fetching external results:', error);
        
        // Check if it's a rate limiting error
        if (error.message && error.message.includes('429')) {
          console.log('Rate limit exceeded, using fallback results');
        }
        
        // Fallback to simulated results
        externalResults = [
          {
            title: `${finalQuery} - Live Version`,
            artist: 'External Artist',
            album: 'Live Album',
            year: 2024,
            externalId: 'ext-1',
            source: 'spotify',
            popularity: 50000,
            imageUrl: null,
            lyrics: {
              original: '君の声が聞こえる\n君の姿が見える\n君のことを想う\n君のことを愛してる',
              hiragana: 'きみのこえがきこえる\nきみのすがたが見える\nきみのことをおもう\nきみのことをあいしてる',
              romaji: 'kimi no koe ga kikoeru\nkimi no sugata ga mieru\nkimi no koto wo omou\nkimi no koto wo aishiteru'
            },
            genre: 'J-POP',
            tags: ['人気', 'ライブ', 'エンターテイメント'],
            metadata: {
              duration: 240,
              bpm: 120,
              key: 'C',
              language: 'ja'
            }
          },
          {
            title: `${finalQuery} - Acoustic`,
            artist: 'Cover Artist',
            album: 'Acoustic Covers',
            year: 2024,
            externalId: 'ext-2',
            source: 'genius',
            popularity: 25000,
            imageUrl: null,
            lyrics: {
              original: '夢ならばどれほどよかったでしょう\n未だにあなたのことを夢にみる\n忘れた物を取りに帰るように\n古びた思い出の埃を払う',
              hiragana: 'ゆめならばどれほどよかったでしょう\nいまだにあなたのことをゆめにみる\nわすれたものをとりにかえるように\nふるびたおもいでのほこりをはらう',
              romaji: 'yume naraba dore hodo yokatta deshou\nimada ni anata no koto wo yume ni miru\nwasureta mono wo tori ni kaeru you ni\nfurubita omoide no hokori wo harau'
            },
            genre: 'Ballad',
            tags: ['アコースティック', 'カバー', '切ない'],
            metadata: {
              duration: 280,
              bpm: 80,
              key: 'Am',
              language: 'ja'
            }
          }
        ];
      }
    }
    
    // Combine results
    const allResults = [...dbResults.data, ...externalResults];
    
    res.json({
      success: true,
      data: allResults,
      pagination: {
        page: 1,
        limit: parseInt(limit),
        total: allResults.length,
        pages: Math.ceil(allResults.length / parseInt(limit))
      },
      query: finalQuery,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error performing real-time search:', error);
    res.status(500).json({
      success: false,
      error: 'Real-time search failed',
      message: error.message
    });
  }
});

// External API search function
async function getExternalSearchResults(query, limit = 10) {
  const results = [];
  
  try {
    // Simulate Spotify API call
    if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      const spotifyResults = await searchSpotify(query, limit);
      results.push(...spotifyResults);
    } else {
      // Fallback simulation
      results.push({
        title: `${query} - Spotify Version`,
        artist: 'Spotify Artist',
        album: 'Spotify Album',
        year: 2024,
        externalId: `spotify-${Date.now()}`,
        source: 'spotify',
        popularity: Math.floor(Math.random() * 100000),
        imageUrl: null
      });
    }
    
    // Simulate Genius API call
    if (process.env.GENIUS_API_KEY) {
      const geniusResults = await searchGenius(query, limit);
      results.push(...geniusResults);
    } else {
      // Fallback simulation
      results.push({
        title: `${query} - Genius Version`,
        artist: 'Genius Artist',
        album: 'Genius Album',
        year: 2024,
        externalId: `genius-${Date.now()}`,
        source: 'genius',
        popularity: Math.floor(Math.random() * 50000),
        imageUrl: null
      });
    }
    
  } catch (error) {
    console.error('Error in external API search:', error);
  }
  
  return results.slice(0, limit);
}

// Simulate Spotify search
async function searchSpotify(query, limit) {
  // This would be a real Spotify API call
  return [
    {
      title: `${query} - Spotify Mix`,
      artist: 'Spotify Artist',
      album: 'Spotify Playlist',
      year: 2024,
      externalId: `spotify-${Date.now()}`,
      source: 'spotify',
      popularity: Math.floor(Math.random() * 100000),
      imageUrl: null
    }
  ];
}

// Simulate Genius search
async function searchGenius(query, limit) {
  // This would be a real Genius API call
  return [
    {
      title: `${query} - Genius Version`,
      artist: 'Genius Artist',
      album: 'Genius Album',
      year: 2024,
      externalId: `genius-${Date.now()}`,
      source: 'genius',
      popularity: Math.floor(Math.random() * 50000),
      imageUrl: null
    }
  ];
}

// Get all songs
app.get('/api/songs', (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'popularity' } = req.query;
    
    let results = [...sampleSongs];
    
    // Sort results
    switch (sortBy) {
      case 'popularity':
        results.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'newest':
        results.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'artist':
        results.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    res.json({
      success: true,
      data: results.slice(startIndex, endIndex),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length,
        pages: Math.ceil(results.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch songs',
      message: error.message
    });
  }
});

// Get specific song
app.get('/api/songs/:id', (req, res) => {
  try {
    const song = sampleSongs.find(s => s._id === req.params.id);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    res.json({
      success: true,
      data: song
    });
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch song',
      message: error.message
    });
  }
});

// Store for external song data (in production, use Redis or database)
const externalSongCache = new Map();

// Get external song details by ID
app.get('/api/songs/external/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Looking for external song with ID: ${id}`);
    console.log(`Cache keys:`, Array.from(externalSongCache.keys()));
    console.log(`Cache size:`, externalSongCache.size);
    
    // Debug: show all cached songs
    for (const [key, song] of externalSongCache.entries()) {
      console.log(`Cached: ${key} -> ${song.title} (externalId: ${song.externalId})`);
    }
    
    // Check if we have cached song data
    if (externalSongCache.has(id)) {
      const songData = externalSongCache.get(id);
      console.log(`✅ Found cached song by direct key:`, songData.title);
      console.log(`Cached song lyrics:`, songData.lyrics?.original?.substring(0, 50) + '...');
      
      // Log the complete song data being returned
      console.log('🎶 COMPLETE SONG DATA BEING RETURNED (direct cache):');
      console.log('  Title:', songData.title);
      console.log('  Artist:', songData.artist);
      console.log('  ExternalId:', songData.externalId);
      console.log('  ID:', songData.id);
      console.log('  Source:', songData.source);
      console.log('  Full song object:', JSON.stringify(songData, null, 2));
      
      return res.json({
        success: true,
        data: songData
      });
    }
    
    // Try to find by externalId in cache
    console.log(`🔍 Searching cache for externalId: ${id}`);
    for (const [key, song] of externalSongCache.entries()) {
      console.log(`Checking: key="${key}", song.externalId="${song.externalId}", match=${song.externalId === id || key === id}`);
      if (song.externalId === id || key === id) {
        console.log(`✅ Found song by externalId:`, song.title);
        
        // If lyrics are not available, fetch them
        if (!song.lyrics) {
          console.log(`Fetching real lyrics for: ${song.title} by ${song.artist}`);
          try {
            const lyrics = await externalAPIs.getLyrics(song.title, song.artist);
            if (lyrics) {
              song.lyrics = lyrics;
              // Update the cache with lyrics
              externalSongCache.set(key, song);
              console.log(`Updated cache with real lyrics for: ${song.title}`);
            } else {
              // Fallback to sample lyrics if no real lyrics found
              song.lyrics = {
                original: `これは「${song.title}」の歌詞です。\n実際の歌詞は外部APIから取得できませんでした。\n\nこの楽曲は「${song.artist}」によって作られました。\n素晴らしい音楽をお楽しみください。`,
                hiragana: `これは「${song.title}」のかしです。\nじっさいのかしはがいぶAPIからしゅとくできませんでした。\n\nこのがっきょくは「${song.artist}」によってつくられました。\nすばらしいおんがくをおたのしみください。`,
                romaji: `kore wa "${song.title}" no kashi desu.\njissai no kashi wa gaibu API kara shutoku dekimasen deshita.\n\nkono gakkyoku wa "${song.artist}" ni yotte tsukuraremashita.\nsubarashii ongaku wo o-tanoshimi kudasai.`
              };
            }
          } catch (lyricsError) {
            console.error('Error fetching lyrics:', lyricsError);
            // Fallback to sample lyrics
            song.lyrics = {
              original: `これは「${song.title}」の歌詞です。\n実際の歌詞は外部APIから取得できませんでした。\n\nこの楽曲は「${song.artist}」によって作られました。\n素晴らしい音楽をお楽しみください。`,
              hiragana: `これは「${song.title}」のかしです。\nじっさいのかしはがいぶAPIからしゅとくできませんでした。\n\nこのがっきょくは「${song.artist}」によってつくられました。\nすばらしいおんがくをおたのしみください。`,
              romaji: `kore wa "${song.title}" no kashi desu.\njissai no kashi wa gaibu API kara shutoku dekimasen deshita.\n\nkono gakkyoku wa "${song.artist}" ni yotte tsukuraremashita.\nsubarashii ongaku wo o-tanoshimi kudasai.`
            };
          }
        }
        
        console.log(`Found song lyrics:`, song.lyrics?.original?.substring(0, 50) + '...');
        
        // Log the complete song data being returned
        console.log('🎶 COMPLETE SONG DATA BEING RETURNED:');
        console.log('  Title:', song.title);
        console.log('  Artist:', song.artist);
        console.log('  ExternalId:', song.externalId);
        console.log('  ID:', song.id);
        console.log('  Source:', song.source);
        console.log('  Full song object:', JSON.stringify(song, null, 2));
        
        return res.json({
          success: true,
          data: song
        });
      }
    }
    
    // Try to find by prefixed ID (ext_)
    const prefixedId = `ext_${id}`;
    if (externalSongCache.has(prefixedId)) {
      const songData = externalSongCache.get(prefixedId);
      console.log(`Found song by prefixed ID:`, songData.title);
      
      // If lyrics are not available, fetch them
      if (!songData.lyrics) {
        console.log(`Fetching real lyrics for: ${songData.title} by ${songData.artist}`);
        try {
          const lyrics = await externalAPIs.getLyrics(songData.title, songData.artist);
          if (lyrics) {
            songData.lyrics = lyrics;
            // Update the cache with lyrics
            externalSongCache.set(prefixedId, songData);
            console.log(`Updated cache with real lyrics for: ${songData.title}`);
          } else {
            // Fallback to sample lyrics if no real lyrics found
            songData.lyrics = {
              original: `これは「${songData.title}」の歌詞です。\n実際の歌詞は外部APIから取得できませんでした。\n\nこの楽曲は「${songData.artist}」によって作られました。\n素晴らしい音楽をお楽しみください。`,
              hiragana: `これは「${songData.title}」のかしです。\nじっさいのかしはがいぶAPIからしゅとくできませんでした。\n\nこのがっきょくは「${songData.artist}」によってつくられました。\nすばらしいおんがくをおたのしみください。`,
              romaji: `kore wa "${songData.title}" no kashi desu.\njissai no kashi wa gaibu API kara shutoku dekimasen deshita.\n\nkono gakkyoku wa "${songData.artist}" ni yotte tsukuraremashita.\nsubarashii ongaku wo o-tanoshimi kudasai.`
            };
          }
        } catch (lyricsError) {
          console.error('Error fetching lyrics:', lyricsError);
          // Fallback to sample lyrics
          songData.lyrics = {
            original: `これは「${songData.title}」の歌詞です。\n実際の歌詞は外部APIから取得できませんでした。\n\nこの楽曲は「${songData.artist}」によって作られました。\n素晴らしい音楽をお楽しみください。`,
            hiragana: `これは「${songData.title}」のかしです。\nじっさいのかしはがいぶAPIからしゅとくできませんでした。\n\nこのがっきょくは「${songData.artist}」によってつくられました。\nすばらしいおんがくをおたのしみください。`,
            romaji: `kore wa "${songData.title}" no kashi desu.\njissai no kashi wa gaibu API kara shutoku dekimasen deshita.\n\nkono gakkyoku wa "${songData.artist}" ni yotte tsukuraremashita.\nsubarashii ongaku wo o-tanoshimi kudasai.`
          };
        }
      }
      
      return res.json({
        success: true,
        data: songData
      });
    }
    
    console.log(`Song not found in cache, cannot search external APIs with ID: ${id}`);
    console.log(`This should not happen - songs should be cached during search`);
    
    // Return 404 if song not found in cache
    return res.status(404).json({
      success: false,
      error: 'Song not found in cache',
      message: 'Song was not properly cached during search'
    });
  } catch (error) {
    console.error('Error fetching external song details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch song details',
      message: error.message
    });
  }
});

// Get YouTube videos for a song
app.get('/api/songs/:id/youtube', async (req, res) => {
  try {
    const song = sampleSongs.find(s => s._id === req.params.id);
    
    if (!song) {
      // For external songs, we need to get the real song data from the search results
      // The frontend should pass the song title and artist as query parameters
      const songTitle = req.query.title || 'Unknown Song';
      const artist = req.query.artist || 'Unknown Artist';
      
      console.log(`Getting YouTube videos for: "${songTitle}" by ${artist}`);
      
      const youtubeVideos = await externalAPIs.getYouTubeVideos(songTitle, artist, 3);
      
      return res.json({
        success: true,
        data: youtubeVideos
      });
    }

    // For database songs, use the song data directly
    const songTitle = song.title;
    const artist = song.artist;
    
    const youtubeVideos = await externalAPIs.getYouTubeVideos(songTitle, artist, 3);
    
    res.json({
      success: true,
      data: youtubeVideos
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch YouTube videos',
      message: error.message
    });
  }
});

// Get popular lyrics (must come before /api/lyrics/:id)
app.get('/api/lyrics/popular', (req, res) => {
  try {
    const { limit = 20, timeRange = 'all' } = req.query;
    
    let results = [...sampleSongs];
    
    // Filter by time range if specified
    if (timeRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (timeRange) {
        case 'day':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        results = results.filter(song => song.year >= cutoffDate.getFullYear());
      }
    }
    
    // Sort by popularity
    results.sort((a, b) => b.popularity - a.popularity);
    
    // Limit results
    results = results.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: results,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching popular lyrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular lyrics',
      message: error.message
    });
  }
});

// Get lyrics
app.get('/api/lyrics/:id', (req, res) => {
  try {
    const { format = 'original' } = req.query;
    const song = sampleSongs.find(s => s._id === req.params.id);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    const lyrics = song.lyrics[format] || song.lyrics.original;
    
    res.json({
      success: true,
      data: {
        songId: song._id,
        title: song.title,
        artist: song.artist,
        format,
        lyrics
      }
    });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lyrics',
      message: error.message
    });
  }
});

// Get genres
app.get('/api/search/genres', (req, res) => {
  res.json({
    success: true,
    data: ['J-POP', 'アニメソング', 'ロック', 'バラード', 'ヒップホップ']
  });
});

// Get years
app.get('/api/search/years', (req, res) => {
  res.json({
    success: true,
    data: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]
  });
});

// Get trending songs
app.get('/api/search/trending', (req, res) => {
  res.json({
    success: true,
    data: sampleSongs.sort((a, b) => b.popularity - a.popularity)
  });
});

// Get search suggestions
app.get('/api/search/suggestions', (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const searchQuery = query.trim().toLowerCase();
    const suggestions = sampleSongs
      .filter(song => 
        song.title.toLowerCase().includes(searchQuery) ||
        song.artist.toLowerCase().includes(searchQuery)
      )
      .slice(0, parseInt(limit))
      .map(song => ({
        title: song.title,
        artist: song.artist
      }));
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions',
      message: error.message
    });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Demo server running on port ${PORT}`);
  console.log(`📱 Frontend should be at: http://localhost:3000`);
  console.log(`🔍 API available at: http://localhost:3001/api`);
  console.log(`💡 This is a demo version with sample data - no MongoDB required!`);
});

module.exports = app;
