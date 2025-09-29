@echo off
REM Kashi.find - Local Development Startup Script for Windows
REM This script helps you start the application locally

echo 🎵 Starting Kashi.find Local Development Environment
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy env.example .env
    echo 📝 Please edit .env file with your configuration
    echo    - Set MONGODB_URI to your MongoDB connection string
    echo    - Set JWT_SECRET to a random string
    echo    - Optionally add external API keys
    echo.
    pause
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo 🚀 Starting the application...
echo.
echo The app will start in two parts:
echo 1. Backend server (http://localhost:3001)
echo 2. Frontend development server (http://localhost:3000)
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "npm run dev:backend"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend development server...
start "Frontend Server" cmd /k "npm run dev:frontend"

echo.
echo ✅ Both servers are starting...
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:3001
echo.
echo Press any key to exit this script (servers will continue running)
pause >nul
