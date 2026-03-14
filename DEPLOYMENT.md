# VideoConnect Deployment Guide

## 🚀 Quick Deploy to Vercel + Railway

### Prerequisites
- GitHub account
- Vercel account (vercel.com)
- Railway account (railway.app)

### Step 1: Prepare Your Code
1. Push your code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy Backend to Railway
1. Go to [Railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub repo
4. Set environment variables in Railway dashboard:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `DB_URL`: Your MongoDB Atlas connection string
   - `CLIENT_URL`: Your Vercel frontend URL (add later)
5. Railway will auto-deploy your backend

### Step 3: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in
2. Click "New Project" → "Import Git Repository"
3. Select your GitHub repo and configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
5. Deploy!

### Step 4: Update Environment Variables
1. In Railway: Update `CLIENT_URL` with your Vercel frontend URL
2. In Vercel: Update `VITE_API_URL` with your Railway backend URL

## 🔧 Manual Deployment Options

### Alternative Backend Deployment
- **Render**: Similar to Railway, supports Node.js + WebSockets
- **Heroku**: Add `engines` to package.json: `"node": "18.x"`
- **DigitalOcean**: Use App Platform or Droplets

### Alternative Frontend Deployment
- **Netlify**: Drag & drop `dist` folder or connect GitHub
- **Firebase**: `firebase deploy` after `npm run build`
- **GitHub Pages**: Use `gh-pages` package

## 🌐 Domain & HTTPS
- All services provide free HTTPS certificates
- Custom domains available on paid plans
- WebRTC requires HTTPS in production

## 🔑 Environment Variables Checklist
- [ ] `DB_URL` - MongoDB Atlas connection
- [ ] `CLIENT_URL` - Frontend URL
- [ ] `VITE_API_URL` - Backend URL
- [ ] Clerk keys (if using auth)
- [ ] Stream keys (if using)

## 🧪 Testing Production
1. Create a room on your deployed app
2. Open the same room URL in another browser/incognito
3. Test video calling and chat
4. Verify WebRTC connection works

## 🚨 Important Notes
- WebRTC requires HTTPS in production
- Update CORS origins with your actual domain
- Monitor Railway/Vercel logs for errors
- Free tiers have usage limits