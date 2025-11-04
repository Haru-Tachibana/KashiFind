# KashiFind Architecture

## Overview

KashiFind is a **real-time search application** that queries external APIs on-demand. **No database is used** - all searches are performed in real-time against external services.

## Architecture Diagram

```
┌─────────────┐
│   Frontend  │ (React on Nginx)
│  Port 3000  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │ (Spring Boot)
│  Port 3001  │
└──────┬──────┘
       │
       ├──► Spotify API (Songs)
       ├──► YouTube API (Videos)
       ├──► Lyrics.ovh API (Lyrics)
       └──► Genius API (Lyrics)
```

## Key Design Decisions

### 1. No Database
- **Why**: User wants real-time search only
- **Benefit**: Always fresh results, no stale data
- **Trade-off**: Slightly slower (API calls), but more up-to-date

### 2. Real-time API Integration
- **Spotify API**: Song metadata, album art, previews
- **YouTube API**: Music videos
- **Lyrics.ovh**: Free lyrics (no API key needed)
- **Genius API**: Premium lyrics (optional)

### 3. Japanese Text Processing
- **Kuromoji**: Processes Japanese text to Hiragana/Romaji
- **On-the-fly**: Processing happens when lyrics are fetched
- **No caching**: Each request processes fresh

## Data Flow

### Search Flow
```
User Query → Frontend → Backend → External APIs
                ↓
         Spotify + YouTube
                ↓
         Combine Results
                ↓
         Return to Frontend
```

### Lyrics Flow
```
Song Selection → Backend → Lyrics.ovh / Genius
                       ↓
                 Get Lyrics
                       ↓
              Process (Hiragana/Romaji)
                       ↓
              Return to Frontend
```

## API Endpoints

### Search Endpoints
- `/api/search?q={query}` - Search Spotify + YouTube
- `/api/search/realtime?q={query}` - Same as above (explicit)
- `/api/search/suggestions?q={query}` - Quick suggestions

### Song Endpoints
- `/api/songs/{id}` - Get song from Spotify
- `/api/songs/external/{id}` - Get song with lyrics
- `/api/songs/{id}/youtube` - Get YouTube videos

### Lyrics Endpoints
- `/api/lyrics/{id}?title=X&artist=Y` - Get lyrics
- `/api/lyrics/process` - Process Japanese text
- `/api/lyrics/furigana` - Generate furigana

## External APIs Used

### 1. Spotify API
- **Purpose**: Song search, metadata, album art
- **Auth**: Client Credentials (Client ID + Secret)
- **Rate Limit**: ~100 requests/30 seconds
- **Endpoint**: `https://api.spotify.com/v1/`

### 2. YouTube Data API v3
- **Purpose**: Music video search
- **Auth**: API Key
- **Rate Limit**: 10,000 units/day (free tier)
- **Endpoint**: `https://www.googleapis.com/youtube/v3/`

### 3. Lyrics.ovh API
- **Purpose**: Free lyrics
- **Auth**: None required
- **Rate Limit**: Reasonable use
- **Endpoint**: `https://api.lyrics.ovh/v1/`

### 4. Genius API
- **Purpose**: Premium lyrics
- **Auth**: API Key
- **Rate Limit**: Varies by plan
- **Endpoint**: `https://api.genius.com/`

## Performance Considerations

### Caching Strategy
- **None**: All results are real-time
- **Token Caching**: Spotify access tokens cached for 1 hour
- **No Result Caching**: Every search is fresh

### Rate Limiting
- **Spotify**: ~100 requests/30 seconds
- **YouTube**: 10,000 units/day (free tier)
- **Lyrics APIs**: Generally more lenient

### Optimization
- Parallel API calls where possible
- Token reuse for Spotify
- Pagination support for large result sets

## Error Handling

### API Failures
- If one API fails, others still work
- Graceful degradation (show available results)
- Error messages returned to frontend

### Missing Data
- If lyrics not found, return empty
- If video not found, return empty array
- Never crash - always return response

## Security

### API Keys
- Stored in `.env` file (never committed)
- Passed to containers via environment variables
- No keys in code or Docker images

### CORS
- Configured for frontend URL only
- Credentials allowed
- Specific origin whitelist

## Deployment

### Docker Compose
- **Backend**: Java Spring Boot container
- **Frontend**: React + Nginx container
- **No Database**: MongoDB removed

### Environment Variables
- Loaded from `.env` file
- Passed to backend container
- Used by Spring Boot configuration

## Future Enhancements (if needed)

If you want to add caching later:
1. Add Redis for result caching
2. Cache API responses for X minutes
3. Still use real-time as primary source

But for now, **everything is real-time** as requested!

