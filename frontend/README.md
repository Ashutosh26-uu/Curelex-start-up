# Healthcare Telemedicine Platform - Frontend

A modern Next.js 15 frontend application for the healthcare telemedicine platform with role-based access control and separate portals for patients, doctors, and officers.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for API calls and caching
- **Role-based navigation** and route guards
- **Responsive design** with mobile support
- **Reusable UI components**

## User Portals

### Patient Portal (`/patient`)
- Dashboard with appointments and vitals overview
- Appointment management and scheduling
- Medical history and records
- Profile management
- Real-time notifications

### Doctor Portal (`/doctor`)
- Patient management dashboard
- Appointment scheduling and management
- Patient records and medical history
- Prescription management
- Visit history tracking

### Officer Portal (`/officer`)
- Executive dashboard with system analytics
- Appointment and patient analytics
- System performance metrics
- Reports and insights
- Administrative controls

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **API Client**: Axios with React Query
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── patient/           # Patient portal pages
│   ├── doctor/            # Doctor portal pages
│   ├── officer/           # Officer portal pages
│   ├── login/             # Authentication
│   └── providers/         # React Query provider
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── guards/           # Route protection
├── lib/                  # Utilities and API client
├── store/                # Zustand stores
└── types/                # TypeScript definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 3000

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open application**:
   ```
   http://localhost:3001
   ```

## Authentication & Authorization

### Role-Based Access Control

The application implements comprehensive RBAC with the following roles:

- **PATIENT**: Access to patient portal and personal data
- **DOCTOR/JUNIOR_DOCTOR**: Access to doctor portal and assigned patients
- **CEO/CTO/CFO/CMO/ADMIN**: Access to officer portal and analytics

### Route Protection

- **AuthGuard**: Ensures user is authenticated
- **RoleGuard**: Restricts access based on user roles
- **Automatic redirects** based on user role after login

### Navigation Guards

```typescript
// Protect routes with role-based access
<RoleGuard allowedRoles={[UserRole.PATIENT]}>
  <PatientDashboard />
</RoleGuard>
```

## State Management

### Zustand Stores

- **Auth Store**: User authentication and profile data
- **Persistent storage** with automatic token management
- **Automatic logout** on token expiration

```typescript
const { user, login, logout } = useAuthStore();
```

## API Integration

### React Query Setup

- **Automatic caching** and background refetching
- **Error handling** with automatic retries
- **Loading states** and optimistic updates

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['appointments'],
  queryFn: () => appointmentApi.getUpcoming(),
});
```

### API Client

- **Axios interceptors** for token management
- **Automatic logout** on 401 responses
- **Type-safe** API methods

## UI Components

### Reusable Components

- **Button**: Multiple variants and sizes
- **Input**: Form inputs with validation
- **Card**: Content containers
- **Layout**: Dashboard and authentication layouts

### Design System

- **Consistent spacing** and typography
- **Color palette** with semantic meanings
- **Responsive breakpoints**
- **Accessibility** compliant components

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

## Security Features

- **JWT token management** with secure storage
- **Role-based route protection**
- **XSS protection** with input sanitization
- **CSRF protection** with SameSite cookies
- **Secure headers** configuration

## Performance Optimizations

- **Code splitting** with Next.js App Router
- **Image optimization** with Next.js Image component
- **API response caching** with React Query
- **Bundle analysis** and optimization

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.