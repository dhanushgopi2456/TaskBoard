# 🚀 TaskBoard — 3D Spatial Task Manager

> **A modern, responsive, animated 3D task manager built with React, Three.js, Framer Motion, Node.js/Express, and PostgreSQL/SQLite.**

---

## 🌟 Demo Credentials

| Role | Email | Password | Pre-seeded Sample Tasks |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo@taskboard.com` | `Demo@123` | 4 tasks (High, Medium, Low, Overdue, Completed) |

*(You can also click the **"Fill Demo Login"** button directly on the login screen for 1-click evaluation!)*

---

## 🎨 Animated 3D UI/UX Highlights

- **Interactive 3D WebGL Background**: Built with **Three.js** featuring floating geometric prisms (icosahedrons, torus knots, octahedrons) and interactive particle constellations that respond smoothly to cursor coordinates and device motion.
- **Interactive 3D Kanban Board**: Complete agile drag-and-drop workflow across **To Do**, **In Progress**, and **Done** columns with dynamic drop zones, glowing indicators, column task counters, and 1-click stage advancement buttons.
- **Dynamic Analytics & Charts View**: Real-time visual metrics dashboard featuring:
  - **Radial SVG Completion Gauge**: Animated circular progress ring with status velocity rating.
  - **Tasks by Priority Breakdown**: Comparative stacked/split bar charts comparing completed vs open tasks across High, Medium, and Low priorities.
  - **7-Day Weekly Schedule & Forecast**: Day-of-week workload distribution with a glowing indicator for "Today".
  - **Smart Productivity Recommendations**: Adaptive feedback based on deadlines and overdue workload.
- **Animated Toast Notification System**: Rich pop-up alerts with spring physics, auto-dismissing progress timer bars, type-specific ambient glows (`success`, `info`, `warning`, `error`, `delete`), and synthesized sound feedback on **every user action** (task creation, updates, completion, column drops, duplications, deletions, and filters).
- **3D Card Perspective Tilt**: Tasks and Stat cards utilize real-time CSS 3D matrix math (`rotateX`, `rotateY`) and specular light sheen reflecting cursor angle with spring physics.
- **Quick Productivity Actions**:
  - **Duplicate Task**: 1-click clone of any task.
  - **Clear Completed Tasks**: Clean batch cleanup modal with safety confirmation.
  - **Quick Filters**: Overdue (⚠️), High Priority (🔥), and Due Today (📅) filters.
  - **Quick Due Date Presets**: Today, Tomorrow, +1 Week shortcuts in task creator modal.
- **3D Micro-interactions & Physics**: Multi-color 3D confetti cannon (`canvas-confetti`) and subtle synthesized audio chime (via Web Audio API) on task completion.
- **Dark Mode & Light Mode**: Smooth 3D theme transition with customized specular lighting, glassmorphic frosted borders, and deep ambient occlusion shadows.
- **Full Mobile Responsiveness**: Pixel-perfect layout from 375px mobile screens up to 4K displays with zero horizontal scrolling.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom glassmorphism and 3D utility layers
- **3D Engine**: Three.js (WebGL interactive canvas)
- **Animation**: Framer Motion (spring layouts, 3D modals, tab indicators)
- **Icons**: Lucide React
- **Confetti & FX**: canvas-confetti & Web Audio API synthesizer

### Backend API
- **Runtime**: Node.js (ESM modules)
- **Framework**: Express.js REST API
- **Security & Auth**: JWT (`jsonwebtoken`), password hashing with `bcryptjs` (salt rounds: 10), user-isolated row access checks
- **Database**: Dual-engine architecture:
  - **Embedded SQLite** (`better-sqlite3`) for instant zero-configuration local runs
  - **PostgreSQL** (`pg`) for cloud deployment (Neon, Supabase, Render Postgres) by setting `DATABASE_URL`
- **Testing**: Jest + Supertest (16 automated tests covering validation, user isolation, auth, and CRUD)

---

## 📋 API Endpoints

All task endpoints are protected with Bearer JWT tokens.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint (returns `"OK"`) |
| `POST` | `/api/auth/signup` | Register a new user (`name`, `email`, `password` ≥ 8 chars) |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT token |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile |
| `GET` | `/api/tasks` | List user tasks (supports `status=all\|pending\|completed\|todo\|in_progress`, `search`, `sort=due_date\|priority\|newest`) |
| `POST` | `/api/tasks` | Create a task (`title` required, `description`, `priority`, `dueDate`, `status`) |
| `PUT` | `/api/tasks/:id` | Update task fields, status (`todo\|in_progress\|completed`), or completion (`completed: boolean`) |
| `DELETE` | `/api/tasks/:id` | Delete a task (with ownership verification) |
| `DELETE` | `/api/tasks/completed/clear` | Clear all completed tasks for logged-in user |

---

## 🖥️ How to Run in Visual Studio Code (VS Code)

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Go to **File** > **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select the `TaskBoard` folder.

---

### Step 2: Open the Integrated Terminal
- Press **`Ctrl + \``** (backtick) or select **Terminal** > **New Terminal** from the top menu.

---

### Step 3: Run the Development Servers
You can run both servers side-by-side using VS Code's **Split Terminal** feature:

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm run dev
```
*(On Windows PowerShell, if you see a script execution policy notice, use `npm.cmd run dev`)*
> 🚀 You will see: `TaskBoard REST API server listening on http://localhost:5000`

#### Terminal 2 — Start Frontend Server:
1. Click the **Split Terminal** button (`Ctrl + Shift + 5` or the ◫ icon in the top-right corner of the terminal pane).
2. Run:
```bash
cd frontend
npm run dev
```
*(Or `npm.cmd run dev` on Windows PowerShell)*
> ⚡ You will see: `Local: http://localhost:3000/`

---

### Step 4: Open the App & Test
1. Hold `Ctrl` and click **`http://localhost:3000`** in the terminal (or open it in your browser).
2. The 3D TaskBoard app will load.
3. Click the **"Fill Demo Login"** button or enter:
   - **Email**: `demo@taskboard.com`
   - **Password**: `Demo@123`
4. Click **Log in** to explore your pre-seeded 3D tasks!

---

### 💡 Alternative: Run via VS Code Tasks (Automated)
This repository includes pre-configured `.vscode` tasks:
1. Press `Ctrl + Shift + P` and type `Tasks: Run Task`.
2. Select **`Start Backend`** to start the API in the background.
3. Select **`Start Frontend`** to start Vite in the background.
4. Select **`Run Backend Tests`** (`Ctrl + Shift + T` or test menu) to run the 16 automated test suites anytime.

---

### 🐞 Debugging with VS Code
1. Click the **Run and Debug** tab on the left sidebar (or press `Ctrl + Shift + D`).
2. Select **"Debug Backend API"** from the dropdown at the top.
3. Press **`F5`** or click the green Play button.
4. Set breakpoints directly in [taskController.js](file:///c:/Users/dhanush%20gopi/Downloads/TaskBoard/backend/src/controllers/taskController.js) or [authController.js](file:///c:/Users/dhanush%20gopi/Downloads/TaskBoard/backend/src/controllers/authController.js) to debug live API calls!

---

## 💻 How to Run Locally (Command Line)

### Prerequisites
- Node.js v18+ or v20+ or v22+
- npm

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-username/TaskBoard.git
cd TaskBoard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Configure Environment Variables
In `backend/.env` (pre-configured defaults work out of the box):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super-secret-taskboard-key-change-in-production-2026
# Optional: set DATABASE_URL to connect to PostgreSQL (e.g. Neon/Supabase)
# DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

### 3. Run Development Servers

**Option A — Run Backend and Frontend separately:**
```bash
# Terminal 1: Start Backend API (runs on port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend (runs on port 3000)
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

**Option B — Unified Single-Command Run:**
```bash
# Build frontend and start the Express server which serves both API and 3D UI
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🧪 Running Automated Tests

Run the test suite with Jest and Supertest:
```bash
cd backend
npm test
```

### Test Coverage Highlights:
- ✅ **Health Check**: verifies `/api/health` returns `200 OK`
- ✅ **Password Validation**: ensures passwords shorter than 8 characters are rejected
- ✅ **Name & Email Validation**: verifies required fields and email uniqueness
- ✅ **Demo User Seed Verification**: confirms `demo@taskboard.com` / `Demo@123` works out of the box
- ✅ **Authentication Guard**: verifies unauthorized requests to `/api/tasks` return `401`
- ✅ **Empty Title Rejection**: verifies server-side validation rejects empty titles
- ✅ **User Isolation**: guarantees User A cannot view, update, or delete User B's tasks
- ✅ **Status Toggling & Strikethrough**: verifies real-time count updates (Total, Pending, Completed)
- ✅ **Filtering & Deletion**: tests status filtering and cascading deletions

---

## ☁️ Deployment Instructions

> **⚠️ Note on Free Tier Cloud Hosting**: Free backend tiers (Render/Koyeb) put instances to sleep when idle. The very first request after an idle period may take 45–60 seconds to spin up.

### Deploy Frontend to Vercel
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   - `VITE_API_URL`: Your live backend API URL (e.g., `https://taskboard-api.onrender.com`)
5. Click **Deploy**.

### Deploy Backend to Render
1. Log in to [Render](https://render.com) and click **"New Web Service"**.
2. Connect your GitHub repository.
3. Configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (generate random 32+ character string)
   - `DATABASE_URL`: (connection string from Neon / Supabase / Render PostgreSQL)
5. Click **Create Web Service**.
6. Verify deployment by visiting `https://your-api.onrender.com/api/health` (should return `"OK"`).

---

## 🤖 AI Usage Note

AI tools were leveraged for:
1. Translating the assignment specifications and visual mockups into a cohesive, responsive React + Tailwind CSS layout.
2. Generating the WebGL Three.js interactive math for the ambient 3D geometric background and 3D card tilt matrices.
3. Structuring the automated test coverage suite using Jest and Supertest.

---

## 💡 Ready for the 20-Minute Follow-up Call

The codebase is cleanly organized for the follow-up live coding walkthrough (e.g., adding a new **`Category`** field):
1. **Database Schema** (`backend/src/db.js`): add `category VARCHAR(50) DEFAULT 'Work'` to table creation and queries.
2. **Controller** (`backend/src/controllers/taskController.js`): accept `category` in `createTask` and `updateTask`.
3. **Frontend Modal** (`frontend/src/components/TaskModal3D.jsx`): add a category dropdown or input pill.
4. **Task Card** (`frontend/src/components/TaskItem3D.jsx`): render a category badge alongside priority.

