#!/bin/bash

# EmotiSound Quick Start Script
# This script helps set up and run EmotiSound locally

set -e

echo "🎵 EmotiSound - Privacy-First Accessibility Tool"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd emotisound-backend

if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOF
PORT=3001
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
EOF
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env already exists"
fi

cd ..

# Setup Frontend
echo ""
echo "⚛️  Setting up frontend..."
cd emotisound

if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api
EOF
    echo "✅ Frontend .env created"
else
    echo "✅ Frontend .env already exists"
fi

cd ..

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start the backend (in Terminal 1):"
echo "   cd emotisound-backend"
echo "   npm start"
echo ""
echo "2. Start the frontend (in Terminal 2):"
echo "   cd emotisound"
echo "   npm start"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🎯 To test:"
echo "   - Register a new account"
echo "   - Allow camera access"
echo "   - Make facial expressions to test detection"
echo "   - Check Analytics for emotion counts"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - SETUP_GUIDE.md - Detailed setup and deployment"
echo "   - ARCHITECTURE.md - Technical architecture"
echo ""
echo "=================================================="
