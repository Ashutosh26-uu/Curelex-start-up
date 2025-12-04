@echo off
echo ========================================
echo Healthcare Telemedicine Platform Setup
echo ========================================
echo.

echo Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak > nul

echo.
echo Setting up database...
npm run prisma:migrate
npm run prisma:seed

echo.
echo ========================================
echo Starting Backend and Frontend...
echo ========================================
echo.
echo Backend will start on: http://localhost:3000
echo Frontend will start on: http://localhost:3001
echo API Documentation: http://localhost:3000/api/docs
echo Database Admin: http://localhost:8080
echo.

start "Backend Server" cmd /k "npm run start:dev"
start "Frontend Server" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Login Credentials:
echo Admin: ashutosh@curelex.com / admin@123
echo Doctor: doctor@healthcare.com / doctor123
echo Patient: patient@healthcare.com / patient123
echo.
echo Press any key to exit...
pause > nul