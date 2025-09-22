const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  album: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  genre: {
    type: String,
    trim: true
  },
  lyrics: {
    original: {
      type: String,
      required: true
    },
    hiragana: String,
    romaji: String
  },
  metadata: {
    duration: Number, // in seconds
    bpm: Number,
    key: String,
    language: {
      type: String,
      default: 'ja',
      enum: ['ja', 'en', 'ko', 'zh']
    }
  },
  tags: [String],
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  searchKeywords: [String], // For better search functionality
  isVerified: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['user', 'api', 'scraped', 'manual'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better search performance
songSchema.index({ title: 'text', artist: 'text', 'lyrics.original': 'text', searchKeywords: 'text' });
songSchema.index({ artist: 1, title: 1 });
songSchema.index({ genre: 1 });
songSchema.index({ year: 1 });
songSchema.index({ popularity: -1 });
songSchema.index({ createdAt: -1 });

// Pre-save middleware to update search keywords
songSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('artist') || this.isModified('lyrics.original')) {
    this.searchKeywords = [
      this.title,
      this.artist,
      this.album,
      ...this.tags,
      ...this.title.split(' '),
      ...this.artist.split(' ')
    ].filter(Boolean);
  }
  this.updatedAt = new Date();
  next();
});

// Virtual for full display name
songSchema.virtual('displayName').get(function() {
  return `${this.artist} - ${this.title}`;
});

// Method to get lyrics with specified format
songSchema.methods.getLyrics = function(format = 'original') {
  const formats = {
    original: this.lyrics.original,
    hiragana: this.lyrics.hiragana || this.lyrics.original,
    romaji: this.lyrics.romaji || this.lyrics.original
  };
  return formats[format] || this.lyrics.original;
};

// Static method for search
songSchema.statics.search = function(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'relevance',
    genre,
    year,
    language = 'ja'
  } = options;

  const searchQuery = {
    $and: [
      { language },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { artist: { $regex: query, $options: 'i' } },
          { 'lyrics.original': { $regex: query, $options: 'i' } },
          { searchKeywords: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };

  if (genre) {
    searchQuery.$and.push({ genre: { $regex: genre, $options: 'i' } });
  }

  if (year) {
    searchQuery.$and.push({ year: year });
  }

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
    default: // relevance
      sortOptions = { popularity: -1, createdAt: -1 };
  }

  return this.find(searchQuery)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-lyrics.hiragana -lyrics.romaji'); // Exclude large fields by default
};

module.exports = mongoose.model('Song', songSchema);
