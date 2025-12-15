@echo off
echo ========================================
echo Healthcare Platform - Start with Checks
echo ========================================

echo Step 1: Checking Docker...
call check-docker.bat
if %errorlevel% neq 0 (
    echo Please fix Docker issues first
    pause
    exit /b 1
)

echo Step 2: Setting up database...
call fix-database.bat

echo Step 3: Installing dependencies...
call npm install

echo Step 4: Starting backend...
start "Backend" cmd /k "echo Backend starting... && npm run start:dev"

echo Step 5: Waiting for backend...
timeout /t 10 /nobreak > nul

echo Step 6: Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo Step 7: Starting frontend...
start "Frontend" cmd /k "echo Frontend starting... && cd frontend && npm run dev"

echo ========================================
echo Platform Started!
echo ========================================
echo Frontend: http://localhost:3001
echo Backend: http://localhost:3000
echo API Docs: http://localhost:3000/api/docs
echo Database: http://localhost:8080
echo ========================================
echo Login: ashutosh@curelex.com / admin@123
echo ========================================

pause