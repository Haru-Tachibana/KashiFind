# KashiFind

A modern music, lyrics, and MV search application with **real-time search** from external APIs.

## Architecture

- **Backend**: Java Spring Boot
- **Frontend**: React with Tailwind CSS
- **Search**: All searches query external APIs
- **Deployment**: Docker & Docker Compose

## Project Structure

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

## Quick Start (3 Steps)

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


## Docker Services

1. **Backend**: Java Spring Boot API (Port 3001)
2. **Frontend**: React app served via Nginx (Port 3000)

## Common Commands

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
