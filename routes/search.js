const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const japaneseProcessor = require('../utils/simpleJapaneseProcessor');
const externalAPIs = require('../utils/externalAPIs');

// GET /api/search - Advanced search functionality
router.get('/', async (req, res) => {
  try {
    const {
      q: query,
      type = 'all', // all, title, artist, lyrics
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      genre,
      year,
      language = 'ja',
      includeReadings = false,
      includeExternal = false // Include external API results
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 500), // Increased from 100 to 500
      sortBy,
      genre,
      year: year ? parseInt(year) : undefined,
      language
    };

    // Build search criteria based on type
    let searchCriteria = { 'metadata.language': language };
    
    if (type === 'all' || type === 'title') {
      searchCriteria.$or = searchCriteria.$or || [];
      searchCriteria.$or.push({ title: { $regex: searchQuery, $options: 'i' } });
    }
    
    if (type === 'all' || type === 'artist') {
      searchCriteria.$or = searchCriteria.$or || [];
      searchCriteria.$or.push({ artist: { $regex: searchQuery, $options: 'i' } });
    }
    
    if (type === 'all' || type === 'lyrics') {
      searchCriteria.$or = searchCriteria.$or || [];
      searchCriteria.$or.push({ 'lyrics.original': { $regex: searchQuery, $options: 'i' } });
    }

    // Add additional filters
    if (genre) {
      searchCriteria.genre = { $regex: genre, $options: 'i' };
    }
    
    if (year) {
      searchCriteria.year = year;
    }

    // If no $or criteria, add a general text search
    if (!searchCriteria.$or) {
      searchCriteria.$text = { $search: searchQuery };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'relevance':
        if (searchCriteria.$text) {
          sortOptions = { score: { $meta: 'textScore' }, popularity: -1 };
        } else {
          sortOptions = { popularity: -1, createdAt: -1 };
        }
        break;
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

    // Execute search in database
    const songs = await Song.find(searchCriteria)
      .sort(sortOptions)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .select('-lyrics.hiragana -lyrics.romaji');

    const total = await Song.countDocuments(searchCriteria);

    // Get external results if requested
    let externalResults = [];
    if (includeExternal === 'true') {
      try {
        externalResults = await externalAPIs.searchMultipleSources(searchQuery, 10);
      } catch (error) {
        console.error('Error fetching external results:', error);
      }
    }

    // Process search results if readings are requested
    let processedResults = songs;
    if (includeReadings === 'true' && japaneseProcessor.containsJapanese(searchQuery)) {
      processedResults = await Promise.all(
        songs.map(async (song) => {
          const readings = await japaneseProcessor.extractReadings(song.title);
          return {
            ...song.toObject(),
            titleReadings: readings
          };
        })
      );
    }

    res.json({
      success: true,
      data: processedResults,
      externalResults: externalResults,
      query: searchQuery,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      },
      filters: {
        type,
        genre,
        year,
        language,
        sortBy,
        includeExternal
      }
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

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchQuery = query.trim();
    const suggestions = await Song.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { artist: { $regex: searchQuery, $options: 'i' } },
            { searchKeywords: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: '$title',
          artist: { $first: '$artist' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1, _id: 1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          title: '$_id',
          artist: 1,
          _id: 0
        }
      }
    ]);

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

// GET /api/search/trending - Get trending songs
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20, timeRange = 'week' } = req.query;
    
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
      default:
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    }

    const trendingSongs = await Song.find(dateFilter)
      .sort({ popularity: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-lyrics.hiragana -lyrics.romaji');

    res.json({
      success: true,
      data: trendingSongs,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending songs',
      message: error.message
    });
  }
});

// GET /api/search/genres - Get available genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await Song.distinct('genre', { genre: { $exists: true, $ne: '' } });
    
    res.json({
      success: true,
      data: genres.sort()
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch genres',
      message: error.message
    });
  }
});

// GET /api/search/years - Get available years
router.get('/years', async (req, res) => {
  try {
    const years = await Song.distinct('year', { year: { $exists: true, $ne: null } });
    
    res.json({
      success: true,
      data: years.sort((a, b) => b - a) // Most recent first
    });
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch years',
      message: error.message
    });
  }
});

// GET /api/search/realtime - Real-time search with external APIs
router.get('/realtime', async (req, res) => {
  try {
    const {
      q: query,
      limit = 50, // Increased from 20 to 50
      includeExternal = true
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    
    // Search external APIs ONLY (no database results)
    let externalResults = [];
    if (includeExternal === 'true') {
      try {
        const externalAPI = new externalAPIs();
        externalResults = await externalAPI.searchMultipleSources(searchQuery, parseInt(limit));
      } catch (error) {
        console.error('Error fetching external results:', error);
      }
    }

    // No database search - only external results
    let dbResults = [];

    res.json({
      success: true,
      data: {
        database: dbResults,
        external: externalResults,
        total: dbResults.length + externalResults.length
      },
      query: searchQuery,
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

module.exports = router;
