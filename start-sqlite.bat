@echo off
echo ========================================
echo Healthcare Platform - SQLite Setup
echo ========================================

echo 1. Installing dependencies...
call npm install

echo 2. Generating Prisma client...
call npx prisma generate

echo 3. Running migrations...
call npx prisma migrate dev --name init

echo 4. Seeding database...
call npm run prisma:seed

echo 5. Starting backend...
start "Backend" cmd /k "echo Backend: http://localhost:3001 && npm run start:dev"

echo 6. Starting frontend...
start "Frontend" cmd /k "echo Frontend: http://localhost:3002 && cd frontend && npm run dev"

echo ========================================
echo ✅ Platform Started Successfully!
echo ========================================
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend API: http://localhost:3001/api/v1
echo 📚 API Docs: http://localhost:3001/api/docs
echo ========================================

pause