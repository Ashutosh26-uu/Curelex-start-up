@echo off
echo ========================================
echo Healthcare Platform - Quick Fix & Start
echo ========================================

echo 1. Installing backend dependencies...
npm install

echo 2. Generating Prisma client...
npm run prisma:generate

echo 3. Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo 4. Waiting for database...
timeout /t 15 /nobreak > nul

echo 5. Running database migrations...
npm run prisma:migrate

echo 6. Seeding database...
npm run prisma:seed

echo 7. Installing frontend dependencies...
cd frontend
npm install
cd ..

echo ========================================
echo Starting servers...
echo ========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo API Docs: http://localhost:3000/api/docs
echo ========================================

start "Backend" cmd /k "npm run start:dev"
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Setup complete! Check the opened terminal windows.
pause