@echo off
echo ========================================
echo Healthcare Platform - Docker Setup
echo ========================================

echo 1. Installing dependencies...
call npm install

echo 2. Starting Docker services...
docker compose -f docker-compose.dev.yml up -d

echo 3. Waiting for database...
timeout /t 15 /nobreak > nul

echo 4. Generating Prisma client...
call npx prisma generate

echo 5. Running migrations...
call npx prisma migrate dev --name init

echo 6. Seeding database...
call npm run prisma:seed

echo 7. Starting backend...
start "Backend" cmd /k "echo Backend: http://localhost:3001 && npm run start:dev"

echo 8. Starting frontend...
start "Frontend" cmd /k "echo Frontend: http://localhost:3002 && cd frontend && npm run dev"

echo ========================================
echo ✅ Platform Started Successfully!
echo ========================================
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend API: http://localhost:3001/api/v1
echo 📚 API Docs: http://localhost:3001/api/docs
echo 🗄️ Database Admin: http://localhost:8080
echo ========================================

pause