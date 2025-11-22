@echo off
echo Starting Healthcare Telemedicine Platform...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "npm run start:dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo 🌐 Backend: http://localhost:3000
echo 🌐 Frontend: http://localhost:3001
echo 📚 API Docs: http://localhost:3000/api/docs
echo.
echo 🔑 Login Credentials:
echo Admin: admin@healthcare.com / admin123
echo Doctor: doctor@healthcare.com / doctor123
echo Patient: patient@healthcare.com / patient123
echo.
pause