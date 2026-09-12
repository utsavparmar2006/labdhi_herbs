# Labdhi Herbs - Full-Stack Application

A modern, production-grade full-stack web application architecture built with Next.js (React + TypeScript), Express.js (Node.js + TypeScript), and MongoDB Atlas Cluster.

## 🚀 Architecture Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript, CSS Modules / Tailwind CSS.
- **Backend**: Express.js, TypeScript, Mongoose (MongoDB ODM), Helmet (Security), CORS, Morgan (HTTP Logging).
- **Database**: MongoDB Atlas Cluster connection via Mongoose.

---

## 📁 Directory Structure

```text
labdhi_herbs/
├── backend/                  # Express.js + TypeScript REST API
│   ├── src/
│   │   ├── config/           # Database configuration & environment setup
│   │   ├── controllers/      # Route controllers (business logic)
│   │   ├── middlewares/      # Error handler, Logger, Auth middlewares
│   │   ├── models/           # Mongoose Data Models
│   │   ├── routes/           # REST API Route declarations
│   │   ├── utils/            # Async handlers and helper utilities
│   │   ├── app.ts            # Express App initialization & middleware configuration
│   │   └── server.ts         # Server bootloader & Database connection
│   ├── .env                  # Private environment config
│   ├── .env.example          # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js App Router + TypeScript Frontend
│   ├── src/
│   │   ├── app/              # Next.js App router routes and components
│   │   ├── components/       # Reusable UI components
│   │   ├── services/         # API Service client layer
│   │   └── types/            # TypeScript type definitions
│   ├── .env.local            # Local frontend environment vars
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```
The backend API will run at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The Next.js application will run at `http://localhost:3000`.

---

## 🔒 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.j45e1ig.mongodb.net/labdhi_herbs?retryWrites=true&w=majority&appName=Cluter0
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```
