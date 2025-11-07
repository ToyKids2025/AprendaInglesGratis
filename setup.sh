#!/bin/bash

# English Flow - Development Setup Script
# Automates the setup of backend and frontend for local development

set -e  # Exit on any error

echo "🚀 English Flow - Development Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} found${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit backend/.env with your database credentials!${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npm run prisma:generate

# Ask if user wants to run migrations
echo ""
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running database migrations..."
    npm run prisma:migrate || echo -e "${YELLOW}⚠️  Migration failed. Make sure your DATABASE_URL is correct in .env${NC}"
fi

# Ask if user wants to seed database
echo ""
read -p "Do you want to seed the database with initial data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    npm run prisma:seed || echo -e "${YELLOW}⚠️  Seeding failed. Make sure migrations ran successfully.${NC}"
fi

echo -e "${GREEN}✓ Backend setup complete!${NC}"
cd ..
echo ""

# Frontend Setup
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete!${NC}"
cd ..
echo ""

# Final Instructions
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Configure your environment variables:"
echo "   - Edit backend/.env with your database URL and secrets"
echo "   - Add your OpenAI API key if you want to use AI features"
echo ""
echo "2. Start the development servers:"
echo ""
echo -e "   ${YELLOW}Terminal 1 (Backend):${NC}"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo -e "   ${YELLOW}Terminal 2 (Frontend):${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3001"
echo "   - Prisma Studio: npm run prisma:studio (in backend folder)"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - README.md - Complete project documentation"
echo "   - INSTALL.md - Detailed installation guide"
echo "   - ROADMAP_EXECUTIVO.md - 90-day development plan"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
