# 🏭 Lokate — Multi-Warehouse Inventory & Location Tracking System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-lokate1.onrender.com-brightgreen?style=for-the-badge)](https://lokate1.onrender.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

> **🚀 Live at:** [https://lokate1.onrender.com](https://lokate1.onrender.com)

---

## 📋 Overview

**Lokate** is an end-to-end multi-warehouse inventory and location tracking platform built for the e-commerce supply chain. It enables real-time product-to-bin mapping, intelligent order routing, full stock movement audit trails, and an admin dashboard with low-stock alerts — all in a sleek, dark-mode UI.

---

## ✨ Features

### 🗺️ Location Hierarchy
- **Warehouse → Row → Bin** hierarchy with unique location codes per bin (e.g. `A-01-01`)
- Interactive India map showing all warehouse locations with state-level drill-down
- Clickable warehouse cards with full capacity, contact, and facility details

### 📦 Inventory & Product-to-Bin Mapping
- Live quantity tracking per bin location
- Product search — type a product name and instantly see its bin location(s) and available quantity
- Inventory records with SKU, lot number, expiry date, and temperature zone

### 🛒 Order Intake & Smart Routing
- Submit an order with any destination address
- System instantly calculates driving distance & weather-adjusted ETA to each warehouse
- Returns the **exact Row/Bin** to pick from, ranked by proximity and stock availability
- Auto-decrements inventory and logs an outward stock movement on fulfillment

### 📊 Stock Movement Audit Log
- Every inward, outward, and transfer movement is recorded with timestamp and note
- Full history visible on the Dashboard under **Recent Movements**
- Movements are automatically generated on order fulfillment

### 🔔 Admin Dashboard
- **Stock overview by Row** — bar chart showing aggregated stock per row across all warehouses
- **Low-stock alerts** — real-time threshold-based alerts with CRITICAL / LOW severity
- **Capacity utilization** — per-facility stacked bar chart and donut chart
- **Active deliveries** — live count of pending, in-transit, and delayed shipments

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **UI / Animation** | Framer Motion, Recharts, Three.js / React Three Fiber |
| **Maps** | Pure SVG + D3-Geo (no external map library) |
| **State / Data** | TanStack Query v5, Axios |
| **Backend** | FastAPI (Python 3.12), SQLAlchemy (async), Alembic |
| **Database** | PostgreSQL 16 |
| **Infrastructure** | Docker Compose (local), Render (production) |

---

## 🚀 Running Locally

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### 1. Clone the repo
```bash
git clone https://github.com/Dhyan011/Lokate1.git
cd Lokate1
```

### 2. Start the Backend (API + Database)
```bash
cd backend
docker-compose up -d
```

The FastAPI server will be available at **http://localhost:8000**
API docs at **http://localhost:8000/docs**

### 3. Seed the Database (first run only)
```bash
cd backend
docker-compose run --rm api python -m app.db.seed --reset
```

### 4. Start the Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend available at **http://localhost:5173**

---

## 📁 Project Structure

```
Lokate/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── models/           # SQLAlchemy ORM models
│   │   │   ├── warehouse.py  # Warehouse, Row, Bin
│   │   │   ├── inventory.py  # InventoryItem
│   │   │   ├── movement.py   # StockMovement
│   │   │   └── order.py      # Order, OrderLineItem
│   │   ├── routers/          # FastAPI route handlers
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (pick suggestion, routing)
│   │   └── db/seed.py        # Demo data seeder
│   ├── alembic/              # Database migrations
│   └── docker-compose.yml
│
└── frontend/                 # React + Vite frontend
    └── src/
        ├── api/hooks.ts      # TanStack Query API hooks
        ├── components/
        │   ├── map/          # India SVG map (d3-geo)
        │   └── ui/           # Shared UI components
        ├── routes/           # Page components
        │   ├── Dashboard.tsx # Admin dashboard & alerts
        │   ├── MapPage.tsx   # Warehouse map view
        │   ├── OrderIntake.tsx # Order submission & routing
        │   ├── ProductSearch.tsx # Product/bin search
        │   └── Tracking.tsx  # Delivery tracking
        └── types/index.ts    # Shared TypeScript types
```

---

## 🌐 Deployment

Deployed on **Render** using a Blueprint (`render.yaml`):
- **PostgreSQL** — Render managed database
- **Backend** — Python web service (FastAPI + Uvicorn)
- **Frontend** — Static site (Vite build)

**Live URL:** [https://lokate1.onrender.com](https://lokate1.onrender.com)

---

## 📸 Screenshots

| Dashboard | Map View | Order Intake |
|---|---|---|
| Stock overview, low-stock alerts, capacity charts | Interactive India map with warehouse markers | Smart routing to exact bin location |

---

## 👥 Team

Built for a Hackathon — E-Commerce Multi-Warehouse Inventory & Location Tracking System.

---

## 📄 License

MIT
