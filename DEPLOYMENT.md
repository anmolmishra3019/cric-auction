# 🚀 CricAuction AI — Deployment Guide

CricAuction AI is built as a single deployable Node.js + Express service with a compiled Vite + React single-page frontend.

---

## 🛠️ Build & Run Commands

| Action | Command |
|---|---|
| **Install Root & Client** | `npm install && cd client && npm install && cd ..` |
| **Build Frontend** | `cd client && npm run build && cd ..` |
| **Run Production Server** | `node server/server.js` (or `npm start`) |
| **Run Local Dev (Both)** | `npm run dev` |
| **Run Test Suite** | `npm test` |

---

## 🌐 Deploy to Render.com (Web Service)

1. Connect your GitHub repository to **Render.com**.
2. Select **Web Service**.
3. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd client && npm install && npm run build && cd ..`
   - **Start Command**: `node server/server.js`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default for Render)
5. Click **Deploy Web Service**!

---

## 🚂 Deploy to Railway / Fly.io

1. Connect your GitHub repository.
2. Ensure Node.js engine is 18+.
3. Build command: `npm install && npm run build --prefix client`
4. Start command: `node server/server.js`
5. Railway / Fly.io will automatically assign the port and bind WebSocket traffic.

---

## 🔐 Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Server listening port |
| `NODE_ENV` | `development` | Setting to `production` enables static file serving & strict CORS |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed origin for CORS & Socket.io handshakes in production |