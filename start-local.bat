@echo off
echo ========================================
echo Healthcare Platform - Local Setup
echo ========================================

echo.
echo Setting up database...
call npm run prisma:migrate
call npm run prisma:generate
call npm run prisma:seed

echo.
echo Starting backend server...
start "Backend Server" cmd /k "npm run start:dev"

echo.
echo Starting frontend server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Platform started successfully!
echo ========================================
echo Backend API: http://localhost:3001
echo Frontend: http://localhost:3002
echo API Docs: http://localhost:3001/api/docs
echo ========================================

pause