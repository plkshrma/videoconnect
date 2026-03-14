#!/bin/bash

echo "🚀 VideoConnect Deployment Script"
echo "================================="

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting."; exit 1; }

echo "✅ Prerequisites check passed"

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
echo "✅ Frontend built successfully"

# Go back to root
cd ..

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy' && git push"
echo "2. Deploy backend to Railway: https://railway.app"
echo "3. Deploy frontend to Vercel: https://vercel.com"
echo "4. Update environment variables in both services"
echo ""
echo "See DEPLOYMENT.md for detailed instructions"