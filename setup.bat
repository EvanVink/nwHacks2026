@echo off
REM EmotiSound Quick Start Script (Windows)
REM This script helps set up and run EmotiSound locally

setlocal enabledelayedexpansion

echo.
echo 🎵 EmotiSound - Privacy-First Accessibility Tool
echo ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Setup Backend
echo 📦 Setting up backend...
cd emotisound-backend

if not exist "node_modules" (
    call npm install
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

if not exist ".env" (
    echo ⚠️  Creating .env file...
    (
        echo PORT=3001
        echo JWT_SECRET=dev-secret-key-change-in-production
        echo NODE_ENV=development
    ) > .env
    echo ✅ Backend .env created
) else (
    echo ✅ Backend .env already exists
)

cd ..

REM Setup Frontend
echo.
echo ⚛️  Setting up frontend...
cd emotisound

if not exist "node_modules" (
    call npm install
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)

if not exist ".env" (
    echo ⚠️  Creating .env file...
    (
        echo REACT_APP_API_URL=http://localhost:3001/api
    ) > .env
    echo ✅ Frontend .env created
) else (
    echo ✅ Frontend .env already exists
)

cd ..

echo.
echo ==================================================
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo.
echo 1. Start the backend (in Terminal 1):
echo    cd emotisound-backend
echo    npm start
echo.
echo 2. Start the frontend (in Terminal 2):
echo    cd emotisound
echo    npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🎯 To test:
echo    - Register a new account
echo    - Allow camera access
echo    - Make facial expressions to test detection
echo    - Check Analytics for emotion counts
echo.
echo 📚 Documentation:
echo    - README.md - Project overview
echo    - SETUP_GUIDE.md - Detailed setup and deployment
echo    - ARCHITECTURE.md - Technical architecture
echo.
echo ==================================================
echo.
pause
