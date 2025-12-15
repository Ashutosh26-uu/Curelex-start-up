@echo off
echo ========================================
echo Healthcare Platform - Enterprise Edition
echo ========================================

echo 1. Installing dependencies...
call npm install

echo 2. Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo 3. Waiting for database...
timeout /t 25 /nobreak > nul

echo 4. Generating Prisma client...
call npx prisma generate

echo 5. Running migrations...
call npx prisma migrate dev --name enterprise_security --skip-seed

echo 6. Seeding enterprise database...
node prisma/enterprise-seed.js

echo 7. Starting backend...
start "Backend" cmd /k "echo 🚀 Backend: http://localhost:3000 && npm run start:dev"

echo 8. Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo 9. Starting frontend...
start "Frontend" cmd /k "echo 🌐 Frontend: http://localhost:3001 && cd frontend && npm run dev"

echo ========================================
echo ✅ Enterprise Platform Started!
echo ========================================
echo 🌐 Frontend: http://localhost:3001
echo 🔧 Backend API: http://localhost:3000/api/v1
echo 📚 API Docs: http://localhost:3000/api/docs
echo 🗄️ Database Admin: http://localhost:8080
echo ========================================
echo 🔐 Enhanced Security Features:
echo • Account lockout protection
echo • Session management
echo • Login history tracking
echo • IP and device monitoring
echo • Secure JWT with validation
echo • Password strength enforcement
echo ========================================
echo 📋 Login Credentials:
echo 👨💼 Admin: ashutosh@curelex.com / admin@123
echo 👨⚕️ Doctor: doctor@healthcare.com / doctor123
echo 👤 Patient: patient@healthcare.com / patient123
echo ========================================

pause