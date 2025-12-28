@echo off
echo ========================================
echo Healthcare Platform - Optimized Setup
echo ========================================

echo 1. Installing backend dependencies...
call npm install --production=false

echo 2. Setting up SQLite database...
call npx prisma generate
call npx prisma migrate dev --name init
call npm run prisma:seed

echo 3. Installing frontend dependencies...
cd frontend
call npm install --production=false
cd ..

echo 4. Starting services...
echo Starting backend on port 3001...
start "Backend" cmd /k "npm run start:dev"

timeout /t 5 /nobreak > nul

echo Starting frontend on port 3002...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo ========================================
echo ✅ Platform Started Successfully!
echo ========================================
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend API: http://localhost:3001/api/v1
echo 📚 API Docs: http://localhost:3001/api/docs
echo 📊 Database: SQLite (./prisma/dev.db)
echo ========================================
echo.
echo Test Credentials:
echo Admin: ashutosh@curelex.com / admin@123
echo Doctor: doctor@healthcare.com / doctor123
echo Patient: patient@healthcare.com / patient123
echo ========================================

pause