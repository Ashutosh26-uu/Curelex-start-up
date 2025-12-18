@echo off
echo ========================================
echo Healthcare Platform - Enterprise Edition
echo ========================================

echo 1. Installing dependencies...
call npm install

echo 2. Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo 3. Waiting for database...
timeout /t 20 /nobreak > nul

echo 4. Generating Prisma client...
call npx prisma generate

echo 5. Running migrations...
call npx prisma migrate dev --name init --skip-seed

echo 6. Seeding enterprise database...
node prisma/simple-seed.js

echo 7. Starting backend...
start "Backend" cmd /k "echo Backend: http://localhost:3000 && npm run start:dev"

echo 8. Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 9. Starting frontend...
start "Frontend" cmd /k "echo Frontend: http://localhost:3001 && cd frontend && npm run dev"

echo ========================================
echo ✅ Enterprise Platform Started Successfully!
echo ========================================
echo 🌐 Modern Auth: http://localhost:3001/auth
echo 🏠 Homepage: http://localhost:3001
echo 🔧 Backend API: http://localhost:3000/api/v1
echo 📚 API Docs: http://localhost:3000/api/docs
echo 🗄️ Database: http://localhost:8080
echo ========================================
echo 🚀 Enterprise Features:
echo • Unified Login/Signup (like Instagram)
echo • Social Login Ready (Google, Facebook)
echo • Two-Factor Authentication (2FA)
echo • Device Management & Fingerprinting
echo • Advanced Security & Session Management
echo • Real-time Notifications & PWA Ready
echo ========================================
echo 🔐 Test Credentials:
echo 👨💼 Admin: ashutosh@curelex.com / admin@123
echo 👨⚕️ Doctor: doctor@healthcare.com / doctor123
echo 👤 Patient: patient@healthcare.com / patient123
echo ========================================
echo 📖 Read ENTERPRISE_FEATURES.md for details
echo ========================================

pause