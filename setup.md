# Healthcare Telemedicine Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Docker Desktop installed and running
- Git installed

### Option 1: Automatic Setup (Recommended)
1. **Run the setup script:**
   ```bash
   # Double-click start-all.bat or run in terminal:
   start-all.bat
   ```

2. **Wait for setup to complete** (2-3 minutes)

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs
   - Database Admin: http://localhost:8080

### Option 2: Manual Setup

1. **Start Docker services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Setup database:**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Start backend:**
   ```bash
   npm run start:dev
   ```

5. **Start frontend (new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | ashutosh@curelex.com | admin@123 |
| CEO | ceo@healthcare.com | admin@123 |
| Doctor | doctor@healthcare.com | doctor123 |
| Junior Doctor | junior.doctor@healthcare.com | doctor123 |
| Nurse | nurse@healthcare.com | admin@123 |
| Patient | patient@healthcare.com | patient123 |
| Patient 2 | patient2@healthcare.com | patient123 |

## 🌐 Application URLs

- **Frontend Application:** http://localhost:3001
- **Backend API:** http://localhost:3000/api/v1
- **API Documentation:** http://localhost:3000/api/docs
- **Database Admin (Adminer):** http://localhost:8080
- **Health Check:** http://localhost:3000/health

## 📱 Features Available

### For Patients
- Register and login
- View medical history
- Book appointments
- View prescriptions
- Check vitals history
- Receive notifications

### For Doctors
- View assigned patients
- Create prescriptions
- Manage appointments
- Record vitals
- View patient history

### For Nurses
- Record patient vitals
- View patient information
- Manage appointments

### For Officers (CEO, CTO, CFO, CMO)
- Executive dashboard
- Analytics and reports
- System health monitoring
- Revenue analytics

### For Admins
- User management
- Doctor-patient assignments
- System statistics
- Audit logs

## 🔧 Development Commands

```bash
# Backend
npm run start:dev          # Start backend in development mode
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Run database migrations
npm run prisma:seed        # Seed database with sample data

# Frontend
cd frontend
npm run dev               # Start frontend development server
npm run build             # Build for production

# Docker
npm run docker:dev        # Start Docker services
npm run docker:down       # Stop Docker services
```

## 🗄️ Database Access

**Adminer (Web Interface):**
- URL: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: postgres
- Password: password
- Database: healthcare_db

**Direct Connection:**
- Host: localhost
- Port: 5432
- Database: healthcare_db
- Username: postgres
- Password: password

## 🔍 Testing the API

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Login Test:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"ashutosh@curelex.com","password":"admin@123"}'
   ```

3. **Use the test script:**
   ```bash
   node test-login.js
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use:**
   - Stop other applications using ports 3000, 3001, 5432, 6379, 8080
   - Or change ports in .env files

2. **Docker not starting:**
   - Ensure Docker Desktop is running
   - Run: `docker-compose -f docker-compose.dev.yml down` then try again

3. **Database connection issues:**
   - Wait 10-15 seconds after starting Docker
   - Check if PostgreSQL container is running: `docker ps`

4. **Frontend not connecting to backend:**
   - Ensure backend is running on port 3000
   - Check CORS settings in main.ts

### Reset Everything:
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (this will delete all data)
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
start-all.bat
```

## 📞 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all services are running: `docker ps`
3. Check the troubleshooting section above
4. Restart the application using `start-all.bat`

## 🎯 Next Steps

1. **Customize the application** for your specific needs
2. **Configure email/SMS** services in .env
3. **Set up Google Meet integration** for video calls
4. **Deploy to production** using Docker
5. **Add more features** as needed

---

**Happy coding! 🚀**