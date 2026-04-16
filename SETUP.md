# Mental Health Support System - Setup & Running Guide

## Overview
This project is a full-stack Mental Health Support System with a React frontend and Node.js/Express backend. You'll need to run both servers.

---

## Prerequisites

Make sure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (optional, for cloning)

---

## Project Structure

```
mental-health-support-frontend/
├── app/                 # React frontend (Vite)
├── backend/             # Node.js/Express backend
└── SETUP.md            # This file
```

---

## Backend Setup & Running

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mental-health-app

# Server Port
PORT=5000

# JWT Secret (add your own random string)
JWT_SECRET=your_super_secret_jwt_key_change_this
```

**Options for MONGODB_URI:**
- **Local MongoDB**: `mongodb://localhost:27017/mental-health-app`
- **MongoDB Atlas (Cloud)**: `mongodb+srv://username:password@cluster.mongodb.net/mental-health-app`

### Step 4: Start the Backend Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

✅ Backend will run on: **http://localhost:5000**

---

## Frontend Setup & Running

### Step 1: Navigate to Frontend Directory (from root)
```bash
cd app
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables (Optional)

Create a `.env.local` file in the `app/` directory if you need a different API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note**: This is optional. By default, it connects to `http://localhost:5000/api`

### Step 4: Start the Frontend Server

**Development mode**:
```bash
npm run dev
```

✅ Frontend will run on: **http://localhost:5173** (or another port if 5173 is taken)

---

## Running Both Servers Together

### Option 1: Using Two Terminal Windows (Recommended)

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd app
npm run dev
```

Then open your browser and go to: **http://localhost:5173**

### Option 2: Using VS Code
1. Open the project in VS Code
2. Open two integrated terminals
3. In Terminal 1: `cd backend && npm run dev`
4. In Terminal 2: `cd app && npm run dev`

---

## Troubleshooting

### Frontend can't connect to backend
- **Problem**: "Failed to fetch" errors in console
- **Solution**: 
  - Ensure backend is running on `http://localhost:5000`
  - Check that `VITE_API_URL` is correct in `.env.local`
  - Check CORS is enabled (backend allows requests from `http://localhost:5173`)

### MongoDB connection error
- **Problem**: "MongoDB connection error"
- **Solution**:
  - If using local MongoDB: Make sure MongoDB service is running
  - If using MongoDB Atlas: Check your connection string in `.env`
  - Check network access (firewall may be blocking)

### Port already in use
- **Problem**: "Port 5000 already in use" or "Port 5173 already in use"
- **Solution**:
  - Backend: Change `PORT` in `.env` file
  - Frontend: Vite will automatically use the next available port

### Dependencies installation fails
- **Solution**: 
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## API Endpoints

Once both servers are running, test the API health:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-04-16T..."
}
```

---

## Building for Production

### Frontend Build
```bash
cd app
npm run build
```
Output will be in `app/dist/` folder

### Backend Production
```bash
cd backend
npm start
```

---

## Notes

- The frontend uses **React 19** with **Vite** for fast development
- The backend uses **Express.js** with **MongoDB** for data persistence
- **JWT** is used for authentication
- **CORS** is enabled for frontend-backend communication

---

## Next Steps

1. ✅ Start both servers
2. 🌐 Open `http://localhost:5173` in your browser
3. 🔐 Create an account or log in
4. 🎯 Start using the application

---

## Need Help?

Check the individual README files:
- Frontend: `app/README.md`
- Backend: `backend/README.md`
