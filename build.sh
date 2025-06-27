#!/bin/bash

# Build client
echo "Building client..."
cd client
npm ci
npm run build
cd ..

# Build server
echo "Building server..."
cd server
npm ci
npm run build
cd ..

# Run migrations
echo "Running database migrations..."
cd server
npm run migrate
cd ..

echo "Build completed successfully!"