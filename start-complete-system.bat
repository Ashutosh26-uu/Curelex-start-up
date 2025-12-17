@echo off
echo ========================================
echo Healthcare Platform - Complete Setup
echo ========================================

echo.
echo [1/6] Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker services
    pause
    exit /b 1
)

echo.
echo [2/6] Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo.
echo [3/6] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [4/6] Setting up database...
call npx prisma migrate dev --name init
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to setup database
    pause
    exit /b 1
)

echo.
echo [5/6] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [6/6] Starting applications...
echo Starting backend server...
start "Backend Server" cmd /k "npm run start:dev"

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend App: http://localhost:3000
echo API Documentation: http://localhost:3001/api/docs
echo Database Admin: http://localhost:8080
echo.
echo Press any key to exit...
pause > nul