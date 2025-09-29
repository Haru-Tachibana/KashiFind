# Kashi.find - Modern Lyrics Search Platform

A modern, elegant lyrics search platform with glassmorphism design and customizable backgrounds. Originally designed for Japanese lyrics but now supports all types of songs and languages.

## Features

### Glassmorphism Design
- Modern transparent UI with backdrop blur effects
- Elegant glass-like components throughout the interface
- Smooth animations and transitions

### Customizable Backgrounds
- Upload your own background images
- Preset gradient backgrounds
- Real-time background preview
- Background settings persist across sessions

### Advanced Search
- Real-time search with instant suggestions
- Search by song title, artist, or lyrics
- External API integration (Spotify, Genius, YouTube)
- Intelligent search algorithms

### Multi-language Support
- Support for songs in various languages
- Clean, readable lyrics display
- Multiple format support
- Smart text processing

### Rich Song Data
- Album artwork from Spotify
- Song metadata (year, genre, duration)
- Lyrics with multiple formats
- YouTube video integration

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes
- Smooth mobile navigation

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Haru-Tachibana/KashiFind.git
   cd KashiFind
   ```

2. **Install dependencies**
   ```bash
   # Backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.template .env
   
   # Edit .env with your API keys
   nano .env
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Configuration

### Required API Keys

Add these to your `.env` file:

```env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Genius API
GENIUS_ACCESS_TOKEN=your_genius_access_token

# YouTube API (Optional)
YOUTUBE_API_KEY=your_youtube_api_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/kashifind
```

### API Key Setup

1. **Spotify API**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Get Client ID and Client Secret

2. **Genius API**
   - Visit [Genius API](https://genius.com/api-clients)
   - Create an account and get access token

3. **YouTube API** (Optional)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable YouTube Data API v3
   - Create API key

4. **MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update MONGODB_URI in your .env file

## Customization

### Background Customization
- Click the "Customize" button in the header
- Upload your own images or choose from presets
- Backgrounds are automatically saved to localStorage

### UI Themes
The app uses a glassmorphism design system with:
- Semi-transparent components
- Backdrop blur effects
- White text with opacity variations
- Gradient accents

## Project Structure

```
KashiFind/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main app component
│   └── package.json
├── routes/                  # Express.js routes
├── utils/                   # Backend utility functions
├── models/                  # Database models
├── config/                  # Configuration files
├── server.js               # Main server file
├── package.json
└── README.md
```

## API Endpoints

### Search
- `GET /api/search` - Search songs
- `GET /api/search/trending` - Get trending songs
- `GET /api/search/years` - Get available years
- `GET /api/search/genres` - Get available genres

### Songs
- `GET /api/songs` - Get songs with pagination
- `GET /api/songs/:id` - Get song details
- `GET /api/songs/:id/youtube` - Get YouTube videos for song
- `GET /api/songs/external/:id` - Get external song data

### Lyrics
- `GET /api/lyrics/popular` - Get popular lyrics
- `GET /api/lyrics/:id` - Get lyrics for specific song

## Development

### Available Scripts

**Backend:**
```bash
npm start          # Start production server
npm run dev        # Start with nodemon
```

**Frontend:**
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Code Style
- ESLint for code linting
- Prettier for code formatting
- Consistent component structure

## Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder
3. Set environment variables in deployment platform

### Backend (Railway/Heroku)
1. Set environment variables
2. Deploy the backend folder
3. Update frontend API URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Spotify API for music data
- Genius API for lyrics
- YouTube API for video integration
- React and Node.js communities
- Music and lyrics communities

## Support

For support, email support@kashifind.com or create an issue on GitHub.

---

**Kashi.find** - Discover music through beautiful lyrics