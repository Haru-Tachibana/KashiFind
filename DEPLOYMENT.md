# KashiFind Local Deployment Guide

Complete guide to deploying KashiFind locally using Docker Compose.

## 📋 Prerequisites

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker is running (green icon in system tray)

2. **Git** (optional, if cloning from repository)

## 🚀 Quick Start

### Step 1: Set Up Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your API keys (see below for how to get them)

### Step 2: Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Or use the convenience script
./docker-start.sh
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔑 Getting API Keys

### Required APIs (Optional but Recommended)

The application works without API keys, but having them unlocks additional features:

#### 1. Genius API (for lyrics)
- **Why**: Fetches lyrics from Genius.com
- **Get it**: https://genius.com/api-clients
- **Steps**:
  1. Sign up for a free Genius account
  2. Go to API Clients
  3. Create a new client
  4. Copy the API key

#### 2. Spotify API (for song metadata)
- **Why**: Get song details, album art, previews
- **Get it**: https://developer.spotify.com/dashboard
- **Steps**:
  1. Log in with your Spotify account
  2. Create a new app
  3. Copy Client ID and Client Secret
  4. Add redirect URI: `http://localhost:3000` (for OAuth if needed)

#### 3. YouTube API (for music videos)
- **Why**: Find and display music videos
- **Get it**: https://console.developers.google.com/
- **Steps**:
  1. Create a new Google Cloud project (or use existing)
  2. Enable "YouTube Data API v3"
  3. Create credentials → API Key
  4. Copy the API key
  5. (Optional) Restrict the key to YouTube Data API

### Minimum Setup

For basic functionality, you only need:
- `JWT_SECRET` - A random secure string (see below)

Generate a secure JWT secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Or use any random string generator
```

## 📝 Environment Variables Setup

### Option 1: Using .env file (Recommended)

1. Create `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your values:
   ```env
   JWT_SECRET=your_generated_secret_here
   GENIUS_API_KEY=your_genius_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   YOUTUBE_API_KEY=your_youtube_key
   ```

3. Docker Compose will automatically load variables from `.env`

### Option 2: Direct in docker-compose.yml

You can also set environment variables directly in `docker-compose.yml` (not recommended for secrets).

## 🐳 Docker Commands

### Start Services
```bash
# Start in background (detached mode)
docker-compose up -d

# Start with logs visible
docker-compose up
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Stop Services
```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes database)
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all
docker-compose up -d --build
```

### Check Status
```bash
# List running containers
docker-compose ps

# Check service health
docker ps
```

## 🗄️ Database Management

### Access MongoDB
```bash
# Connect to MongoDB shell
docker-compose exec mongodb mongosh lyrics_search

# Or using docker directly
docker exec -it kashifind-mongodb mongosh lyrics_search
```

### Seed Database (Optional)
```bash
# If you have seed data script
docker-compose exec backend mvn spring-boot:run -Dspring-boot.run.arguments=--seed
```

### Backup Database
```bash
# Create backup
docker-compose exec mongodb mongodump --out /data/backup

# Copy backup from container
docker cp kashifind-mongodb:/data/backup ./backup
```

## 🔧 Troubleshooting

### Port Already in Use

If ports 3000, 3001, or 27017 are already in use:

1. **Option 1**: Stop the conflicting service
2. **Option 2**: Change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3002:3001"  # Change host port
   ```

### Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart [service-name]
```

### Backend Can't Connect to MongoDB

```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec backend curl http://localhost:3001/api/health
```

### Frontend Can't Connect to Backend

1. Verify backend is running: `docker-compose ps backend`
2. Check backend logs: `docker-compose logs backend`
3. Test backend: `curl http://localhost:3001/api/health`
4. Check `REACT_APP_API_URL` in frontend Dockerfile

### Environment Variables Not Loading

1. Ensure `.env` file exists in project root
2. Check variable names match exactly (case-sensitive)
3. Restart containers: `docker-compose restart`

### Build Errors

```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Service Health Checks

All services have health checks configured:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:3001/api/health
curl http://localhost:3000/health
```

## 🧹 Clean Up

```bash
# Remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove everything including unused images
docker system prune -a
```

## 📱 Access Points

Once deployed, access:

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **MongoDB**: localhost:27017 (if you have MongoDB client)

## 🔒 Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong JWT_SECRET** - Generate with `openssl rand -base64 32`
3. **Restrict API keys** - In production, restrict API keys to specific IPs/domains
4. **Use HTTPS in production** - Set up reverse proxy with SSL

## 🎯 Next Steps

1. ✅ Set up `.env` with your API keys
2. ✅ Run `docker-compose up -d`
3. ✅ Verify all services are healthy
4. ✅ Access http://localhost:3000
5. ✅ Test the API at http://localhost:3001/api/health

## 💡 Tips

- Use `docker-compose logs -f` to watch logs in real-time
- Use `docker-compose ps` to quickly check service status
- Use `docker-compose restart [service]` to restart individual services
- Database data persists in Docker volumes between restarts

## 🆘 Need Help?

- Check logs: `docker-compose logs -f`
- Verify all services: `docker-compose ps`
- Review this guide's troubleshooting section
- Check Docker Desktop is running

