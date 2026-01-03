#!/bin/bash

# MindMingle - One-Click Setup Script
# This script sets up everything you need to build and run the app

echo "🧠 MindMingle Setup Script"
echo "=========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install React Native CLI globally
echo ""
echo "📦 Installing React Native CLI..."
npm install -g react-native-cli

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
npm install

# Setup backend
echo ""
echo "📦 Setting up backend..."
mkdir -p backend
cd backend

# Create package.json if not exists
if [ ! -f "package.json" ]; then
    cp ../backend-package.json package.json
fi

# Install backend dependencies
npm install

# Create .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mindmingle
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=development
EOF
    echo "✅ .env file created"
fi

cd ..

# Create necessary directories
mkdir -p android/app/src/main/res/drawable
mkdir -p ios/MindMingle/Images.xcassets

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB: mongod"
echo "2. Start backend: cd backend && npm start"
echo "3. Start React Native: npm start"
echo "4. Run on Android: npm run android"
echo "5. Run on iOS: npm run ios"
echo ""
echo "For Play Store build:"
echo "cd android && ./gradlew assembleRelease"
