@echo off
echo ========================================
echo Healthcare Platform - Backend Only
echo ========================================

echo.
echo Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Waiting for database to be ready...
timeout /t 15 /nobreak > nul

echo.
echo Setting up database...
call npm run prisma:migrate
call npm run prisma:generate
call npm run prisma:seed

echo.
echo Starting backend server...
npm run start:dev

pause