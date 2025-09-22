const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const japaneseProcessor = require('../utils/simpleJapaneseProcessor');

// GET /api/lyrics/:id - Get lyrics with format options
router.get('/:id', async (req, res) => {
  try {
    const { 
      format = 'original',
      showFurigana = false,
      showRomaji = false
    } = req.query;

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

    let lyrics = song.getLyrics(format);
    let furigana = null;
    let romaji = null;

    // Generate additional formats if requested
    if (showFurigana === 'true' && format !== 'hiragana') {
      furigana = song.getLyrics('hiragana');
    }

    if (showRomaji === 'true' && format !== 'romaji') {
      romaji = song.getLyrics('romaji');
    }

    const response = {
      success: true,
      data: {
        songId: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        year: song.year,
        genre: song.genre,
        lyrics: {
          [format]: lyrics
        }
      }
    };

    if (furigana) {
      response.data.lyrics.hiragana = furigana;
    }

    if (romaji) {
      response.data.lyrics.romaji = romaji;
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lyrics',
      message: error.message
    });
  }
});

// GET /api/lyrics/:id/formats - Get all available formats for a song
router.get('/:id/formats', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    const formats = {
      original: song.lyrics.original,
      hiragana: song.lyrics.hiragana || song.lyrics.original,
      romaji: song.lyrics.romaji || song.lyrics.original
    };

    res.json({
      success: true,
      data: {
        songId: song._id,
        title: song.title,
        artist: song.artist,
        formats
      }
    });
  } catch (error) {
    console.error('Error fetching lyrics formats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lyrics formats',
      message: error.message
    });
  }
});

// POST /api/lyrics/process - Process text to generate hiragana and romaji
router.post('/process', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
    }

    const processed = await japaneseProcessor.processLyrics(text);

    res.json({
      success: true,
      data: processed
    });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process text',
      message: error.message
    });
  }
});

// POST /api/lyrics/furigana - Generate furigana for text
router.post('/furigana', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
    }

    const furigana = await japaneseProcessor.addFurigana(text);

    res.json({
      success: true,
      data: furigana
    });
  } catch (error) {
    console.error('Error generating furigana:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate furigana',
      message: error.message
    });
  }
});

// GET /api/lyrics/random - Get random lyrics for discovery
router.get('/random', async (req, res) => {
  try {
    const { limit = 5, genre, language = 'ja' } = req.query;

    const query = { language };
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    const count = await Song.countDocuments(query);
    const random = Math.floor(Math.random() * count);

    const songs = await Song.find(query)
      .skip(random)
      .limit(parseInt(limit))
      .select('-lyrics.hiragana -lyrics.romaji');

    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    console.error('Error fetching random lyrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random lyrics',
      message: error.message
    });
  }
});

// GET /api/lyrics/popular - Get popular lyrics
router.get('/popular', async (req, res) => {
  try {
    const { 
      limit = 20, 
      timeRange = 'all',
      genre,
      language = 'ja'
    } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    const query = { language, ...dateFilter };
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    const songs = await Song.find(query)
      .sort({ popularity: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-lyrics.hiragana -lyrics.romaji');

    res.json({
      success: true,
      data: songs,
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

module.exports = router;
