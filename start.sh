#!/bin/bash

# Script to start the application with necessary setup steps

echo "Starting application setup..."

# Step 1: Check if .env file exists, if not copy from .env.example
if [ ! -f .env ]; then
    echo ".env file not found!"
    if [ -f .env.example ]; then
        echo "📋 Copying .env.example to .env..."
        cp .env.example .env
        echo ".env file created successfully!"
    else
        echo "Error: .env.example file not found!"
        echo "Please create a .env file manually."
        exit 1
    fi
else
    echo ".env file already exists"
fi

# Step 2: Start Docker Compose
echo "Starting Docker Compose..."
docker-compose up -d

# Wait a bit for the database to be ready
echo " Waiting for database to be ready..."
sleep 5

# Step 3: Generate Prisma Client
echo "Generating Prisma Client..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo " Error: Failed to generate Prisma Client"
    exit 1
fi

# Step 4: Run Prisma Migrations
echo "Running Prisma Migrations..."
npm run prisma:migrate

if [ $? -ne 0 ]; then
    echo "Error: Failed to run Prisma Migrations"
    exit 1
fi

# Step 5: Start the development server
echo "Starting development server..."
npm run dev
