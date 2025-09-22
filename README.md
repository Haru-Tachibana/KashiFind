# 🎵 KashiFind - Modern Japanese Lyrics Search Engine

A modern, elegant lyrics search website inspired by UtaTen but with significant improvements - **no ads**, **real-time search**, **YouTube integration**, and **smart furigana display**.

![KashiFind Logo](frontend/public/logo192.svg)

## ✨ Features

### 🔍 **Real-time Search Engine**
- **Google-like search** with instant results as you type
- **Real-time suggestions** with keyboard navigation
- **External API integration** (Spotify + Genius) for comprehensive results
- **Fuzzy matching** with intelligent scoring system

### 🎌 **Japanese Text Processing**
- **Smart furigana display** - only shows furigana above kanji characters
- **UtaTen-style layout** - smaller, lighter furigana text above kanji
- **Multiple text formats** - original, hiragana, and romaji
- **Intelligent text processing** - compares original and furigana lyrics

### 🎬 **YouTube Integration**
- **Automatic video search** for each song
- **Embedded YouTube player** with multiple video options
- **"Watch on YouTube"** button for external viewing
- **Real-time video fetching** based on song title and artist

### 🎨 **Modern Design**
- **Clean, ad-free interface** - no distracting advertisements
- **Responsive design** - works on desktop, tablet, and mobile
- **Dark theme** with elegant typography
- **Smooth animations** and transitions

### 🚀 **Technical Features**
- **Real-time search** with debounced input
- **External API fallbacks** for reliable results
- **Dynamic content** - different songs show different lyrics
- **Modern tech stack** - React, Node.js, Express, MongoDB

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with hooks and functional components
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **Axios** for API calls

### **Backend**
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **External APIs** (Spotify, Genius, YouTube)
- **Rate limiting** and security middleware
- **CORS** and compression

### **APIs Integrated**
- **Spotify Web API** - for music search and metadata
- **Genius API** - for lyrics and song information
- **YouTube Data API v3** - for video search and embedding

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (or MongoDB Atlas)
- API keys for Spotify, Genius, and YouTube

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Haru-Tachibana/KashiFind.git
   cd KashiFind
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   npm install
   
   # Frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kashifind
   
   # Server
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # JWT
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   
   # External APIs
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   GENIUS_API_KEY=your_genius_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. **Start the application**
   ```bash
   # Start backend server
   npm run dev
   
   # In another terminal, start frontend
   cd frontend
   npm start
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## 📁 Project Structure

```
KashiFind/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions and API calls
│   │   └── App.js          # Main App component
│   └── package.json
├── models/                  # Mongoose data models
├── routes/                  # Express API routes
├── utils/                   # Backend utilities
├── server.js               # Main server file
├── server-demo.js          # Demo server (no MongoDB required)
└── package.json
```

## 🔧 API Endpoints

### **Search Endpoints**
- `GET /api/search` - Advanced search with filters
- `GET /api/search/realtime` - Real-time search with external APIs
- `GET /api/search/suggestions` - Search suggestions
- `GET /api/search/trending` - Trending songs
- `GET /api/search/genres` - Available genres
- `GET /api/search/years` - Available years

### **Song Endpoints**
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song by ID
- `GET /api/songs/:id/youtube` - Get YouTube videos for song
- `GET /api/lyrics/:id` - Get lyrics in different formats

## 🎯 Key Features Explained

### **Smart Furigana Display**
The application intelligently displays furigana only above kanji characters, not above hiragana or katakana. This creates a clean, readable layout similar to UtaTen.

### **Real-time Search**
Search results update instantly as you type, with intelligent suggestions and external API integration for comprehensive results.

### **YouTube Integration**
Each song automatically searches for and displays relevant YouTube videos, providing a complete music experience.

### **Dynamic Content**
Different external songs show different sample lyrics and metadata, creating a realistic demonstration experience.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [UtaTen](https://utaten.com/) for the furigana display concept
- Built with modern web technologies for optimal performance
- External API integration for comprehensive music data

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**KashiFind** - Find your favorite Japanese lyrics with style! 🎵✨