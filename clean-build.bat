@echo off
echo Cleaning build cache...
rmdir /s /q dist 2>nul
rmdir /s /q node_modules\.cache 2>nul
del /q tsconfig.tsbuildinfo 2>nul

echo Installing dependencies...
call npm install

echo Building project...
call npm run build

echo Build complete!
pause