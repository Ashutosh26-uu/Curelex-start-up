@echo off
echo ========================================
echo Healthcare Platform - Complete Setup
echo ========================================

echo 1. Installing backend dependencies...
call npm install

echo 2. Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 3. Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo 4. Waiting for database to be ready...
timeout /t 20 /nobreak > nul

echo 5. Generating Prisma client...
call npx prisma generate

echo 6. Running database migrations...
call npx prisma migrate dev --name init

echo 7. Seeding database with sample data...
call npx prisma db seed

echo 8. Testing API endpoints...
node test-endpoints.js

echo ========================================
echo Starting Applications...
echo ========================================

start "Backend API" cmd /k "echo Backend starting on http://localhost:3000 && npm run start:dev"
timeout /t 5 /nobreak > nul
start "Frontend App" cmd /k "echo Frontend starting on http://localhost:3001 && cd frontend && npm run dev"

echo ========================================
echo Setup Complete!
echo ========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo API Docs: http://localhost:3000/api/docs
echo Database: http://localhost:8080
echo ========================================

pause