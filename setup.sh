#!/bin/bash

# Query Mobile App - Installation Script (Linux/Mac)
# Run this script to set up the project automatically

echo "🚀 Query Mobile App - Automated Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION detected"
else
    echo "✗ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check if npm is installed
echo "📦 Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm $NPM_VERSION detected"
else
    echo "✗ npm is not installed!"
    exit 1
fi

echo ""
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "✗ Installation failed!"
    exit 1
fi

echo "✓ Dependencies installed successfully"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✓ .env file already exists"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please update .env with your Laravel backend details!"
    echo "   Edit the following variables in .env:"
    echo "   - VITE_API_BASE_URL"
    echo "   - VITE_REVERB_APP_KEY"
    echo "   - VITE_REVERB_HOST"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Update .env file with your Laravel backend details"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - QUICKSTART.md - Quick setup guide"
echo "   - LARAVEL_SETUP.md - Backend integration"
echo "   - README.md - Full documentation"
echo ""
echo "Happy coding! 🎉"
