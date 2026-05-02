# FitPulse - Fitness Tracker & Gym Management System

FitPulse is a comprehensive, full-stack fitness tracking application designed for both individual fitness enthusiasts and gym owners. It bridges the gap between personal workout tracking and professional gym management, allowing users to log their progress while enabling gym owners to monitor and manage their members.

## 🚀 Key Features

### 🏋️ For Users
- **Guided Workout Sessions:** An interactive, timer-based workout player that guides users through their daily splits (e.g., Chest & Triceps), automatically managing exercise and rest durations.
- **Gym Membership Integration:** Users can join a specific gym using a unique 6-character "Gym ID". This sends a membership request directly to the gym owner.
- **Progress & Analytics:** Visual tracking of weekly completion rates, calories burned, and workout history.
- **Goal Setting:** Track and manage personal fitness goals (e.g., losing weight, building muscle).
- **Health Metrics Tracking:** Log daily water intake and monitor consistency over time.

### 🏢 For Gym Owners
- **Owner Dashboard:** A centralized control panel for managing gym operations.
- **Membership Request System:** Accept or reject incoming membership requests from new users who enter the Gym ID.
- **Member Management:** View all active members, search through the roster, and monitor individual performance.
- **Global Progress Analytics:** Compare performance across all gym members using interactive charts (Workouts Completed, Calories Burned).
- **Secure ID System:** Automatically generated 6-character Gym IDs (e.g., `GYM3F9A`) that owners can share with their clients.

## 🛠 Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Radix UI primitives)
- **Animations:** Framer Motion & Tailwind Animate
- **Charts & Data Visualization:** Recharts
- **State Management & Data Fetching:** React Query & React Context API
- **Routing:** React Router DOM
- **Forms & Validation:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** Bcrypt.js (Password hashing), CORS

## 🧠 System Architecture & Workflows

### Authentication Flow
The system utilizes a dual-role authentication mechanism:
1. **Users** register with standard metrics (age, weight, height, goal).
2. **Gym Owners** register via a secure modal, creating a gym profile.
3. Both roles receive securely signed JWT tokens upon login, stored in `localStorage`. API calls are intercepted by Axios to automatically attach the correct authorization headers.

### Gym Membership Flow
1. **User Side:** A user navigates to the "Gym Edition" tab and inputs a `Gym ID`. This triggers a POST request to create a `MembershipRequest` with a `pending` status.
2. **Owner Side:** The gym owner logs into their dashboard and sees pending requests. They can accept or reject them.
3. **Approval:** Upon acceptance, the user's `membershipStatus` is updated to `approved`, and the user is added to the gym owner's active member roster.

### Guided Workout Flow
1. Users select a daily plan (e.g., "Monday - Chest + Triceps").
2. The UI renders a `GuidedWorkoutSession` component, initializing a timer loop for exercises (60s) and rest periods (30s).
3. Upon completion, the system automatically calculates estimated calories based on duration and sport type.
4. The workout is packaged and sent to the `/api/workout/save` endpoint, persisting it to MongoDB.

## 📁 Project Structure

```text
fitness-flourish/
├── backend/                  # Node.js + Express Backend
│   ├── config/               # Database connection setup
│   ├── controllers/          # Business logic for routes
│   ├── middleware/           # JWT auth and role protection
│   ├── models/               # Mongoose schemas (User, GymOwner, Workout, etc.)
│   ├── routes/               # API route definitions
│   └── server.js             # Express application entry point
├── src/                      # React Frontend
│   ├── components/           # Reusable UI components (Shadcn, custom)
│   ├── contexts/             # Global state (AuthContext)
│   ├── lib/                  # Utilities and Axios API configuration
│   ├── pages/                # Application views (Dashboard, Gym, Auth, etc.)
│   │   └── owner/            # Gym Owner specific views
│   ├── index.css             # Global Tailwind styles
│   └── main.tsx              # React application entry point
├── .env.example              # Environment variables template
└── package.json              # Project metadata and dependencies
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)

### Installation
1. Clone the repository.
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `cd backend && npm install`
4. Copy `.env.example` to `backend/.env` and fill in your `MONGO_URI` and `JWT_SECRET`.

### Running Locally
You can start both the frontend and backend simultaneously from the root directory:
```bash
npm run dev
npm run dev:api
```
- Frontend runs on `http://localhost:5173`
- Backend API runs on `http://localhost:8000`

---
*Built with modern web technologies, designed to make fitness tracking flourish.*
