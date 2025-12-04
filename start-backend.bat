@echo off
echo Starting Healthcare Telemedicine Platform Backend...
echo.

echo 1. Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo 2. Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo.
echo 3. Running database migrations...
npm run prisma:migrate

echo.
echo 4. Seeding database with sample data...
npm run prisma:seed

echo.
echo 5. Starting NestJS backend server...
npm run start:dev

pause