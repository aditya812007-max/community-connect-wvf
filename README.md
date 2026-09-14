# Community Connect — White Volunteers Foundation

A structured, responsive web application for **White Volunteers Foundation** designed to make community teaching consistent, student progress measurable, volunteer support personalized, and early childhood learning engaging.

---

## 🚀 Key Features

1. **Role-Based Access Control & Quick Switcher**:
   - **Admin / NGO**: Real-time KPI metrics, attendance rates, learning-level distributions, student management, weekly teaching plan builder, and session audit logs.
   - **Volunteer / Teacher**: Step-by-step classroom session runner (Attendance $\rightarrow$ 1-5 Performance Ratings $\rightarrow$ Observations & Areas Needing Help $\rightarrow$ Session Finalization).
   - **Student / Child (Classes 1–4)**: High-contrast, playful UI with big touch cards, interactive animal/fruit counting math game, phonics word match, interactive HTML5 drawing canvas, and personal milestone badges.
   - **Instant Demo Switcher**: Seamlessly test all three roles via the header switcher.

2. **Learning Levels over Strict Ages**:
   - Groups students into **Beginner**, **Intermediate**, and **Advanced** stages so volunteers can tailor instruction.

3. **Extensible AI Architecture**:
   - Includes baseline heuristics and endpoints (`/api/ai/recommend-level` and `/api/ai/recommend-activities`) ready to plug into Gemini API models.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3), SQLAlchemy ORM, SQLite, Pydantic, Python-JOSE (JWT), Pytest.
- **Frontend**: React 19 (TypeScript), Vite, Tailwind CSS, Lucide React, Canvas Confetti.

---

## 🏃 Getting Started

### 1. Backend Server (FastAPI)
```powershell
# Activate virtual environment and run the server
.\venv\Scripts\uvicorn.exe server.app.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Client (React + Vite)
```powershell
cd client
npm run dev
```
Open your browser at: `http://localhost:5173`

### 3. Run Automated Tests
```powershell
.\venv\Scripts\pytest.exe test_api.py
```
