# Hostel Mess Hub — Queue Intelligence Platform

Deployment link: https://cyanic-globularly-keeley.ngrok-free.dev/login

Government-grade, real-time operational intelligence for high-density institutional queue management (e.g. hostel mess, cafeterias). Single comprehensive guide for the full stack, ML pipeline, and deployment.

**Stack:** React + Vite + Tailwind (Frontend) | Node.js + Express + Socket.IO (Backend) | optional Python/YOLOv8 (person detection).  
**Mode:** Real-time simulation, ML-ready, enterprise UI, mobile-responsive.

---

## Repository structure

```
HostelHack/
├── README.md                    # This file — full project guide
├── package.json                 # Root scripts (dev, install:all, build)
├── SNUC_QuickQ/
│   ├── README.md                # Short pointer to this README
│   ├── package.json             # Monorepo root (dev, install:all)
│   ├── frontend/                # React + Vite + Tailwind
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.jsx, App.jsx, index.css
│   │       ├── api/              # REST client, Socket.IO
│   │       ├── store/            # Zustand (auth, realtime)
│   │       ├── components/       # Shared UI (Card, Button, Badge, etc.)
│   │       ├── layout/           # Admin, Staff, Student layouts
│   │       └── pages/            # Role-based: Admin, Staff, Student
│   └── backend/                 # Node + Express + Socket.IO
│       ├── package.json
│       ├── src/
│       │   ├── index.js          # Server entry, routes, Socket, DB init
│       │   ├── config.js         # Simulation intervals, ports
│       │   ├── db/               # SQLite (better-sqlite3) — staff state, alerts, AI feed
│       │   ├── routes/           # auth, analytics, staff, system, ai
│       │   ├── services/         # Intelligence engine, event bus, ML placeholders, simulated sensors
│       │   ├── socket/           # Socket.IO handler
│       │   └── store/            # In-memory analytics (simulation)
│       └── python/              # Optional YOLOv8 queue detection
│           ├── README.md        # YOLO setup and video requirements
│           ├── requirements.txt
│           ├── yolo_detect.py
│           ├── download_sample_video.py
│           └── sample.mp4       # (add or download — see below)
```

---

## Quick start

### 1. Install dependencies (one time)

From **HostelHack** (or **SNUC_QuickQ**) root:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

On Windows PowerShell you can use:  
`npm install; cd frontend; npm install; cd ..\backend; npm install`

The backend creates the `backend/data/` directory automatically on first run (for SQLite).

### 2. Run development (two terminals)

**Terminal 1 — Backend**
```bash
cd SNUC_QuickQ/backend
npm run dev
```
→ Backend: http://localhost:3001

**Terminal 2 — Frontend**
```bash
cd SNUC_QuickQ/frontend
npm run dev
```
→ Frontend: http://localhost:5173

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3001  
- **Socket.IO:** Vite proxies `/socket.io` to the backend in dev; connect from the same origin.

### 3. Build for production

```bash
npm run build
npm run start:backend
```

Serve `frontend/dist` with any static host; API and Socket.IO from the backend.

---

## Optional: real person detection (YOLOv8)

The queue monitor can use **YOLOv8** to detect persons in a video and stream bounding boxes to the dashboard.

- **No video** → backend sends a no-video state (no random boxes, count 0).
- **With video** → backend runs the Python script and emits real detection over Socket.IO.

**Setup:**

1. **Install Python deps** (once), from `SNUC_QuickQ/backend/python/`:
   ```bash
   pip install -r requirements.txt
   ```
   Installs `ultralytics` (YOLOv8) and `opencv-python-headless`. First run downloads `yolov8n.pt`.

2. **Add a video file** in `backend/python/`:  
   Supported: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm` (e.g. `sample.mp4`).

3. **Restart the Node backend** so it picks up the video and starts the YOLO process.

**Sample video (optional):**
```bash
cd SNUC_QuickQ/backend/python
python download_sample_video.py
```
Then restart the backend.

---

## Roles and mock login

| Role    | Login (any email, any password) | Role field  | UI        |
|---------|---------------------------------|------------|-----------|
| Student | any / any                       | (default)  | Student   |
| Staff   | any / any                       | Staff      | Staff     |
| Admin   | any / any                       | Admin      | Admin     |

JWT is simulated; no real auth persistence.

---

## ML-ready boundaries

Backend exposes these endpoints for future ML replacement (rule-based logic today):

- `POST /ai/predict_wait` — Wait time prediction  
- `POST /ai/forecast_demand` — Demand/attendance forecast  
- `POST /ai/detect_queue` — Queue/count detection  

Frontend uses REST + Socket events only; swap backend handlers to real ML services without frontend changes.

---

## Key features

- **Real-time simulation:** Queue count, wait prediction, shock events, fairness audits, sustainability metrics (waste, completion, carbon/water impact).
- **Sustainability analytics:** Trend lines and heatmaps driven by the closed simulation (backend emits full metrics; frontend shows live and historical).
- **Admin:** Overview KPIs, congestion heatmap, demand forecast, fairness audit, sustainability intelligence.
- **Staff:** Dashboard, queue monitor, shock events.
- **Student:** Home, alerts/fairness, sustainability log.
- **SQLite:** Staff state, alerts, AI feed persisted; analytics store is in-memory for simulation (replace with DB in production).

---

## Configuration

- **Backend:** `backend/src/config.js` — simulation intervals (queue, wait prediction, sustainability, etc.), ports.
- **Frontend:** Vite proxy in `vite.config.js` for `/api` and `/socket.io` to the backend.

---

## Troubleshooting

- **"Cannot open database because the directory does not exist"**  
  The backend now creates `backend/data/` automatically. If you are on an older version, create `backend/data` manually or pull the latest fix.

- **No video / no detection**  
  Ensure a video file exists in `backend/python/` and the backend has been restarted. See *Optional: real person detection* above.

- **Socket not updating**  
  Ensure backend is running on the port Vite proxies to (default 3001) and that no firewall blocks it.
