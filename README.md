# Healthcare Telemedicine Platform

A comprehensive NestJS monorepo for healthcare telemedicine platform with role-based access control, appointment scheduling, vitals monitoring, and Google Meet integration.

## Features

- **Authentication & Authorization**: JWT-based auth with RBAC (9 roles)
- **Patient Management**: Registration, medical history, profile management
- **Doctor Management**: Patient assignments, prescriptions, visit history
- **Officer Dashboard**: Analytics and role-based access for executives
- **Appointment System**: Scheduling with Google Meet integration
- **Vitals Monitoring**: BP, heart rate, oxygen, sugar tracking by junior staff
- **Notifications**: Email, SMS, and push notifications
- **Admin Panel**: User management and doctor assignments
- **Audit Logging**: Complete audit trails for all actions
- **Integration**: Google Meet API for video consultations

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT, Passport
- **Notifications**: Nodemailer (Email), Twilio (SMS)
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## User Roles

1. **PATIENT** - Book appointments, view medical history
2. **DOCTOR** - Manage patients, create prescriptions
3. **JUNIOR_DOCTOR** - Record vitals, assist senior doctors
4. **NURSE** - Patient care, vital monitoring
5. **CEO** - Executive dashboard and analytics
6. **CTO** - Technical oversight and system analytics
7. **CFO** - Financial analytics and reporting
8. **CMO** - Medical operations oversight
9. **ADMIN** - System administration and user management

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd healthcare-telemedicine-platform
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**:
   ```bash
   npm run docker:dev
   ```

4. **Database setup**:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Start application**:
   ```bash
   npm run start:dev
   ```

## API Documentation

Access Swagger documentation at: `http://localhost:3000/api/docs`

## Key API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Patients
- `GET /api/v1/patients` - List all patients
- `GET /api/v1/patients/:id` - Get patient details
- `GET /api/v1/patients/:id/medical-history` - Patient medical history
- `GET /api/v1/patients/:id/past-visits` - Patient visit history

### Doctors
- `GET /api/v1/doctors/:id/patients` - Assigned patients
- `POST /api/v1/doctors/prescriptions` - Create prescription
- `GET /api/v1/doctors/:id/visit-history` - Doctor's visit history

### Appointments
- `POST /api/v1/appointments` - Schedule appointment
- `GET /api/v1/appointments/upcoming/me` - User's upcoming appointments
- `PATCH /api/v1/appointments/:id` - Update appointment

### Vitals
- `POST /api/v1/vitals` - Record vital signs
- `GET /api/v1/vitals/patient/:id/latest` - Latest vitals
- `GET /api/v1/vitals/patient/:id/history` - Vital history

### Officer Dashboard
- `GET /api/v1/officer/dashboard` - Dashboard analytics
- `GET /api/v1/officer/analytics/appointments` - Appointment analytics
- `GET /api/v1/officer/analytics/patients` - Patient analytics

### Admin
- `POST /api/v1/admin/assign-doctor` - Assign doctor to patient
- `GET /api/v1/admin/users` - Manage users
- `GET /api/v1/admin/stats` - System statistics

### Notifications
- `GET /api/v1/notifications/me` - User notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - Base user authentication
- **Profiles** - User profile information
- **Patients** - Patient-specific data
- **Doctors** - Doctor-specific data
- **Officers** - Executive role data
- **Appointments** - Appointment scheduling
- **Vitals** - Patient vital signs
- **Prescriptions** - Medical prescriptions
- **Notifications** - System notifications
- **AuditLogs** - Activity tracking

## Development

### Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run prisma:studio` - Open Prisma Studio
- `npm run docker:dev` - Start Docker development environment
- `npm run docker:down` - Stop Docker containers

### Project Structure

```
src/
├── common/           # Shared utilities, guards, decorators
├── modules/          # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── patient/      # Patient management
│   ├── doctor/       # Doctor management
│   ├── officer/      # Officer dashboard
│   ├── appointment/  # Appointment scheduling
│   ├── vitals/       # Vitals monitoring
│   ├── notification/ # Notification system
│   ├── admin/        # Admin panel
│   ├── logging/      # Audit logging
│   └── integration/  # External integrations
├── config/           # Configuration files
└── main.ts          # Application entry point
```

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Request rate limiting
- Input validation and sanitization
- Audit logging for all operations
- Secure password hashing with bcrypt

## Monitoring & Logging

- Complete audit trails for all user actions
- Request/response logging
- Error tracking and monitoring
- Performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.