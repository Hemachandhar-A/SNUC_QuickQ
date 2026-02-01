# Hostel Mess Hub — Queue Intelligence Platform

Government-grade, real-time operational intelligence for high-density institutional queue management.  
**Stack:** React + Vite + Tailwind (Frontend) | Node.js + Express + Socket.IO (Backend).  
**Mode:** Real-time simulation, ML-ready, enterprise UI, mobile-responsive.

---

## Folder structure

```
HostelHack/
├── package.json                 # Root scripts (dev, install:all)
├── README.md
├── frontend/                    # React + Vite + Tailwind
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/                 # API client, Socket.IO
│       ├── store/               # Zustand
│       ├── theme/
│       ├── components/         # Shared UI
│       ├── layout/
│       └── pages/               # Role-based pages
├── backend/                     # Node + Express + Socket.IO
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config.js
│       ├── routes/
│       ├── services/            # Intelligence engine, event bus, ML placeholders
│       ├── socket/
│       └── store/               # In-memory analytics (simulation)
```

---

## Quick start

### 1. Install dependencies (one time)

From project root:

```bash
npm install
cd frontend
npm install
cd ../backend
npm install
```

(On Windows PowerShell, use separate lines or `;` instead of `&&`. From root: `npm install; cd frontend; npm install; cd ..\backend; npm install`.)

### 2. Run development

Use **two terminals** (recommended):

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```
Backend: http://localhost:3001

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
Frontend: http://localhost:5173

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3001  
- **Socket.IO:** Vite proxies `/socket.io` to the backend in dev; connect from the same origin.

### 3. Build for production

```bash
npm run build
npm run start:backend
```

Serve `frontend/dist` with any static host; API and Socket.IO from backend.

---

## ML-ready boundaries

Backend exposes these endpoints for future ML replacement (rule-based logic today):

- `POST /ai/predict_wait` — Wait time prediction  
- `POST /ai/forecast_demand` — Demand/attendance forecast  
- `POST /ai/detect_queue` — Queue/count detection  

Frontend never calls ML directly; it uses REST + Socket events. Swap backend handlers to real ML services without frontend changes.

---

## Roles & mock login

- **Student:** email any, password any → Student UI  
- **Staff:** email any, password any, role Staff → Staff UI  
- **Admin:** email any, password any, role Admin → Admin UI  

JWT is simulated; no real auth persistence.
