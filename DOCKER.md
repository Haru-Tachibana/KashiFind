# Docker Deployment Guide

This guide explains how to deploy the KashiFind application using Docker and Docker Compose.

## Architecture

The application is split into three containers:
- **Frontend**: React application served via Nginx (Port 3000)
- **Backend**: Node.js/Express API server (Port 3001)
- **Database**: MongoDB (Port 27017)

## Prerequisites

- Docker Desktop installed and running
- Git (to clone the repository)

## Quick Start

### 1. Build and Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all containers
docker-compose down
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Detailed Commands

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Start Services

```bash
# Start in detached mode (background)
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d mongodb
docker-compose up -d backend
docker-compose up -d frontend
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
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker-compose down -v
```

### Check Status

```bash
# List running containers
docker-compose ps

# Check service health
docker-compose ps
```

## Development Mode

For development with hot-reload:

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up

# Or run only database in Docker
docker-compose -f docker-compose.dev.yml up -d mongodb
# Then run backend and frontend locally
```

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the root directory (or use `.env.docker` as reference):

```env
MONGODB_URI=mongodb://mongodb:27017/lyrics_search
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secret_key_here
```

### Frontend Environment Variables

The frontend uses `REACT_APP_API_URL` which is set in `docker-compose.yml`. For production, you may want to:

1. Create a `.env` file in the `frontend/` directory
2. Set `REACT_APP_API_URL=http://localhost:3001/api`
3. Rebuild the frontend image

## Database Management

### Access MongoDB Shell

```bash
# Connect to MongoDB container
docker-compose exec mongodb mongosh lyrics_search

# Or using docker directly
docker exec -it kashifind-mongodb mongosh lyrics_search
```

### Backup Database

```bash
# Create backup
docker-compose exec mongodb mongodump --out /data/backup

# Copy backup from container
docker cp kashifind-mongodb:/data/backup ./backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup kashifind-mongodb:/data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

### Seed Database (Initial Data)

```bash
# Run seed script
docker-compose exec backend node scripts/seedData.js
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart [service-name]
```

### Port Already in Use

If ports 3000, 3001, or 27017 are already in use:

1. Edit `docker-compose.yml`
2. Change the port mappings:
   ```yaml
   ports:
     - "3002:3001"  # Change host port
   ```

### Database Connection Issues

```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test connection from backend container
docker-compose exec backend node -e "require('mongoose').connect('mongodb://mongodb:27017/lyrics_search').then(() => console.log('Connected')).catch(e => console.error(e))"
```

### Frontend Can't Connect to Backend

1. Verify backend is running: `docker-compose ps backend`
2. Check backend logs: `docker-compose logs backend`
3. Test backend health: `curl http://localhost:3001/api/health`
4. Check `REACT_APP_API_URL` in frontend environment

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose build [service-name]

# Rebuild and restart
docker-compose up -d --build [service-name]

# Rebuild all
docker-compose up -d --build
```

## Production Deployment

### Security Considerations

1. **Change JWT Secret**: Update `JWT_SECRET` in environment variables
2. **Use HTTPS**: Configure reverse proxy (nginx/traefik) with SSL
3. **Update CORS**: Set `FRONTEND_URL` to your production domain
4. **Database Security**: Use MongoDB authentication in production
5. **Environment Variables**: Never commit `.env` files

### Production docker-compose.yml

For production, consider:
- Using external managed MongoDB (MongoDB Atlas)
- Adding SSL/TLS termination
- Using secrets management
- Setting resource limits
- Using production-ready Nginx configuration

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Clean Up

```bash
# Remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove everything including unused images
docker system prune -a
```

## Useful Docker Commands

```bash
# List all containers
docker ps -a

# List all images
docker images

# Remove unused resources
docker system prune

# Execute command in running container
docker-compose exec backend npm run seed

# View container resource usage
docker stats
```

## Next Steps

1. **Set up environment variables** for production
2. **Configure domain and SSL** if deploying publicly
3. **Set up monitoring** (optional)
4. **Configure backups** for MongoDB
5. **Set up CI/CD** for automated deployments

## Support

For issues or questions:
- Check container logs: `docker-compose logs`
- Verify all services are healthy: `docker-compose ps`
- Review this guide's troubleshooting section

