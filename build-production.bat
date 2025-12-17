@echo off
echo 🔒 Starting secure production build...

echo 🧹 Cleaning build artifacts...
if exist "dist" rmdir /s /q "dist"
if exist "frontend\.next" rmdir /s /q "frontend\.next"

echo 🔍 Running security checks...
node scripts\security-check.js
if %errorlevel% neq 0 (
    echo ❌ Security checks failed
    exit /b 1
)

echo 🏗️ Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    exit /b 1
)

echo 🎨 Building frontend...
cd frontend
call npm run build:secure
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)
cd ..

echo ✅ Production build completed successfully!
echo 📦 Backend: dist/
echo 📦 Frontend: frontend/.next/