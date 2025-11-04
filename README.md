# XY-DO Athletic Programs Backend

Backend API for the XY-DO Athletic Programs platform.

## Quick Deploy to Railway

### Step 1: Upload to GitHub

1. Create a new repository: `xydo-backend`
2. Upload all these files to the repository
3. Commit

### Step 2: Deploy on Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `xydo-backend`
5. Click "Deploy"

### Step 3: Add Environment Variables

In Railway, go to Variables tab and add:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://hateskate:%23n82424Thewedge%24n86283@xy-do.ezhkjdx.mongodb.net/xydo_athletic_programs?retryWrites=true&w=majority
JWT_SECRET=xydo_jaguars_secret_2024_basketball_development_platform
JWT_EXPIRE=30d
```

### Step 4: Get Your URL

1. Go to Settings → Networking
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://xydo-backend-production.up.railway.app`)

## API Endpoints

- `GET /` - API info
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/videos` - Get videos
- `GET /api/messages` - Get messages
- `POST /api/messages` - Post message
- `GET /api/teams` - Get teams
- `GET /api/content` - Get content

## Features

- ✅ Express.js server
- ✅ MongoDB connection
- ✅ CORS enabled
- ✅ All API routes ready
- ✅ Error handling
- ✅ Railway-ready configuration

## Local Development

```bash
npm install
npm start
```

Server runs on port 5000 by default.

