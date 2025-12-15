# Healthcare Platform - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. Database Connection Error (P1001)
**Error:** `Can't reach database server at localhost:5432`

**Solution:**
```bash
# Run this script to fix database issues:
fix-database.bat
```

**Manual Steps:**
1. Check if Docker is running: `docker --version`
2. Start Docker Desktop if not running
3. Stop existing containers: `docker-compose -f docker-compose.dev.yml down`
4. Start fresh: `docker-compose -f docker-compose.dev.yml up -d`
5. Wait 30 seconds for database to be ready

### 2. Docker Not Running
**Error:** Docker commands fail

**Solution:**
1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Wait for Docker to fully start (green icon in system tray)

### 3. Port Already in Use
**Error:** Port 3000, 3001, 5432 already in use

**Solution:**
```bash
# Check what's using the ports:
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Kill processes if needed:
taskkill /PID <process_id> /F
```

### 4. Frontend 404 Errors
**Error:** API calls return 404

**Solution:**
1. Ensure backend is running on port 3000
2. Check API base URL in frontend/.env.local
3. Verify CORS settings in backend

### 5. TypeScript Errors in Seed
**Error:** Property 'doctor' does not exist

**Solution:**
Use the JavaScript seed instead:
```bash
node prisma/simple-seed.js
```

## 🔧 Quick Fixes

### Reset Everything:
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down -v

# Remove node_modules
rmdir /s node_modules
rmdir /s frontend\node_modules

# Fresh install
npm install
cd frontend && npm install && cd ..

# Start fresh
start-with-checks.bat
```

### Check Service Status:
```bash
# Check Docker containers
docker ps

# Check if database is ready
docker exec healthcare_postgres pg_isready -U postgres

# Test API endpoint
curl http://localhost:3000/api/v1/health
```

## 📋 Startup Checklist

1. ✅ Docker Desktop is installed and running
2. ✅ No other services using ports 3000, 3001, 5432, 6379, 8080
3. ✅ Node.js 18+ is installed
4. ✅ Internet connection for downloading dependencies

## 🚀 Recommended Startup Command

```bash
start-with-checks.bat
```

This script will:
- Check Docker status
- Fix database issues
- Install dependencies
- Start both backend and frontend
- Show helpful URLs and credentials

## 🔐 Default Login Credentials

- **Admin:** ashutosh@curelex.com / admin@123
- **Doctor:** doctor@healthcare.com / doctor123
- **Patient:** patient@healthcare.com / patient123

## 🌐 Service URLs

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api/v1
- **API Documentation:** http://localhost:3000/api/docs
- **Database Admin:** http://localhost:8080
- **Health Check:** http://localhost:3000/api/v1/health

## 📞 Still Having Issues?

1. Run `check-docker.bat` to verify Docker setup
2. Run `fix-database.bat` to reset database
3. Check the console logs for specific error messages
4. Ensure all required ports are available