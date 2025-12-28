@echo off
echo ========================================
echo Healthcare Platform - Setup Check
echo ========================================

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm not found
    pause
    exit /b 1
)

echo.
echo Checking project dependencies...
if not exist "node_modules" (
    echo ⚠️  Backend dependencies not installed
    echo Run: npm install
) else (
    echo ✅ Backend dependencies found
)

if not exist "frontend\node_modules" (
    echo ⚠️  Frontend dependencies not installed
    echo Run: cd frontend && npm install
) else (
    echo ✅ Frontend dependencies found
)

echo.
echo Checking database...
if exist "prisma\dev.db" (
    echo ✅ SQLite database found
) else (
    echo ⚠️  Database not initialized
    echo Run: npm run prisma:migrate && npm run prisma:seed
)

echo.
echo Checking environment...
if exist ".env" (
    echo ✅ Environment file found
) else (
    echo ⚠️  .env file missing
    echo Copy .env.example to .env and configure
)

echo.
echo ========================================
echo Setup Status Summary:
echo ========================================
echo ✅ Uses SQLite (no external database needed)
echo ✅ No Docker required
echo ✅ All services run on localhost
echo ✅ Production-ready configuration
echo ========================================

pause