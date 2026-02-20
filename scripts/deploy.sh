#!/bin/bash
# Training Dashboard Deployment Script
# Run this from the Lightsail browser-based SSH terminal

set -e

echo "=== Training Dashboard Deployment ==="
echo "Started at: $(date)"

cd ~/training_dashboard

echo ""
echo "1. Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main

echo ""
echo "2. Installing server dependencies..."
cd server
npm install

echo ""
echo "3. Installing client dependencies..."
cd ../client
npm install

echo ""
echo "4. Building frontend..."
npm run build

echo ""
echo "5. Initializing database..."
cd ../server
npm run db:init 2>/dev/null || true
npm run db:seed 2>/dev/null || true

echo ""
echo "6. Restarting PM2..."
pm2 restart all || pm2 start src/server.js --name training-dashboard

echo ""
echo "=== Deployment Complete ==="
echo "Finished at: $(date)"
echo ""
echo "Test the application:"
echo "  Health check: curl http://localhost:3001/api/health"
echo "  Public URL: http://$(curl -s ifconfig.me):3001"
