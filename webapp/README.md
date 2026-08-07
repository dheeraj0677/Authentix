# Authentix — Full-Stack Web Application (`webapp`)

The Web Application wires Module 1 (Deep Learning Detector) and Module 2 (Blockchain Smart Contract Registry) together into a cohesive web interface.

---

## 🏗️ Stack Architecture

- **Backend**: FastAPI, Python 3.10+, SQLAlchemy, SQLite caching, Web3.py
- **Frontend**: React 18, Tailwind CSS, Vite, Ethers.js v6, Lucide React

---

## ⚡ Running Backend (FastAPI)

1. Install dependencies:
```bash
cd webapp/backend
pip install -r requirements.txt
```

2. Start server:
```bash
uvicorn main:app --reload --port 8000
```

API docs will be live at `http://localhost:8000/docs`.

---

## ⚛️ Running Frontend (React + Vite)

1. Install dependencies:
```bash
cd webapp/frontend
npm install
```

2. Start dev server:
```bash
npm run dev
```

App will be available at `http://localhost:5173`.
