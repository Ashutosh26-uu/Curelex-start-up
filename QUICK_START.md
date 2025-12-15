# Curelex HealthTech - Quick Start Guide

## 🚀 Run the Project

### 1. Backend Setup
```bash
# Install dependencies
npm install

# Setup database
npm run prisma:migrate
npm run prisma:seed

# Start backend
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **API Docs**: http://localhost:3000/api/docs

## 🔐 Login Portals

### Patient Portal
- **URL**: http://localhost:3001/patient-login
- **Credentials**: patient@healthcare.com / patient123

### Doctor Portal  
- **URL**: http://localhost:3001/doctor-login
- **Credentials**: doctor@healthcare.com / doctor123

## 📱 Features Available

### Patient Portal
- Self registration with phone-based unique ID
- Medical history management
- Appointment booking
- Prescription viewing
- Vitals tracking

### Doctor Portal
- Patient management
- Appointment scheduling
- Prescription creation
- Medical history access
- Vitals monitoring

## 🔧 Fixed Issues

✅ **Authentication Problem**: Extended token validity to 24 hours
✅ **404 Login Error**: Fixed API endpoints for patient/doctor portals
✅ **Portal Separation**: Removed admin/officer portals, kept only patient & doctor
✅ **API Routes**: Updated frontend to use correct backend endpoints

## 🏥 Test the Platform

1. Start both backend and frontend
2. Visit http://localhost:3001
3. Use patient or doctor login portals
4. Test registration, appointments, and prescriptions

Your healthcare platform is ready! 🎉