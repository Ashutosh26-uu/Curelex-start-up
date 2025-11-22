# Healthcare Telemedicine Platform - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (requires PostgreSQL)
npx prisma migrate dev

# Seed initial data
npm run prisma:seed
```

### 3. Start Services
```bash
# Backend (Terminal 1)
npm run start:dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 🔑 Default Login Credentials

- **Admin**: admin@healthcare.com / admin123
- **Doctor**: doctor@healthcare.com / doctor123  
- **Patient**: patient@healthcare.com / patient123
- **Nurse**: nurse@healthcare.com / nurse123

## 📱 Available Pages

### Public Access
- `/login` - User login
- `/register` - Patient registration

### Patient Dashboard
- `/patient` - Patient dashboard
- `/patient/appointments` - View appointments
- `/patient/medical-history` - Medical records

### Doctor Dashboard  
- `/doctor` - Doctor dashboard
- `/doctor/patients` - Assigned patients
- `/doctor/appointments` - Manage appointments

### Admin Dashboard
- `/admin` - User management
- `/vitals` - Record vitals (Nurse/Junior Doctor)
- `/prescriptions` - Prescription management
- `/notifications` - System notifications

## 🛠 Features Implemented

✅ **Authentication & Authorization**
✅ **Role-based Access Control** 
✅ **Patient Registration**
✅ **Appointment Scheduling**
✅ **Vitals Recording**
✅ **Prescription Management**
✅ **Medical History**
✅ **Admin Dashboard**
✅ **Notifications System**
✅ **Real-time Updates**

## 🔧 Environment Variables

Backend (.env):
```
DATABASE_URL="postgresql://user:pass@localhost:5432/healthcare_db"
JWT_SECRET="your-jwt-secret"
REDIS_URL="redis://localhost:6379"
```

Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## 📊 API Documentation

Access Swagger docs at: http://localhost:3000/api/docs

## 🐳 Docker Setup (Optional)

```bash
npm run docker:dev
```

The platform is now fully functional with all core healthcare features!