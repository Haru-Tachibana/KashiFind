# Deployment Guide

## Frontend Deployment (Netlify)

### Step 1: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account and select the `KashiFind` repository
4. Set the build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Click "Deploy site"

### Step 2: Configure Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:
- `REACT_APP_API_URL` = `https://your-backend-url.railway.app`

## Backend Deployment (Railway)

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your `KashiFind` repository
4. Railway will automatically detect it's a Node.js app

### Step 2: Configure Environment Variables
In Railway dashboard, go to Variables tab and add:
- `NODE_ENV` = `production`
- `MONGODB_URI` = `your_mongodb_atlas_connection_string`
- `FRONTEND_URL` = `https://your-netlify-app.netlify.app`
- `JWT_SECRET` = `your_production_jwt_secret`
- `PORT` = `3001`

### Step 3: Set up MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get the connection string
4. Add it to Railway environment variables

## Alternative Backend Hosting

### Option 1: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`

### Option 2: Heroku
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Run: `git push heroku main`
4. Set environment variables in Heroku dashboard

## Testing Deployment

1. Test backend health: `https://your-backend-url.railway.app/api/health`
2. Test frontend: Visit your Netlify URL
3. Test search functionality

## Troubleshooting

- Check Railway/Render logs for backend issues
- Check Netlify build logs for frontend issues
- Ensure CORS is properly configured
- Verify environment variables are set correctly
