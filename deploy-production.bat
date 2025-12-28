@echo off
echo ========================================
echo Healthcare Platform - Production Deploy
echo ========================================

echo.
echo Building backend...
call npm run build

echo.
echo Building frontend...
cd frontend
call npm run build
cd ..

echo.
echo Starting production services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Waiting for services to be ready...
timeout /t 20 /nobreak > nul

echo.
echo Running database migrations...
call npm run prisma:migrate

echo.
echo Starting backend in production mode...
start "Backend Production" cmd /k "npm run start:prod"

echo.
echo Starting frontend in production mode...
cd frontend
start "Frontend Production" cmd /k "npm run start"
cd ..

echo.
echo ========================================
echo Production deployment completed!
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3002
echo API Docs: http://localhost:3001/api/docs
echo ========================================

pause