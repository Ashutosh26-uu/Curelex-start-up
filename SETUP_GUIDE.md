# Healthcare Telemedicine Platform - Complete Setup Guide

## 🚀 Quick Start (Recommended)

### Prerequisites
- Node.js 18+ installed
- Docker Desktop installed and running
- Git installed

### One-Click Setup
```bash
# Run the complete setup script
start-complete.bat
```

This will automatically:
- Start Docker services (PostgreSQL, Redis, PgAdmin)
- Set up the database with migrations and seed data
- Start the backend server on port 3001
- Start the frontend server on port 3002

## 🔧 Manual Setup

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Start Docker services
npm run docker:dev

# Wait for database to be ready (30 seconds)
# Then run database setup
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed

# Start backend server
npm run start:dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

## 🌐 Access Points

After successful setup, access the platform at:

- **Frontend Application**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Database Admin (PgAdmin)**: http://localhost:5050
- **Health Check**: http://localhost:3001/health

## 👥 Test Credentials

### Admin Access
- **Email**: ashutosh@curelex.com
- **Password**: admin@123
- **Role**: System Administrator

### Doctor Access
- **Email**: doctor@healthcare.com
- **Password**: DocPass123!
- **Role**: Senior Doctor (Cardiology)

### Junior Doctor Access
- **Email**: junior@healthcare.com
- **Password**: DocPass123!
- **Role**: Junior Doctor (General Medicine)

### Patient Access
- **Email**: patient@healthcare.com
- **Password**: PatPass123!
- **Role**: Patient

### Executive Access
- **Email**: ceo@healthcare.com
- **Password**: TempPass123!
- **Role**: CEO

## 🗄️ Database Access

### PgAdmin Access
- **URL**: http://localhost:5050
- **Email**: admin@healthcare.com
- **Password**: admin123

### Database Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: healthcare_db
- **Username**: postgres
- **Password**: password

## 🔧 Development Commands

### Backend Commands
```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Run migrations
npm run prisma:reset       # Reset database
npm run db:setup           # Complete database setup

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run with coverage

# Docker
npm run docker:dev         # Start Docker services
npm run docker:down        # Stop Docker services
```

### Frontend Commands
```bash
# Development
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production build

# Testing
npm run test               # Run tests
npm run test:a11y          # Run accessibility tests
npm run test:coverage      # Run with coverage

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking
```

## 🏗️ Project Structure

```
healthcare-telemedicine-platform/
├── src/                          # Backend source code
│   ├── common/                   # Shared utilities
│   ├── config/                   # Configuration files
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication
│   │   ├── patient/              # Patient management
│   │   ├── doctor/               # Doctor management
│   │   ├── appointment/          # Appointment system
│   │   ├── vitals/               # Vitals monitoring
│   │   ├── prescription/         # Prescription management
│   │   ├── notification/         # Notification system
│   │   └── integration/          # External integrations
│   ├── app.module.ts             # Main application module
│   └── main.ts                   # Application entry point
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── app/                  # Next.js app directory
│   │   ├── components/           # Reusable components
│   │   ├── lib/                  # Utility libraries
│   │   ├── store/                # State management
│   │   └── types/                # TypeScript types
│   └── public/                   # Static assets
├── prisma/                       # Database schema and migrations
├── docker-compose.dev.yml        # Docker development setup
└── README.md                     # This file
```

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (9 user roles)
- **Multi-factor Authentication** support
- **Device Fingerprinting** for security
- **Rate Limiting** and **CORS** protection
- **Password Encryption** with bcrypt
- **Session Management** with Redis
- **Audit Logging** for compliance

## 🏥 Core Features

### Patient Module
- ✅ Secure registration and login
- ✅ Digital health profile management
- ✅ Appointment booking system
- ✅ Medical report management
- ✅ Digital prescriptions
- ✅ Medication reminders
- ✅ Telemedicine consultations
- ✅ Recovery tracking

### Doctor Module
- ✅ Professional authentication
- ✅ Patient consultation dashboard
- ✅ Medical history access
- ✅ E-prescription system
- ✅ Diagnostic recommendations
- ✅ Treatment planning
- ✅ Teleconsultation management

### Hospital Operations
- ✅ Appointment flow management
- ✅ Doctor availability tracking
- ✅ Bed management system
- ✅ Patient flow analytics
- ✅ Resource scheduling
- ✅ Staff utilization tracking

### AI & Analytics
- ✅ Symptom pattern detection
- ✅ Appointment optimization
- ✅ Medication adherence prediction
- ✅ Recovery progress analysis
- ✅ Vital sign anomaly detection
- ✅ Risk assessment algorithms

## 🔧 Troubleshooting

### Common Issues

1. **Docker services not starting**
   ```bash
   # Check Docker Desktop is running
   docker --version
   
   # Restart Docker services
   npm run docker:down
   npm run docker:dev
   ```

2. **Database connection errors**
   ```bash
   # Wait for PostgreSQL to be ready
   # Check if port 5432 is available
   netstat -an | findstr 5432
   ```

3. **Frontend not connecting to backend**
   - Check if backend is running on port 3001
   - Verify CORS settings in main.ts
   - Check environment variables in .env.local

4. **Prisma migration issues**
   ```bash
   # Reset and recreate database
   npm run prisma:reset
   npm run prisma:migrate
   npm run prisma:seed
   ```

### Port Conflicts
If you encounter port conflicts, update these files:
- Backend port: `.env` file (PORT variable)
- Frontend port: `frontend/package.json` (dev script)
- Database port: `docker-compose.dev.yml`

## 📚 API Documentation

Comprehensive API documentation is available at:
- **Swagger UI**: http://localhost:3001/api/docs
- **OpenAPI Spec**: http://localhost:3001/api/docs-json

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/unified` - Unified login/register
- `POST /api/v1/auth/refresh` - Refresh JWT tokens
- `POST /api/v1/auth/logout` - Secure logout

#### Patient Management
- `GET /api/v1/patients/me` - Patient dashboard
- `POST /api/v1/patients/self-register` - Self registration
- `GET /api/v1/patients/:id/medical-history` - Medical records

#### Appointments
- `POST /api/v1/appointments` - Schedule appointment
- `GET /api/v1/appointments/upcoming/me` - Upcoming appointments
- `PATCH /api/v1/appointments/:id` - Update appointment

#### Vitals & Monitoring
- `POST /api/v1/vitals` - Record vital signs
- `GET /api/v1/vitals/patient/:id/latest` - Latest readings
- `GET /api/v1/vitals/anomalies/:patientId` - AI anomaly detection

## 🚀 Deployment

### Production Build
```bash
# Backend
npm run build:secure
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

### Environment Variables
Ensure all production environment variables are set:
- Database URLs
- JWT secrets
- API keys (Google Meet, Twilio, etc.)
- SMTP configuration

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review API documentation
- Check application logs in the console
- Verify environment configuration

---

**Built with ❤️ for better healthcare outcomes**