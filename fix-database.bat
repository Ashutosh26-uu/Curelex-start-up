@echo off
echo ========================================
echo Fixing Database Connection Issue
echo ========================================

echo 1. Stopping any existing containers...
docker-compose -f docker-compose.dev.yml down

echo 2. Removing old volumes...
docker-compose -f docker-compose.dev.yml down -v

echo 3. Starting fresh database...
docker-compose -f docker-compose.dev.yml up -d

echo 4. Waiting for database to be ready...
timeout /t 30 /nobreak > nul

echo 5. Testing database connection...
docker exec healthcare_postgres pg_isready -U postgres

echo 6. Generating Prisma client...
npx prisma generate

echo 7. Running migrations...
npx prisma migrate dev --name init --skip-seed

echo 8. Seeding database...
node prisma/simple-seed.js

echo ========================================
echo Database is now ready!
echo ========================================
echo You can now start the backend with: npm run start:dev
pause