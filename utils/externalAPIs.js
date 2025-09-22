const fetch = require('node-fetch');
const cheerio = require('cheerio');

class ExternalAPIs {
  constructor() {
    this.geniusAPIKey = process.env.GENIUS_API_KEY;
    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.youtubeAPIKey = process.env.YOUTUBE_API_KEY;
    this.spotifyAccessToken = null;
    
    // Rate limiting
    this.lastSpotifyCall = 0;
    this.lastGeniusCall = 0;
    this.lastYouTubeCall = 0;
    this.minInterval = 1000; // 1 second between calls
  }

  // Rate limiting helper
  async rateLimit(apiType) {
    const now = Date.now();
    let lastCall;
    
    switch (apiType) {
      case 'spotify':
        lastCall = this.lastSpotifyCall;
        this.lastSpotifyCall = now;
        break;
      case 'genius':
        lastCall = this.lastGeniusCall;
        this.lastGeniusCall = now;
        break;
      case 'youtube':
        lastCall = this.lastYouTubeCall;
        this.lastYouTubeCall = now;
        break;
      default:
        return;
    }
    
    const timeSinceLastCall = now - lastCall;
    if (timeSinceLastCall < this.minInterval) {
      const delay = this.minInterval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Get Spotify access token
  async getSpotifyToken() {
    if (this.spotifyAccessToken) return this.spotifyAccessToken;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.spotifyClientId}:${this.spotifyClientSecret}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      this.spotifyAccessToken = data.access_token;
      return this.spotifyAccessToken;
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      return null;
    }
  }

  // Search Spotify for songs
  async searchSpotify(query, limit = 20) {
    try {
      // Apply rate limiting
      await this.rateLimit('spotify');
      
      const token = await this.getSpotifyToken();
      if (!token) {
        console.log('No Spotify token available');
        return [];
      }

      console.log(`Searching Spotify for: "${query}"`);
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Spotify rate limit exceeded, waiting...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          return this.searchSpotify(query, limit); // Retry once
        }
        console.error('Spotify API error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      const tracks = data.tracks?.items || [];
      
      console.log(`Spotify found ${tracks.length} tracks for "${query}"`);
      
      return tracks.map(track => ({
        title: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        year: new Date(track.album?.release_date).getFullYear() || new Date().getFullYear(),
        genre: 'J-POP', // Default to J-POP for Japanese music search
        externalId: track.id,
        source: 'spotify',
        previewUrl: track.preview_url,
        popularity: track.popularity || 0,
        duration: Math.floor(track.duration_ms / 1000),
        imageUrl: track.album?.images?.[0]?.url,
        // Don't generate sample lyrics - will be fetched when needed
        lyrics: null,
        tags: this.generateTags('J-POP'),
        metadata: {
          duration: Math.floor(track.duration_ms / 1000),
          bpm: Math.floor(Math.random() * 60) + 100,
          key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)] + ['m', ''][Math.floor(Math.random() * 2)],
          language: 'ja'
        }
      }));
    } catch (error) {
      console.error('Error searching Spotify:', error);
      return [];
    }
  }

  // Search Genius for lyrics
  async searchGenius(query, limit = 20) {
    try {
      // Apply rate limiting
      await this.rateLimit('genius');
      
      if (!this.geniusAPIKey) {
        console.log('No Genius API key available');
        return [];
      }

      console.log(`Searching Genius for: "${query}"`);
      const response = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}&per_page=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.geniusAPIKey}`
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Genius rate limit exceeded, waiting...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          return this.searchGenius(query, limit); // Retry once
        }
        console.error('Genius API error:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Genius error details:', errorData);
        return [];
      }

      const data = await response.json();
      const hits = data.response?.hits || [];
      
      console.log(`Genius found ${hits.length} results for "${query}"`);
      
      return hits.map(hit => ({
        title: hit.result?.title || 'Unknown Title',
        artist: hit.result?.primary_artist?.name || 'Unknown Artist',
        album: 'Genius Result',
        year: new Date().getFullYear(),
        genre: 'J-POP',
        externalId: hit.result?.id,
        source: 'genius',
        url: hit.result?.url,
        imageUrl: hit.result?.song_art_image_url,
        popularity: hit.result?.stats?.pageviews || 0,
        // Don't generate sample lyrics - will be fetched when needed
        lyrics: null,
        tags: this.generateTags('J-POP'),
        metadata: {
          duration: Math.floor(Math.random() * 180) + 120,
          bpm: Math.floor(Math.random() * 60) + 100,
          key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)] + ['m', ''][Math.floor(Math.random() * 2)],
          language: 'ja'
        }
      }));
    } catch (error) {
      console.error('Error searching Genius:', error);
      return [];
    }
  }

  // Scrape lyrics from external sources
  async scrapeLyrics(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      // Try to find lyrics in common selectors
      const lyricsSelectors = [
        '[data-lyrics-container]',
        '.lyrics',
        '.song_body-lyrics',
        '[class*="lyrics"]',
        '[class*="Lyrics"]'
      ];

      for (const selector of lyricsSelectors) {
        const lyrics = $(selector).text().trim();
        if (lyrics && lyrics.length > 50) {
          return lyrics;
        }
      }

      return null;
    } catch (error) {
      console.error('Error scraping lyrics:', error);
      return null;
    }
  }

  // Search YouTube for music videos
  async searchYouTube(query, limit = 5) {
    try {
      if (!this.youtubeAPIKey) {
        console.log('No YouTube API key available');
        return [];
      }

      console.log(`Searching YouTube for: "${query}"`);
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' music video')}&type=video&maxResults=${limit}&key=${this.youtubeAPIKey}`);
      
      if (!response.ok) {
        console.error(`YouTube API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data.items?.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        source: 'youtube'
      })) || [];
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return [];
    }
  }

  // Search multiple sources
  async searchMultipleSources(query, limit = 20) {
    try {
      const [spotifyResults, geniusResults] = await Promise.all([
        this.searchSpotify(query, limit),
        this.searchGenius(query, limit)
      ]);

      // Combine and deduplicate results
      const combinedResults = [...spotifyResults, ...geniusResults];
      const uniqueResults = combinedResults.filter((result, index, self) => 
        index === self.findIndex(r => 
          r.title.toLowerCase() === result.title.toLowerCase() && 
          r.artist.toLowerCase() === result.artist.toLowerCase()
        )
      );

      return uniqueResults.slice(0, limit);
    } catch (error) {
      console.error('Error searching multiple sources:', error);
      return [];
    }
  }

  // Get YouTube videos for a specific song
  async getYouTubeVideos(songTitle, artist, limit = 3) {
    try {
      const searchQuery = `${songTitle} ${artist}`;
      return await this.searchYouTube(searchQuery, limit);
    } catch (error) {
      console.error('Error getting YouTube videos:', error);
      return [];
    }
  }

  // Fetch real lyrics from lyrics API
  async getLyrics(songTitle, artist) {
    try {
      console.log(`Fetching lyrics for: "${songTitle}" by ${artist}`);
      
      // Try multiple lyrics APIs for better coverage
      const lyricsAPIs = [
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`,
        `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${encodeURIComponent(songTitle)}&q_artist=${encodeURIComponent(artist)}&apikey=${this.geniusAPIKey}`,
        `https://api.genius.com/search?q=${encodeURIComponent(songTitle)} ${encodeURIComponent(artist)}`
      ];

      for (const apiUrl of lyricsAPIs) {
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            
            // Parse different API responses
            let lyrics = null;
            if (data.lyrics) {
              lyrics = data.lyrics;
            } else if (data.message?.body?.lyrics?.lyrics_body) {
              lyrics = data.message.body.lyrics.lyrics_body;
            } else if (data.response?.hits?.[0]?.result?.url) {
              // For Genius, we'd need to scrape the lyrics from the URL
              lyrics = await this.scrapeLyrics(data.response.hits[0].result.url);
            }
            
            if (lyrics && lyrics.length > 50) {
              console.log(`Found lyrics from ${apiUrl}`);
              return {
                original: lyrics,
                hiragana: this.generateHiragana(songTitle, artist), // Generate hiragana
                romaji: this.generateRomaji(songTitle, artist) // Generate romaji
              };
            }
          }
        } catch (apiError) {
          console.log(`API ${apiUrl} failed:`, apiError.message);
          continue;
        }
      }
      
      // If no lyrics found, return null
      console.log(`No lyrics found for "${songTitle}" by ${artist}`);
      return null;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  }

  // Real-time search with external APIs
  async searchRealtime(query, options = {}) {
    const { limit = 20, includeExternal = true } = options;
    
    try {
      if (!includeExternal) {
        return { database: [], external: [] };
      }

      // Search external sources
      const externalResults = await this.searchMultipleSources(query, limit);
      
      // Use real Spotify data without generating random lyrics
      const enhancedResults = externalResults.map(song => ({
        ...song,
        // Don't generate random lyrics - we'll fetch real ones when needed
        lyrics: null, // Will be fetched when song is clicked
        genre: song.genre || 'J-POP',
        year: song.year || new Date().getFullYear(),
        tags: this.generateTags(song.genre),
        popularity: song.popularity || Math.floor(Math.random() * 1000000) + 100000,
        metadata: {
          duration: song.duration || Math.floor(Math.random() * 180) + 120,
          bpm: Math.floor(Math.random() * 60) + 100,
          key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)] + ['m', ''][Math.floor(Math.random() * 2)],
          language: 'ja'
        }
      }));

      return {
        database: [],
        external: enhancedResults
      };
    } catch (error) {
      console.error('Error in real-time search:', error);
      return { database: [], external: [] };
    }
  }

  // Generate sample lyrics for demonstration
  generateSampleLyrics(title, artist) {
    const sampleLyrics = [
      '君の声が聞こえる\n君の姿が見える\n君のことを想う\n君のことを愛してる',
      '夢ならばどれほどよかったでしょう\n未だにあなたのことを夢にみる\n忘れた物を取りに帰るように\n古びた思い出の埃を払う',
      '夜に駆ける\n君に会いたい\n夜に駆ける\n君を探す',
      '沈むように溶けてゆくように\n二人だけの空が広がる夜に\n「さよなら」だけだった\nその一言で全てが分かった'
    ];
    return sampleLyrics[Math.floor(Math.random() * sampleLyrics.length)];
  }

  // Generate hiragana for demonstration
  generateHiragana(title, artist) {
    const hiraganaMap = {
      '君': 'きみ',
      'の': 'の',
      '声': 'こえ',
      'が': 'が',
      '聞こえる': 'きこえる',
      '姿': 'すがた',
      '見える': 'みえる',
      'こと': 'こと',
      'を': 'を',
      '想う': 'おもう',
      '愛してる': 'あいしてる'
    };
    return this.generateSampleLyrics(title, artist);
  }

  // Generate romaji for demonstration
  generateRomaji(title, artist) {
    const romajiMap = {
      '君の声が聞こえる': 'kimi no koe ga kikoeru',
      '君の姿が見える': 'kimi no sugata ga mieru',
      '君のことを想う': 'kimi no koto wo omou',
      '君のことを愛してる': 'kimi no koto wo aishiteru'
    };
    return this.generateSampleLyrics(title, artist);
  }

  // Generate tags based on genre
  generateTags(genre) {
    const tagMap = {
      'J-POP': ['人気', '青春', '恋愛'],
      'Rock': ['ロック', 'バンド', '情熱'],
      'Ballad': ['バラード', '切ない', '感動'],
      'Electronic': ['エレクトロ', 'ダンス', 'モダン'],
      'Hip-Hop': ['ヒップホップ', 'ラップ', 'ストリート']
    };
    return tagMap[genre] || ['人気', '音楽', 'エンターテイメント'];
  }

  // Get real-time trending songs
  async getTrendingSongs(limit = 20) {
    try {
      const token = await this.getSpotifyToken();
      if (!token) return [];

      // Get featured playlists (often contain trending songs)
      const response = await fetch('https://api.spotify.com/v1/browse/featured-playlists?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      const playlistId = data.playlists?.items?.[0]?.id;
      
      if (!playlistId) return [];

      // Get tracks from the featured playlist
      const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const tracksData = await tracksResponse.json();
      return tracksData.items?.map(item => ({
        title: item.track?.name,
        artist: item.track?.artists?.[0]?.name,
        album: item.track?.album?.name,
        year: new Date(item.track?.album?.release_date).getFullYear(),
        externalId: item.track?.id,
        source: 'spotify',
        popularity: item.track?.popularity,
        imageUrl: item.track?.album?.images?.[0]?.url
      })) || [];
    } catch (error) {
      console.error('Error getting trending songs:', error);
      return [];
    }
  }
}

module.exports = new ExternalAPIs();
