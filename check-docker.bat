@echo off
echo Checking Docker status...

docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker is running
echo Checking containers...
docker ps

echo Checking if healthcare containers exist...
docker ps -a | findstr healthcare

echo Done!