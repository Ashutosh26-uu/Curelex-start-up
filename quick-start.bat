@echo off
echo ========================================
echo Healthcare Platform - Quick Start
echo ========================================

echo Installing dependencies...
call npm install

echo Setting up database...
call setup-db.bat

echo Starting backend...
start "Backend" cmd /k "npm run start:dev"

echo Waiting for backend...
timeout /t 5 /nobreak > nul

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================
echo Platform Started!
echo ========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo API Docs: http://localhost:3000/api/docs
echo ========================================

pause