# KashiFind

A modern music, lyrics, and MV search application with **real-time search** from external APIs.

## 🏗️ Architecture

- **Backend**: Java Spring Boot (Java 17, Spring Boot 3.2.0)
- **Frontend**: React with Tailwind CSS
- **Search**: Real-time only - no database! All searches query external APIs
- **Deployment**: Docker & Docker Compose

## 🎯 Key Features

- **100% Real-time Search**: No database - all searches query Spotify, YouTube, Genius APIs in real-time
- **Japanese Text Processing**: Converts lyrics to Hiragana and Romaji
- **Multiple API Sources**: Spotify, YouTube, Genius, Lyrics.ovh
- **Fast & Fresh**: Always get the latest results from external sources

## 📁 Project Structure

```
KashiFind/
├── backend/          # Java Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/         # React frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml # Docker orchestration
```

## 🚀 Quick Start (3 Steps)

### 1. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your favorite editor
```

**Required:**
- `JWT_SECRET` - Generate: `openssl rand -base64 32`

**Required for Full Functionality:**
- `SPOTIFY_CLIENT_ID` & `SPOTIFY_CLIENT_SECRET` - Get from https://developer.spotify.com/dashboard (for song search)
- `YOUTUBE_API_KEY` - Get from https://console.developers.google.com/ (for music videos)
- `GENIUS_API_KEY` - Get from https://genius.com/api-clients (for lyrics)

**Optional:**
- Lyrics.ovh API works without keys (free tier)

### 2. Start Docker Services

```bash
# Make sure Docker Desktop is running, then:
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔍 How It Works

**Real-time Search Only:**
- Every search queries **Spotify** and **YouTube** APIs in real-time
- No database storage - results are always fresh
- Lyrics fetched from **Lyrics.ovh** and **Genius** APIs
- Japanese text processing happens on-the-fly

## 📚 API Documentation

### Search (Real-time)
- `GET /api/search?q={query}` - Search songs from external APIs
- `GET /api/search/realtime?q={query}` - Real-time search (same as above)
- `GET /api/search/suggestions?q={query}` - Get search suggestions

### Songs
- `GET /api/songs/{id}` - Get song details from external API
- `GET /api/songs/external/{id}` - Get external song with lyrics
- `GET /api/songs/{id}/youtube?title=X&artist=Y` - Get YouTube videos

### Lyrics
- `GET /api/lyrics/{id}?title=X&artist=Y` - Get lyrics (real-time)
- `POST /api/lyrics/process` - Process text to generate hiragana/romaji
- `POST /api/lyrics/furigana` - Generate furigana for text

## 🔑 Required API Keys

### Spotify (Required for song search)
1. Go to: https://developer.spotify.com/dashboard
2. Create a new app
3. Copy Client ID and Client Secret

### YouTube (Required for music videos)
1. Go to: https://console.developers.google.com/
2. Create a project
3. Enable "YouTube Data API v3"
4. Create API Key

### Genius (Optional, for lyrics)
1. Go to: https://genius.com/api-clients
2. Create API client
3. Copy API key

**Note**: Lyrics.ovh works without API keys (free).

## 🐳 Docker Services

1. **Backend**: Java Spring Boot API (Port 3001)
2. **Frontend**: React app served via Nginx (Port 3000)

**No MongoDB needed!** - Everything is real-time.

## 🔧 Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Check status
docker-compose ps
```

## 📝 Features

- ✅ Real-time search from Spotify, YouTube
- ✅ Japanese lyrics processing (Hiragana, Romaji)
- ✅ Multiple lyrics sources (Lyrics.ovh, Genius)
- ✅ Music video search from YouTube
- ✅ No database - always fresh results
- ✅ RESTful API
- ✅ Docker containerization

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[DOCKER.md](./DOCKER.md)** - Docker-specific documentation

## 📄 License

MIT

## 👤 Author

KashiFind Development Team
