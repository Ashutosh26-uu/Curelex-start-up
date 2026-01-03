@echo off
echo ========================================
echo CureLex Healthcare Platform
echo ========================================

echo 1. Installing backend dependencies...
call npm install

echo 2. Setting up SQLite database...
call npx prisma generate
call npx prisma migrate dev --name init
call npm run prisma:seed

echo 3. Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 4. Starting services...
start "Backend" cmd /k "echo Backend: http://localhost:3001 && npm run start:dev"

timeout /t 5 /nobreak > nul

start "Frontend" cmd /k "echo Frontend: http://localhost:3002 && cd frontend && npm run dev"

echo ========================================
echo ✅ Platform Started Successfully!
echo ========================================
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend API: http://localhost:3001/api/v1
echo 📚 API Docs: http://localhost:3001/api/docs
echo 📊 Database: SQLite (./prisma/dev.db)
echo ========================================
echo 🔐 Test Credentials:
echo 👨💼 Admin: ashutosh@curelex.com / admin@123
echo 👨⚕️ Doctor: doctor@healthcare.com / doctor123
echo 👤 Patient: patient@healthcare.com / patient123
echo ========================================
echo 📱 Mobile Responsive: ✅
echo 🔐 Authentication: ✅
echo 👥 Patient Dashboard: ✅
echo 👨⚕️ Doctor Dashboard: ✅
echo ========================================

pause