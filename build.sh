#!/usr/bin/env bash
# build.sh - Render build script

# Exit on error
set -o errexit

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build Next.js application
npm run build
