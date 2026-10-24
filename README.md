 <p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&amp;color=0:0F172A,35:2563EB,70:7C3AED,100:06B6D4&amp;height=230&amp;section=header&amp;text=TaskBoard&amp;fontSize=54&amp;fontColor=ffffff&amp;animation=fadeIn&amp;fontAlignY=35&amp;desc=3D%20Spatial%20Task%20Manager&amp;descAlignY=55&amp;descSize=20" alt="TaskBoard 3D Spatial Task Manager banner" width="100%" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&amp;weight=600&amp;size=18&amp;duration=2600&amp;pause=900&amp;color=7C3AED&amp;center=true&amp;vCenter=true&amp;width=750&amp;lines=Plan+smarter.+Ship+faster.;A+3D+workspace+for+everyday+tasks;React+%7C+Three.js+%7C+Framer+Motion+%7C+Express" alt="TaskBoard animated tagline" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&amp;logo=react&amp;logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Three.js-3D%20UI-000000?style=for-the-badge&amp;logo=threedotjs&amp;logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Framer%20Motion-Animations-0055FF?style=for-the-badge&amp;logo=framer&amp;logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&amp;logo=nodedotjs&amp;logoColor=white" alt="Node.js Express" />
</p>


> A modern, responsive, animated 3D task manager built with React, Three.js, Framer Motion, Node.js/Express, and PostgreSQL/SQLite.

<p align="center">
  <strong>Organize tasks. Visualize progress. Stay productive.</strong>
</p>

---

## 🧭 Quick Navigation

<p align="center">
  <a href="#demo-credentials">
    <img src="https://img.shields.io/badge/Demo_Credentials-2563EB?style=for-the-badge" alt="Demo Credentials"/>
  </a>
  <a href="#features">
    <img src="https://img.shields.io/badge/Features-7C3AED?style=for-the-badge" alt="Features"/>
  </a>
  <a href="#system-architecture">
    <img src="https://img.shields.io/badge/System_Architecture-0891B2?style=for-the-badge" alt="System Architecture"/>
  </a>
  <a href="#tech-stack">
    <img src="https://img.shields.io/badge/Tech_Stack-059669?style=for-the-badge" alt="Tech Stack"/>
  </a>
  <a href="#api-endpoints">
    <img src="https://img.shields.io/badge/API_Endpoints-EA580C?style=for-the-badge" alt="API Endpoints"/>
  </a>
 <a href="#run-locally">
  <img src="https://img.shields.io/badge/▶️_Run_Locally-16A34A?style=for-the-badge" alt="Run Locally"/>
 </a>
  <a href="#deployment">
    <img src="https://img.shields.io/badge/Deployment-0F766E?style=for-the-badge" alt="Deployment"/>
  </a>
</p>

---
<a id="demo-credentials"></a>
## 🌟 Demo Credentials

| Role | Email | Password | Sample Tasks |
|---|---|---|---|
| **Demo User** | `demo@taskboard.com` | `Demo@123` | Pre-seeded task examples |

You can also click **Fill Demo Login** on the login screen for one-click evaluation.

> **Security note:** These are demo credentials documented by the project. Avoid using demo credentials or hardcoded secrets for production accounts.

---
<a id="features"></a>
## 🎨 Animated 3D UI/UX Highlights

- **Interactive 3D WebGL Background:** Three.js floating geometric shapes and interactive particle constellations.
- **Interactive Kanban Board:** Drag-and-drop tasks across To Do, In Progress, and Done columns.
- **Analytics Dashboard:** Animated completion gauge, priority breakdown, weekly workload, and productivity recommendations.
- **Animated Notifications:** Toast alerts with status-specific visual effects and auto-dismiss timers.
- **3D Card Perspective:** CSS 3D tilt and lighting effects on task and statistic cards.
- **Quick Productivity Actions:** Duplicate tasks, clear completed tasks, and filter overdue or high-priority work.
- **Due-Date Shortcuts:** Quickly choose Today, Tomorrow, or one week ahead.
- **Completion Effects:** Confetti and synthesized audio feedback.
- **Dark and Light Themes:** Glassmorphism, ambient shadows, and theme transitions.
- **Responsive Layout:** Designed for mobile and desktop screens.

---
<a id="system-architecture"></a>
## 🏗️ System Architecture

<p align="center">
  <a href="#-system-architecture">
    <img src="https://img.shields.io/badge/🏗️_System_Architecture-2563EB?style=for-the-badge&amp;logo=diagramsdotnet&amp;logoColor=white" alt="System Architecture Section"/>
  </a>
</p>

```mermaid
flowchart TB
    U["👤 User"] --> UI["React 18 + Vite"]
    UI --> FX["Three.js + Framer Motion"]
    UI -->|"REST API + JWT"| API["Express REST API"]

    API --> AUTH["JWT Authentication"]
    AUTH --> CTRL["Task Controllers"]
    CTRL --> OWN["User Ownership Checks"]
    OWN --> DB{"Database Configuration"}

    DB -->|"Local default"| SQLITE["SQLite"]
    DB -->|"DATABASE_URL configured"| PG["PostgreSQL"]

    TEST["Jest + Supertest"] -.-> API

    classDef client fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A,stroke-width:2px;
    classDef server fill:#EDE9FE,stroke:#7C3AED,color:#4C1D95,stroke-width:2px;
    classDef data fill:#D1FAE5,stroke:#059669,color:#064E3B,stroke-width:2px;
    classDef test fill:#FFEDD5,stroke:#EA580C,color:#9A3412,stroke-width:2px;

    class U,UI,FX client;
    class API,AUTH,CTRL,OWN server;
    class DB,SQLITE,PG data;
    class TEST test;
```

### 🔄 Task Management Workflow

```mermaid
flowchart LR
    A["Create Task"] --> B["Set Priority and Due Date"]
    B --> C["To Do"]
    C --> D["In Progress"]
    D --> E["Completed"]
    E --> F["Analytics Update"]

    classDef create fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A,stroke-width:2px;
    classDef progress fill:#EDE9FE,stroke:#7C3AED,color:#4C1D95,stroke-width:2px;
    classDef done fill:#D1FAE5,stroke:#059669,color:#064E3B,stroke-width:2px;

    class A,B create;
    class C,D progress;
    class E,F done;
```

---
<a id="tech-stack"></a>
## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| Vite | Development server and build tooling |
| Tailwind CSS | Styling and responsive layout |
| Three.js | Interactive 3D background |
| Framer Motion | UI animations and transitions |
| Lucide React | Icons |
| canvas-confetti | Completion effects |
| Web Audio API | Synthesized audio feedback |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| better-sqlite3 | Local SQLite database |
| pg | PostgreSQL connectivity |
| Jest | Automated testing |
| Supertest | HTTP endpoint testing |

### Database Configuration

- **SQLite:** Local development with minimal configuration.
- **PostgreSQL:** Cloud database support through `DATABASE_URL`.

---
<a id="api-endpoints"></a>
## 📋 API Endpoints

Task endpoints require a valid Bearer JWT token.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API health |
| `POST` | `/api/auth/signup` | Register a user |
| `POST` | `/api/auth/login` | Authenticate and obtain a JWT |
| `GET` | `/api/auth/me` | Get the current user profile |
| `GET` | `/api/tasks` | List tasks with supported filters |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update task fields or status |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `DELETE` | `/api/tasks/completed/clear` | Clear completed tasks |

### Supported task query parameters

- `status`: `all`, `pending`, `completed`, `todo`, `in_progress`
- `search`: Search tasks
- `sort`: `due_date`, `priority`, `newest`

---
<a id="run-locally"></a>
## 🖥️ How to Run in Visual Studio Code (VS Code)

### Step 1: Open the project

Open the `TaskBoard` folder in VS Code.

### Step 2: Start the backend

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

Expected local API address:

`http://localhost:5000`

### Step 3: Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Expected local frontend address:

`http://localhost:3000`

### Step 4: Log in

Open `http://localhost:3000` in your browser and use the demo login option.

---

## 💻 Run Locally from the Command Line

### Prerequisites

- Node.js 18 or later
- npm
- Git

### 1. Clone the repository

Replace the placeholder with your actual GitHub repository URL.

```bash
git clone https://github.com/<your-username>/TaskBoard.git
cd TaskBoard
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install

cd ..
```

### 3. Configure environment variables

Create or update `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret

# Optional: configure PostgreSQL
# DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

Use a unique, securely generated `JWT_SECRET` in production. Never commit real secrets to GitHub.

### 4. Run development servers

**Backend terminal:**

```bash
cd backend
npm run dev
```

**Frontend terminal:**

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

### Alternative: Unified Run

If the root project scripts support a unified build and start:

```bash
npm run build
npm start
```

The documented unified setup serves the frontend and API from port `5000`.

---

## 🧪 Running Automated Tests

Run the backend tests:

```bash
cd backend
npm test
```

The documented Jest and Supertest suite covers:

- Health check responses
- Password validation
- Name and email validation
- Demo user seed verification
- Authentication guards
- Empty task-title rejection
- User-level task isolation
- Task status updates
- Filtering and deletion

The original project documentation reports **16 automated tests**. Run the suite to verify the current result.

---
<a id="deployment"></a>
## ☁️ Deployment Instructions

> **Note:** Free cloud services may sleep when idle, causing the first request after inactivity to take longer.

### Deploy Frontend to Vercel

1. Push the repository to GitHub.
2. Open [Vercel](https://vercel.com).
3. Import the repository.
4. Set the frontend root directory to `frontend`.
5. Configure the environment variable:

   ```env
   VITE_API_URL=https://your-api.onrender.com
   ```

6. Deploy and test the application.

### Deploy Backend to Render

1. Open [Render](https://render.com).
2. Create a new Web Service and connect the repository.
3. Set the root directory to `backend`.
4. Configure the build command:

   ```bash
   npm install
   ```

5. Configure the start command:

   ```bash
   npm start
   ```

6. Set production environment variables:

   ```env
   NODE_ENV=production
   JWT_SECRET=your-generated-secret
   DATABASE_URL=your-postgresql-connection-string
   ```

7. Deploy and verify the API health endpoint:

   `https://your-api.onrender.com/api/health`

---

## 🤖 AI Usage Note

AI tools were used to assist with:

1. Translating assignment specifications and visual mockups into a responsive React and Tailwind CSS interface.
2. Developing the interactive Three.js background and 3D card-tilt effects.
3. Structuring automated tests with Jest and Supertest.

---

## 💡 Follow-Up Live Coding: Adding a Category Field

The project notes identify these areas for extending tasks with a `Category` field:

1. **Database:** Update `backend/src/db.js` to add the category field and handle it in relevant queries.
2. **Controller:** Update `backend/src/controllers/taskController.js` to accept category during task creation and updates.
3. **Task modal:** Update `frontend/src/components/TaskModal3D.jsx` with a category dropdown or input.
4. **Task card:** Update `frontend/src/components/TaskItem3D.jsx` to display a category badge.

Remember to update validation, database table creation logic, and tests as needed.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&amp;color=0:0F172A,50:7C3AED,100:06B6D4&amp;height=4&amp;section=footer" alt="" width="100%" />
</p>

<p align="center">
  <strong>✨ Organize. Focus. Complete. Repeat.</strong><br/>
  Plan with clarity. Track your progress. Keep moving forward.
</p>
