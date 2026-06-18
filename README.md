# Service Proof

Service Proof is a complete vehicle service transparency ecosystem (inspired by Xtime). It includes a **Multi-Point Inspection (MPI)** engine, advisor-customer chat channels, digital signature approvals, and visual **Proof-of-Work Verification** (video streams of fluid drainages, tire wall tread depths, brake pads, etc.) to bridge the trust gap between workshops and vehicle owners.

## Monorepo Architecture

The repository is structured as a unified monorepo:

- **`api/`**: Node.js backend server managing CRUD actions and websocket/polling synchronization. It supports connecting to a cloud **MongoDB Atlas** database, and automatically falls back to a local `db.json` database if no connection URI is configured.
- **`web/`**: Vite + React modern glassmorphic web dashboard containing 4 dedicated roles:
  - **Technician Workbench**: Perform inspections, capture photo/video proof, and sign off.
  - **Advisor Dashboard**: Track progress, start chat threads, inspect items, and request QC.
  - **Customer Portal**: Review estimates itemized by categories (OEM vs. Repair vs. Value-Added Service) with attached visual evidence, approve/decline, and sign off.
  - **Manager Analytics**: View live throughput, average repair approvals, and revenue metrics.
- **`mobile/`**: Expo + React Native mobile application for customers to track service in real time, view proofs, accept/decline repairs, and review their digital vehicle service history passport.

---

## Local Setup

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Run the API Server
```bash
cd api
npm install
npm start
```
*By default, the server runs on port `3001` and reads/writes to `db.json`. If you create a `.env` file containing `MONGODB_URI`, the server will connect to MongoDB Atlas and seed the collection with the initial values from `db.json` automatically.*

### 2. Run the Web Dashboard
```bash
cd web
npm install
npm run dev
```
*The web dashboard runs on port `5173`. To point to a custom API URL, create a `.env` file containing `VITE_API_URL=https://your-api-url.onrender.com/api/data`.*

### 3. Run the Customer Mobile App
```bash
cd mobile
npm install
npm run start
# Or for web output:
npm run web
```
*To test sync with your local machine or staging servers, tap the **Settings Gear Icon** in the top right header of the mobile app to type in the API server IP address.*

---

## Deployment Guide

### API Server (Render Deployment)
1. Log in to [Render](https://render.com/).
2. Click **New +** > **Web Service**.
3. Link your GitHub repository and select the `service-proof-repo` project.
4. Set the following settings:
   - **Root Directory**: `api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `MONGODB_URI`: *Your MongoDB Atlas Connection URI* (e.g. `mongodb+srv://...`)
   - `PORT`: `3001`

### Web Dashboard (Vercel Deployment)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** > **Project** and select your GitHub repository.
3. In the project configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `web`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: *Your deployed Render API endpoint URL + `/api/data`* (e.g. `https://service-proof-api.onrender.com/api/data`)
5. Click **Deploy**.

---

## Database Configuration (MongoDB Atlas Free Tier)
To create a free MongoDB database:
1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster (M0 Free Tier).
3. Under **Database Access**, create a user with read/write permissions.
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) since Render uses dynamic IP addresses.
5. Copy the connection string (with your username and password) and plug it into Render's `MONGODB_URI` environment variable.
