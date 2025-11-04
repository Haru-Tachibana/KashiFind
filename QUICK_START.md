# Quick Start Guide - KashiFind

## 🚀 Start Everything with Docker Compose

### Prerequisites
- Docker Desktop installed and running
- `.env` file configured with API keys

### 1. Configure Environment

Create `.env` file from example:
```bash
cp env.example .env
```

Edit `.env` and add your API keys:
```env
JWT_SECRET=<generate with: openssl rand -base64 32>
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

### 2. Start All Services

**Start everything (frontend + backend):**
```bash
docker-compose up -d --build
```

This will:
- Build both frontend and backend Docker images
- Start both containers
- Connect them on the same network
- Expose:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:3001

### 3. Check Status

```bash
# View all running containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 📦 What Gets Packaged

### Backend Container
- Java 21 LTS
- Spring Boot 3.2.0
- All dependencies pre-installed
- Health check endpoint

### Frontend Container
- React app (pre-built)
- Nginx web server
- Static file serving
- SPA routing support

## 🔍 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Frontend can't reach backend
- Make sure backend is healthy: `curl http://localhost:3001/api/health`
- Check network: `docker network ls`
- Verify ports aren't in use: `lsof -i :3000 -i :3001`

### API keys not working
- Verify `.env` file exists and has correct values
- Check backend logs: `docker-compose logs backend`
- Restart backend: `docker-compose restart backend`

## 🎯 Next Steps

1. Open http://localhost:3000 in your browser
2. Search for songs using the search bar
3. Browse results and view lyrics

## 📚 More Information

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide
- See [README.md](./README.md) for project overview
