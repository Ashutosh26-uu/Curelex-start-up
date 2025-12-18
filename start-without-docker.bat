@echo off
echo ========================================
echo Healthcare Platform - No Docker Setup
echo ========================================

echo 1. Installing dependencies...
call npm install

echo 2. Skipping Docker (using local PostgreSQL)
echo Please ensure PostgreSQL is running on localhost:5432

echo 3. Generating Prisma client...
call npx prisma generate

echo 4. Running migrations...
call npx prisma migrate dev --name init

echo 5. Seeding database...
call npm run prisma:seed

echo 6. Starting backend...
start "Backend" cmd /k "echo Backend: http://localhost:3001 && npm run start:dev"

echo 7. Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 8. Starting frontend...
start "Frontend" cmd /k "echo Frontend: http://localhost:3002 && cd frontend && npm run dev"

echo ========================================
echo ✅ Platform Started Successfully!
echo ========================================
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend API: http://localhost:3001/api/v1
echo 📚 API Docs: http://localhost:3001/api/docs
echo ========================================

pause