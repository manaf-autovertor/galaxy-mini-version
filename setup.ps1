# Query Mobile App - Installation Script
# Run this script to set up the project automatically

Write-Host "🚀 Query Mobile App - Automated Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "📦 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please update .env with your Laravel backend details!" -ForegroundColor Yellow
    Write-Host "   Edit the following variables in .env:" -ForegroundColor Yellow
    Write-Host "   - VITE_API_BASE_URL" -ForegroundColor Cyan
    Write-Host "   - VITE_REVERB_APP_KEY" -ForegroundColor Cyan
    Write-Host "   - VITE_REVERB_HOST" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your Laravel backend details" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - QUICKSTART.md - Quick setup guide" -ForegroundColor White
Write-Host "   - LARAVEL_SETUP.md - Backend integration" -ForegroundColor White
Write-Host "   - README.md - Full documentation" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
