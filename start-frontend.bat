@echo off
echo Starting Healthcare Telemedicine Platform Frontend...
echo.

cd frontend

echo Installing dependencies...
npm install

echo.
echo Starting Next.js development server...
npm run dev

pause