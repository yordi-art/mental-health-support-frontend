# Mental Health Support System — Setup Guide

## Running on GitHub Codespaces (Recommended)

### Step 1 — Open two terminals in Codespace

Use the split terminal button or press `Ctrl+Shift+5`.

---

### Step 2 — Backend (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

Backend runs on port **5000**.
In Codespaces, it will be forwarded automatically — copy the forwarded URL from the **Ports** tab.

---

### Step 3 — Frontend (Terminal 2)

```bash
cd app
npm install
npm run dev -- --host
```

Frontend runs on port **5173**.
Open the forwarded URL from the **Ports** tab in your browser.

---

### Step 4 — Connect frontend to backend in Codespaces

The frontend `.env` already has:
```
VITE_API_URL=/api
```

This works when both run on the same host. If you get API errors, update `app/.env`:
```
VITE_API_URL=https://<your-codespace-name>-5000.app.github.dev/api
```

Replace `<your-codespace-name>` with your actual Codespace name from the Ports tab.

---

## Backend Environment Variables

The `backend/.env` file is **not committed to git**. Create it manually:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your MongoDB URI:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mental-health-app
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:5173
DEV_MODE=false
```

> **DEV_MODE=false** means real AI license verification runs.
> Set `DEV_MODE=true` only for local testing to skip verification.

---

## How Therapist Verification Works

1. Therapist fills the 4-step registration form
2. Uploads license document (PDF or image)
3. Backend runs AI verification:
   - Extracts text via OCR (pytesseract / PyMuPDF)
   - Checks expiry date, license number format, issuing authority, name match
   - ML model gives secondary confidence score
4. Result:
   - **VERIFIED** → therapist is auto-redirected to dashboard and appears in client search
   - **PENDING / REJECTED / EXPIRED** → therapist sees result screen with a manual "Go to Dashboard" button

Only **VERIFIED** therapists appear in the client dashboard and therapist search.

---

## Running Locally (without Codespaces)

**Terminal 1 — Backend:**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd app && npm install && npm run dev
```

Open: **http://localhost:5173**

---

## Push to GitHub

```bash
git add .
git commit -m "your message"
git push
```

> `backend/.env` is in `.gitignore` and will NOT be pushed. Use `.env.example` as reference.
