# Visitor Pass Management System (VPMS)

A full-stack Visitor Pass Management System built with the MERN Stack (MongoDB, Express.js, React.js, Node.js).

---

## Features

- Three role-based user types: Administrator, Receptionist, Employee
- Complete visitor lifecycle: Registration → Approval → Check-In → Check-Out
- 10 enforced business validation rules
- Full audit trail with activity logs
- Search and filtering on visitor records
- Admin reports with date range filtering

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6, Axios, Vite |
| Backend | Node.js, Express.js 4 |
| Database | MongoDB, Mongoose 8 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |

---

## Project Structure

```
vpms/
├── server/    # Node.js + Express API
└── client/    # React.js SPA
```

---

## Prerequisites

- Node.js >= 18.x
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)
- npm >= 9.x

---

## Setup Instructions

### 1. Clone and navigate

```bash
git clone <your-repo-url>
cd vpms
```

### 2. Configure the Backend

```bash
cd server
```

Copy the example env file and edit as needed:

```bash
copy .env.example .env
```

The `.env` file is pre-configured for local development:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vpms
JWT_SECRET=vpms_jwt_secret_key_change_in_production_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

Install dependencies:

```bash
npm install
```

### 3. Seed the Database

```bash
npm run seed
```

This inserts 7 user accounts and 10 sample visitor passes with activity logs.

### 4. Start the Backend Server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

### 5. Configure and Start the Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## Sample Login Credentials

| Role | Email | Password |
|---|---|---|
| Administrator | admin@vpms.com | Admin@123 |
| Receptionist | receptionist@vpms.com | Recept@123 |
| Employee (Alice) | alice@vpms.com | Emp@123 |
| Employee (Bob) | bob@vpms.com | Emp@123 |
| Employee (Carol) | carol@vpms.com | Emp@123 |
| Employee (David) | david@vpms.com | Emp@123 |
| Employee (Eve) | eve@vpms.com | Emp@123 |

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| PORT | Express server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/vpms |
| JWT_SECRET | JWT signing secret | (change in production) |
| JWT_EXPIRES_IN | JWT token expiry | 7d |
| NODE_ENV | Environment mode | development |
| CLIENT_ORIGIN | Allowed CORS origin | http://localhost:5173 |

---

## API Overview

All API routes are prefixed with `/api`. See `server/API_DOCS.md` for the full reference.

| Base Path | Description |
|---|---|
| /api/auth | Login, current user |
| /api/users | User account CRUD (Admin) |
| /api/visitors | Visitor pass lifecycle |
| /api/dashboard | Role-scoped stats |
| /api/reports | Summary reports (Admin) |
| /api/activity-logs | Global audit log (Admin) |

---

## Business Rules Implemented

| Rule | Description |
|---|---|
| R1 | A visitor cannot have more than one active visit simultaneously |
| R2 | No duplicate registrations for the same visitor on the same date |
| R3 | Visit date cannot be in the past |
| R4 | For today's visits, arrival time cannot be in the past |
| R5 | An employee cannot have more than 3 pending visitor requests |
| R6 | Visitors can only be checked in after approval |
| R7 | A checked-in visitor cannot be checked in again |
| R8 | Check-out time must be later than check-in time |
| R9 | Rejected requests cannot be checked in |
| R10 | Cancelled visits are excluded from active visitor lists |

---

## Role Permissions

| Feature | Administrator | Receptionist | Employee |
|---|---|---|---|
| View Dashboard | All metrics | Desk metrics | Own request metrics |
| Manage Employees | CRUD | View list (dropdown) | — |
| Manage User Accounts | CRUD | — | — |
| Register Visitors | — | Yes | — |
| Approve / Reject Requests | — | — | Own requests only |
| Check In / Check Out | — | Yes | — |
| View Reports | Yes | — | — |
| View Activity Logs | Global | — | — |
