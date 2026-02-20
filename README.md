# TOCA Player Portal

A small fullstack demo: React + Vite frontend and a TypeScript Express backend.

## Quick overview
- Frontend: `frontend/` (Vite + React)
- Backend: `backend/` (Express + TypeScript)

## Prerequisites
- Node.js (I used v18.20.8)
- npm (or yarn)

## Run locally (development)
1. Start the backend (dev):

```bash
cd backend
npm install
npm run dev
```

2. Start the frontend (Vite):

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:4000` in development.

## Build frontend for production

```bash
cd frontend
npm run build