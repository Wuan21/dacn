#!/usr/bin/env bash
# build.sh - Render build script for MongoDB

# Exit on error
set -o errexit

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema to MongoDB (no migrations needed)
npx prisma db push

# Build Next.js application
npm run build
