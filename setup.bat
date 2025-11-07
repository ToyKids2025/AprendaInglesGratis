@echo off
REM English Flow - Development Setup Script (Windows)
REM Automates the setup of backend and frontend for local development

echo.
echo 🚀 English Flow - Development Setup
echo ====================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% found

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION% found
echo.

REM Backend Setup
echo 📦 Setting up Backend...
cd backend

echo Installing backend dependencies...
call npm install

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✓ .env file created
    echo ⚠️  IMPORTANT: Edit backend\.env with your database credentials!
) else (
    echo ✓ .env file already exists
)

echo Generating Prisma Client...
call npm run prisma:generate

REM Ask if user wants to run migrations
echo.
set /p MIGRATE="Do you want to run database migrations now? (y/n) "
if /i "%MIGRATE%"=="y" (
    echo Running database migrations...
    call npm run prisma:migrate
)

REM Ask if user wants to seed database
echo.
set /p SEED="Do you want to seed the database with initial data? (y/n) "
if /i "%SEED%"=="y" (
    echo Seeding database...
    call npm run prisma:seed
)

echo ✓ Backend setup complete!
cd ..
echo.

REM Frontend Setup
echo 📦 Setting up Frontend...
cd frontend

echo Installing frontend dependencies...
call npm install

echo ✓ Frontend setup complete!
cd ..
echo.

REM Final Instructions
echo ✅ Setup Complete!
echo.
echo Next Steps:
echo.
echo 1. Configure your environment variables:
echo    - Edit backend\.env with your database URL and secrets
echo    - Add your OpenAI API key if you want to use AI features
echo.
echo 2. Start the development servers:
echo.
echo    Terminal 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo    Terminal 2 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://localhost:3001
echo.
echo 📚 Documentation:
echo    - README.md - Complete project documentation
echo    - INSTALL.md - Detailed installation guide
echo.
echo Happy coding! 🎉
echo.
pause
