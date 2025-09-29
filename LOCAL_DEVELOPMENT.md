# Kashi.find - Local Development Guide

This guide will walk you through setting up and running the Kashi.find lyrics search application locally on your machine.

## Prerequisites

Before starting, make sure you have the following installed:

### 1. Node.js and npm
- **Node.js**: Version 18 or higher
- **npm**: Usually comes with Node.js

**Check your versions:**
```bash
node --version
npm --version
```

**Install Node.js:**
- Download from [nodejs.org](https://nodejs.org/)
- Or use a version manager like [nvm](https://github.com/nvm-sh/nvm)

### 2. MongoDB
You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string

#### Option B: MongoDB Local
1. Download from [mongodb.com/try/download/community](https://mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017/lyrics_search`

### 3. Git (Optional)
- For cloning the repository
- Download from [git-scm.com](https://git-scm.com/)

## Step-by-Step Setup

### Step 1: Clone/Download the Project
```bash
# If using Git
git clone https://github.com/Haru-Tachibana/KashiFind.git
cd KashiFind

# Or download ZIP and extract
```

### Step 2: Install Backend Dependencies
```bash
# Navigate to project root
cd /path/to/KashiFind

# Install backend dependencies
npm install
```

### Step 3: Install Frontend Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Go back to root
cd ..
```

### Step 4: Set Up Environment Variables
Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following content to `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lyrics_search
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lyrics_search?retryWrites=true&w=majority

DB_NAME=lyrics_search

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External APIs (Optional - for more search results)
GENIUS_API_KEY=your_genius_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Logging
LOG_LEVEL=info
```

### Step 5: Seed the Database (Optional)
The app comes with sample Japanese songs. To add them:

```bash
# From project root
node scripts/seedData.js
```

### Step 6: Start the Backend Server
```bash
# From project root
npm start
# OR
node server.js
```

You should see:
```
🚀 Server running on port 3001
📊 Database connected successfully
✅ Health check available at http://localhost:3001/api/health
```

### Step 7: Start the Frontend Development Server
Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Start React development server
npm start
```

You should see:
```
Compiled successfully!
You can now view modern-lyrics-frontend in the browser.
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

### Step 8: Access the Application
Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/health

## Quick Start Scripts

### Option 1: Manual Start (Recommended for Development)
```bash
# Terminal 1 - Backend
cd /path/to/KashiFind
npm start

# Terminal 2 - Frontend
cd /path/to/KashiFind/frontend
npm start
```

### Option 2: Using npm Scripts
```bash
# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Start both (if configured)
npm run dev
```

## Testing the Application

### 1. Test Backend Health
```bash
curl http://localhost:3001/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-29T12:00:00.000Z"
}
```

### 2. Test Database Connection
```bash
curl http://localhost:3001/api/songs
```
Should return a list of songs from the database.

### 3. Test Search Functionality
```bash
# Search for Japanese songs
curl "http://localhost:3001/api/search/realtime?q=YOASOBI&limit=10"

# Search for English songs (if external APIs configured)
curl "http://localhost:3001/api/search/realtime?q=arctic+monkeys&limit=10"
```

### 4. Test Frontend
1. Open http://localhost:3000
2. Try searching for "YOASOBI" or "LiSA"
3. Click on a song to view details
4. Test the YouTube video player

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### 2. MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string in `.env`
- For Atlas: check network access settings

#### 3. Frontend Build Errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

#### 4. Backend Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. CORS Issues
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that backend is running on port 3001
- Verify CORS configuration in `server.js`

### Debug Mode
```bash
# Backend with debug logs
DEBUG=* npm start

# Frontend with verbose output
cd frontend
REACT_APP_DEBUG=true npm start
```

## Development Tips

### 1. Hot Reload
- Frontend: Changes auto-reload
- Backend: Restart server after changes

### 2. Database Management
- Use MongoDB Compass for GUI
- Or use command line: `mongosh`

### 3. API Testing
- Use Postman or curl
- Check browser Network tab
- Use browser dev tools

### 4. Logs
- Backend logs in terminal
- Frontend logs in browser console
- Check server logs for errors

## File Structure
```
KashiFind/
├── frontend/           # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── routes/             # Backend API routes
├── models/             # Database models
├── utils/              # Utility functions
├── server.js           # Main server file
├── package.json        # Backend dependencies
└── .env               # Environment variables
```

## Next Steps

1. **Customize the app**: Modify components, add features
2. **Add more songs**: Use the seed script or add via API
3. **Configure external APIs**: Add Spotify/Genius keys for more results
4. **Deploy**: Follow the DEPLOYMENT.md guide

## Support

If you encounter issues:
1. Check this guide first
2. Look at the error messages
3. Check the logs
4. Verify all prerequisites are installed
5. Make sure all services are running

Happy coding! 🎵
