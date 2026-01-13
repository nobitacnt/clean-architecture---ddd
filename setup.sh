#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Clean Architecture + DDD Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Check if Docker is running
echo -e "${BLUE}Step 1: Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}\n"

# Step 2: Start PostgreSQL with Docker Compose
echo -e "${BLUE}Step 2: Starting PostgreSQL...${NC}"
docker-compose up -d
sleep 5
echo -e "${GREEN}✅ PostgreSQL started${NC}\n"

# Step 3: Copy environment file
echo -e "${BLUE}Step 3: Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Step 4: Install dependencies
echo -e "${BLUE}Step 4: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Step 5: Generate Prisma Client
echo -e "${BLUE}Step 5: Generating Prisma Client...${NC}"
npm run prisma:generate
echo -e "${GREEN}✅ Prisma Client generated${NC}\n"

# Step 6: Run migrations
echo -e "${BLUE}Step 6: Running database migrations...${NC}"
npm run prisma:migrate
echo -e "${GREEN}✅ Migrations completed${NC}\n"

# Success message
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   🎉 Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Run ${GREEN}npm run dev${NC} to start the development server"
echo -e "  2. Visit ${GREEN}http://localhost:3000/health${NC} to check server status"
echo -e "  3. Visit ${GREEN}http://localhost:3000/graphql${NC} for GraphQL playground"
echo -e "  4. Visit ${GREEN}http://localhost:3000/api/orders${NC} for REST API"
echo -e "\n${BLUE}Useful commands:${NC}"
echo -e "  - ${GREEN}npm run dev${NC}           - Start development server"
echo -e "  - ${GREEN}npm run prisma:studio${NC} - Open database GUI"
echo -e "  - ${GREEN}docker-compose down${NC}   - Stop database"
echo -e ""
