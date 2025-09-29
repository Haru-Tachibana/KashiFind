const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const japaneseProcessor = require('../utils/simpleJapaneseProcessor');
const externalAPIs = require('../utils/externalAPIs');
const Joi = require('joi');

// Validation schemas
const songSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(200),
  artist: Joi.string().required().trim().min(1).max(200),
  album: Joi.string().trim().max(200).allow(''),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  genre: Joi.string().trim().max(100).allow(''),
  lyrics: Joi.object({
    original: Joi.string().required().min(1)
  }).required(),
  metadata: Joi.object({
    duration: Joi.number().min(0),
    bpm: Joi.number().min(0),
    key: Joi.string().max(10),
    language: Joi.string().valid('ja', 'en', 'ko', 'zh').default('ja')
  }),
  tags: Joi.array().items(Joi.string().trim().max(50))
});

// GET /api/songs - Get all songs with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'popularity',
      genre,
      year,
      language = 'ja',
      search
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Max 100 results per page
      sortBy,
      genre,
      year: year ? parseInt(year) : undefined,
      language
    };

    let songs;
    if (search) {
      songs = await Song.search(search, options);
    } else {
      const query = { 'metadata.language': language };
      if (genre) query.genre = { $regex: genre, $options: 'i' };
      if (year) query.year = year;

      let sortOptions = {};
      switch (sortBy) {
        case 'popularity':
          sortOptions = { popularity: -1, createdAt: -1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'title':
          sortOptions = { title: 1 };
          break;
        case 'artist':
          sortOptions = { artist: 1, title: 1 };
          break;
        default:
          sortOptions = { popularity: -1, createdAt: -1 };
      }

      songs = await Song.find(query)
        .sort(sortOptions)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .select('-lyrics.hiragana -lyrics.romaji');
    }

    const total = await Song.countDocuments(
      search ? { $text: { $search: search } } : { 'metadata.language': language }
    );

    res.json({
      success: true,
      data: songs,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
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

// GET /api/songs/:id - Get a specific song by ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
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

// GET /api/songs/external/:id - Get external song details (Spotify)
router.get('/external/:id', async (req, res) => {
  try {
    const spotifyId = req.params.id;
    const externalAPI = new externalAPIs();
    
    // Get song details from Spotify
    const songDetails = await externalAPI.getSpotifyTrackDetails(spotifyId);
    
    if (!songDetails) {
      return res.status(404).json({
        success: false,
        error: 'External song not found'
      });
    }

    // Try to get lyrics from multiple sources
    let lyrics = null;
    try {
      lyrics = await externalAPI.getLyrics(songDetails.title, songDetails.artist);
    } catch (lyricsError) {
      console.log('Could not fetch lyrics:', lyricsError.message);
    }

    // Combine Spotify data with lyrics
    const songData = {
      ...songDetails,
      lyrics: lyrics ? {
        original: lyrics,
        hiragana: null,
        romaji: null
      } : null,
      source: 'spotify',
      externalId: spotifyId
    };

    res.json({
      success: true,
      data: songData
    });
  } catch (error) {
    console.error('Error fetching external song:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch external song',
      message: error.message
    });
  }
});

// POST /api/songs - Create a new song
router.post('/', async (req, res) => {
  try {
    const { error, value } = songSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details
      });
    }

    // Process lyrics to generate hiragana and romaji
    const processedLyrics = await japaneseProcessor.processLyrics(value.lyrics.original);
    
    const songData = {
      ...value,
      lyrics: {
        original: processedLyrics.original,
        hiragana: processedLyrics.hiragana,
        romaji: processedLyrics.romaji
      }
    };

    const song = new Song(songData);
    await song.save();

    res.status(201).json({
      success: true,
      data: song,
      message: 'Song created successfully'
    });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create song',
      message: error.message
    });
  }
});

// PUT /api/songs/:id - Update a song
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = songSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details
      });
    }

    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    // Process lyrics if they've changed
    let processedLyrics = song.lyrics;
    if (value.lyrics.original !== song.lyrics.original) {
      processedLyrics = await japaneseProcessor.processLyrics(value.lyrics.original);
    }

    const updateData = {
      ...value,
      lyrics: {
        original: processedLyrics.original,
        hiragana: processedLyrics.hiragana,
        romaji: processedLyrics.romaji
      }
    };

    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedSong,
      message: 'Song updated successfully'
    });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update song',
      message: error.message
    });
  }
});

// DELETE /api/songs/:id - Delete a song
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    res.json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete song',
      message: error.message
    });
  }
});

// GET /api/songs/:id/youtube - Get YouTube videos for a song
router.get('/:id/youtube', async (req, res) => {
  try {
    const { title, artist } = req.query;
    
    if (!title || !artist) {
      return res.status(400).json({
        success: false,
        error: 'Title and artist are required'
      });
    }

    const externalAPI = new externalAPIs();
    console.log(`Getting YouTube videos for: "${title}" by ${artist}`);
    
    // Get YouTube videos and sort by view count (most popular first)
    const youtubeVideos = await externalAPI.getYouTubeVideos(title, artist, 5);
    
    if (youtubeVideos && youtubeVideos.length > 0) {
      // Sort by view count descending (most popular first)
      youtubeVideos.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      
      res.json({
        success: true,
        data: youtubeVideos
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No YouTube videos found for this song'
      });
    }
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch YouTube videos',
      message: error.message
    });
  }
});

// GET /api/songs/:id/lyrics - Get lyrics in specific format
router.get('/:id/lyrics', async (req, res) => {
  try {
    const { format = 'original' } = req.query;
    const validFormats = ['original', 'hiragana', 'romaji'];
    
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Must be one of: original, hiragana, romaji'
      });
    }

    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    const lyrics = song.getLyrics(format);

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

module.exports = router;
