@echo off
echo Setting up Healthcare Platform Environment...

echo.
echo 1. Installing backend dependencies...
call npm install

echo.
echo 2. Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo 3. Setting up database...
call npx prisma generate
call npx prisma migrate dev --name init

echo.
echo 4. Seeding database...
call npm run prisma:seed

echo.
echo ✅ Setup complete!
echo.
echo To start the application:
echo   Backend:  npm run start:dev
echo   Frontend: cd frontend && npm run dev
echo.
echo Access URLs:
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:3001
echo   API Docs: http://localhost:3000/api/docs

pause